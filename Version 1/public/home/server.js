const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

// Middleware to serve static files
app.use(express.static(__dirname));

// Route for the landing page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Route for movie1 page
app.get('/movies/movie1', (req, res) => {
  res.sendFile(path.join(__dirname, 'movies', 'movie1', 'index.html'));
});

// Dynamic route for movies
app.get('/movies/:movieId', (req, res) => {
  const movieId = req.params.movieId;
  const moviePath = path.join(__dirname, 'movies', movieId, 'index.html');

  res.sendFile(moviePath, (err) => {
    if (err) {
      res.status(404).send('Movie not found');
    }
  });
});

// Error handling middleware for 404 pages
app.use((req, res) => {
  res.status(404).send('Page not found!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
