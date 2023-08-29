const express = require('express');
const { getMe, allUsers } = require('../controllers/user');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, allUsers);
router.get('/me', protect, getMe);

module.exports = router;
