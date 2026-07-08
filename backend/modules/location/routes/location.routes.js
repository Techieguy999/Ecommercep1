import { Router } from 'express';
import { handleGeocode, handleReverseGeocode } from '../controller/location.controller.js';

const router = Router();

router.post('/geocode', handleGeocode);
router.post('/reverse', handleReverseGeocode);

export default router;
