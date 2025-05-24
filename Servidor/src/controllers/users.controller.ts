import { Request, Response } from 'express';
import * as usersService from '../services/users.service';
import { CreateUser } from '../interfaces/user.interface';

export const handleGetAllUsers = async (_req: Request, res: Response) => {
  try {
    const data = await usersService.obtenerUsuarios();
    res.json(data);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};
export const handleGetUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = await usersService.obtenerUsuarioPorId(Number(id));
    res.json(data);
  } catch (error) {
    const err = error as Error;
    res.status(404).json({ error: err.message });
  }
};

export const handleCreateUser = async (req: Request, res: Response ) => {
  try {
    const { identificacion, username, password_plano, role } = req.body;
    const newUser: CreateUser = { identificacion, username, password_plano, role };
    const user = await usersService.crearUsuario(newUser);

    if (!user) {
      return res.status(400).json({ error: 'Error al crear el usuario' });
    }

    res.status(201).json(user);
  } catch (error: any) {
    console.error('Error en el controlador:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const handleUpdateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedUser: CreateUser = req.body;

    const user = await usersService.actualizarUsuario(Number(id), updatedUser);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(user);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const handleDeleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = await usersService.eliminarUsuario(Number(id));
    if (!success) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.status(204).send();
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};
