const { getDB } = require('../config/database');

// Get favorites
const getFavorites = async (req, res, next) => {
  try {
    const db = getDB();
    const usersCollection = db.collection('users');
    const { email } = req.params;
    
    const user = await usersCollection.findOne(
      { email: decodeURIComponent(email) },
      { projection: { favorites: 1 } }
    );
    
    res.json({
      success: true,
      data: user?.favorites || [],
    });
  } catch (error) {
    next(error);
  }
};

// Update favorites
const updateFavorites = async (req, res, next) => {
  try {
    const db = getDB();
    const usersCollection = db.collection('users');
    const { email } = req.params;
    const { favorites } = req.body;
    
    if (!Array.isArray(favorites)) {
      return res.status(400).json({
        success: false,
        error: 'Favorites must be an array',
      });
    }
    
    await usersCollection.findOneAndUpdate(
      { email: decodeURIComponent(email) },
      {
        $set: { favorites, updatedAt: new Date() },
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
  getFavorites,
  updateFavorites,
};








