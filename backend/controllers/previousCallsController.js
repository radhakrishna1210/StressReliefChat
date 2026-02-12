const { getDB } = require('../config/database');

// Get previous calls
const getPreviousCalls = async (req, res, next) => {
  try {
    const db = getDB();
    const usersCollection = db.collection('users');
    const { email } = req.params;
    
    const user = await usersCollection.findOne(
      { email: decodeURIComponent(email) },
      { projection: { previousCalls: 1 } }
    );
    
    res.json({
      success: true,
      data: user?.previousCalls || [],
    });
  } catch (error) {
    next(error);
  }
};

// Update previous calls
const updatePreviousCalls = async (req, res, next) => {
  try {
    const db = getDB();
    const usersCollection = db.collection('users');
    const { email } = req.params;
    const { previousCalls } = req.body;
    
    if (!Array.isArray(previousCalls)) {
      return res.status(400).json({
        success: false,
        error: 'Previous calls must be an array',
      });
    }
    
    await usersCollection.findOneAndUpdate(
      { email: decodeURIComponent(email) },
      {
        $set: { previousCalls, updatedAt: new Date() },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true }
    );
    
    res.json({
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPreviousCalls,
  updatePreviousCalls,
};





