const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middlewares/authMiddleware');

// POST /api/reviews/:movieId
router.post('/:movieId', authMiddleware, reviewController.addReview);

// GET /api/reviews/:movieId
router.get('/:movieId', reviewController.getReviewsByMovieId);

// PUT/PATCH /api/reviews/:reviewId
router.put('/:reviewId', authMiddleware, reviewController.updateReview);

// DELETE /api/reviews/:reviewId
router.delete('/:reviewId', authMiddleware, reviewController.deleteReview);

// GET /api/recommendations
router.get('/recommendations', authMiddleware, reviewController.getRecommendations);

module.exports = router;
