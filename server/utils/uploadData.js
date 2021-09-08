const fs = require("fs");
const mongoose = require("mongoose");
const Director = require("../api/models/directors");
const Movie = require("../api/models/movies");
const Genre = require("../api/models/genres");
const fetch = require("node-fetch");
// const User = require('./api/models/user');
require("dotenv").config();

// node.js script to upload JSON file data to the database

// Read data
const data = JSON.parse(fs.readFileSync(process.argv[2], "utf-8"));

async function logIn() {
  // Function that checks authorization
  const url = "http://localhost:5000/user/login";
  // Login as admin
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
      }),
    });
    // Quit if access denied
    if (response.status !== 200) {
      console.log("Authentication failed.");
      process.exit();
    } else {
      return true;
    }
  } catch (error) {
    console.log(error);
    process.exit();
  }
}

async function getDirector(movie) {
  // Asynchronous function that saves director data to the database
  try {
    const searchResult = await Director.findOne({
      name: movie.director,
    }).select("-__v");
    // Create a new DB entry if director is not present
    if (searchResult === null) {
      const newDirector = new Director({
        _id: mongoose.Types.ObjectId(),
        name: movie.director,
      });
      const savedResult = await newDirector.save();
      delete savedResult._doc.__v;
      // Add director data to movie document
      movie.director = savedResult;
      return movie;
    }
    // Add director data to movie document
    movie.director = searchResult;
    return movie;
  } catch (error) {
    console.log(error);
    process.exit();
  }
}

async function getGenres(movie) {
  // Asynchronous function that saves movie genere data to the database
  try {
    // Look for movie genres
    const searchResult = await Genre.find({ name: movie.genres }).select(
      "-__v"
    );
    // Array that holds genres that are not in the DB yet
    const missingGenres = [];
    // Push new genres to the missingGenres array
    movie.genres.forEach((genre) => {
      if (!searchResult.map((item) => item.name).includes(genre)) {
        missingGenres.push(genre);
      }
    });
    // Create a new genre document if it is not in DB
    if (missingGenres.length > 0) {
      const genreObjects = missingGenres.map((genre) => {
        return new Genre({
          _id: mongoose.Types.ObjectId(),
          name: genre,
        });
      });
      let genres = searchResult;
      const savedResult = await Genre.insertMany(genreObjects);
      savedResult.forEach((item) => delete item._doc.__v);
      genres = [...genres, ...savedResult];
      console.log(genres);
      // Add genre data to movie document
      movie.genres = genres;
      return movie;
    } else {
      // console.log(searchResult);
      // Add genre data to movie document if it is already in DB
      movie.genres = searchResult;
      return movie;
    }
  } catch (error) {
    console.log(error);
    process.exit();
  }
}

// async function saveMovie(movie) {
//     const newMovie = new Movie({
//         _id: mongoose.Types.ObjectId(),
//         title: movie.title,
//         releaseYear: movie.releaseYear,
//         runtimeMinutes: movie.runtimeMinutes,
//         genres: movie.genres,
//         director: movie.director
//     });
//     const savedResult = await newMovie.save();
//     return savedResult;
// }

async function updateMovie(movie) {
  // Async function that adds genre/director data to movie document
  // Wraps getGenres() and getDirector()
  try {
    const genreResult = await getGenres(movie);
    const directorResult = await getDirector(genreResult);
    return directorResult;
  } catch (error) {
    console.log(error);
  }
}

async function uploadData(data) {
  // Async function to upload data to the database
  try {
    // Connect to the DB
    await mongoose.connect(
      process.env.DB_CONNECT,
      {
        useUnifiedTopology: true,
        useNewUrlParser: true,
      },
      () => console.log("Connected to DB")
    );
    // Create an array of promises
    // Each promise is for a movie document
    // Wait until all movie data is finalized before inserting into DB
    const promises = [];
    for (const movie of data) {
      promises.push(updateMovie(movie));
    }
    console.log("Inserting data...");
    // Wait until all promises are resolved
    const results = await Promise.all(promises);
    // Insert finalized movie data
    await Movie.insertMany(results);
    console.log("Data inserted successfully");
    process.exit();
  } catch (error) {
    console.log(error);
  }
}

async function authorizeAndUpload(data) {
  try {
    const authStatus = await logIn();
    if (authStatus) {
      uploadData(data);
    } else {
      console.log("Authentication failed");
      process.exit();
    }
  } catch (error) {
    console.log(error);
  }
}

authorizeAndUpload(data);
// uploadData(data);
