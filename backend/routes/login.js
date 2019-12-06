const express   = require('express');
const router    = express.Router();
const bcrypt    = require('bcryptjs');
const jwt       = require('jsonwebtoken');
const dotenv    = require('dotenv').config({ path: '../../.env' });
const auth      = require('../authentification');

// User Model
let User = require('../models/user.model');

router.post('/', (req, res) => {
    console.log("\nPOST /login \nparams:", req.params, "\nquery:", req.query, "\nbody:", req.body);
    const {login, password} = req.body;

    // Simple validation
    if (!login || !password) {
        return res.status(400).json({msg: 'Please enter all fields'});
    }

    // Check for existing user
    User.findOne({login}, '+password')
        .then(user => {
            if (!user)
                return res.status(400).json({msg: 'Invalid credentials'});

            // Validate password
            bcrypt.compare(password, user.password)
            .then(isMatch => {
                if (!isMatch)
                    return res.status(400).json({msg: 'Invalid credentials'});

                jwt.sign({id: user.id}, process.env.JWT_SECRET, {expiresIn: 3600},(err, token) => {
                    if (err)
                        throw err;
                    res.json({
                        token,
                        user: {
                            id: user.id,
                            login: user.login
                        }
                    });
                })
            })
        })
});

router.get('/isTokenValid', auth, (req, res) => {
    console.log("\nGET /login/isTokenValid \nparams:", req.params, "\nquery:", req.query, "\nbody:", req.body);
    res.json({err: 'true'});
});

module.exports = router;
