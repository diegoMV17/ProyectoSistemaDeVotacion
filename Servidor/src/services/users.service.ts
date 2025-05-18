import { User } from '../interfaces/user.interface';

const users: User[] = [];

export const crearUsuario = (data: User): User => {
  const nuevo: User = {
    ...data,
    id: users.length + 1,
  };
  users.push(nuevo);
  return nuevo;
};

export const obtenerUsuarios = (): User[] => users;