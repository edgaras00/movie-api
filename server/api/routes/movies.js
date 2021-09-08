const express = require("express");
// Set up Router instance
const router = express.Router();
const checkAuth = require("../middleware/check-auth");
const MoviesController = require("../controllers/movies");
const Movie = require("../models/movies");
const pagination = require("../middleware/pagination");
const getDirectors = require("../middleware/getDirectors");
const getGenres = require("../middleware/getGenres");

// Movie routes

// Get all movie data
router.get("/", pagination(Movie, "movies"), MoviesController.movies_get_all);

// Get a single movie
router.get("/:movieId", MoviesController.movies_get_single);

// Get all movies by a specific genre
router.get(
  "/genres/:genreId",
  pagination(Movie, "movies", (mode = "genreMovies")),
  MoviesController.movies_specific_genre
);

// Get all movies directed by a specific director
router.get(
  "/directors/:directorId",
  pagination(Movie, "movies", (mode = "directorMovies")),
  MoviesController.movies_specific_director
);

// Add new movie (protected route)
router.post("/", getDirectors, getGenres, MoviesController.movies_add_movie);

// Update a movie (protected route)
router.patch("/:movieId", checkAuth, MoviesController.movies_update_movie);

// Delete a movie (protected route)
router.delete("/:movieId", checkAuth, MoviesController.movies_delete_movie);

module.exports = router;
