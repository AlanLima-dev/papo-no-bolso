import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import type { UIMessage } from "ai";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { ChatWindow } from "@/components/ChatWindow";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cofrinho — Finanças pessoais por conversa" },
      { name: "description", content: "Registre gastos conversando, acompanhe metas e receba dicas de economia do seu Agente Financeiro." },
      { property: "og:title", content: "Cofrinho — Finanças pessoais por conversa" },
      { property: "og:description", content: "Registre gastos conversando, acompanhe metas e receba dicas de economia." },
    ],
  }),
  component: () => (
    <AppShell>
      <ChatLoader />
    </AppShell>
  ),
});

function ChatLoader() {
  const { data, isLoading } = useQuery({
    queryKey: ["chat_messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("message")
        .order("created_at", { ascending: true })
        .limit(200);
      if (error) throw error;
      return (data ?? []).map((r) => r.message as unknown as UIMessage);
    },
    staleTime: Infinity,
  });
  if (isLoading || !data) return <div className="p-10 text-center text-muted-foreground">Carregando conversa…</div>;
  return <ChatWindow initialMessages={data} />;
}
