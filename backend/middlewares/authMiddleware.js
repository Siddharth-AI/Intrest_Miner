const jwt = require('jsonwebtoken');
const { customResponse } = require('../utils/customResponse');

const authenticateUser = (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        
        if (!token) {
            return customResponse('Authorization token required', 401, false)(req, res);
        }

        // Verify token
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return customResponse('Invalid or expired token', 403, false)(req, res);
            }
            
            // Attach user to request
            req.user = {
                uuid: decoded.uuid,
                user_id: decoded.user_id
            };
            next();
        });
    } catch (error) {
        console.error('Authentication error:', error);
        return customResponse('Authentication failed', 500, false)(req, res);
    }
};

module.exports = {
    authenticateUser
};