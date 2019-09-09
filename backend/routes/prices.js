const router = require('express').Router();
let Item = require('../../models/item.model');
let Price = require('../../models/price.model');


/* 30/08/16	Pour le moment on oublie la partie authentification de l'utilisateur */
router.route('/:itemId').post((req, res) => {
    var itemId = req.params.itemId;

    console.log('POST /item/' + itemId);

    //var username = req.body.username;
    //var authToken = req.body.authToken;
    var price_1 = req.body.price_1;
    var price_10 = req.body.price_10;
    var price_100 = req.body.price_100;
    var price_avg = req.body.price_avg;

    console.log('price_1:	' + price_1);
    console.log('price_10:	' + price_10);
    console.log('price_100:	' + price_100);
    console.log('price_avg:	' + price_avg);

    /*
     if(undef(username) || undef(authToken)){
     sendError(res, 400, "No username or auth token supplied");
     return;
     }
     */
    // Authentify user
    /*dbFindOne({
     model: User,
     filter: JSON.stringify({login: username}),
     success: function(user){
     // Check if auth token is valid
     if(def(user.session) &&user.session.expires > new Date().getTime()){
     // Check if tokens match
     if(makeAuthToken(user.session.salt, user.password) == authToken){*/
    var item = {itemId: parseInt(itemId)};
    //item.userId =  user._id;
    item.timestamp = new Date().getTime();
    if (def(price_1)) {
        item.price_1 = parseInt(price_1);
    }
    if (def(price_10)) {
        item.price_10 = parseInt(price_10);
    }
    if (def(price_100)) {
        item.price_100 = parseInt(price_100);
    }
    if (def(price_avg)) {
        item.price_avg = parseInt(price_avg);
    }
    Price.create(item, function () {
        //créer l'item schema
        res.write("OK_" + item.itemId);
        res.end();
        dbFind({
            model: Item,
            filter: {itemGID: item.itemId},
            success: function (itemDetails) {
                console.log(itemDetails.length);
                if (itemDetails.length == 0)
                {
                    //Le détail de l'item n'existe pas dans la bdd, allons le chercher dans l'encyclopédie
                    getItemDetailOnEncyclopedia(item.itemId);
                } else {
                    console.log("Item already in bdd:");
                }
            },
            notFound: function (error) {
                //Le détail de l'item n'existe pas dans la bdd, allons le chercher dans l'encyclopédie
                getItemDetailOnEncyclopedia(item.itemId);
            }
        });
    });
    /*
     } else {
     sendError(res, 400, "Invalid session token");
     }
     } else {
     sendError(res, 400, "Session expired");
     }
     },
     notFound: function(error){
     sendError(res, 400, "Inknown username");
     }
     });*/
});

var getItemDetailOnEncyclopedia = function (GID) {
    //var GID = 1455; // 1455 : aile de scarafeuille bleu
    var options = {
        host: 'www.dofus.com',
        port: 80,
        path: '/fr/mmorpg/encyclopedie/ressources/' + GID + '-' + GID
    };

    //console.log("call to "+options.host+options.path);
    http.get("https://" + options.host + options.path, (resp) => {
        let encyclopediaPage = '';

        resp.on('data', (chunk) => {
            encyclopediaPage += chunk;
        });
        resp.on("end", () => {

            // La page est "découpée" en trois regex

            var regex1 = /.*<title>([^-]+)-([^-]+)-([^-]+).*/;
            var regex2 = /Niveau\s:\s(\d+)/;
            var regex3 = /<img src="(https:\/\/s\.ankama\.com\/ww.*dofus\/www\/game\/.*png)/

            var result1;
            if ((result1 = regex1.exec(encyclopediaPage)) !== null) {
                if (result1.index === regex1.lastIndex) {
                    regex1.lastIndex++;
                }
            }

            var result2;
            if ((result2 = regex2.exec(encyclopediaPage)) !== null) {
                if (result2.index === regex2.lastIndex) {
                    regex2.lastIndex++;
                }
            }

            var result3;
            if ((result3 = regex3.exec(encyclopediaPage)) !== null) {
                if (result3.index === regex3.lastIndex) {
                    regex3.lastIndex++;
                }
            }

            /*
             console.log("Retour from encylopedia:");
             if( result1 != null){
             console.log("label:" + result1[1]); // label
             console.log("type: " + result1[3]); // type
             console.log("catégorie: " + result1[2]); // Catégorie
             }
             if( result2 != null){
             console.log("niveau: " + result2[1]); // Niveau
             }
             if( result3 != null){
             console.log("url: " + result3[1]); // Url de l'image
             }
             */

            if (result1 == null || result2 == null || result3 == null) {
                console.log("Could not retrieve enougth info from encyclopedia - GID: " + GID);
                return;
            }
            var itemDetail = {itemGID: parseInt(GID)};
            itemDetail.label = result1[1];
            itemDetail.type = result1[3];
            itemDetail.category = result1[2];
            itemDetail.lvl = parseInt(result2[1]);

            Item.create(itemDetail, function () {
                console.log("Details from encyclopedia of item " + GID + " added in bdd");
                console.log(itemDetail);
                downloadImage(result3[1], GID + '.png', function () {
                    console.log('Added image ' + 'public/images/items/' + GID + '.png' + '	from ' + result3[1]);
                });
            });

        });
    }).on("error", function (e) {
        console.log("Got error: " + e.message);
    });
};

//////////////////////////
//
// Download image
var downloadImage = function (uri, filename, callback) {
    request.head(uri, function (err, res, body) {
        console.log('content-type:', res.headers['content-type']);
        console.log('content-length:', res.headers['content-length']);

        request(uri).pipe(fs.createWriteStream("../public/images/items/" + filename)).on('close', callback);
    });
};

module.exports = router;