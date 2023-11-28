const Review = require('../models/review');
const Movie = require('../models/movie');

const addReview = async (req, res) => {
  try {
    const { movieId } = req.params;
    const { rating, comment } = req.body;

    // Check if the movie exists
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found.' });
    }

    // Create a new review
    const newReview = new Review({
      user: req.user._id, // Assuming you attach the user object to the request in the authentication middleware
      movie: movieId,
      rating,
      comment,
    });

    // Save the review to the database
    await newReview.save();

    // Update the movie's reviews array
    movie.reviews.push(newReview._id);
    await movie.save();

    res.status(201).json({ message: 'Review added successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getReviewsByMovieId = async (req, res) => {
  try {
    const { movieId } = req.params;

    // Check if the movie exists
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found.' });
    }

    // Populate the reviews and user details for the movie
    await movie.populate('reviews').execPopulate();

    res.status(200).json(movie.reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    // Check if the review exists
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found.' });
    }

    // Check if the user is the owner of the review
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to update this review.' });
    }

    // Update the review
    review.rating = rating;
    review.comment = comment;
    await review.save();

    res.status(204).json();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    // Check if the review exists
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found.' });
    }

    // Check if the user is the owner of the review
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to delete this review.' });
    }

    // Remove the review from the movie's reviews array
    await Movie.findByIdAndUpdate(review.movie, { $pull: { reviews: reviewId } });

    // Delete the review
    await Review.findByIdAndDelete(reviewId);

    res.status(202).json({ message: 'Review deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getRecommendations = async (req, res) => {
    try {
      // Get the user's watched movies and reviews
      const user = await User.findById(req.user._id).populate('watchedMovies reviews');
  
      // Extract genres and ratings from user's reviews
      const userGenres = user.reviews.reduce((genres, review) => {
        return genres.concat(review.movie.genre);
      }, []);
  
      const userRatings = user.reviews.reduce((ratings, review) => {
        ratings[review.movie.toString()] = review.rating;
        return ratings;
      }, {});
  
      // Find movies with similar genres
      const similarMovies = await Movie.find({ genre: { $in: userGenres } });
  
      // Exclude movies the user has already watched
      const unwatchedMovies = similarMovies.filter((movie) => !user.watchedMovies.includes(movie._id));
  
      // Sort unwatched movies by average ratings from other users
      const sortedRecommendations = unwatchedMovies.sort((a, b) => {
        const avgRatingA = calculateAverageRating(a.reviews, userRatings);
        const avgRatingB = calculateAverageRating(b.reviews, userRatings);
  
        return avgRatingB - avgRatingA;
      });
  
      res.status(200).json(sortedRecommendations);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
  
  // Helper function to calculate the average rating for a movie
  const calculateAverageRating = (reviews, userRatings) => {
    const validReviews = reviews.filter((review) => userRatings.hasOwnProperty(review.user.toString()));
    if (validReviews.length === 0) {
      return 0; // Default rating if no valid reviews
    }
  
    const totalRating = validReviews.reduce((sum, review) => sum + userRatings[review.user.toString()], 0);
    return totalRating / validReviews.length;
  };

  
module.exports = {
  addReview,
  getReviewsByMovieId,
  updateReview,
  deleteReview,
  getRecommendations,
};

