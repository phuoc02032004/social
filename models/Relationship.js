const mongoose = require('mongoose');

const relationshipSchema = new mongoose.Schema({
    userId1: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userId2: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['follow', 'block'], // Xác định các loại mối quan hệ hợp lệ
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Relationship = mongoose.model('Relationship', relationshipSchema);

module.exports = Relationship;