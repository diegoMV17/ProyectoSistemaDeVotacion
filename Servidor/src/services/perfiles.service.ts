import { UserProfile } from '../interfaces/perfil.interface';

const perfiles: UserProfile[] = [];

export const crearPerfil = (data: UserProfile): UserProfile => {
  const nuevo: UserProfile = {
    ...data,
    id: perfiles.length + 1,
  };
  perfiles.push(nuevo);
  return nuevo;
};

export const obtenerPerfiles = (): UserProfile[] => perfiles;
