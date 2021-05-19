//controller for crud for battle rooms
//find appropriate room, find by pk, create new one 

var express = require('express');
var authJwt = require('../middleware/authJwt');
var router = express.Router();
const roomsManager= require('../controllers/socket/roomsManager')


router.post('/find',
    (req,res)=>{
        let filter = req.fields;
        if (!filter.maxPlayers || !filter.minPlayers || !filter.battleTypes)
            res.sendStatus(400)
        else {
            let resRoom = roomsManager.findRoomForBattle(filter);
            if (!resRoom){
                res.status(500).send('room wasn`t created')
            }else {
                res.status(200).send(resRoom.roomId+'');
            }
        }

    })
    
// router.post('/find/:id',
//     (req,res)=>{
//         if (!req.params.id)
//             res.sendStatus(400)
//         else {
//             let resRoom = roomsManager.findRoomById(req.params.id);
//             if (!resRoom){
//                 res.status(500).send('room wasn`t created')
//             }else {
//                 res.status(200).send(resRoom.roomId+'');
//             }
//         }

//     })
    
    
router.post('/add',
    [authJwt.verifyToken,
    authJwt.getMiddlewareToCheckUserRole(5),
    (req,res)=>{
        let room = req.fields;
        if (!room)
            res.sendStatus(400)
        else {
            if (!room.maxPlayersNumber || room.battleType==undefined || room.battleType==null)
                res.sendStatus(400)
            else {
                res.send(roomsManager.addNewRoom(room).roomId + '');
            }
        }

    }])

module.exports = router;