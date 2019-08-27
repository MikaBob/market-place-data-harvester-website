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
					item.timestamp =  new Date().getTime();
					if(def(price_1)){
						item.price_1 = parseInt(price_1);
					}
					if(def(price_10)){
						item.price_10 = parseInt(price_10);
					}
					if(def(price_100)){
						item.price_100 = parseInt(price_100);
					}
					if(def(price_avg)){
						item.price_avg = parseInt(price_avg);
					}
					Price.create(item, function(){
						//créer l'item schema
						res.write("OK_"+item.itemId);
						res.end();
						dbFind({
							model: Item,
							filter: {itemGID: item.itemId},
							success: function(itemDetails){
								console.log(itemDetails.length);
								if(itemDetails.length == 0)
								{
									//Le détail de l'item n'existe pas dans la bdd, allons le chercher dans l'encyclopédie 
									getItemDetailOnEncyclopedia(item.itemId);
								} else {
									console.log("Item already in bdd:");
								}
							},
							notFound: function(error){
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


module.exports = router;