// Show search results
exports.search_movies = (req, res) => {
    res.status(200).json(res.searchResults);
}