export const CATEGORIES = [
  "Alimentação",
  "Transporte",
  "Moradia",
  "Saúde",
  "Lazer",
  "Educação",
  "Compras",
  "Contas",
  "Salário",
  "Outros",
] as const;

export type Category = (typeof CATEGORIES)[number];

export type Tx = {
  id: string;
  description: string;
  amount: number;
  kind: "expense" | "income" | string;
  category: string;
  occurred_on: string;
};

export type Goal = {
  id: string;
  name: string;
  target_amount: number;
  saved_amount: number;
  deadline: string | null;
};

export const brl = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);

export function normalizeCategory(c: string | null | undefined): Category {
  const found = CATEGORIES.find((x) => x.toLowerCase() === (c ?? "").trim().toLowerCase());
  return found ?? "Outros";
}

/** Totals for a list of transactions. Expenses are grouped by category, largest first. */
export function summarize(txs: Tx[]) {
  let income = 0;
  let expense = 0;
  const byCat = new Map<string, number>();
  for (const t of txs) {
    const v = Number(t.amount);
    if (t.kind === "income") income += v;
    else {
      expense += v;
      byCat.set(t.category, (byCat.get(t.category) ?? 0) + v);
    }
  }
  const categories = [...byCat.entries()]
    .map(([category, total]) => ({ category, total: Math.round(total * 100) / 100 }))
    .sort((a, b) => b.total - a.total);
  return {
    income: Math.round(income * 100) / 100,
    expense: Math.round(expense * 100) / 100,
    balance: Math.round((income - expense) * 100) / 100,
    categories,
  };
}

export function goalProgress(g: Pick<Goal, "target_amount" | "saved_amount">) {
  if (Number(g.target_amount) <= 0) return 0;
  return Math.min(100, Math.round((Number(g.saved_amount) / Number(g.target_amount)) * 100));
}

export function monthRange(d = new Date()) {
  const start = new Date(d.getFullYear(), d.getMonth(), 1);
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  const f = (x: Date) =>
    `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
  return { start: f(start), end: f(end) };
}
