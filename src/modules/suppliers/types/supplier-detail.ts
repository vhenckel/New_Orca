export interface SupplierResponsible {
  name: string;
  email: string;
}

export interface SupplierSegment {
  id: string;
  name: string;
}

export interface SupplierServiceArea {
  state: string;
  city: string;
  neighborhood: string;
}

export interface SupplierLinkedEstablishment {
  id: string;
  name: string;
  address?: {
    city: string;
    neighborhood: string;
  };
}

export interface SupplierSearchResult {
  id: string;
  name: string;
  phone: string;
  responsibleName: string;
}

export interface SupplierDetail {
  id: string;
  name: string;
  responsible: SupplierResponsible;
  phone: string;
  segments: SupplierSegment[];
  minimumOrderValue: string;
  serviceAreas: SupplierServiceArea[];
  establishments: SupplierLinkedEstablishment[];
  ownerLinkedEntityCount: number;
}

export type LinkedUserUpdateScope = "current" | "all";

export interface CreateSupplierPayload {
  name: string;
  responsible: SupplierResponsible;
  phone: string;
  segmentIds: string[];
  minimumOrderValue?: string;
  serviceAreas: SupplierServiceArea[];
}

export interface UpdateSupplierPayload extends CreateSupplierPayload {
  linkedUserUpdateScope?: LinkedUserUpdateScope;
}
