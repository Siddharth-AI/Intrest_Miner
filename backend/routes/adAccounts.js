const express = require("express");
const { fetchAdAccounts } = require("../controllers/adAccountController");
const router = express.Router();
router.get("/", fetchAdAccounts);

module.exports = router;
