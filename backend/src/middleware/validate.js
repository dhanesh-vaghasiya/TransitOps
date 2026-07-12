const ApiError = require('../utils/ApiError');

const validate = (schema) => (req, res, next) => {
  try {
    // If the schema is an object schema checking for req parts (body, query, params)
    if (schema && schema.shape && (schema.shape.body || schema.shape.query || schema.shape.params)) {
      const parsed = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params
      });
      if (parsed.body) req.body = parsed.body;
      if (parsed.query) req.query = parsed.query;
      if (parsed.params) req.params = parsed.params;
    } else if (schema) {
      // Validate req.body directly
      req.body = schema.parse(req.body);
    }
    next();
  } catch (err) {
    if (err.errors && err.errors[0]) {
      next(new ApiError(400, err.errors[0].message));
    } else {
      next(err);
    }
  }
};

module.exports = validate;
