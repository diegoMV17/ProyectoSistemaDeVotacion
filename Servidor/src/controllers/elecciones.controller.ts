import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export const getAllElecciones = async (_req: Request, res: Response) => {
  const { data, error } = await supabase.from('elecciones').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

export const getEleccionById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('elecciones').select('*').eq('id', id).single();
  if (error) return res.status(404).json({ error: error.message });
  res.json(data);
};

export const createEleccion = async (req: Request, res: Response) => {
  const { nombre, descripcion, tipo_representacion, fecha_inicio, fecha_fin, estado } = req.body;
  const { data, error } = await supabase.from('elecciones').insert({
    nombre,
    descripcion,
    tipo_representacion,
    fecha_inicio,
    fecha_fin,
    estado
  }).select().single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
};

export const updateEleccion = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { nombre, descripcion, tipo_representacion, fecha_inicio, fecha_fin, estado } = req.body;

  const { data, error } = await supabase.from('elecciones').update({
    nombre,
    descripcion,
    tipo_representacion,
    fecha_inicio,
    fecha_fin,
    estado
  }).eq('id', id).select().single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};

export const deleteEleccion = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { error } = await supabase.from('elecciones').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.status(204).send();
};
