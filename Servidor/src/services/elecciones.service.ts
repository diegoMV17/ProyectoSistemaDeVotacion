import { Eleccion } from '../interfaces/eleccion.interface';

const elecciones: Eleccion[] = [];

export const crearEleccion = (data: Eleccion): Eleccion => {
  const nueva: Eleccion = {
    ...data,
    id: elecciones.length + 1,
    createdat: new Date().toISOString(),
    updatedat: new Date().toISOString(),
  };
  elecciones.push(nueva);
  return nueva;
};

export const obtenerElecciones = (): Eleccion[] => elecciones;