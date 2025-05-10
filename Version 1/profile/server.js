const express = require('express');
const path = require('path');
const multer = require('multer');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');

const app = express();

// Middleware setup
app.use(cors());
app.use(helmet());
app.use(morgan('tiny'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (including profile images) from 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Rate-limiting for sensitive routes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: 'Too many requests, please try again later.',
});
app.use(limiter);

// Set up multer for profile picture upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/profile-pics/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Example user profile
let userProfile = {
  name: 'test',
  email: 'test@gmail.com',
  phone: '123-456-7890',
  plan: 'Premium',
  expiry: '2000-11-11',
  devices: 3,
  profilePicUrl: '/profile-pics/astronaut.jpg',
};

// Authentication Middleware
const isAuthenticated = (req, res, next) => {
  const authenticated = true; // For demo purposes
  if (authenticated) return next();
  res.status(401).json({ error: 'Unauthorized' });
};

// Routes
app.get('/profile', isAuthenticated, (req, res) => {
  res.json(userProfile);
});

app.post(
  '/profile',
  isAuthenticated,
  [
    body('name').isString().notEmpty().withMessage('Name must be a non-empty string'),
    body('email').isEmail().withMessage('Email must be valid'),
    body('phone').isMobilePhone().withMessage('Phone number must be valid'),
    body('devices').isInt({ min: 1 }).withMessage('Devices must be a positive integer'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, email, phone, plan, expiry, devices } = req.body;
    userProfile = { name, email, phone, plan, expiry, devices, profilePicUrl: userProfile.profilePicUrl };
    res.json({ message: 'Profile updated successfully', userProfile });
  }
);

app.post('/upload-profile-pic', isAuthenticated, upload.single('profilePic'), (req, res) => {
  const profilePicUrl = `/profile-pics/${req.file.filename}`;
  userProfile.profilePicUrl = profilePicUrl;
  res.json({ message: 'Profile picture updated successfully', profilePicUrl });
});

// Error handler (catch-all)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
