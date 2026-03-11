export interface SalesPipelineStage {
  id: string;
  name: string;
  total: number;
}

export interface SalesContact {
  id: string;
  name: string;
  company?: string;
}
