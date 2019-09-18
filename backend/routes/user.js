const express   = require('express');
const router    = express.Router();
const bcrypt    = require('bcryptjs');
const jwt       = require('jsonwebtoken');
const dotenv    = require('dotenv').config({ path: '../../.env' });
const auth      = require('../authentification');

// User Model
let User = require('../models/user.model');

// Get User
router.get('/', auth, (req, res) => {
    console.log("GET /user \nparams:", req.params, "\nquery:", req.query, "\nbody:", req.body);
    User.findById(req.user.id)
            .select('-password')
            .then(user => res.json(user));
});

// Create User
router.post('/', auth, (req, res) => {
    console.log("POST /user \nparams:", req.params, "\nquery:", req.query, "\nbody:", req.body);
    const { login, password } = req.body;

    // Simple validation
    if(!login || !password) {
        return res.status(400).json({ msg: 'Please enter all fields' });
    }

    // Check for existing user
    User.findOne({ login })
        .then(user => {
            if(user) return res.status(400).json({ msg: 'User already exists' });

            const newUser = new User({
                login,
                password
            });

            // Create password with salt & generate user's token
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if(err)
                        throw err;
                    newUser.password = hash;
                    newUser.save()
                    .then(user => {
                        jwt.sign(
                            { id: user.id },
                            process.env.JWT_SECRET,
                            { expiresIn: 3600 },
                            (err, token) => {
                                if(err)
                                    throw err;
                                res.json({
                                    token,
                                    user: {
                                        id: user.id,
                                        login: user.login
                                    }
                                });
                            }
                        )
                    });
                })
            })
        })
});

module.exports = router;