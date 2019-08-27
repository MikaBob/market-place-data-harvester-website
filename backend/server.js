const express   = require('express');   // excellent router
const cors      = require('cors');      // Cross-Origin Ressource Sharing (pour communiqué entre seveur (frontend/backend))
const mongoose  = require('mongoose');  // On ne le présente plus
const fs        = require('fs');        // file system access simplified

const PORT = 8090;
const DB_HOST = "mongodb://localhost:27017/MarketPlaceDataHarvesterDB";
const PUBLIC_URL = "../public";

const app = express();


app.use(cors());
app.use(express.json());


// DB Connection
mongoose.connect(DB_HOST, { useNewUrlParser: true, useCreateIndex: true });
const connection = mongoose.connection;

connection.once('open', () => {
    console.log("MongoDB database connection established successfully");
});


// Routing
const itemRouter = require('./routes/item');
const userRouter = require('./routes/user');

app.use('/item', itemRouter);
app.use('/user', userRouter);


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

// Start Server
app.listen(PORT);
console.log(`Server ready and listening on ${PORT}`);