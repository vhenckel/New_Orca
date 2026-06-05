import { startOfDay, startOfMonth } from "date-fns";

/** Intervalo do dia 1 do mês corrente até hoje (início do dia local). */
export function getCurrentMonthToTodayRange(): { from: Date; to: Date } {
  const to = startOfDay(new Date());
  const from = startOfMonth(to);
  return { from, to };
}
