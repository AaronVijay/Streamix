const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Set up EJS as the templating engine (optional)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Place EJS files in "views" if needed

// Temporary user storage (Replace with a database later)
const users = [];

// ✅ Serve the login page when opening the website
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login", "login.html"), (err) => {
        if (err) {
            console.error("Error serving login page:", err);
            res.status(500).send("Internal Server Error");
        }
    });
});

// ✅ Serve the register page
app.get("/register", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login", "register.html"), (err) => {
        if (err) {
            console.error("Error serving register page:", err);
            res.status(500).send("Internal Server Error");
        }
    });
});

// ✅ Handle login form submission
app.post("/login", (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        res.redirect("/home");
    } else {
        res.status(401).send("Invalid credentials. <a href='/'>Try again</a>");
    }
});

// ✅ Handle registration form submission
app.post("/register", (req, res) => {
    const { username, password } = req.body;
    
    // Check if the user already exists
    if (users.some(u => u.username === username)) {
        return res.status(400).send("User already exists. <a href='/register'>Try again</a>");
    }

    users.push({ username, password });
    res.redirect("/");
});

// ✅ Serve the home page (after login)
app.get("/home", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "home", "dashboard.html"), (err) => {
        if (err) {
            console.error("Error serving home page:", err);
            res.status(500).send("Internal Server Error");
        }
    });
});

// ✅ Serve the profile page correctly
app.get("/profile", (req, res) => {
    res.redirect("http://localhost:8080/");
});



// ✅ Route to test error handling
app.get('/error-test', (req, res, next) => {
    next(new Error("This is a test error!")); // Pass error directly to error handler
});

// ✅ Handle 404 errors (for undefined routes)
app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, 'public', 'errors', '404.html'), (err) => {
        if (err) {
            res.status(404).send("Page Not Found");
        }
    });
});

// ✅ Global error-handling middleware
app.use((err, req, res, next) => {
    console.error(`[${new Date().toISOString()}] Error: ${err.message}`); // Log error with timestamp

    // Check if the request is from a browser or API
    if (req.headers['accept'] && req.headers['accept'].includes('text/html')) {
        res.status(500).sendFile(path.join(__dirname, 'public', 'errors', '500.html'), (err) => {
            if (err) {
                res.status(500).send("Internal Server Error");
            }
        });
    } else {
        res.status(err.status || 500).json({
            error: true,
            message: err.message || "Something went wrong! Please try again later.",
        });
    }
});

// ✅ Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
