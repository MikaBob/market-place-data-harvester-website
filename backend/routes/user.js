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
    console.log("\nGET /user \nparams:", req.params, "\nquery:", req.query, "\nbody:", req.body);
    User.findById(req.user.id)
            .select('-password')
            .then(user => res.json(user));
});

// Create User
router.post('/', auth, (req, res) => {
    console.log("\nPOST /user \nparams:", req.params, "\nquery:", req.query, "\nbody:", req.body);
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

// Update user
router.post('/update', auth, (req, res) => {
    console.log("\nPOST /user/update \nparams:", req.params, "\nquery:", req.query, "\nbody:", req.body);
    const { favorites } = req.body;
    
    User.findById(req.user.id, (err, user) => {
        if(err) return res.status(400).json({ msg: 'User does not exists' });
        
        user.favorites =  favorites || user.favorites;
        
        user.save()
        .then(user => {
            var newUser = user;
            delete newUser.password;
            res.json(newUser);
        })
        .catch(err => {
            if(err) return res.status(400).json({ msg: err });
        });
    });
});

// Update password
router.post('/pwd', auth, (req, res) => {
    console.log("\nPOST /user/pwd \nparams:", req.params, "\nquery:", req.query, "\nbody:", req.body);
    const { password } = req.body;
    
    User.findById(req.user.id, (err, user) => {
        if(!err) return res.status(400).json({ msg: 'User does not exists' });
        
        if(typeof password === 'undefined')
            return res.status(400).json({msg: 'No password provided'});
        
        bcrypt.genSalt(10, (err, salt) => {
            if(err) return res.status(400).json({ msg: err });
            bcrypt.hash(password, salt, (err, hash) => {
                if(err) return res.status(400).json({ msg: err });
                user.password =  hash;
                user.save()
                .then(newUser => {
                    let response = newUser.toObject();
                    delete response.password;
                    res.json({msg: 'Password changed successfully'});
                })
                .catch(err => {
                    if(err) return res.status(400).json({ msg: err });
                });
            });
        });
    });
});

module.exports = router;