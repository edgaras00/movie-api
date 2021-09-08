const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// Import routes
const movieRoutes = require('./api/routes/movies');
const genreRoutes = require('./api/routes/genres');
const directorRoutes = require('./api/routes/directors');
const userRoutes = require('./api/routes/user');
const searchRoutes = require('./api/routes/search');


// Start express instance
const app = express();

// Connect to the database
mongoose.connect(
    process.env.DB_CONNECT,
    {useUnifiedTopology: true, useNewUrlParser: true},
    () => console.log('Connected to the database')
);

// Enable CORS
app.use(cors());
// Parse JSON and urlencoded (not rich-text) data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Middleware to use routes
app.use('/movies', movieRoutes);
app.use('/genres', genreRoutes);
app.use('/directors', directorRoutes);
app.use('/user', userRoutes);
app.use('/search', searchRoutes);

// Error handling
// 404 if path not found
// 500 (server error) for anything else 
app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error)
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    })
});

// PORT
const PORT = process.env.PORT || 5000;
// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));