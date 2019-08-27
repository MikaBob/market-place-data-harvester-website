const router = require('express').Router();
let Item = require('../models/item.model');


router.get('/list', function(req, res) {
    console.log("GET /item/list \twith", req.query);
    var filter = {"label": {"$regex" : req.query.itemName, "$options": "i"}};
    Item.find(filter)
        .then(items => res.json(items))
        .catch(err => res.status(400).json('Error: ' + err));
});

/*
router.route('/:itemId').get((req, res) => {
    Item.find({itemGID: req.params.itemId})
        .then(item => res.json(item))
        .catch(err => res.status(400).json('Error: ' + err));
});
*/
module.exports = router;