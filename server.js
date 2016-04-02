var express = require("express");
var fs = require("fs");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var crypto = require('crypto');
var async = require('async');


var port = 8090;
var dbName = "mongodb://localhost:27017/MarketPlaceDataHarvesterDB";
var app = express();

var userSessionExpirationTimeMinutes = 30;
var userSessionMap = new Map();
var userInformationsMap = new Map();

mongoose.connect(dbName);

var userSchema = new mongoose.Schema({ userId: String, login:  String, password: String, salt: String});
var userModel = mongoose.model("user", userSchema, "user");

var getUser = function(userInfo){
	userModel.findOne(userInfo, function(error, values){
		if(!error){
			// console.log(values.login);
			userInformationsMap.set(values.login, values);
		}
	});
};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

var log = function (filename, data) {
	fs.appendFile(filename, data + "\n", function(errorCode){if(errorCode){console.log("Unable to read log file " + filename)}});
};

app.listen(port);
console.log("Server ready and listening on port " + port);
app.get("*", function(req, res){
	if(req.url === "/"){
		req.url = "/index.html";
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
app.post("/login", function(req, res){
	console.log('POST /login');
	var username = req.body.username;
	var authToken = req.body.authtoken;
	
	if(typeof username !== 'undefined'){
		async.parallel([
			function(callback) {
				userModel.findOne({login: username}, function(error, values){
					if(!error){
						userInformationsMap.set(values.login, values);
					}
					callback();
				});
			}
		], function(err) {
			var user = userInformationsMap.get(username);
			if(typeof user !== 'undefined'){
				if(typeof authToken !== 'undefined'){ // Second request with authentication token
					// Retrieve session salt from map
					var userSession = userSessionMap.get(user.login);
					if(typeof userSession !== 'undefined' && userSession.expires > new Date().getTime()){
						// Process auth token from h(password + session)
						var processedAuthToken = crypto.createHash('sha256').update(user.password + userSession.sessionsalt).digest('hex');
						if(processedAuthToken == authToken){ // Login successful
							console.log("User authenticated :", user.login);
						log("log/userLogin.log", "[", new Date().toLocaleString() + "] User authenticated : " + user.login);
							res.writeHead(200, {"content-type": "text/html"});
							res.write("<h1>Login successful</h1><h5>Welcome " + user.login + "</h5>");
							res.end();
						} else { // Login failed
							sendError(res, 400, "Authentication failed", "Did you type your password correctly ?");
						}
					} else {
						console.log("Unknown session");
						sendError(res, 400, "Unknown session");
					}
				} else { // First request with only username
					var sessionsalt = crypto.randomBytes(16).toString('hex');
					userSessionMap.set(user.login, {sessionsalt: sessionsalt, expires: (new Date().getTime() + userSessionExpirationTimeMinutes * 60 * 1000)});
					res.writeHead(200, {"content-type": "application/json"});
					res.write(JSON.stringify({accountsalt: user.salt, sessionsalt: sessionsalt}));
					res.end();
				}
			} else { // Couldn't find user in db
				sendError(res, 500, "Coundn't retrieve user salt from database");
			}
		});
	} else { // No username
		sendError(res, 400, "Unknown login", "To register, use POST /register {username: 'your_username' , password: 'your_password'}");
		// console.log(crypto.randomBytes(16).toString('hex'));: });
	}
});

var send404 = function(res){
	sendError(res, 404, "404 / Page not found");
};

var sendError = function(res, httpErrorCode, errorString, errorDetails){
	var additionnalInformation = '';
	if (typeof errorDetails !== 'undefined') {
		additionnalInformation = "<h5>" + errorDetails + "</h5>";
	}
	res.writeHead(httpErrorCode, {"content-type": "text/html"});
	res.write("<h1 class='color:red;'>Error : " + errorString + "</h1>" + additionnalInformation);
	res.end();
};













