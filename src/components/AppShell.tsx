import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { LogOut, MessageCircle, PieChart, Target } from "lucide-react";
import logo from "@/assets/agente-logo.png";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/", label: "Conversa", icon: MessageCircle },
  { to: "/metas", label: "Metas", icon: Target },
  { to: "/relatorios", label: "Relatórios", icon: PieChart },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/login" });
  }, [loading, session, navigate]);

  if (loading || !session) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Carregando…</div>;
  }

  return (
    <div className="flex h-dvh flex-col">
      <header className="border-b bg-card/70 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="" width={36} height={36} className="size-9" />
            <span className="font-display text-xl font-bold text-primary">Cofrinho</span>
          </Link>
          <nav className="ml-auto flex items-center gap-1">
            {NAV.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                activeOptions={{ exact: true }}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground data-[status=active]:bg-primary data-[status=active]:text-primary-foreground"
              >
                <Icon className="size-4" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            ))}
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Sair"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate({ to: "/login" });
              }}
            >
              <LogOut />
            </Button>
          </nav>
        </div>
      </header>
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
