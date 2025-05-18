import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export const getAllUsers = async (_req: Request, res: Response) => {
  const { data, error } = await supabase.from('users').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
  if (error) return res.status(404).json({ error: error.message });
  res.json(data);
};

export const createUser = async (req: Request, res: Response) => {
  const { identificacion, username, password_hash, role } = req.body;
  const { data, error } = await supabase.from('users').insert({ identificacion, username, password_hash, role }).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
};

export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { identificacion, username, password_hash, role } = req.body;
  const { data, error } = await supabase.from('users').update({ identificacion, username, password_hash, role }).eq('id', id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { error } = await supabase.from('users').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.status(204).send();
};
