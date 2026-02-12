const { getDB } = require('../config/database');

// Get wallet balance
const getWalletBalance = async (req, res, next) => {
  try {
    const db = getDB();
    const usersCollection = db.collection('users');
    const { email } = req.params;

    const user = await usersCollection.findOne(
      { email: decodeURIComponent(email) },
      { projection: { walletBalance: 1 } }
    );

    res.json({
      success: true,
      balance: user?.walletBalance || 0,
    });
  } catch (error) {
    next(error);
  }
};

// Update wallet balance
const updateWalletBalance = async (req, res, next) => {
  try {
    const db = getDB();
    const usersCollection = db.collection('users');
    const { email } = req.params;
    const { amount } = req.body;

    if (typeof amount !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'Amount must be a number',
      });
    }

    const result = await usersCollection.findOneAndUpdate(
      { email: decodeURIComponent(email) },
      {
        $set: { walletBalance: amount, updatedAt: new Date() },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true, returnDocument: 'after' }
    );

    res.json({
      success: true,
      balance: result.value?.walletBalance || 0,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWalletBalance,
  updateWalletBalance,
};





