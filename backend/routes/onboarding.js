// routes/onboarding.js (Using custom helper functions)
const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authMiddleware').authenticateUser;
const { getOnboardingStatus, updateOnboardingStatus } = require('../utils/sqlFunctions');

// GET: Fetch user onboarding status
router.get('/onboarding-status', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.uuid;

    const result = await getOnboardingStatus(userId);

    // console.log('User ID:=>>>>>>>>>>>>>>>>>>>>>', result);
    if (!result) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      hasSeenOnboarding: result.has_seen_onboarding === 1,
      hasSeenInterestMinerTutorial: result.has_seen_interest_miner_tutorial === 1
    });

  } catch (error) {
    console.error('Error fetching onboarding status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT: Update onboarding status
router.put('/onboarding-status', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.uuid;

    // console.log('User ID:=>>>>>>>>>>>>>>>>>>>>>', req.user);
    const { hasSeenOnboarding, hasSeenInterestMinerTutorial } = req.body;
    const updatedBy = req.user.email || req.user.name || 'system';

    await updateOnboardingStatus(
      userId,
      hasSeenOnboarding,
      hasSeenInterestMinerTutorial,
      updatedBy
    );

    res.json({
      message: 'Onboarding status updated successfully',
      hasSeenOnboarding,
      hasSeenInterestMinerTutorial
    });

  } catch (error) {
    console.error('Error updating onboarding status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
