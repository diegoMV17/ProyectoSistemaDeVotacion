import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export const getAllCandidaturas = async (_req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('candidaturas')
    .select('*, users(*), elecciones(*)');

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

export const getCandidaturaById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('candidaturas')
    .select('*, users(*), elecciones(*)')
    .eq('id', id)
    .single();

  if (error) return res.status(404).json({ error: error.message });
  res.json(data);
};

export const createCandidatura = async (req: Request, res: Response) => {
  const { propuesta, userid, eleccionid } = req.body;
  const { data, error } = await supabase
    .from('candidaturas')
    .insert({ propuesta, userid, eleccionid })
    .select('*, users(*), elecciones(*)')
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
};

export const updateCandidatura = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { propuesta, userid, eleccionid } = req.body;
  const { data, error } = await supabase
    .from('candidaturas')
    .update({ propuesta, userid, eleccionid })
    .eq('id', id)
    .select('*, users(*), elecciones(*)')
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};

export const deleteCandidatura = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { error } = await supabase.from('candidaturas').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.status(204).send();
};
