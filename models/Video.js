const mongoose = require('mongoose');
const firebase = require('../utils/firebase');

const videoSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: null
    },
    videoUrl: {
        type: String,
        required: true
    },
    thumbnailUrl: {
        type: String,
        required: true
    },
    likes: {
        type: Number,
        default: 0
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment' // Tham chiếu đến model Comment
    }],
    musicId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Music',
        required: true
    },
    views: {
        type: Number,
        default: 0
    },
    tags: [{
        type: String
    }],
    duration: {
        type: Number,
        default: 0
    },
    private: {
        type: Boolean,
        default: false
    },
    commentsDisabled: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Tạo model Video
const Video = mongoose.model('Video', videoSchema);

module.exports = Video