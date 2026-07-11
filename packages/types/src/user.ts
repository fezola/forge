export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserInput {
  email: string;
  name: string;
  password: string;
  organization?: string;
}

export interface UpdateUserInput {
  email?: string;
  name?: string;
  password?: string;
  avatar?: string;
}
