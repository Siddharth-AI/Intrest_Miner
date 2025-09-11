const { getTokenFromHeader } = require("../utils/helper");
const { getAdAccounts } = require("../services/metaApiService");

const fetchAdAccounts = async (req, res) => {
  try {
    const token = getTokenFromHeader(req);
    const data = await getAdAccounts(token);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { fetchAdAccounts };
