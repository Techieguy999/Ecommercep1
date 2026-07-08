import { Router } from 'express';
import { getAddresses, saveAddress, updateAddress, deleteAddress, makeDefault } from '../controller/address.controller.js';

const router = Router();

router.get('/', getAddresses);
router.post('/', saveAddress);
router.put('/:id', updateAddress);
router.delete('/:id', deleteAddress);
router.patch('/:id/default', makeDefault);

export default router;
