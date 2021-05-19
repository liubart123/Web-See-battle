const express = require("express")
const app = express();
const https = require('https');
const fs = require('fs');

//INIT DATABASE CONNECTION
const sequalize = require('./app/models/sequalize_connector');

//CORS
const cors = require("cors");
var corsOptions = {
    credentials: true,
    origin: "http://localhost:8081"
  };
app.use(cors(corsOptions));


//PARSE BODY AND COOKIE
const formidableMiddleware = require('express-formidable');
app.use(formidableMiddleware());

cookieParser = require('cookie-parser')
//todo: move secret to the file?
app.use(cookieParser('secret key'))


//CONTROLLERS
// const test_frontController = require('./web/controllers/test/test_front_controller')
// app.use("/test",test_frontController);


//STATIC
// app.use(express.static(__dirname + "/web/static"));

//ROUTES
//mw for check authorizaion and deserialize user
const authJwt = require('./app/web/middleware/authJwt');
//check user role and his token for authentification
require('./app/web/routes/auth_routes')(app);
const battleFormationRouter = require('./app/web/controllers/battleFormation/battleFormationController');
app.use('/api/battleFormation', authJwt.verifyToken, battleFormationRouter);

const roomRoute = require('./app/web/controllers/room');
app.use('/api/room',roomRoute);

const gameRecordsRoute = require('./app/web/controllers/game_records');
app.use('/api',gameRecordsRoute);

const additionalPriveleges = require('./app/web/controllers/additionalPrivileges');
app.use('/api',additionalPriveleges);

//DEFAULT 404 CONTROLLER
app.use((req,res,next)=>{
    res.sendStatus(404);
})

// var server = app.listen(3000);

let options={
    key:fs.readFileSync('./sertificationE/LAB.key').toString(),
    crt:fs.readFileSync('./sertificationE/LAB.crt').toString(),
}

var server = https.createServer({
    key: options.key,
    cert: options.crt,
    //ca: certificateAuthority,
    ciphers: [
        "ECDHE-RSA-AES128-SHA256",
        "DHE-RSA-AES128-SHA256",
        "AES128-GCM-SHA256",
        "RC4",
        "HIGH",
        "!MD5",
        "!aNULL"
    ].join(':'),
}, app).listen(3000);

// SOCKET IO TEST
require('./app/web/controllers/socket/testSocketController')(server);



//require('./app/web/controllers/socket/testSocketController')(app,server);

// var io = require('socket.io')(server,{
//   cors: {
//     origin: "http://localhost:8081",
//     methods: ["GET", "POST"]
//   }
// });

// io.sockets.on('connection', function (socket) {
//   console.log('A user connected with ');
// });