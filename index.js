const express = require("express")
const app = express();

//INIT DATABASE CONNECTION
const sequalize = require('./app/models/sequalize_connector');

//CORS
const cors = require("cors");
var corsOptions = {
    origin: "http://localhost:8081"
  };
app.use(cors(corsOptions));


//BODY PARSER
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


//CONTROLLERS
// const test_frontController = require('./web/controllers/test/test_front_controller')
// app.use("/test",test_frontController);


//STATIC
// app.use(express.static(__dirname + "/web/static"));

//ROUTES
//check user role and his token for authentification
require('./app/web/routes/auth_routes')(app);

//DEFAULT 404 CONTROLLER
app.use((req,res,next)=>{
    res.sendStatus(404);
})

var server = app.listen(3000);
//SOCKET IO TEST
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