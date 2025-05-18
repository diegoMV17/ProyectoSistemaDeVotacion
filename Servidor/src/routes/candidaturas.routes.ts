import { Router} from 'express';
import { getAllCandidaturas, getCandidaturaById, createCandidatura, updateCandidatura, deleteCandidatura } from '../controllers/candidaturas.controller';

const router = Router();

router.get('/', getAllCandidaturas);
router.get('/:id', getCandidaturaById);
router.post('/', createCandidatura);
router.put('/:id', updateCandidatura);
router.delete('/:id', deleteCandidatura);

export default router;
