import { Candidatura } from '../interfaces/candidatura.interface';

const candidaturas: Candidatura[] = [];
export const buscarCandidatura = async (): Promise<Candidatura[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(candidaturas);
    }, 1000);
  });
}

export const crearCandidatura = (data: Candidatura): Candidatura => {
  const nueva: Candidatura = {
    ...data,
    id: candidaturas.length + 1,
    createdat: new Date().toISOString(),
    updatedat: new Date().toISOString(),
  };
  candidaturas.push(nueva);
  return nueva;
};

export const obtenerCandidaturas = (): Candidatura[] => candidaturas;