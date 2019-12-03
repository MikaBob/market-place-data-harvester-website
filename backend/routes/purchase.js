const router    = require('express').Router();
const auth      = require('../authentification');

let Item    = require('../models/item.model');
let Purchase   = require('../models/purchase.model');


router.get('/list', auth, (req, res) => {
    console.log("\nGET /purchase/list \nparams:", req.params, "\nquery:", req.query);

    var filter = {"userId": req.user.id};
    const { label, startTime, endTime } = req.query;
    
    if(label)
        filter.label = {"$regex": req.query.label, "$options": "i"};

    // /!\ Date in ISO format (YYYY-MM-DDTHH:mm:ss)
    if(startTime || endTime)
        filter.date_bought = {};

    startDate = dateFromTimestamp(startTime);
    if (startDate !== null) {
        filter.date_bought.$gt = startDate;
    }

    endDate = dateFromTimestamp(endTime);
    if (endDate !== null) {
        filter.date_bought.$lt = endDate;
    }

    Purchase.find(filter)
        .select('-userId')
        .then(purchases => res.json(purchases))
        .catch(err => res.status(400).json('Error: ' + err));
});

router.post('/add', auth, (req, res) => {
    console.log("\nPOST /purchase/add \nparams:", req.params, "\nquery:", req.query, "\nbody:", req.body);

    const { label, price_bought, date_bought, itemGID } = req.body.params;

    Item.findOne({ itemGID })
    .then(item => {

        const newPurchase = new Purchase({
            userId: req.user.id,
            label: label,
            date_bought: new Date(date_bought),
            price_bought: parseInt(price_bought)
        });
        if(item) newPurchase.itemGID = parseInt(itemGID);

        newPurchase.save(function (err, purchase) {
            if(err){throw err;};
            res.json(purchase);
        });
    });
});

router.post('/edit', auth, (req, res) => {
    console.log("\nPOST /purchase/edit \nparams:", req.params, "\nquery:", req.query, "\nbody:", req.body);

    const { label, price_bought, date_bought, price_sold, date_sold, isValid } = req.body.params;

    Purchase.findById(req.body.params._id, (err, purchase) => {
        if(err) return res.status(400).json({ msg: 'Purchase not found' });
        
        purchase.label =  label || purchase.label;
        purchase.price_bought =  parseInt(price_bought) || purchase.price_bought;
        purchase.date_bought =  date_bought || purchase.date_bought;
        purchase.price_sold =  parseInt(price_sold) || purchase.price_sold;
        purchase.date_sold =  date_sold || purchase.date_sold;
        purchase.isValid =  isValid || purchase.isValid;
        
        purchase.save()
        .then(purchase => {
            purchase.userId = undefined;
            res.json(purchase);
        })
        .catch(err => {
            if(err) return res.status(400).json({ msg: err });
        });
    });
});

router.post('/delete', auth, (req, res) => {
    console.log("\nPOST /purchase/delete \nparams:", req.params, "\nquery:", req.query, "\nbody:", req.body);

    Purchase.findById(req.body.params._id, (err, purchase) => {
        if(err) return res.status(400).json({ msg: 'Purchase not found' });
        
        if(req.user.id !== purchase.userId){
            purchase.remove()
            .then(purchase => {
                res.json(purchase);
            })
            .catch(err => {
                if(err) return res.status(400).json({ msg: err });
            });
         } else {
            return res.status(400).json({ msg: 'You can not delete Purchase that are not yours' });
        }
    });
});

module.exports = router;


var dateFromTimestamp = function (dateText) {
    var timestamp = Date.parse(dateText);
    return (!isNaN(timestamp)) ? new Date(timestamp) : null;
};
