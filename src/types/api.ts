export interface ApiSuccess<T> {
  data: T;
}

export interface ApiPagination {
  nextCursor: string | null;
  hasMore: boolean;
}

export interface ApiPaginated<T> {
  data: T[];
  pagination: ApiPagination;
}

/** Page-numbered list (GET /listings). */
export interface ApiPagePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface ApiPagedList<T> {
  data: T[];
  pagination: ApiPagePagination;
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    /** Machine-readable context, e.g. `{ missing: ["categoryId"] }` for LISTING_INCOMPLETE. */
    details?: unknown;
    /** Per-field messages for validation (400) and uniqueness (409) failures. */
    fields?: Record<string, string>;
  };
  requestId?: string;
}
