const mongoose = require('mongoose');

// Director schema
const directorSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {type: String, required: true}
})

module.exports = mongoose.model('Director', directorSchema);