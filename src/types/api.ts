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

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
  };
  requestId?: string;
}
