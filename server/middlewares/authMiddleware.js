const jwt = require("jsonwebtoken");

// Verifies the Bearer token and attaches the caller's id to req.body.userId
module.exports = (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    if (!header.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication token missing" });
    }

    const token = header.split(" ")[1];
    jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
      if (err) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid or expired token" });
      }
      // decoded = { id: <userId> }
      req.body = req.body || {};
      req.body.userId = decoded.id;
      next();
    });
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Authentication failed" });
  }
};
