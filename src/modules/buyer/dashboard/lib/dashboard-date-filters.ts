import { parseAsIsoDate } from "nuqs";

export const dashboardDateFilterParsers = {
  from: parseAsIsoDate,
  to: parseAsIsoDate,
};
