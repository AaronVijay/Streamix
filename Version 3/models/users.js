const mongoose = require('mongoose');

// Define the schema for a user
const userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true 
    },
    phone: { 
        type: String, 
        required: true 
    },
    gender: { 
        type: String, 
        required: true 
    },
    dob: { 
        type: Date, 
        required: true 
    }
});

// Create a model based on the schema
const User = mongoose.model('User', userSchema);

// Export the User model for use in other files
module.exports = User;
