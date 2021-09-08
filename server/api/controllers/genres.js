const mongoose = require('mongoose');
const Genre = require('../models/genres');
const Movie = require('../models/movies');

// Genre controllers

// Get all genre data
exports.genres_get_all = (req, res) => {
  // Paginated results passed by a middleware
  res.status(200).json(res.paginatedResults);
};

// Add genre document
exports.genres_add_genre = (req, res) => {
  const path = req.protocol + '://' + req.get('host') + req.originalUrl;
  const genre = new Genre({
    _id: mongoose.Types.ObjectId(),
    name: req.body.name,
  });
  genre.save()
  .then(result => {
    console.log(result);
    delete result._doc.__v;
    res.status(201).json({
      createdGenre: result._doc,
      request: {
        type: 'GET',
        url: path + `/${result._id}`
      }
    })
  })
  .catch(error => {
    console.log(error);
    res.status(500).json({error: error})
  });
}

// Get genre by ID
exports.genres_get_single = (req, res) => {
  const id = req.params.genreId;
  Genre.findById(id)
    .select("-__v")
    .exec()
    .then((doc) => {
      const path = req.protocol + '://' + req.get('host');
      console.log(doc);
      if (doc) {
        res.status(200).json({
          genre: doc,
          requests: [
            {
              type: 'GET',
              description: 'Get all genres',
              url: path + '/genres',
            },
            {
              type: 'GET',
              description: `Get all ${doc.name} movies`,
              url: path + `/movies/genres/${doc._id}`
            }
          ]
        });
      } else {
        res.status(404).json({
          message: `No valid entry found for provided id ${id}`,
        });
      }
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ error: error });
    });
};

// Update genre
// Example object to change genre data:
// [{"propName": "name"}]
exports.genres_update_genre = (req, res) => {
  const id = req.params.genreId;
  const updateOps = {};
  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }
  Genre.update({ _id: id }, { $set: updateOps })
    .exec()
    .then((result) => {
      console.log(result);
      res.status(200).json({
        message: "Updated genre",
        request: {
          type: "GET",
          url: req.protocol + "://" + req.get("host") + req.originalUrl,
        },
      });
    })
    .catch((error) => {
      console.log(error);
      res.status(200).json({ error: error });
    });
};

// Delete genre
exports.genres_delete_genre = (req, res) => {
  const id = req.params.genreId;
  Genre.remove({ _id: id })
    .exec()
    .then((result) => {
      console.log(result);
      res.status(200).json({
        message: "Deleted genre",
        request: {
          type: "POST",
          url: req.protocol + "://" + req.get("host") + "/genres",
          body: {
            name: "String",
            movies: "Array",
          },
        },
      });
    })
    .catch();
};