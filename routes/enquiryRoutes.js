import express from 'express';
import {
  createEnquiry,
  getEnquiries,
  deleteEnquiry,
} from '../controllers/enquiryController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(createEnquiry).get(protect, admin, getEnquiries);
router.route('/:id').delete(protect, admin, deleteEnquiry);

export default router;
