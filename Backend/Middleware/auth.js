const jwt = require('jsonwebtoken')
const userModel = require('../Models/UserModel');
const secretKey = "abcsdalfhdslf"


module.exports = async (req, res, next) => {
  try {
    const barrierToken = req.headers.authorization;
    if (!barrierToken) {
      return res.status(404).json({ message: "No token provided" })
    }

    const token = barrierToken.split(" ")[1];
    if (!token) {
      return res.status(404).json({ message: "No token found!" })
    }

    try {
      const decodeToken = jwt.verify(token, secretKey);
      // Find user regardless of role
      const user = await userModel.findOne({ email: decodeToken.email });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      req.user = user;
      next();
    } catch (jwtError) {
      // Handle JWT-specific errors more gracefully
      console.log("Invalid JWT token:", token.substring(0, 10) + "...");
      return res.status(401).json({ message: "Invalid token" });
    }
  } catch (error) {
    console.log("Auth middleware error:", error.message);
    return res.status(500).json({ message: "Authentication error" });
  }
}
