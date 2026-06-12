import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// Add to favorites
router.post('/favorite/:foodId', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user.favoriteItems.includes(req.params.foodId)) {
      user.favoriteItems.push(req.params.foodId);
      await user.save();
    }
    res.json({ message: '✅ Added to favorites' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove from favorites
router.delete('/favorite/:foodId', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    user.favoriteItems = user.favoriteItems.filter(id => id.toString() !== req.params.foodId);
    await user.save();
    res.json({ message: '✅ Removed from favorites' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
