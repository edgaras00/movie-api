const mongoose = require('mongoose');
const Director = require('../models/directors');

// Middleware to check the database has director information for the specific
// movie that the user adds
// Creates a new entry in the DB if it is a new director

module.exports = (req, res, next) => {
    // Check the database if director info already exists
    Director.findOne({name: req.body.director})
    .select('-__v')
    .exec()
    .then(result => {
        console.log(result);
        
        // Add director info if it is a new director
        if (result === null) {
            const newDirector = new Director({
                _id: mongoose.Types.ObjectId(),
                name: req.body.director
            });
            newDirector.save()
            .then(result => {
                console.log(result);
                delete result._doc.__v;
                res.directorData = result;
                next();
            })
            .catch(error => {
                console.log(error);
                res.status(500).json({error: error});
            })
        } else {
            // Use existing informatio if director is in the DB
            res.directorData = result;
            next();
        }

       
    })
    .catch(error => {
        console.log(error);
        res.status(500).json({error: error});
    });
}