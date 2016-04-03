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

app.get("/:file.js", function(req, res){
	var file = req.params.file;
	console.log("requested file: ", file);
	var fileFullPath = "./public_html/script/" + file + ".js";
	if(fs.existsSync(fileFullPath)){
		res.writeHead(200, {"content-type": "text/javascript"});
		fs.createReadStream(fileFullPath).pipe(res);
	} else {
		send404(res);
	}
});

app.get("/", function(req, res){
	if(req.url === "/"){
		req.url = "/public_html/index.html";
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
					if(error || ! values){
						
					} else {
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
							res.writeHead(200, {"content-type": "application/json"});
							res.write(JSON.stringify({success: true, username: user.login}));
							res.end();
						} else { // Login failed
							sendError(res, 400, "Incorrect password for user '" + username + "'", 'password');
						}
					} else {
						console.log("Unknown session");
						sendError(res, 400, "Your session has expired, please login again");
					}
				} else { // First request with only username
					var sessionsalt = crypto.randomBytes(16).toString('hex');
					userSessionMap.set(user.login, {sessionsalt: sessionsalt, expires: (new Date().getTime() + userSessionExpirationTimeMinutes * 60 * 1000)});
					res.writeHead(200, {"content-type": "application/json"});
					res.write(JSON.stringify({accountsalt: user.salt, sessionsalt: sessionsalt}));
					res.end();
				}
			} else { // Couldn't find user in db
				sendError(res, 400, "Unknown username \"" + username + "\"", 'username');
			}
		});
	} else { // No username
		sendError(res, 400, "Unknown login");
	}
});

var send404 = function(res){
	sendError(res, 404, "404 / Page not found");
};

var sendError = function(res, httpErrorCode, errorString, errorSource){
	var error = {errmsg: errorString};
	if (typeof errorSource !== 'undefined') {
		error.errsrc = errorSource;
	}
	res.writeHead(httpErrorCode, {"content-type": "application/json"});
	res.write(JSON.stringify(error));
	res.end();
};













