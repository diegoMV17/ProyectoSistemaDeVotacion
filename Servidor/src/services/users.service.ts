import { promises } from 'dns';
import { supabase } from '../config/supabase';
import { CreateUser } from '../interfaces/user.interface';
import bcrypt from 'bcrypt';

const users: CreateUser[] = [];

export const obtenerUsuarios = async (): Promise<CreateUser[]>=> {
  const { data, error } = await supabase.from('users').select('*');
  if (error) throw new Error(error.message);
  return data;
};
export const obtenerUsuarioPorId = async (id: number) => {
  const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
  if (error) throw new Error(error.message);
  return data;
};
export const crearUsuario = async (usuario: CreateUser): Promise <CreateUser| null> => {
  const { identificacion, username, password_plano, role } = usuario;
  const hashed = await bcrypt.hash(usuario.password_plano, 10);
  const { data, error } = await supabase.from('users').insert([{
    identificacion,
    username,
    password_plano: hashed,
    role,
  }]).select().single();
  if (error) {
    console.error('Error al crear usuario:', error.message);
    return null;
  }
  return data as CreateUser;
}
export const actualizarUsuario = async (id: number, usuario: CreateUser): Promise<CreateUser | null> => {
  const { data, error } = await supabase.from('users').update(usuario).eq('id', id).select().single();
  if (error) {
    console.error('Error al actualizar usuario:', error.message);
    return null;
  }
  return data as CreateUser;
}
export const eliminarUsuario = async (id: number): Promise<boolean> => {
  const { error } = await supabase.from('users').delete().eq('id', id);
  if (error) {
    console.error('Error al eliminar usuario:', error.message);
    return false;
  }
  return true;
}