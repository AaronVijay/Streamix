const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const mongoose = require('mongoose');
const session = require('express-session');
const User = require('./models/users');
const methodOverride = require('method-override');


app.use(methodOverride('_method'));

// Middleware to parse form data and JSON body data
app.use(express.urlencoded({ extended: false }));  // For parsing form data
app.use(express.json());  // For parsing JSON data

// Session middleware 
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));


// Check if mongoose is already connected before connecting
if (mongoose.connection.readyState === 0) {
    mongoose.connect('mongodb://127.0.0.1:27017/streamixDB')
        .then(() => console.log("MongoDB connected"))
        .catch(err => console.log("DB error", err));
}


// Set up EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//static files
app.use(express.static(path.join(__dirname, 'public')));

// Global to hold current user (temporary)
let currentUser = null;

// Routes
app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.get('/main', (req, res) => {
    res.render('mainPage');
});

app.get('/', (req, res) => {
    res.redirect('/login');
});




app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username, password });
        if (!user) {
            return res.send('Invalid credentials');
        }

        req.session.userId = user._id;  // Save only the userId in the session
        res.redirect('/main');
    } catch (err) {
        res.status(500).send('Server error');
    }
});

app.post('/register', async (req, res) => {
    const { username, password, email, phone, gender, dob } = req.body;

    console.log(req.body); 

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.send('Username already exists');
        }

        const newUser = new User({ username, password, email, phone, gender, dob });
        await newUser.save();
        res.redirect('/login');
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).send('Error registering user');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});





app.get('/profile', async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login');  // Redirect to login if user is not logged in
    }

    try {
        const user = await User.findById(req.session.userId);  // Use userId from session
        res.render('profile', { user });  // Render profile.ejs with user data
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching user data');
    }
});



// Route to render the edit profile page with user data
app.get('/profile/edit', async (req, res) => {
    try {
        const user = await User.findById(req.session.userId); // Assuming the user ID is stored in the session
        res.render('editProfile', { user });
    } catch (err) {
        console.error('Error fetching user:', err);
        res.status(500).send('Internal Server Error');
    }
});

// Route to handle the update of the user profile
app.post('/profile/:id/edit', async (req, res) => {
    try {
        const { username, email, phone, dob, gender } = req.body;
        const updatedUser = await User.findByIdAndUpdate(req.params.id, {
            username,
            email,
            phone,
            dob,
            gender
        }, { new: true });

        // Redirect to the profile page or any page to reflect changes
        res.redirect('/profile');
    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).send('Internal Server Error');
    }
});


//movie route
app.get('/movies/video/:movieFile', (req, res) => {
    const movieFile = req.params.movieFile;
    const moviePath = path.join(__dirname, 'public', 'movies', movieFile);

    // Check if file exists
    fs.access(moviePath, fs.constants.F_OK, (err) => {
        if (err) {
            console.error('Movie file not found:', moviePath);
            return res.status(404).send('Movie file not found');
        }

        // Force browser to treat it as inline media
        res.setHeader('Content-Type', 'video/mp4');
        res.setHeader('Content-Disposition', 'inline');  // IMPORTANT
        res.sendFile(moviePath);
    });
});





// Start server
const port = 3400;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
