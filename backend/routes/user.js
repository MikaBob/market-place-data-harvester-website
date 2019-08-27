const router = require('express').Router();
let User = require('../models/user.model');


router.route('/:userId').get((req, res) => {
    User.find({id: req.params.userId})
        .then(user => res.json(user))
        .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;