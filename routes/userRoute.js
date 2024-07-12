const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Import model User
const bcrypt = require('bcrypt'); // Import thư viện bcrypt
const jwt = require('jsonwebtoken'); // Import thư viện jsonwebtoken

// Endpoint đăng ký người dùng
router.post('/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Xác thực dữ liệu đầu vào
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Thiếu thông tin' });
        }

        // Kiểm tra xem username hoặc email đã tồn tại hay chưa
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ error: 'Tên người dùng hoặc email đã tồn tại' });
        }

        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        // Tạo người dùng mới
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: 'Đăng ký thành công!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Endpoint đăng nhập
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Xác thực dữ liệu đầu vào
        if (!email || !password) {
            return res.status(400).json({ error: 'Thiếu thông tin' });
        }

        // Tìm người dùng theo email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
        }

        // So sánh mật khẩu
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
        }

        // Tạo token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

        res.status(200).json({ message: 'Đăng nhập thành công!', token: token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Endpoint lấy thông tin người dùng
router.get('/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'Người dùng không tồn tại' });
        }
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Endpoint cập nhật thông tin người dùng
router.put('/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const updates = req.body;

        // Kiểm tra xem người dùng có tồn tại hay không
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'Người dùng không tồn tại' });
        }

        // Cập nhật thông tin
        const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true });
        res.status(200).json(updatedUser);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Endpoint xóa người dùng
router.delete('/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({ error: 'Người dùng không tồn tại' });
        }
        res.status(200).json({ message: 'Xóa người dùng thành công!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Endpoint theo dõi người dùng
router.post('/:userId/following', async (req, res) => {
    try {
        const userId = req.params.userId;
        const followingId = req.body.followingId;

        // Kiểm tra xem người dùng và người được theo dõi có tồn tại hay không
        const user = await User.findById(userId);
        const followingUser = await User.findById(followingId);
        if (!user || !followingUser) {
            return res.status(404).json({ error: 'Người dùng không tồn tại' });
        }

        // Kiểm tra xem đã theo dõi rồi hay chưa
        if (user.following.includes(followingId)) {
            return res.status(400).json({ error: 'Bạn đã theo dõi người dùng này' });
        }

        // Thêm vào danh sách following
        user.following.push(followingId);
        await user.save();

        // Thêm vào danh sách follower của người được theo dõi
        followingUser.followers.push(userId);
        await followingUser.save();

        res.status(200).json({ message: 'Theo dõi thành công!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Endpoint bỏ theo dõi người dùng
router.delete('/:userId/following', async (req, res) => {
    try {
        const userId = req.params.userId;
        const followingId = req.body.followingId;

        // Kiểm tra xem người dùng và người được theo dõi có tồn tại hay không
        const user = await User.findById(userId);
        const followingUser = await User.findById(followingId);
        if (!user || !followingUser) {
            return res.status(404).json({ error: 'Người dùng không tồn tại' });
        }

        // Kiểm tra xem đã theo dõi hay chưa
        if (!user.following.includes(followingId)) {
            return res.status(400).json({ error: 'Bạn chưa theo dõi người dùng này' });
        }

        // Xóa khỏi danh sách following
        user.following = user.following.filter(id => id !== followingId);
        await user.save();

        // Xóa khỏi danh sách follower của người được theo dõi
        followingUser.followers = followingUser.followers.filter(id => id !== userId);
        await followingUser.save();

        res.status(200).json({ message: 'Bỏ theo dõi thành công!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Endpoint chặn người dùng
router.post('/:userId/blocking', async (req, res) => {
    try {
        const userId = req.params.userId;
        const blockingId = req.body.blockingId;

        // Kiểm tra xem người dùng và người bị chặn có tồn tại hay không
        const user = await User.findById(userId);
        const blockingUser = await User.findById(blockingId);
        if (!user || !blockingUser) {
            return res.status(404).json({ error: 'Người dùng không tồn tại' });
        }

        // Kiểm tra xem đã chặn rồi hay chưa
        if (user.blocking.includes(blockingId)) {
            return res.status(400).json({ error: 'Bạn đã chặn người dùng này' });
        }

        // Thêm vào danh sách blocking
        user.blocking.push(blockingId);
        await user.save();

        res.status(200).json({ message: 'Chặn thành công!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Endpoint bỏ chặn người dùng
router.delete('/:userId/blocking', async (req, res) => {
    try {
        const userId = req.params.userId;
        const blockingId = req.body.blockingId;

        // Kiểm tra xem người dùng và người bị chặn có tồn tại hay không
        const user = await User.findById(userId);
        const blockingUser = await User.findById(blockingId);
        if (!user || !blockingUser) {
            return res.status(404).json({ error: 'Người dùng không tồn tại' });
        }

        // Kiểm tra xem đã chặn hay chưa
        if (!user.blocking.includes(blockingId)) {
            return res.status(400).json({ error: 'Bạn chưa chặn người dùng này' });
        }

        // Xóa khỏi danh sách blocking
        user.blocking = user.blocking.filter(id => id !== blockingId);
        await user.save();

        res.status(200).json({ message: 'Bỏ chặn thành công!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
