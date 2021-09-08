const mongoose = require('mongoose');

// Genre schema
const genreSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {type: String, required: true}
});


module.exports = mongoose.model('Genre', genreSchema);
