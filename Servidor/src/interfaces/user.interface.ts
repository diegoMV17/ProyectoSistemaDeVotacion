export interface CreateUser {
  id?: string;
  identificacion: string;
  username: string;
  password_plano: string;
  role: 'ADMIN' | 'ADMINISTRATIVO' | 'CANDIDATO' | 'VOTANTE';
}
export interface UserUpdate {
  id?: string;
  identificacion?: string;
  username?: string;
  password_plano?: string;
  role?: 'ADMIN' | 'ADMINISTRATIVO' | 'CANDIDATO' | 'VOTANTE';
}
