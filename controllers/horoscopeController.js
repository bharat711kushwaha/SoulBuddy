// controllers/horoscopeController.js
const User = require('../models/userSchema');
const { catchAsync } = require('../utils/errorHandler');

/**
 * @description - Controller to fetch daily horoscope for the user
 * @route GET /api/users/:id/horoscope/daily
 * @param {id} userId - User ID
 */
exports.getDailyHoroscope = catchAsync(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const dailyHoroscope = user.horoscopeHistory.find(
    (horoscope) => horoscope.date.toDateString() === new Date().toDateString()
  );

  if (!dailyHoroscope) {
    return res.status(404).json({ message: 'Daily horoscope not available' });
  }

  return res.status(200).json({ dailyHoroscope });
});

/**
 * @description - Controller to fetch monthly horoscope for the user
 * @route GET /api/users/:id/horoscope/monthly
 * @param {id} userId - User ID
 */
exports.getMonthlyHoroscope = catchAsync(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const monthlyHoroscope = user.horoscopeHistory.find(
    (horoscope) => new Date(horoscope.date).getMonth() === new Date().getMonth()
  );

  if (!monthlyHoroscope) {
    return res.status(404).json({ message: 'Monthly horoscope not available' });
  }

  return res.status(200).json({ monthlyHoroscope });
});
