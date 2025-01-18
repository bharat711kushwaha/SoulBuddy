/**
 * @description Wrapper for handling async errors in controllers
 * @param {Function} fn - Async controller function
 */
exports.catchAsync = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
  
  /**
   * @description Global error-handling middleware
   * @param {*} err - Error object
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  exports.errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
  
    res.status(err.status || 500).json({
      message: err.message || 'Internal Server Error',
    });
  };
  