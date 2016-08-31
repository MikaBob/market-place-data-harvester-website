//////////////////////////
//
// Includes
// var async = require('async');
var bodyParser = require("body-parser");
var crypto = require('crypto');
var express = require("express");
var fs = require("fs");
var http = require("http");
var mongoose = require("mongoose");
var request = require("request");
// var NodeRSA = require('node-rsa');


//////////////////////////
//
// Settings
var port = 8090;
var userSessionExpirationTimeMinutes = 30;


//////////////////////////
//
// Mongo setup
var dbName = "mongodb://localhost:27017/MarketPlaceDataHarvesterDB";
mongoose.connect(dbName);

var UserSchema = new mongoose.Schema({
	login:  String,
	password: String,
	/*salt: String,
	session: {
		salt: String,
		expires: Date
	}*/
});
var User = mongoose.model("user", UserSchema, "user");

var PriceSchema = new mongoose.Schema({
	itemId: Number,
	userId:  mongoose.Schema.Types.ObjectId,
	timestamp: Date,
	price_1: Number,
	price_10: Number,
	price_100: Number,
	price_avg: Number
});
var Price = mongoose.model("price", PriceSchema, "price");

var ItemSchema = new mongoose.Schema({
	itemGID:  Number,
	label: String,
	lvl: Number,
	type: String,
	category: String
});
var ItemModel = mongoose.model("item", ItemSchema);


