const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true // Đảm bảo tên người dùng là duy nhất
    },
    email: {
        type: String,
        required: true,
        unique: true // Đảm bảo email là duy nhất
    },
    password: {
        type: String,
        required: true
    },
    profilePicture: {
        type: String,
        default: null
    },
    bio: {
        type: String,
        default: null
    },
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Tham chiếu đến model User
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Tham chiếu đến model User
    }],
    role: {
        type: String,
        default: 'user'
    },
    verified: {
        type: Boolean,
        default: false
    },
    notifications: [{
        type: String,
        default: []
    }],
    privacy: {
        type: String,
        default: null
    },
    favoriteMusic: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Music' // Tham chiếu đến model Music
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Tạo model User
const User = mongoose.model('User', userSchema);

module.exports = User;