const express = require('express');
const router = express.Router();
const Movie = require('../models/movies');
const SearchController = require('../controllers/search');
const searchDatabase = require('../middleware/search');

router.get('/movies', searchDatabase(Movie, 'movies'), SearchController.search_movies );

module.exports = router;