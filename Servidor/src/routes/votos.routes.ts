import { Router } from 'express';
import { getAllVotos, getVotoById, createVoto,  deleteVoto } from '../controllers/votos.controller';

const router = Router();

router.get('/', getAllVotos);
router.get('/:id', getVotoById);
router.post('/', createVoto);
router.delete('/:id', deleteVoto);

export default router;
