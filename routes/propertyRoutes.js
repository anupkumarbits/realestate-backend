import express from 'express';
import {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
} from '../controllers/propertyController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(getProperties).post(protect, admin, createProperty);
router
  .route('/:id')
  .get(getPropertyById)
  .put(protect, admin, updateProperty)
  .delete(protect, admin, deleteProperty);

export default router;
