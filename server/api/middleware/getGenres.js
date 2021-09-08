const Genre = require("../models/genres");
const mongoose = require("mongoose");

// Middleware to check the database if a genre info exists for the
// specific movie that the user submits
// Creates a new entry in the DB if it is a new genre

module.exports = (req, res, next) => {
  // Check if the genre info is in the DB
  Genre.find({ name: req.body.genres })
    .select("-__v")
    .exec()
    .then((result) => {
      const missingGenres = [];
      req.body.genres.forEach((genre) => {
        if (!result.map((genre) => genre.name).includes(genre)) {
          missingGenres.push(genre);
        }
      });
      // Create a new genre entry in the DB
      if (missingGenres.length > 0) {
        genresObjects = missingGenres.map((genre) => {
          return new Genre({
            _id: mongoose.Types.ObjectId(),
            name: genre,
          });
        });
        let genres = result;
        Genre.insertMany(genresObjects)
          .then((result) => {
            result.forEach((item) => delete item._doc.__v);
            genres = [...genres, ...result];
            res.genreData = genres;
            next();
          })
          .catch((error) => {
            console.log(error);
            res.status(500).json({ error: error });
          });
      } else {
        //  Add existing genre information if it is already in the DB
        res.genreData = result;
        next();
      }
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ error: error });
    });
};
