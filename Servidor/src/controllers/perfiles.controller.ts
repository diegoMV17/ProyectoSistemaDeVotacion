import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export const getAllProfiles = async (_req: Request, res: Response) => {
  const { data, error } = await supabase.from('userprofiles').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

export const getProfileById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('userprofiles').select('*').eq('id', id).single();
  if (error) return res.status(404).json({ error: error.message });
  res.json(data);
};

export const createProfile = async (req: Request, res: Response) => {
  const { user_id, nombres, apellidos, edad, genero } = req.body;
  const { data, error } = await supabase.from('userprofiles').insert({ user_id, nombres, apellidos, edad, genero }).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
};

export const updateProfile = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { nombres, apellidos, edad, genero } = req.body;
  const { data, error } = await supabase.from('userprofiles').update({ nombres, apellidos, edad, genero }).eq('id', id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};

export const deleteProfile = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { error } = await supabase.from('userprofiles').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.status(204).send();
};
