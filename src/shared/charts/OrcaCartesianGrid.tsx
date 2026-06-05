import { CartesianGrid } from "recharts";

import { CHART_COLORS } from "@/shared/charts/chart-colors";

export function OrcaCartesianGrid() {
  return (
    <CartesianGrid
      stroke={CHART_COLORS.grid}
      strokeDasharray="4 4"
      vertical={false}
    />
  );
}
