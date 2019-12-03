const router    = require('express').Router();
const auth      = require('../authentification');

let Item    = require('../models/item.model');
let Price   = require('../models/price.model');


router.get('/list', auth, (req, res) => {
    console.log("\nGET /item/list \nparams:", req.params, "\nquery:", req.query);

    if(typeof req.query.label === 'undefined' || req.query.label.length < 2 )
        res.status(400).json('Search string must be at least 2 characters long');

    var limit = (req.query.limit === 'undefined')?-1 : parseInt(req.query.limit);

    var filter = {"label": {"$regex": req.query.label, "$options": "i"}};
    Item.find(filter)
        .limit(limit)
        .then(items => res.json(items))
        .catch(err => res.status(400).json('Error: ' + err));
});


router.get('/', auth, (req, res) => {
    console.log("\nGET /item/ \nparams:", req.params, "\nquery:", req.query, "\nbody:", req.body);
    const itemsGID = req.query.itemsGID;

    if(!itemsGID)
        return res.status(400).json({ msg: 'no Ids provided' });
        
    Item.find({itemGID: itemsGID})
            .then(item => res.json(item))
            .catch(err => res.status(400).json('Error: ' + err));
});

router.get('/:itemGID/prices', auth, (req, res) => {
    console.log("\nGET /item/:itemGID/prices/ \nparams:", req.params, "\nquery:", req.query, "\nbody:", req.body);
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
