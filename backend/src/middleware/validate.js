const ApiError = require('../utils/ApiError');

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (err) {
    next(new ApiError(400, err.errors[0].message));
  }
};

module.exports = validate;
