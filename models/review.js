const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
  rating: { type: Number, required: true },
  comment: { type: String },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Review', reviewSchema);
