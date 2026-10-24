import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { brl, monthRange, summarize } from "@/lib/finance";
import { txQuery } from "@/lib/queries";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/relatorios")({
  head: () => ({
    meta: [
      { title: "Relatórios — Cofrinho" },
      { name: "description", content: "Veja para onde seu dinheiro vai, por categoria e por mês." },
      { property: "og:title", content: "Relatórios — Cofrinho" },
      { property: "og:description", content: "Veja para onde seu dinheiro vai, por categoria e por mês." },
    ],
  }),
  component: () => (
    <AppShell>
      <ReportsPage />
    </AppShell>
  ),
});

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

function ReportsPage() {
  const qc = useQueryClient();
  const [offset, setOffset] = useState(0);
  const ref = new Date();
  ref.setMonth(ref.getMonth() + offset, 1);
  const { start, end } = monthRange(ref);
  const { data: txs = [], isLoading } = useQuery(txQuery(start, end));
  const s = summarize(txs);
  const label = ref.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  const top = s.categories[0];

  async function remove(id: string) {
    await supabase.from("transactions").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["transactions"] });
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Relatório</h1>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-sm" aria-label="Mês anterior" onClick={() => setOffset(offset - 1)}><ChevronLeft /></Button>
            <span className="w-36 text-center text-sm font-medium capitalize">{label}</span>
            <Button variant="ghost" size="icon-sm" aria-label="Próximo mês" onClick={() => setOffset(offset + 1)} disabled={offset >= 0}><ChevronRight /></Button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <Stat label="Entrou" value={brl(s.income)} tone="text-success" />
          <Stat label="Saiu" value={brl(s.expense)} tone="text-destructive" />
          <Stat label="Sobrou" value={brl(s.balance)} tone={s.balance >= 0 ? "text-primary" : "text-destructive"} />
        </div>

        {top && (
          <p className="rounded-2xl bg-accent px-4 py-3 text-sm text-accent-foreground">
            💡 Sua maior categoria em {label} foi <b>{top.category}</b> ({brl(top.total)}
            {s.expense > 0 && `, ${Math.round((top.total / s.expense) * 100)}% dos gastos`}). Pequenos cortes aqui fazem a maior diferença.
          </p>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="card-soft p-5">
            <h2 className="mb-3 text-lg font-semibold">Gastos por categoria</h2>
            {s.categories.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">Sem gastos neste mês.</p>
            ) : (
              <>
                <div className="h-52">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={s.categories} dataKey="total" nameKey="category" innerRadius={50} outerRadius={85} paddingAngle={2}>
                        {s.categories.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v: number) => brl(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <ul className="mt-2 space-y-1.5 text-sm">
                  {s.categories.map((c, i) => (
                    <li key={c.category} className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      {c.category}
                      <span className="ml-auto font-medium">{brl(c.total)}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <div className="card-soft p-5">
            <h2 className="mb-3 text-lg font-semibold">Transações</h2>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Carregando…</p>
            ) : txs.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">Nada registrado. Conte um gasto no chat!</p>
            ) : (
              <ul className="max-h-96 divide-y overflow-y-auto text-sm">
                {txs.map((t) => (
                  <li key={t.id} className="group flex items-center gap-2 py-2">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{t.description}</p>
                      <p className="text-xs text-muted-foreground">{t.category} · {new Date(t.occurred_on + "T12:00").toLocaleDateString("pt-BR")}</p>
                    </div>
                    <span className={`ml-auto shrink-0 font-semibold ${t.kind === "income" ? "text-success" : ""}`}>
                      {t.kind === "income" ? "+" : "−"} {brl(t.amount)}
                    </span>
                    <Button variant="ghost" size="icon-xs" aria-label="Excluir" className="opacity-0 group-hover:opacity-100" onClick={() => remove(t.id)}><Trash2 /></Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="card-soft p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`font-display text-2xl font-bold ${tone}`}>{value}</p>
    </div>
  );
}
