// routes/horoscopeRoutes.js
const express = require('express');
const { getDailyHoroscope, getMonthlyHoroscope } = require('../controllers/horoscopeController');

const router = express.Router();

// Route to fetch daily horoscope
router.get('/users/:id/horoscope/daily', getDailyHoroscope);

// Route to fetch monthly horoscope
router.get('/users/:id/horoscope/monthly', getMonthlyHoroscope);

module.exports = router;
