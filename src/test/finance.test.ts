import { describe, expect, it } from "vitest";
import { goalProgress, normalizeCategory, summarize } from "@/lib/finance";

describe("finance rules", () => {
  it("balance is income minus expenses, grouped by category", () => {
    const s = summarize([
      { id: "1", description: "salário", amount: 3000, kind: "income", category: "Salário", occurred_on: "2026-10-01" },
      { id: "2", description: "mercado", amount: 200.5, kind: "expense", category: "Alimentação", occurred_on: "2026-10-02" },
      { id: "3", description: "uber", amount: 30, kind: "expense", category: "Transporte", occurred_on: "2026-10-02" },
      { id: "4", description: "ifood", amount: 50, kind: "expense", category: "Alimentação", occurred_on: "2026-10-03" },
    ]);
    expect(s.balance).toBe(2719.5);
    expect(s.categories[0]).toEqual({ category: "Alimentação", total: 250.5 });
  });

  it("goal progress caps at 100%", () => {
    expect(goalProgress({ target_amount: 1000, saved_amount: 250 })).toBe(25);
    expect(goalProgress({ target_amount: 100, saved_amount: 500 })).toBe(100);
  });

  it("unknown categories fall back to Outros", () => {
    expect(normalizeCategory("pets")).toBe("Outros");
    expect(normalizeCategory("lazer")).toBe("Lazer");
  });
});
