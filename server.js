var express = require("express");
var fs = require("fs");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");


var port = 8090;
var dbName = "mongodb://localhost:27017/MarketPlaceDataHarvesterDB";
var app = express();

mongoose.connect(dbName);

var userSchema = new mongoose.Schema({ userId: String, login:  String, password: String});
var userModel = mongoose.model("user", userSchema, "user");

userModel.find({}, function(error, values){
	if(error){
		console.error("Error reading model");
	} else {
		console.log(values);
	}
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

var log = function (filename, data) {
	fs.appendFile(filename, data + "\n", function(errorCode){if(errorCode){console.log("Unable to read log file " + filename)}});
};

app.listen(port);
console.log("Server ready and listening on port " + port);
app.get("*", function(req, res){
	res.writeHead(200, {"content-type": "text/html"});
	if(req.url === "/"){
		req.url = "/index.html";
	}
	console.log("req.url = ", req.url);
	if(fs.existsSync("." + req.url)){
		fs.createReadStream("." + req.url).pipe(res);
	} else {
		send404(res);
	}
});

var send404 = function(res){
	res.writeHead(404, {"content-type": "text/html"});
	res.write("<h1>Error 404 / Page not found</h1>");
	res.end();
};