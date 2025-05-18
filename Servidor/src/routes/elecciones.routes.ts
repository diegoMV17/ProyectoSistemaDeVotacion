import { Router } from 'express';
import { getAllElecciones,getEleccionById,createEleccion,updateEleccion,deleteEleccion } from '../controllers/elecciones.controller';

const router = Router();

router.get('/', getAllElecciones);
router.get('/:id', getEleccionById);
router.post('/', createEleccion);
router.put('/:id', updateEleccion);
router.delete('/:id', deleteEleccion);

export default router;
