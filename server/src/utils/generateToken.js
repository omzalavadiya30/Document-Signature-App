const crypto = require("crypto");

/**
 * Generates secure random token
 */
const generateToken = () => {
    return crypto.randomBytes(32).toString("hex");
};

module.exports = generateToken;