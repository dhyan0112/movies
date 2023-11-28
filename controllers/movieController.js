const Movie = require('../models/movie');

const getAllMovies = async (req, res) => {
  try {
    // Get all movies from the database
    const movies = await Movie.find();

    res.status(200).json(movies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getMovieById = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the movie exists
    const movie = await Movie.findById(id);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found.' });
    }

    res.status(200).json(movie);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  getAllMovies,
  getMovieById,
};
