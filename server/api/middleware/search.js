function search(model, route) {

  return async (req, res, next) => {
    // Query text
    const query = req.query.query;
    const path = req.protocol + "://" + req.get("host");
    const url = req.originalUrl;
    // Initiate empty response object

    const response = {};

    // Pagination
    const page = req.query.page ? parseInt(req.query.page) : 1;
    let limit = req.query.limit ? parseInt(req.query.limit) : 20;
    if (limit > 20) {
      limit = 20;
    };

    // Start and end indices
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;


    // Add link to previous page data if available
    if (startIndex > 0) {
      response.previous = {
        page: page - 1,
        limit: limit,
        request: {
          type: "GET",
          description: "Get the previous page results",
          url: path + url + `&page=${page-1}&limit=${limit}`
        }
      }
    };
    
    // Add link to the next page data if available
    if (endIndex < (await model.countDocuments({$text: {$search: query}}).exec())) {
      response.next = {
        page: page + 1,
        limit: limit,
        request: {
          type: "GET",
          description: "Get the next page results",
          url: path + url + `&page=${page+1}&limit=${limit}`
        }
      }
    };


    try {
      // Perform text search
      response.results = await model
        .find({ $text: { $search: query } })
        .limit(limit)
        .skip(startIndex)
        .select("-__v")
        .exec();

      // Number of returned results
      response.count = response.results.length;
      // Format movie genre and director objects
      response.results = response.results.map(result => {
          result.genres = result.genres.map(genre => {
            return {
              ...genre,
              request: {
                type: 'GET',
                url: req.protocol + '://' + req.get('host') + `/genres/${genre._id}`
              }
            }
          });
          result.director = {
            ...result.director,
            request: {
              type: 'GET',
              url: req.protocol + '://' + req.get('host') + `/directors/${result.director._id}`
            }
          }
          return {
              ...result._doc,
              request: {
                  type: 'GET',
                  url: path + `/${route}/${result._id}`
              }
          }
      });
      res.searchResults = response;
      next();
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error });
    }
  };
}

module.exports = search;
