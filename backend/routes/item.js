const router    = require('express').Router();
const auth      = require('../authentification');

let Item    = require('../models/item.model');
let Price   = require('../models/price.model');


router.get('/list', auth, (req, res) => {
    console.log("GET /item/list \nparams:", req.params, "\nquery:", req.query);

    if(typeof req.query.itemName === 'undefined' || req.query.itemName.length < 2 )
        res.status(400).json('Search string must be at least 3 characters long');

    var filter = {"label": {"$regex": req.query.itemName, "$options": "i"}};
    Item.find(filter)
        .then(items => res.json(items))
        .catch(err => res.status(400).json('Error: ' + err));
});


router.get('/:itemGID', auth, (req, res) => {
    console.log("GET /item/:itemGID \nparams:", req.params, "\nquery:", req.query);
    Item.findOne({itemGID: req.params.itemGID})
            .then(item => res.json(item))
            .catch(err => res.status(400).json('Error: ' + err));
});

router.get('/:itemGID/prices', auth, (req, res) => {
    console.log("GET /item/:itemGID/prices/ \nparams:", req.params, "\nquery:", req.query);
    var itemGID = req.params.itemGID;       // req.params pour un parameter depuis l'URL
    var startTime = req.query.startTime;    // req.query pour un parameter depuis la requête
    var endTime = req.query.endTime;

    var filter = {itemGID: parseInt(itemGID)};

    // /!\ Date in ISO format (YYYY-MM-DDTHH:mm:ss)
    filter.timestamp = {};

    var startDate = dateFromTimestamp(startTime);
    if (startDate !== null) {
        filter.timestamp.$gt = startDate;
    }
    var endDate = dateFromTimestamp(endTime);
    if (endDate !== null) {
        filter.timestamp.$lt = endDate;
    }

    //console.log(filter);
    Price.find(filter)
            .then(prices => res.json(prices))
            .catch(err => res.status(400).json('Error: ' + err));
});
module.exports = router;


var dateFromTimestamp = function (dateText) {
    var timestamp = Date.parse(dateText)
    return (!isNaN(timestamp)) ? new Date(timestamp) : null;
};