//////////////////////////
//
// Starting app
var app = express();
app.use(express.static(__dirname + '/public/images/items'));
app.use(express.static(__dirname + '/public/script'));
app.use(express.static(__dirname + '/public/css'));
app.use(express.static(__dirname + '/public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.listen(port);
console.log("Server ready and listening on port " + port);


//////////////////////////
//
// REST commands handling

// Get items list
app.get("/items", function(req, res){
	
	console.log('GET /items');
		
	dbFind({
		model: ItemModel,
		filter: {},
		success: function(values){
			res.writeHead(200, {"content-type": "text/javascript"});
			res.write(JSON.stringify(values));
			res.end();
		},
		notFound: function(error){
			sendError(res, 400, "No price matching filters");
		}
	});
});

// Item prices
app.get("/item/:itemId", function(req, res){
	var itemId = req.params.itemId;
	
	console.log('GET /item/' + itemId);
	
	var startTime = req.query.startTime;
	var endTime = req.query.endTime;
	
	if(def(itemId)){
		
		var filter = {itemId: parseInt(itemId)};
		/*filter.timestamp = {};
		
		var startDate = dateFromTimestamp(startTime);
		if(startDate !== null){
			filter.timestamp.$gt = startDate;
		}
		var endDate = dateFromTimestamp(endTime);
		if(endDate !== null){
			filter.timestamp.$lt = endDate;
		}*/
		
		dbFind({
			model: Price,
			filter: filter,
			success: function(values){
				res.writeHead(200, {"content-type": "text/javascript"});
				res.write(JSON.stringify(values));
				res.end();
			},
			notFound: function(error){
				sendError(res, 400, "No price matching filters");
			}
		});
	} else {
		sendError(res, 400, "No item id supplied");
	}
});



/* 30/08/16	Pour le moment on oublie la partie authentification de l'utilisateur */
app.post("/item/:itemId", function(req, res){
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
						/*res.writeHead(200, {"content-type": "text/javascript"});*/
						//créer l'item schema
						console.log("Price of "+item.itemId+" added in bdd");
						console.log(item);
						res.write("OK"+item.itemId);
						res.end();
						dbFind({
							model: ItemModel,
							filter: JSON.stringify({itemGID: item.itemId}),
							success: function(itemDetails){
								console.log("Item already in bdd:");
								console.log(itemDetails.length);
								if(itemDetails.length == 0)
								{
									//Le détail de l'item n'existe pas dans la bdd, allons le chercher dans l'encyclopédie 
									console.log("length == 0 | Item details not found in bdd, getItemDetailOnEncyclopedia("+item.itemId+")");
									getItemDetailOnEncyclopedia(item.itemId);
								}
							},
							notFound: function(error){
								//Le détail de l'item n'existe pas dans la bdd, allons le chercher dans l'encyclopédie 
								console.log("length == 0 | Item details not found in bdd, getItemDetailOnEncyclopedia("+item.itemId+")");
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

// app.get("/:file.js", function(req, res){
	// var file = req.params.file;
	// console.log("requested file: ", file);
	// var fileFullPath = "./public/script/" + file + ".js";
	// if(fs.existsSync(fileFullPath)){
		// res.writeHead(200, {"content-type": "text/javascript"});
		// fs.createReadStream(fileFullPath).pipe(res);
	// } else {
		// send404(res);
	// }
// });

app.get("/", function(req, res){
	if(req.url === "/"){
		req.url = "/public/item_prices.html";
		// req.url = "/public/index.html";
	}
	console.log("req.url = ", req.url);
	if(fs.existsSync("." + req.url)){
		res.writeHead(200, {"content-type": "text/html"});
		fs.createReadStream("." + req.url).pipe(res);
	} else {
		send404(res);
	}
});

// Auth
app.post("/register", function(req, res){
	console.log('POST /register');
	var username = req.body.username;
	var password = req.body.password;
	if(def(username)){
		dbFindOne({
			model: User,
			filter: {login: username},
			success: function(user){
				if(def(password)){
					User.update({login: username}, {password: password}).then(function(){
						res.writeHead(200, {"content-type": "application/json"});
						res.write(JSON.stringify({success: true}));
						res.end();
					});
				} else {
					sendError(res, 400, "An account with this login already exists");
				}
			},
			notFound: function(error){
				// User didn't exist in database
				// Generate new salt and save user
				var accountSalt = crypto.randomBytes(16).toString('hex');
				var newUser = new User({login: username, salt: accountSalt});
				newUser.save().then(function(){
					// Send salt to client for password encryption
					res.writeHead(200, {"content-type": "application/json"});
					res.write(JSON.stringify({success: true, accountsalt: accountSalt}));
					res.end();
				});
			}
		});
	}
	
	// var sessionsalt = crypto.randomBytes(16).toString('hex');
});

// Auth
app.post("/login", function(req, res){
	console.log('POST /login');
	var username = req.body.username;
	var authToken = req.body.authtoken;
	
	if(def(username)){
		dbFindOne({
			model: User,
			filter: {login: username},
			success: function(user){
				if(def(authToken)){ // Second request with authentication token
					if(def(user.session) && user.session.expires > new Date().getTime()){ // Is session valid ?
						// Process auth token from h(password + session)
						var processedAuthToken = makeAuthToken(user.session.salt, user.password);
						if(processedAuthToken == authToken){ // Login successful
							console.log("User authenticated :", user.login);
						log("log/userLogin.log", "[", new Date().toLocaleString() + "] User authenticated : " + user.login);
							res.writeHead(200, {"content-type": "application/json"});
							res.write(JSON.stringify({success: true, username: user.login, authToken: authToken}));
							res.end();
						} else { // Login failed
							sendError(res, 400, "Incorrect password for user '" + username + "'", 'password');
						}
					} else {
						sendError(res, 400, "Your session has expired, please login again");
					}
				} else { // First request with only username
					var sessionsalt = crypto.randomBytes(16).toString('hex');
					User.update( // Save session into database
						{login: user.login},
						{session: {
							salt: sessionsalt, 
							expires: (new Date().getTime() + userSessionExpirationTimeMinutes * 60 * 1000)
						}}
					).then(function(){
						// userSessionMap.set(user.login, {sessionsalt: sessionsalt, expires: (new Date().getTime() + userSessionExpirationTimeMinutes * 60 * 1000)});
						res.writeHead(200, {"content-type": "application/json"});
						res.write(JSON.stringify({accountsalt: user.salt, sessionsalt: sessionsalt}));
						res.end();
					});
				}
			},
			notFound: function(error){
				sendError(res, 400, "Unknown username \"" + username + "\"", 'username');
			}
		});
	} else { // No username
		sendError(res, 400, "Unknown login");
	}
});


//////////////////////////
//
// DB utils

/**
 * Finds the first item of the collection described by options.model that matches options.filter
 * On success, the given callback function options.success(found_values) will be fired
 * On failiure, the given callback function options.notFound(error) will be fired
 */
var dbFindOne = function(options){
	options.filter = options.filter || {};
	if(def(options.model)){
		options.model.findOne(options.filter, function(error, values){
			if(error || ! values){
				if(func(options.notFound)){
					options.notFound(error);
				}
			} else {
				if(func(options.success)){
					options.success(values);
				}
			}
		});
	}
};

/**
 * Finds all items of the collection described by options.model that match options.filter
 * On success, the given callback function options.success(found_values) will be fired
 * On failiure, the given callback function options.notFound(error) will be fired
 */
var dbFind = function(options){
	if(def(options.model) &&def(options.filter)){
		options.model.find(options.filter, function(error, values){
			if(error || ! values){
				if(func(options.notFound)){
					options.notFound(error);
				}
			} else {
				if(func(options.success)){
					options.success(values);
				}
			}
		});
	}
};


//////////////////////////
//
// Utils
var dateFromTimestamp = function(dateText){
	var timestamp=Date.parse(dateText)
	return (! isNaN(timestamp)) ? new Date(timestamp) : null;
};

var undef = function(value){
	return ! def(value);
};

var def = function(value){
	return typeof value !== 'undefined';
};

var func = function(value){
	return typeof value === 'function';
};

var send404 = function(res){
	sendError(res, 404, "404 / Page not found");
};

var sendError = function(res, httpErrorCode, errorString, errorSource){
	var error = {errmsg: errorString};
	if (def(errorSource)) {
		error.errsrc = errorSource;
	}
	res.writeHead(httpErrorCode, {"content-type": "application/json"});
	res.write(JSON.stringify(error));
	res.end();
};

var makeAuthToken = function(sessionSalt, password){
	return crypto.createHash('sha256').update(password + sessionSalt).digest('hex');
};

var log = function (filename, data) {
	fs.appendFile(filename, data + "\n", function(errorCode){if(errorCode){console.log("Unable to read log file " + filename)}});
};


var getItemDetailOnEncyclopedia = function(GID){
	//var GID = 1455; // 1455 : aile de scarafeuille bleu
	var options = {
			host: 'www.dofus.com',
			port: 80,
			path: '/fr/mmorpg/encyclopedie/ressources/'+GID+'-'+GID
	};

	console.log("call to "+options.host+options.path);
	var encyclopediaPage = "";
	http.get(options, function(resp){
			resp.on('data', function(chunk){
					//console.log("new chunk: ");
					//console.log(chunk);
					encyclopediaPage += chunk;
			});
			resp.on("end", function(e){
		
				console.log("Encyclopedia page size:"+encyclopediaPage.length);
				// coupé en feux regex car le 
				var regex1 = /.*<title>([^-]+)-([^-]+)-([^-]+).*/;
				var regex2 = /Niveau\s:\s(\d+)/;
				var regex3 = /(http:\/\/staticns.ankama.com.*\.\.\/\.\.\/.*\.png)/
				
				var result1;
				if ((result1 = regex1.exec(encyclopediaPage)) !== null) {
					if (result1.index === regex1.lastIndex) {
						regex1.lastIndex++;
					}
					/*console.log("result1:");
					console.log("result1[0]:"+result1[0]);
					console.log("result1[1]:"+result1[1]);
					console.log("result1[2]:"+result1[2]);
					console.log("result1[3]:"+result1[3]);
					*/
				}
				
				var result2;
				if ((result2 = regex2.exec(encyclopediaPage)) !== null) {
					if (result2.index === regex2.lastIndex) {
						regex2.lastIndex++;
					}
					/*console.log("result2:");
					console.log("result2[0]:"+result2[0]);
					console.log("result2[1]:"+result2[1]);*/
				}
				
				var result3;
				if ((result3 = regex3.exec(encyclopediaPage)) !== null) {
					if (result3.index === regex3.lastIndex) {
						regex3.lastIndex++;
					}
					/*console.log("result3:");
					console.log("result3[0]:"+result3[0]);
					console.log("result3[1]:"+result3[1]);*/					
				}
				
				
				/*console.log("Retour from encylopedia:");
				console.log(result1[1]); // label
				console.log(result1[3]); // type
				console.log(result1[2]); // Catégorie
				console.log(result2[1]); // Niveau
				console.log(result3[1]); // Url de l'image
				*/
				
				var itemDetail = {itemGID:parseInt(GID)};
				itemDetail.label = result1[1];
				itemDetail.type = result1[3];
				itemDetail.category = result1[2];
				itemDetail.lvl = parseInt(result2[1]);
				
				
				
				ItemModel.create(itemDetail, function(){
					console.log("Details of item "+GID+" added in bdd");
					console.log(itemDetail);
					downloadImage(result3[1], GID+'.png', function(){
						console.log('Added image '+'public/images/items/'+GID+'.png'+ '	from '+result3[1]);
					});
				});
			});
	}).on("error", function(e){
			console.log("Got error: " + e.message);
	});
};

//////////////////////////
//
// Download image
var downloadImage = function(uri, filename, callback){
  request.head(uri, function(err, res, body){
    console.log('content-type:', res.headers['content-type']);
    console.log('content-length:', res.headers['content-length']);

    request(uri).pipe(fs.createWriteStream("public/images/items/" + filename)).on('close', callback);
  });
};