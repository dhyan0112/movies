const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  // Get the token from the request header
  const token = req.header('Authorization');

  // Check if the token is present
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, 'masai');

    // Attach the user object to the request for use in subsequent middleware/routes
    req.user = decoded;

    // Proceed to the next middleware or route
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: 'Invalid token.' });
  }
};

module.exports = authMiddleware;
