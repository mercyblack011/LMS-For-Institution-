// Wraps an async route handler so a rejected promise is forwarded to
// Express's error handler instead of crashing the request silently.
module.exports = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
