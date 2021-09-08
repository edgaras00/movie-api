const mongoose = require("mongoose");
const Director = require("../models/directors");

// Display all results
exports.directors_get_all = (req, res) => {
  res.status(200).json(res.paginatedResults);
};

// Add a new director
exports.directors_add_director = (req, res) => {
  const director = new Director({
    _id: mongoose.Types.ObjectId(),
    name: req.body.name,
  });
  director
    .save()
    .then((result) => {
      const path = req.protocol + "://" + req.get("host") + req.originalUrl;
      console.log(result);
      delete result._doc.__v;
      res.status(201).json({
        message: "Added director",
        createdDirector: result._doc,
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

// Get information for a single director
exports.directors_get_single = (req, res) => {
  const id = req.params.directorId;
  Director.findById(id)
    .select("-__v")
    .exec()
    .then((doc) => {
      console.log(doc);
      if (doc) {
        const path = req.protocol + "://" + req.get("host");
        res.status(200).json({
          director: doc,
          requests: [
            {
              type: "GET",
              description: "Get all directors",
              url: path + "/directors",
            },
            {
              type: "GET",
              description: `Get all movies directed by ${doc.name}`,
              url: path + `/movies/directors/${doc._id}`,
            },
          ],
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

// Update director
// [{"propName": "name", "value": "newValue"}]
exports.directors_update_director = (req, res) => {
  const id = req.params.id;
  const updateOps = {};
  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }
  Director.update({ _id: id }, { $set: updateOps })
    .exec()
    .then((result) => {
      console.log(result);
      res.status(200).json({
        message: "Updated director",
        request: {
          type: "GET",
          url: req.protocol + "://" + req.get("host") + req.originalUrl,
        },
      });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ error: error });
    });
};

// Delete director
exports.directors_delete_director = (req, res) => {
  const id = req.params.directorId;
  Director.deleteOne({ _id: id })
    .exec()
    .then((result) => {
      console.log(result);
      res.status(200).json({
        message: "Deleted director",
        request: {
          type: "POST",
          url: req.protocol + "://" + req.get("host") + "/directors",
          body: {
            name: "String",
            movies: "Array",
          },
        },
      });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ error: error });
    });
};
