import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage, isToolUIPart, getToolName } from "ai";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Coins, PiggyBank, Target, BarChart3 } from "lucide-react";
import logo from "@/assets/agente-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { brl } from "@/lib/finance";
import { Conversation, ConversationContent, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { PromptInput, PromptInputFooter, PromptInputSubmit, PromptInputTextarea } from "@/components/ai-elements/prompt-input";
import { Tool, ToolContent, ToolHeader, ToolInput, ToolOutput } from "@/components/ai-elements/tool";
import { Shimmer } from "@/components/ai-elements/shimmer";

const SUGGESTIONS = [
  "Gastei 42 reais no mercado hoje",
  "Recebi 3.200 de salário",
  "Quero juntar 5 mil para uma viagem até dezembro",
  "Como estão meus gastos este mês?",
  "Me dá uma dica para economizar",
];

const TOOL_LABEL: Record<string, string> = {
  registrar_transacao: "Registrando transação",
  criar_meta: "Criando meta",
  guardar_na_meta: "Guardando na meta",
  resumo_financeiro: "Consultando seu resumo",
};

type ToolOut = { ok?: boolean; transacao?: { description: string; amount: number; kind: string; category: string }; meta?: unknown; progresso?: number; guardado?: number };

function ToolSummary({ name, output }: { name: string; output: ToolOut }) {
  if (name === "registrar_transacao" && output?.ok && output.transacao) {
    const t = output.transacao;
    return (
      <div className="flex items-center gap-2 rounded-xl bg-secondary px-3 py-2 text-sm text-secondary-foreground">
        <CheckCircle2 className="size-4 text-success" />
        <span className="font-medium">{t.description}</span>
        <span className="text-muted-foreground">· {t.category}</span>
        <span className={`ml-auto font-semibold ${t.kind === "income" ? "text-success" : ""}`}>
          {t.kind === "income" ? "+" : "−"} {brl(Number(t.amount))}
        </span>
      </div>
    );
  }
  return null;
}

const ICON: Record<string, typeof Coins> = {
  registrar_transacao: Coins,
  criar_meta: Target,
  guardar_na_meta: PiggyBank,
  resumo_financeiro: BarChart3,
};

export function ChatWindow({ initialMessages }: { initialMessages: UIMessage[] }) {
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const taRef = useRef<HTMLTextAreaElement>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        headers: async (): Promise<Record<string, string>> => {
          const { data } = await supabase.auth.getSession();
          return data.session ? { Authorization: `Bearer ${data.session.access_token}` } : {};
        },
      }),
    [],
  );

  const { messages, sendMessage, status, stop } = useChat({
    id: "principal",
    messages: initialMessages,
    transport,
    onError: (e) => toast.error(e.message?.includes("{") ? JSON.parse(e.message).error ?? "Erro" : e.message || "Erro ao enviar."),
    onFinish: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["goals"] });
      taRef.current?.focus();
    },
  });

  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    taRef.current?.focus();
  }, []);

  function send(value: string) {
    const v = value.trim();
    if (!v || busy) return;
    sendMessage({ text: v });
    setText("");
    taRef.current?.focus();
  }

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col px-4">
      <Conversation className="flex-1">
        <ConversationContent className="py-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center py-10 text-center">
              <img src={logo} alt="Agente Financeiro" width={120} height={120} className="size-28" />
              <h1 className="mt-3 text-3xl font-bold text-primary">Oi! Sou seu Agente Financeiro.</h1>
              <p className="mt-2 max-w-md text-muted-foreground">
                Me conte seus gastos do jeito que você falaria com um amigo. Eu anoto, organizo por categoria e te dou dicas para economizar.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-full border bg-card px-3.5 py-1.5 text-sm text-foreground transition-colors hover:border-primary hover:bg-secondary"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m) => (
            <Message key={m.id} from={m.role}>
              <MessageContent className="group-[.is-user]:bg-primary group-[.is-user]:text-primary-foreground">
                {m.parts.map((p, i) => {
                  if (p.type === "text") {
                    return m.role === "user" ? <span key={i}>{p.text}</span> : <MessageResponse key={i}>{p.text}</MessageResponse>;
                  }
                  if (isToolUIPart(p)) {
                    const name = getToolName(p);
                    const Icon = ICON[name] ?? Coins;
                    return (
                      <div key={i} className="space-y-2">
                        {p.state === "output-available" && <ToolSummary name={name} output={p.output as ToolOut} />}
                        <Tool defaultOpen={false} className="mb-0 border-dashed">
                          <ToolHeader type="dynamic-tool" toolName={name} state={p.state} title={TOOL_LABEL[name] ?? name} />
                          <ToolContent>
                            <Icon className="hidden" />
                            <ToolInput input={p.input} />
                            <ToolOutput output={p.output} errorText={p.errorText} />
                          </ToolContent>
                        </Tool>
                      </div>
                    );
                  }
                  return null;
                })}
              </MessageContent>
            </Message>
          ))}
          {status === "submitted" && (
            <Message from="assistant">
              <MessageContent>
                <Shimmer>Pensando…</Shimmer>
              </MessageContent>
            </Message>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
      <div className="pb-4">
        <PromptInput onSubmit={(msg) => send(msg.text ?? text)} className="card-soft">
          <PromptInputTextarea
            ref={taRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ex.: paguei 120 de luz ontem"
          />
          <PromptInputFooter className="justify-end">
            <PromptInputSubmit status={status} onStop={stop} disabled={!busy && !text.trim()} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}
