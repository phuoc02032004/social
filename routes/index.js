const express = require('express');
const router = express.Router();

// Import các router
const userRouter = require('./userRoute');
const videoRouter = require('./videoRoute');

// Sử dụng các router
router.use('/users', userRouter);
router.use('/videos', videoRouter);

// Xuất router chính
module.exports = router;