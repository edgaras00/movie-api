const mongoose = require("mongoose");

// Movie schema
const movieSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  title: { type: String, required: true },
  releaseYear: { type: Number, required: true },
  director: {
    type: Object,
    required: true,
    name: String,
  },
  runtimeMinutes: { type: Number, required: true },
  genres: {
    type: Array,
    required: true,
  },
});

// Create index to support text search
movieSchema.index(
  { title: "text", "director.name": "text" },
  { name: "text-search-index", weights: { title: 10, "director.name": 5 } }
);

module.exports = mongoose.model("Movies", movieSchema);
