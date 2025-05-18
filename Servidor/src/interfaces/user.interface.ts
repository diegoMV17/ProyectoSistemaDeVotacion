export interface User {
  id?: number;
  identificacion: string;
  username: string;
  password_hash: string;
  role: string;
}