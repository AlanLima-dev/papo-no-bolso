import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { brl, goalProgress } from "@/lib/finance";
import { goalsQuery } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/metas")({
  head: () => ({
    meta: [
      { title: "Metas — Cofrinho" },
      { name: "description", content: "Acompanhe suas metas financeiras e quanto falta para alcançá-las." },
      { property: "og:title", content: "Metas — Cofrinho" },
      { property: "og:description", content: "Acompanhe suas metas financeiras e quanto falta para alcançá-las." },
    ],
  }),
  component: () => (
    <AppShell>
      <GoalsPage />
    </AppShell>
  ),
});

function GoalsPage() {
  const qc = useQueryClient();
  const { data: goals = [], isLoading } = useQuery(goalsQuery);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [deposit, setDeposit] = useState<Record<string, string>>({});

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from("goals").insert({ name, target_amount: Number(target) });
    if (error) { toast.error("Não foi possível criar a meta."); return; }
    setName("");
    setTarget("");
    qc.invalidateQueries({ queryKey: ["goals"] });
  }

  async function save(id: string, current: number) {
    const v = Number(deposit[id]);
    if (!v) return;
    const { error } = await supabase.from("goals").update({ saved_amount: current + v }).eq("id", id);
    if (error) { toast.error("Erro ao guardar."); return; }
    setDeposit((d) => ({ ...d, [id]: "" }));
    toast.success(`${brl(v)} guardados!`);
    qc.invalidateQueries({ queryKey: ["goals"] });
  }

  async function remove(id: string) {
    await supabase.from("goals").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["goals"] });
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <div>
          <h1 className="text-3xl font-bold">Suas metas</h1>
          <p className="text-muted-foreground">
            Metas dão um "porquê" para economizar. Dica: você também pode criar pelo{" "}
            <Link to="/" className="font-medium text-primary underline-offset-4 hover:underline">chat</Link>.
          </p>
        </div>

        <form onSubmit={add} className="card-soft flex flex-col gap-2 p-4 sm:flex-row">
          <Input placeholder="Ex.: Reserva de emergência" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input placeholder="Valor (R$)" type="number" min="1" step="0.01" value={target} onChange={(e) => setTarget(e.target.value)} required className="sm:w-40" />
          <Button type="submit"><Plus /> Criar</Button>
        </form>

        {isLoading ? (
          <p className="text-muted-foreground">Carregando…</p>
        ) : goals.length === 0 ? (
          <p className="card-soft p-6 text-center text-muted-foreground">Nenhuma meta ainda. Que tal começar por uma reserva de emergência?</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {goals.map((g) => {
              const pct = goalProgress(g);
              return (
                <div key={g.id} className="card-soft space-y-3 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-semibold">{g.name}</h3>
                      {g.deadline && <p className="text-xs text-muted-foreground">até {new Date(g.deadline + "T12:00").toLocaleDateString("pt-BR")}</p>}
                    </div>
                    <Button variant="ghost" size="icon-sm" aria-label="Excluir meta" onClick={() => remove(g.id)}><Trash2 /></Button>
                  </div>
                  <Progress value={pct} />
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold">{brl(g.saved_amount)}</span>
                    <span className="text-muted-foreground">{pct}% de {brl(g.target_amount)}</span>
                  </div>
                  <div className="flex gap-2">
                    <Input placeholder="Guardar R$" type="number" min="0" step="0.01" value={deposit[g.id] ?? ""} onChange={(e) => setDeposit((d) => ({ ...d, [g.id]: e.target.value }))} />
                    <Button variant="secondary" onClick={() => save(g.id, g.saved_amount)}>Guardar</Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
