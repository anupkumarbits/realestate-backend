import express from 'express';
import { authUser, initAdmin } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', authUser);
router.post('/init', initAdmin); // To create the first admin user

export default router;
