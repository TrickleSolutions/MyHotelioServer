const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = function (req, res, next) {
    try {
        const token = req.header('access-token');
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        if (!token.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Invalid token format' });
        }

        const tokenValue = token.replace('Bearer ', '');
        const verified = jwt.verify(tokenValue, process.env.SECRET_CODE);

        req.user = verified;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token has expired' });
        }
        return res.status(401).json({ error: 'Invalid token' });
    }
};
