import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export const getAllVotos = async (_req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('votos')
    .select('*, users(*), elecciones(*), candidaturas(*)');

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

export const getVotoById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('votos')
    .select('*, users(*), elecciones(*), candidaturas(*)')
    .eq('id', id)
    .single();

  if (error) return res.status(404).json({ error: error.message });
  res.json(data);
};

export const createVoto = async (req: Request, res: Response) => {
  const { userid, eleccionid, candidaturaid } = req.body;
  const { data, error } = await supabase
    .from('votos')
    .insert({ userid, eleccionid, candidaturaid })
    .select('*, users(*), elecciones(*), candidaturas(*)')
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
};

export const deleteVoto = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { error } = await supabase.from('votos').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.status(204).send();
};
