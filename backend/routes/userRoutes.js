import express from 'express';
import {
    createUser,
    loginUser,
    updateUserProfile,
    deleteUser,
    getUserProfile,
    logoutUser,
    getAllUsers,
    getUserProfileById,
    updateUserById
} from '../controllers/userController.js';
import { authenticate, checkAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/auth', loginUser);
router.post('/register', createUser);
router.post('/logout', authenticate, logoutUser);
router.get('/profile', authenticate, getUserProfile);
router.put('/profile', authenticate, updateUserProfile);

router.route('/:id')
    .delete(authenticate, checkAdmin, deleteUser)
    .get(authenticate, checkAdmin, getUserProfileById)
    .put(authenticate, checkAdmin, updateUserById)

router.route('/').
post(createUser).
get(authenticate, checkAdmin, getAllUsers);

export default router;
