import { supabase } from "@/integrations/supabase/client";
import type { Goal, Tx } from "@/lib/finance";

export const txQuery = (start: string, end: string) => ({
  queryKey: ["transactions", start, end],
  queryFn: async (): Promise<Tx[]> => {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .gte("occurred_on", start)
      .lte("occurred_on", end)
      .order("occurred_on", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((t) => ({ ...t, amount: Number(t.amount) }));
  },
});

export const goalsQuery = {
  queryKey: ["goals"],
  queryFn: async (): Promise<Goal[]> => {
    const { data, error } = await supabase.from("goals").select("*").order("created_at");
    if (error) throw error;
    return (data ?? []).map((g) => ({ ...g, target_amount: Number(g.target_amount), saved_amount: Number(g.saved_amount) }));
  },
};
