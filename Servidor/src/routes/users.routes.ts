import { Router } from 'express';
import { handleGetAllUsers, handleGetUserById, handleUpdateUser, handleDeleteUser, handleCreateUser } from '../controllers/users.controller';

const router = Router();

router.get('/', handleGetAllUsers);
router.get('/:id', handleGetUserById);
router.post('/', handleCreateUser);
router.put('/:id', handleUpdateUser);
router.delete('/:id', handleDeleteUser);

export default router;
