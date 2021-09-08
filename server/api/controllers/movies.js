const mongoose = require("mongoose");
const Movie = require("../models/movies");

// Movie controllers

// Get all movie data
exports.movies_get_all = (req, res) => {
  // Get paginated results from the pagination middleware
  const response = res.paginatedResults;
  // Update genre and director info
  // Add individual requests
  response.movies = response.movies.map(movie => {
    movie.genres = movie.genres.map(genre => {
      if (genre._id) {
        return {
          ...genre,
          request: {
            type: 'GET',
            url: req.protocol + '://' + req.get('host') + `/genres/${genre._id}`
          }
        }
      }
    })
    if (movie.director._id) {
      movie.director = {
        ...movie.director,
        request: {
          type: 'GET',
          url: req.protocol + '://' + req.get('host') + `/directors/${movie.director._id}`
        }
      }
    }
    return movie;
  })
  res.status(200).json(response);
};

// Get movie data by movie id
exports.movies_get_single = async (req, res) => {
  try {
    const id = req.params.movieId;
    const results = await Movie.findById(id).select("-__v");
    console.log(results);
    if (results) {
      // Add genre request
      results.genres = results.genres.map((genre) => {
        if (genre._id) {
          return {
            ...genre,
            request: {
              type: "GET",
              url:
                req.protocol + "://" + req.get("host") + `/genres/${genre._id}`,
            },
          };
        }
      });
      if (results.director._id) {
        results.director = {
          ...results.director,
          request: {
            type: "GET",
            url:
              req.protocol +
              "://" +
              req.get("host") +
              `/directors/${results.director._id}`,
          },
        };
      }
      // Return response
      res.status(200).json({
        movie: results,
        request: {
          type: "GET",
          description: "Get all movies",
          url: req.protocol + "://" + req.get("host") + "/movies",
        },
      });
    } else {
      // 404 if ID is not in the DB
      res.status(404).json({
        message: `No valid entry found for provided id ${id}`,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({error});
  }
};

// Add a movie (restricted)
exports.movies_add_movie = (req, res) => {
  let genreData;
  // Genre data passed by middleware
  // Director data is also passed by middleware
  if (res.genreData.length > 0) {
    genreData = res.genreData;
  } else {
    genreData = req.body.genres.map(genre => {
      return {name: genre}
    });
  }
  // New movie
  const movie = new Movie({
    _id: mongoose.Types.ObjectId(),
    title: req.body.title,
    director: res.directorData,
    releaseYear: req.body.releaseYear,
    runtimeMinutes: req.body.runtimeMinutes,
    genres: genreData,
  });
  movie
    .save()
    .then((result) => {
      const path = req.protocol + "://" + req.get("host") + req.originalUrl;
      delete result._doc.__v;
      // Add genre request urls for each genre
      result.genres = result.genres.map(genre => {
        if (genre._id) {
          return {
            ...genre._doc,
            request: {
              type: "GET",
              url:
                req.protocol + "://" + req.get("host") + `/genres/${genre._id}`,
            },
          };
        }
        return genre;  
      });
      // Add director request
      if (result.director._id) {
        result._doc.director._doc = {
          ...result._doc.director._doc,
          request: {
            type: 'GET',
            url: req.protocol + '://' + req.get('host') + `/directors/${result.director._id}`
          }
        }
      }
      res.status(201).json({
        createdMovie: result._doc,
        request: {
          type: "GET",
          url: path + `/${result._id}`,
        },
      });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ error: error });
    });
};

// Update movie
// Example object to change the properties of a document:
// Array of objects that have 2 keys:
// propName: property the authenticated user wants to change
// value: new value for that property
// [{"propName": "title", "value": "newTitleValue" }]
exports.movies_update_movie = (req, res) => {
  const id = req.params.movieId;
  const updateOps = {};
  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }
  Movie.update({ _id: id }, { $set: updateOps })
    .exec()
    .then((result) => {
      const path = req.protocol + "://" + req.get("host") + req.originalUrl;
      console.log(result);
      res.status(200).json({
        message: "Updated movie",
        request: {
          type: "GET",
          link: path,
        },
      });
    })
    .catch((error) => {
      console.log(error);
      res.status(200).json({ error: error });
    });
};

// Delete movie document
exports.movies_delete_movie = (req, res) => {
  const id = req.params.movieId;
  Movie.deleteOne({ _id: id })
    .exec()
    .then((result) => {
      console.log(result);
      if (result) {
        res.status(200).json({
          message: "Deleted movie",
          request: {
            type: "POST",
            url: req.protocol + "://" + req.get("host") + "/movies",
            body: {
              name: "String",
              director: "String",
              release_date: "Number",
              genre: "Array",
            },
          },
        });
      } else {
        res.status(404).json({
          message: `No valid entry found with provided id ${id}`,
        });
      }
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ error: error });
    });
};

// Get movie data for movies of specific genre
exports.movies_specific_genre = (req, res) => {
  // Get results passed from the pagination middleware
  const response = res.paginatedResults;
  // Format movie data
  response.movies = response.movies.map(movie => {
    // Add genre requests
    movie.genres = movie.genres.map(genre => {
      if (genre._id) {
        return {
          ...genre,
          request: {
            type: 'GET',
            url: req.protocol + '://' + req.get('host') + `/genres/${genre._id}`
          }
        }
      }
      return genre;
    })
    // Add director request
    if (movie.director._id) {
      movie.director = {
        ...movie.director,
        request: {
          type: 'GET',
          url: req.protocol + '://' + req.get('host') + `/directors/${movie.director._id}`
        }
      }
    }
    return movie;
  });
  res.status(200).json(response);
};

// Get movie data for specific director
exports.movies_specific_director = (req, res) => {
  // Data passed by pagination middleware
  const response = res.paginatedResults;
  // Format movie data
  response.movies = response.movies.map(movie => {
    // Add genre requests
    movie.genres = movie.genres.map(genre => {
      if (genre._id) {
        return {
          ...genre,
          request: {
            type: 'GET',
            url: req.protocol + '://' + req.get('host') + `/genres/${genre._id}`
          }
        }
      }
      return genre;
    })
    // Add director request
    if (movie.director._id) {
      movie.director = {
        ...movie.director,
        request: {
          type: 'GET',
          url: req.protocol + '://' + req.get('host') + `/directors/${movie.director._id}`
        }
      }
    }
    return movie;
  })
  
  res.status(200).json(response);
};
