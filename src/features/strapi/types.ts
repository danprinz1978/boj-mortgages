interface Pagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

interface Attribute {
  [key: string]: any;
}

export interface DataItem {
  id: number;
  documentId?: string;
  attributes: Attribute;
}

interface Meta {
  pagination: Pagination;
}

export interface ManagementAPIResponse {
  data: DataItem | DataItem[];
  meta: Meta;
}
