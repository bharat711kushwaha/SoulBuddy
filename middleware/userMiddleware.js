const mongoose = require('mongoose');

/**
 * @description Middleware to validate MongoDB ObjectId
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.isValidObjectIdMiddleware = (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      message: 'Invalid user ID format.',
    });
  }

  next();
};
