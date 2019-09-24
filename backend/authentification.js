const jwt       = require('jsonwebtoken');
const dotenv    = require('dotenv').config({ path: '../../.env' });

function auth(req, res, next) {

    // Uncomment the following lines to deactivate authentification
    /*
    next();
    return;
    */
    const token = req.header('x-auth-token');

    // Simple validation
    if (!token)
        return res.status(401).json({err: 'No token, authorizaton denied'});

    try {
        // Decrypt token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Add user from payload
        req.user = decoded;
        next(); // return
    } catch (e) {
        res.status(400).json({err: 'Token is not valid'});
    }
}

module.exports = auth;