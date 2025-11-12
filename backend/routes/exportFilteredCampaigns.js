const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middlewares/authMiddleware");
const { exportFilteredCampaigns } = require('../controllers/exportController');
router.use(authenticateUser)
router.post('/', exportFilteredCampaigns);

module.exports = router;
