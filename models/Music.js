const mongoose = require('mongoose');

const musicSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    artist: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    genre: {
        type: String,
        default: null
    },
    album: {
        type: String,
        default: null
    },
    releaseDate: {
        type: Date,
        default: Date.now
    }
});

const Music = mongoose.model('Music', musicSchema);

module.exports = Music;