export interface ApiMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface ApiSuccess<T> {
  status: true;
  message: string;
  data: T;
  meta?: ApiMeta;
}

/**
 * Format error Laravel default (dari ValidationException->errors()):
 * { "email": ["Email wajib diisi"], "password": ["Password minimal 6 karakter"] }
 */
export type ApiValidationErrors = Record<string, string[]>;

export interface ApiError {
  status: false;
  message: string;
  errors?: ApiValidationErrors | null;
}

export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  [key: string]: string | number | undefined;
}
