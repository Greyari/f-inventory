export interface Permission {
  id: string;
  slug: string;
  group: string;
  label: string;
}

export interface Role {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isSystem: boolean;
  userCount?: number;
  permissions: Permission[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  roleId: string;
  role: Role;
  // Flatten slug permission dari role, biar gampang dicek: user.permissions.includes('users.manage')
  permissions: string[];
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
