var express = require('express');
var path = require('path');
var router = express.Router();

//crete handler, that will return file for its name
//TODO: probably its better to change this code for automatic handler for all
//necessary static files
addToRouterGetFileResponse = (fileName, filePath) => {
    router.get(`/${fileName}`, function(req, res) {
        res.sendFile(filePath + fileName);
    });
}

addToRouterGetFileResponse("index.jsx",path.dirname(process.mainModule.filename) + "/front/");

router.get(`/front`, function(req, res) {
    res.sendFile(path.dirname(process.mainModule.filename) + "/front/index.html");
});

module.exports = router;
