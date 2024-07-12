const express = require('express');
const router = express.Router();
const Video = require('../models/Video');
const firebase = require('../utils/firebase');
const multer = require('multer');
const fs = require('fs'); // Import thư viện fs
const { Readable } = require('stream'); // Import thư viện stream

// Cấu hình multer để xử lý file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Lưu file tạm thời vào thư mục 'uploads/'
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Endpoint đăng video
router.post('/', upload.fields([{ name: 'video', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), async (req, res) => {
    try {
        const { userId, title, description, musicId } = req.body;
        const videoFile = req.files.video[0];
        const thumbnailFile = req.files.thumbnail[0];

        // Xác thực dữ liệu đầu vào
        if (!userId || !title || !videoFile || !thumbnailFile || !musicId) {
            return res.status(400).json({ error: 'Thiếu thông tin' });
        }

        // Upload video và thumbnail lên Firebase Storage
        const videoStream = fs.createReadStream(videoFile.path);
        const thumbnailStream = fs.createReadStream(thumbnailFile.path);

        const videoUrl = await firebase.upload(videoStream, `videos/${videoFile.originalname}`);
        const thumbnailUrl = await firebase.upload(thumbnailStream, `thumbnails/${thumbnailFile.originalname}`);

        // Tạo video mới
        const newVideo = new Video({ userId, title, description, videoUrl, thumbnailUrl, musicId });
        await newVideo.save();
        res.status(201).json({ message: 'Đăng video thành công!', videoUrl, thumbnailUrl });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
// Endpoint lấy danh sách video
router.get('/', async (req, res) => {
    try {
        const videos = await Video.find().populate('userId'); // Populate userId để lấy thông tin người dùng
        res.status(200).json(videos);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Endpoint lấy thông tin chi tiết video
router.get('/:videoId', async (req, res) => {
    try {
        const videoId = req.params.videoId;
        const video = await Video.findById(videoId).populate('userId musicId'); // Populate userId và musicId
        if (!video) {
            return res.status(404).json({ error: 'Video không tồn tại' });
        }
        res.status(200).json(video);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Endpoint cập nhật video
router.put('/:videoId', async (req, res) => {
    try {
        const videoId = req.params.videoId;
        const updates = req.body;

        // Kiểm tra xem video có tồn tại hay không
        const video = await Video.findById(videoId);
        if (!video) {
            return res.status(404).json({ error: 'Video không tồn tại' });
        }

        // Cập nhật thông tin video
        const updatedVideo = await Video.findByIdAndUpdate(videoId, updates, { new: true });
        res.status(200).json(updatedVideo);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Endpoint xóa video
router.delete('/:videoId', async (req, res) => {
    try {
        const videoId = req.params.videoId;
        const video = await Video.findByIdAndDelete(videoId);
        if (!video) {
            return res.status(404).json({ error: 'Video không tồn tại' });
        }
        res.status(200).json({ message: 'Xóa video thành công!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Endpoint thêm bình luận
router.post('/:videoId/comments', async (req, res) => {
    try {
        const videoId = req.params.videoId;
        const userId = req.body.userId;
        const content = req.body.content;

        // Xác thực dữ liệu đầu vào
        if (!userId || !content) {
            return res.status(400).json({ error: 'Thiếu thông tin' });
        }

        // Tạo bình luận mới
        const newComment = new Comment({ videoId, userId, content });
        await newComment.save();

        // Thêm bình luận vào mảng comments của video
        const video = await Video.findById(videoId);
        video.comments.push(newComment._id);
        await video.save();

        res.status(201).json({ message: 'Thêm bình luận thành công!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Endpoint lấy danh sách bình luận
router.get('/:videoId/comments', async (req, res) => {
    try {
        const videoId = req.params.videoId;
        const comments = await Comment.find({ videoId }).populate('userId'); // Populate userId để lấy thông tin người dùng
        res.status(200).json(comments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Endpoint cập nhật bình luận
router.put('/:videoId/comments/:commentId', async (req, res) => {
    try {
        const videoId = req.params.videoId;
        const commentId = req.params.commentId;
        const content = req.body.content;

        // Kiểm tra xem bình luận có tồn tại hay không
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ error: 'Bình luận không tồn tại' });
        }

        // Cập nhật nội dung bình luận
        comment.content = content;
        await comment.save();
        res.status(200).json({ message: 'Cập nhật bình luận thành công!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Endpoint xóa bình luận
router.delete('/:videoId/comments/:commentId', async (req, res) => {
    try {
        const videoId = req.params.videoId;
        const commentId = req.params.commentId;
        const comment = await Comment.findByIdAndDelete(commentId);
        if (!comment) {
            return res.status(404).json({ error: 'Bình luận không tồn tại' });
        }
        // Xóa bình luận khỏi mảng comments của video
        const video = await Video.findById(videoId);
        video.comments = video.comments.filter(id => id !== commentId);
        await video.save();
        res.status(200).json({ message: 'Xóa bình luận thành công!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Endpoint thêm like
router.post('/:videoId/likes', async (req, res) => {
    try {
        const videoId = req.params.videoId;
        const userId = req.body.userId;

        // Kiểm tra xem video và người dùng có tồn tại hay không
        const video = await Video.findById(videoId);
        const user = await User.findById(userId);
        if (!video || !user) {
            return res.status(404).json({ error: 'Video hoặc người dùng không tồn tại' });
        }

        // Kiểm tra xem người dùng đã like rồi hay chưa
        if (video.likes.includes(userId)) {
            return res.status(400).json({ error: 'Bạn đã like video này' });
        }

        // Thêm like vào video
        video.likes.push(userId);
        await video.save();

        res.status(200).json({ message: 'Like thành công!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Endpoint hủy like
router.delete('/:videoId/likes', async (req, res) => {
    try {
        const videoId = req.params.videoId;
        const userId = req.body.userId;

        // Kiểm tra xem video và người dùng có tồn tại hay không
        const video = await Video.findById(videoId);
        const user = await User.findById(userId);
        if (!video || !user) {
            return res.status(404).json({ error: 'Video hoặc người dùng không tồn tại' });
        }

        // Kiểm tra xem người dùng đã like rồi hay chưa
        if (!video.likes.includes(userId)) {
            return res.status(400).json({ error: 'Bạn chưa like video này' });
        }

        // Xóa like khỏi video
        video.likes = video.likes.filter(id => id !== userId);
        await video.save();

        res.status(200).json({ message: 'Hủy like thành công!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;