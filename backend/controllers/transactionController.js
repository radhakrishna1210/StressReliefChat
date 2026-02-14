const { getDB } = require('../config/database');

// Get transactions
const getTransactions = async (req, res, next) => {
  try {
    const db = getDB();
    const transactionsCollection = db.collection('transactions');
    const { email } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    
    const transactions = await transactionsCollection
      .find({ userEmail: decodeURIComponent(email) })
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();
    
    res.json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
};

// Add transaction
const addTransaction = async (req, res, next) => {
  try {
    const db = getDB();
    const transactionsCollection = db.collection('transactions');
    const { email } = req.params;
    const transaction = req.body;
    
    const result = await transactionsCollection.insertOne({
      ...transaction,
      userEmail: decodeURIComponent(email),
      timestamp: transaction.timestamp ? new Date(transaction.timestamp) : new Date(),
    });
    
    res.status(201).json({
      success: true,
      id: result.insertedId,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTransactions,
  addTransaction,
};






