const mongoose = require("mongoose");

function pagination(model, route, mode = "all") {
  // Pagination middleware
  // Parameters: 
  // model: Mongoose model
  // route: request route / resource
  // mode: search mode ("movies", "director", "genres")
  // Additional modes for movies route: "genreMovies", "directorMovies"
  return async (req, res, next) => {
    // URL
    const path = req.protocol + "://" + req.get("host");
    // Use entered route url if  default "all" mode is selected
    let url = mode == "all" ? req.originalUrl.split("?")[0] : "/movies";
    // Genre or director id to fetch all movies with that genre/director id
    const genreId = req.params.genreId;
    const directorId = req.params.directorId;

    // query string is used only for "genreMovies" and "directorMovies"
    // Creates query to fetch all movies for that genre/director
    let query;
    switch (mode) {
      case "all":
        query = null;
        break;
      case "genreMovies":
        query = { "genres._id": mongoose.Types.ObjectId(genreId) };
        url += `/genres/${genreId}`
        break;
      case "directorMovies":
        query = { "director._id": mongoose.Types.ObjectId(directorId) };
        url += `/directors/${directorId}`
        break;
    };

    // Pagination

    // Set page = 1 if page data is not in query params
    const page = req.query.page ? parseInt(req.query.page) : 1;
    // Set default return limit as 20 (maximum)
    let limit = req.query.limit ? parseInt(req.query.limit) : 20;
    // Maximum 20 results per page
    if (limit > 20) {
      limit = 20;
    }
    // Calculate start and end indexes
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    // Initiate empty response object
    const response = {};

    // Add previous page data link if available
    if (startIndex > 0) {
      response.previous = {
        page: page - 1,
        limit: limit,
        request: {
          type: "GET",
          description: "Get the previous page data.",
          url: path + url + `?page=${page - 1}&limit=${limit}`,
        },
      };
    }


    // Add next page data if available
    if (endIndex < (await model.countDocuments(query).exec())) {
      response.next = {
        page: page + 1,
        limit: limit,
        request: {
          type: "GET",
          description: "Get the next page data.",
          url: path + url + `?page=${page + 1}&limit=${limit}`,
        },
      };
    }

    // Show current page to the user in the response
    response.currentPage = page;

    // Fetch data from the database
    // Returns all results (paginated) if query has no value
    try {
      response[route] = await model
        .find(query)
        .limit(limit)
        .skip(startIndex)
        .select("-__v")
        .exec();
      // Number of returned results
      response.count = response[route].length;
      // Format returned result object
      response[route] = response[route].map((doc) => {
        return {
          ...doc._doc,
          request: {
            type: "GET",
            url: path + url + `/${doc._id}`,
          },
        };
      });
      // Pass the results to next middleware
      res.paginatedResults = response;
      next();
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error });
    }
  };
}

module.exports = pagination;
