const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');
const GenresController = require('../controllers/genres');
const pagination = require('../middleware/pagination');
const Genre = require('../models/genres');

// Genre routes

// Get all genres
router.get('/', pagination(Genre, 'genres'), GenresController.genres_get_all);

// Get a single genre 
router.get('/:genreId', GenresController.genres_get_single);

// Add a new genre (protected route)
router.post('/', checkAuth, GenresController.genres_add_genre);

// Update a genre (protected route)
router.patch('/:genreId', checkAuth, GenresController.genres_get_single);

// Delete a genre (protected route)
router.delete('/:genreId', checkAuth, GenresController.genres_delete_genre);

module.exports = router;