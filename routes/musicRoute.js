const express = require('express');
const router = express.Router();
const Music = require('../models/Music'); // Import model Music

// Endpoint thêm bài nhạc
router.post('/', async (req, res) => {
    try {
        const { title, artist, url, genre, album } = req.body;

        // Xác thực dữ liệu đầu vào
        if (!title || !artist || !url) {
            return res.status(400).json({ error: 'Thiếu thông tin' });
        }

        // Tạo bài nhạc mới
        const newMusic = new Music({ title, artist, url, genre, album });
        await newMusic.save();
        res.status(201).json({ message: 'Thêm bài nhạc thành công!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Endpoint lấy danh sách bài nhạc
router.get('/', async (req, res) => {
    try {
        const musics = await Music.find();
        res.status(200).json(musics);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Endpoint lấy thông tin chi tiết bài nhạc
router.get('/:musicId', async (req, res) => {
    try {
        const musicId = req.params.musicId;
        const music = await Music.findById(musicId);
        if (!music) {
            return res.status(404).json({ error: 'Bài nhạc không tồn tại' });
        }
        res.status(200).json(music);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Endpoint cập nhật bài nhạc
router.put('/:musicId', async (req, res) => {
    try {
        const musicId = req.params.musicId;
        const updates = req.body;

        // Kiểm tra xem bài nhạc có tồn tại hay không
        const music = await Music.findById(musicId);
        if (!music) {
            return res.status(404).json({ error: 'Bài nhạc không tồn tại' });
        }

        // Cập nhật thông tin bài nhạc
        const updatedMusic = await Music.findByIdAndUpdate(musicId, updates, { new: true });
        res.status(200).json(updatedMusic);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Endpoint xóa bài nhạc
router.delete('/:musicId', async (req, res) => {
    try {
        const musicId = req.params.musicId;
        const music = await Music.findByIdAndDelete(musicId);
        if (!music) {
            return res.status(404).json({ error: 'Bài nhạc không tồn tại' });
        }
        res.status(200).json({ message: 'Xóa bài nhạc thành công!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;