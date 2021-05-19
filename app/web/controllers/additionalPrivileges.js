const express = require('express')
var router = express.Router();
var authJwt = require('../middleware/authJwt');
var userModel = require('../../models/user_queries');

router.get('/report',[
    authJwt.verifyToken,
    authJwt.getMiddlewareToCheckUserRole(10),
    (req,res)=>{
        if (req.query.id!=undefined){
            userModel.reportUser(req.query.id);
        }
        res.sendStatus(200);
}]);
router.get('/ban',[
    authJwt.verifyToken,
    authJwt.getMiddlewareToCheckUserRole(15),
    (req,res)=>{
    if (req.query.id!=undefined){
        var endOfBan = new Date();
        endOfBan.setDate(endOfBan.getDate() + 1);   //1 day of ban
        userModel.banUser(req.query.id,endOfBan);
    }
    res.sendStatus(200);
}]);

router.get('/changeRole',[
    authJwt.verifyToken,
    authJwt.getMiddlewareToCheckUserRole(15),
    (req,res)=>{
    if (req.query.username!=undefined && req.query.role!=undefined){
        userModel.changeUserRole(req.query.username,req.query.role);
        res.sendStatus(200);
    }else {

        res.sendStatus(400);
    }
}]);


module.exports = router;
