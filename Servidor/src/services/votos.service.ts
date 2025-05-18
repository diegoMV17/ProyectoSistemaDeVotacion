import { Voto } from '../interfaces/voto.interface';

const votos: Voto[] = [];

export const emitirVoto = (data: Voto): Voto => {
  const nuevo: Voto = {
    ...data,
    id: votos.length + 1,
    createdat: new Date().toISOString(),
    updatedat: new Date().toISOString(),
  };
  votos.push(nuevo);
  return nuevo;
};

export const obtenerVotos = (): Voto[] => votos;