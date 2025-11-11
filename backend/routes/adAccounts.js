const express = require("express");
const { fetchAdAccounts } = require("../controllers/adAccountController");
const { authenticateUser } = require("../middlewares/authMiddleware");
const router = express.Router();
router.get("/", authenticateUser, fetchAdAccounts);

module.exports = router;
