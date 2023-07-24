const jwt = require("jsonwebtoken");

function createApiError(message = "Internal Server Error", statusCode = 500) {
  // Create new instance of error
  const error = new Error(message);

  // Append statusCode property to error object to facilitate error handling
  error.statusCode = statusCode;

  return error;
}

const getUserIdFromRefreshToken = async (refreshToken) => {
  return jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    (err, decoded) => {
      if (err) return res.status(401).json({ message: "Unauthorized" });
      return decoded.userId;
    }
  );
};
module.exports = { createApiError, getUserIdFromRefreshToken };
