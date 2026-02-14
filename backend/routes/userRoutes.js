const express = require('express');
const router = express.Router();
const { getUser, createOrUpdateUser } = require('../controllers/userController');
const { getWalletBalance, updateWalletBalance } = require('../controllers/walletController');
const { getTransactions, addTransaction } = require('../controllers/transactionController');
const { getFavorites, updateFavorites } = require('../controllers/favoriteController');
const { getPreviousCalls, updatePreviousCalls } = require('../controllers/previousCallsController');

// User routes
router.get('/:email', getUser);
router.post('/:email', createOrUpdateUser);

// Wallet routes
router.get('/:email/wallet', getWalletBalance);
router.put('/:email/wallet', updateWalletBalance);

// Transaction routes
router.get('/:email/transactions', getTransactions);
router.post('/:email/transactions', addTransaction);

// Favorites routes
router.get('/:email/favorites', getFavorites);
router.put('/:email/favorites', updateFavorites);

// Previous calls routes
router.get('/:email/previous-calls', getPreviousCalls);
router.put('/:email/previous-calls', updatePreviousCalls);

module.exports = router;






