import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import "@lovable.dev/cloud-auth-js/styles.css";
import logo from "@/assets/agente-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar — Cofrinho" },
      { name: "description", content: "Entre no Cofrinho e organize suas finanças conversando." },
      { property: "og:title", content: "Entrar — Cofrinho" },
      { property: "og:description", content: "Entre no Cofrinho e organize suas finanças conversando." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const { session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (session) navigate({ to: "/" });
  }, [session, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) toast.error("E-mail ou senha incorretos.");
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) toast.error(error.message);
      else if (!data.session) toast.success("Conta criada! Confira seu e-mail para confirmar.");
    }
    setBusy(false);
  }

  async function oauth(provider: "google" | "lovable") {
    const r = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin });
    if (r.error) toast.error("Não foi possível entrar agora.");
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="card-soft w-full max-w-sm p-7">
        <div className="mb-6 text-center">
          <img src={logo} alt="Mascote do Cofrinho" width={88} height={88} className="mx-auto size-22" />
          <h1 className="mt-2 text-3xl font-bold text-primary">Cofrinho</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Suas finanças organizadas numa conversa. Sem planilhas.
          </p>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pw">Senha</Label>
            <Input id="pw" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {mode === "in" ? "Entrar" : "Criar conta"}
          </Button>
        </form>
        <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
          <div className="h-px flex-1 bg-border" /> ou <div className="h-px flex-1 bg-border" />
        </div>
        <div className="space-y-2">
          <Button variant="outline" className="w-full" onClick={() => oauth("google")}>
            Continuar com Google
          </Button>
          <button type="button" className="lovable-auth-button w-full" onClick={() => oauth("lovable")}>
            Continue with Lovable
          </button>
        </div>
        <p className="mt-5 text-center text-sm text-muted-foreground">
          {mode === "in" ? "Ainda não tem conta?" : "Já tem conta?"}{" "}
          <button className="font-semibold text-primary underline-offset-4 hover:underline" onClick={() => setMode(mode === "in" ? "up" : "in")}>
            {mode === "in" ? "Criar conta" : "Entrar"}
          </button>
        </p>
      </div>
    </div>
  );
}
