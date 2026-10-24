import { createOpenAI } from "@ai-sdk/openai";
import { createClient } from "@supabase/supabase-js";
import { convertToModelMessages, stepCountIs, streamText, tool, type UIMessage } from "ai";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { CATEGORIES, monthRange, normalizeCategory, summarize, goalProgress } from "@/lib/finance";
import { createLovableAiGatewayRunIdFetch, getLovableAiGatewayRunId, withLovableAiGatewayRunIdHeader } from "./run-id.server";

const MODEL = "openai/gpt-6-astra";

function json(status: number, error: string) {
  return new Response(JSON.stringify({ error }), { status, headers: { "Content-Type": "application/json" } });
}

function userClient(token: string) {
  const url = process.env['SUPABASE_URL']!;
  const key = process.env['SUPABASE_PUBLISHABLE_KEY']!;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        headers.set("apikey", key);
        headers.set("Authorization", `Bearer ${token}`);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function instructions() {
  return `Você é o "Agente Financeiro" do app Cofrinho, um educador financeiro gentil para iniciantes no Brasil.
Data de hoje: ${today()}. Moeda: real (R$). Sempre responda em português, com frases curtas, linguagem simples e tom encorajador — nunca julgue os gastos.

O que você faz:
- Quando o usuário mencionar um gasto ou recebimento ("gastei 45 no mercado", "recebi 3000 de salário", "uber 22 ontem"), chame registrar_transacao — uma chamada por item. Classifique a categoria você mesmo entre: ${CATEGORIES.join(", ")}. Converta datas relativas ("ontem") para AAAA-MM-DD.
- Para criar uma meta ("quero juntar 5 mil para viajar em dezembro"), chame criar_meta. Para guardar dinheiro numa meta, chame guardar_na_meta.
- Para perguntas sobre quanto gastou, saldo, metas ou pedidos de dicas, chame resumo_financeiro antes de responder.
- Se faltar o valor, pergunte. Não invente números.
- Depois de registrar, confirme em uma linha (ex.: "Anotado: R$ 45,00 em Alimentação ✅") e, de vez em quando, dê UMA dica prática e curta de economia ligada ao gasto.
- Ao dar dicas, explique o porquê de forma educativa (ex.: regra 50/30/20, reserva de emergência), com no máximo 3 itens.
Use markdown leve (negrito, listas).`;
}

function buildTools(sb: ReturnType<typeof userClient>, userId: string) {
  return {
    registrar_transacao: tool({
      description: "Registra um gasto (expense) ou recebimento (income) do usuário.",
      inputSchema: z.object({
        description: z.string().describe("Descrição curta, ex.: Mercado"),
        amount: z.number().describe("Valor positivo em reais"),
        kind: z.enum(["expense", "income"]),
        category: z.enum(CATEGORIES),
        date: z.string().nullable().describe("AAAA-MM-DD, ou null para hoje"),
      }),
      execute: async ({ description, amount, kind, category, date }) => {
        const value = Math.abs(Number(amount));
        if (!value) return { ok: false, erro: "Valor inválido" };
        const { data, error } = await sb
          .from("transactions")
          .insert({
            user_id: userId,
            description,
            amount: value,
            kind,
            category: normalizeCategory(category),
            occurred_on: date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : today(),
          })
          .select("description, amount, kind, category, occurred_on")
          .single();
        if (error) return { ok: false, erro: error.message };
        return { ok: true, transacao: data };
      },
    }),
    criar_meta: tool({
      description: "Cria uma meta financeira (objetivo de economia).",
      inputSchema: z.object({
        name: z.string(),
        target_amount: z.number(),
        deadline: z.string().nullable().describe("AAAA-MM-DD ou null"),
      }),
      execute: async ({ name, target_amount, deadline }) => {
        const { data, error } = await sb
          .from("goals")
          .insert({ user_id: userId, name, target_amount: Math.abs(target_amount), deadline: deadline || null })
          .select("name, target_amount, deadline")
          .single();
        if (error) return { ok: false, erro: error.message };
        return { ok: true, meta: data };
      },
    }),
    guardar_na_meta: tool({
      description: "Adiciona um valor guardado a uma meta existente, buscando pelo nome.",
      inputSchema: z.object({ goal_name: z.string(), amount: z.number() }),
      execute: async ({ goal_name, amount }) => {
        const { data: goals, error } = await sb.from("goals").select("id, name, target_amount, saved_amount");
        if (error) return { ok: false, erro: error.message };
        const g = goals?.find((x) => x.name.toLowerCase().includes(goal_name.toLowerCase()));
        if (!g) return { ok: false, erro: "Meta não encontrada", metas: goals?.map((x) => x.name) };
        const saved = Number(g.saved_amount) + Math.abs(amount);
        const { error: e2 } = await sb.from("goals").update({ saved_amount: saved }).eq("id", g.id);
        if (e2) return { ok: false, erro: e2.message };
        return { ok: true, meta: g.name, guardado: saved, alvo: Number(g.target_amount), progresso: goalProgress({ saved_amount: saved, target_amount: Number(g.target_amount) }) };
      },
    }),
    resumo_financeiro: tool({
      description: "Retorna o resumo do mês atual (receitas, gastos por categoria, saldo), últimas transações e metas.",
      inputSchema: z.object({}),
      execute: async () => {
        const { start, end } = monthRange();
        const [{ data: txs }, { data: goals }] = await Promise.all([
          sb.from("transactions").select("*").gte("occurred_on", start).lte("occurred_on", end).order("occurred_on", { ascending: false }),
          sb.from("goals").select("name, target_amount, saved_amount, deadline"),
        ]);
        const list = (txs ?? []).map((t) => ({ ...t, amount: Number(t.amount) }));
        return {
          mes: start.slice(0, 7),
          ...summarize(list),
          ultimas: list.slice(0, 8).map((t) => ({ d: t.description, v: t.amount, tipo: t.kind, cat: t.category, data: t.occurred_on })),
          metas: (goals ?? []).map((g) => ({ ...g, progresso: goalProgress({ saved_amount: Number(g.saved_amount), target_amount: Number(g.target_amount) }) })),
        };
      },
    }),
  };
}

export async function handleChat(request: Request) {
  const auth = request.headers.get("authorization") ?? "";
  const token = auth.replace(/^Bearer\s+/i, "");
  if (!token) return json(401, "Faça login para conversar.");
  const sb = userClient(token);
  const { data: userData, error: userErr } = await sb.auth.getUser(token);
  if (userErr || !userData.user) return json(401, "Sessão expirada. Entre novamente.");
  const userId = userData.user.id;

  const apiKey = process.env['LOVABLE_API_KEY'];
  if (!apiKey) return json(500, "IA não configurada.");

  let messages: UIMessage[];
  try {
    const body = (await request.json()) as { messages?: UIMessage[] };
    if (!Array.isArray(body.messages) || body.messages.length === 0) return json(400, "Mensagem vazia.");
    messages = body.messages.slice(-40);
  } catch {
    return json(400, "Requisição inválida.");
  }

  const last = messages[messages.length - 1];
  if (last?.role === "user") {
    const { error } = await sb.from("chat_messages").insert({ user_id: userId, message: last as never });
    if (error) console.error("save user message failed", error);
  }

  const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });

  const result = streamText({
    model: provider.responses(MODEL),
    instructions: instructions(),
    messages: await convertToModelMessages(messages),
    tools: buildTools(sb, userId),
    stopWhen: stepCountIs(50),
    abortSignal: request.signal,
    providerOptions: {
      openai: {
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        store: false,
        include: ["reasoning.encrypted_content"],
      },
    },
  });

  return withLovableAiGatewayRunIdHeader(
    result.toUIMessageStreamResponse({
      originalMessages: messages,
      sendReasoning: false,
      onFinish: async ({ responseMessage }) => {
        const { error } = await sb.from("chat_messages").insert({ user_id: userId, message: responseMessage as never });
        if (error) console.error("save assistant message failed", error);
      },
      onError: (err) => {
        console.error("chat error", err);
        const status = (err as { statusCode?: number })?.statusCode;
        if (status === 429) return "Muitas mensagens em pouco tempo. Aguarde alguns segundos e tente de novo.";
        if (status === 402) return "Os créditos de IA acabaram. Adicione créditos no workspace para continuar.";
        return "Não consegui responder agora. Tente novamente.";
      },
    }),
    runIdFetch,
  );
}
