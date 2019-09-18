const express   = require('express');   // excellent router
const cors      = require('cors');      // Cross-Origin Ressource Sharing (pour communiqué entre seveur (frontend/backend))
const mongoose  = require('mongoose');  // On ne le présente plus
const fs        = require('fs');        // file system access simplified
const dotenv    = require('dotenv').config({ path: '../.env' }); // environement variable (shared with frontend)

const PORT = 8090;
const DB_HOST = process.env.MONGO_URL;
const PUBLIC_URL = "../"+process.env.PUBLIC_URL+"public/";

const app = express();


app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// DB Connection
mongoose.connect(DB_HOST, { useNewUrlParser: true, useCreateIndex: true });
const connection = mongoose.connection;

connection.once('open', () => {
    console.log("MongoDB database connection established successfully");
});


// Routing
app.use('/item', require('./routes/item'));
app.use('/user', require('./routes/user'));
app.use('/prices', require('./routes/prices'));
app.use('/login', require('./routes/login'));


app.get("/", function(req, res){
    console.log("GET /      = ", req.url);

    res.writeHead(200, {"content-type": "text/html"});
    fs.createReadStream(PUBLIC_URL+"/admin.html").pipe(res);
});

app.get("*.js", function(req, res){
    console.log("GET *.js   = ", req.url);

    var jsRepo = PUBLIC_URL+"/scripts/js/";
    if(fs.existsSync(jsRepo + req.url)){
        res.writeHead(200, {"content-type": "text/javascript"});
        fs.createReadStream(jsRepo + req.url).pipe(res);
    }
});

app.get("*.css", function(req, res){
    console.log("GET *.css  = ", req.url);

    var cssRepo = PUBLIC_URL+"/scripts/css/";
    if(fs.existsSync(cssRepo + req.url)){
        res.writeHead(200, {"content-type": "text/css"});
        fs.createReadStream(cssRepo + req.url).pipe(res);
    }
});

app.get("*.png", function(req, res){
    console.log("GET *.png  = ", req.url);

    var imagesRepo = PUBLIC_URL+"/images/";
    if(fs.existsSync(imagesRepo + req.url)){
        res.writeHead(200, {"content-type": "text/css"});
        fs.createReadStream(imagesRepo + req.url).pipe(res);
    }
});

// Start Server
app.listen(PORT);
console.log(`Server ready and listening on ${PORT}`);