//creates socket io connection
//handle socket cllients input
//does necessary calculations 
//and inform socket clients about them :3


/*
    events:
        (server) getCommonRoomState(room object)
        (server) getPlayerInRoomState(fullPlayerState object)
        (client) playerChanged(fullPlayerState)
        (server) playerChanged(playerState, int order)

    event calls:
        connect to room:
            -getCommonRoomState
            -getPlayerInRoomState
            -(others)playerChanged
        disconnect from room:
            -disconnect socketio
            -(others)playerChanged
        any player state change:
            -(clients asks)playerChanged
            -(server answers)playerChanged
            -(others)playerChanged
        battle starts:
            -getCommonRoomState
            -getPlayerInRoomState


    player's information about himself:{
        fullPlayerState:{
            order,
            isReady:bool,
            battleFormationId,
            battleFormation,
        }
    }
*/
const socketIo = require('socket.io');
// const battleFormationModel = require('../../../models/battle_formation_queries')
const battleFormationModel = require('../../../models/battle_formation_queries')

roomsMap = new Map();
//key - roomid
/*
{
    players(map):[ key - playerOrder
        {
            isPlayer:bool, if false this position will be placed by AI
            userId:int (player id in database)
            battleFormationId:int (id of map used by player in this room)
            battleFormation: collection of cells, where ships were put
                [
                    {
                        x:int,
                        y:int,
                        type:int    //type of ship in the cell
                    }
                ]
            shotMap: collection of cells, where other players shooted
                [
                    {
                        x,y:int
                        type:int    //type of shot
                        owner:int   //order id of player, who did this shot
                    }
                ]
            order:int (number of player in the room)
            isReady:bool
        }
    ]
    maxPlayersNumber:int
    readyPlayersNumber:int
    battleType:int
    isWaiting:bool
}
*/

//create player ojbect to send it to other players. They don't need to know too much about this player;)
let getPlayerStateForSending = (player) =>{
    let playerStateForOtherPlayers = {
        isReady: player.isReady,
        isPlayer: player.isPlayer,
        order:player.order,
        userId:player.userId
    }
    return playerStateForOtherPlayers;
}
let getFullPlayerStateForSending = (player) => {
    let playerFullState = getPlayerStateForSending(player);

    playerFullState.battleFormationId = player.battleFormationId;
    return battleFormationModel.getBattleFormation(playerFullState.battleFormationId)
        .then(res=>{
            player.battleFormation = res.BattleFormationCells;
            playerFullState.battleFormation = player.battleFormation;
            return playerFullState;
        })
}
//add almost all event handlers to user's socket
let addNewUserToRoom = (socket, io, roomId, userId, battleFormationId) => {
    //CREATING OBJECTS ON SERVER
    let room = roomsMap.get(roomId)
    if (!room)
        return;

    if (!battleFormationId)
        battleFormationId=-1;

    let playerOrder = 0;
    for (; playerOrder < room.maxPlayersNumber;playerOrder++){
        if (!room.players.get(playerOrder).isPlayer)
            break;
    }
    if (room.players.get(playerOrder).isPlayer) {
        socket.emit("error", "Room is full");
        socket.disconnect()
    }
    let player = room.players.get(playerOrder)
    player.userId = userId;
    player.battleFormationId = battleFormationId;
    player.isPlayer = true;
    player.isReady = false;
    //TODO:getting formation from db by id
    // player.battleFormation = battleFormation;


    //BINDING HANDLERS
    socket.on('disconnect', () => {
        playerStateForOtherPlayers = {
            isReady: false,
            isPlayer: false
        }
        io.to(roomId).emit('playerChanged', playerStateForOtherPlayers, player.order)
        player.isPlayer = false;
        player.isReady = false;
        player.userId=-1;
    });
    socket.on('playerChanged',(newPlayerState)=>{
        //SETTING NEW VALUES OF PLAYER
        player.isReady = newPlayerState.isReady;
        player.battleFormationId = newPlayerState.battleFormationId;
        if (newPlayerState.battleFormation)
            player.battleFormation = newPlayerState.battleFormation;

        //SENDING UPDATED INFO TO OTHERS PLAYERS
        let playerStateForOtherPlayers = getPlayerStateForSending(player)
        io.to(roomId).emit('playerChanged', playerStateForOtherPlayers, player.order)
    })

    //SENDING PLAYER INFO ABOUT HIMSELF AND ROOM
    let sendingRoomState = {
        isWaiting:room.isWaiting,
        maxPlayersNumber : room.maxPlayersNumber,
        battleType:room.battleType,
        players:new Array()
    }
    for(let pl of room.players.values()){
        let playerStateForOtherPlayers = getPlayerStateForSending(pl)
        sendingRoomState.players.push(playerStateForOtherPlayers);
    }
    socket.emit('getCommonRoomState', sendingRoomState);

    //GET FORMATION FROM FORMATION_ID AND SEND IT TO CURENT PLAYER
    getFullPlayerStateForSending(player)
        .then(res => {
            socket.emit('getPlayerInRoomState',res);
        })
        .catch(err => {
            socket.emit("error", "Error during getting player info: " + err);
            socket.disconnect()
        })
    //SENDING INFO ABOUT NEW PLAYER TO OTHER PLAYERS
    let playerStateForOtherPlayers = getPlayerStateForSending(player)
    io.to(roomId).emit('playerChanged', playerStateForOtherPlayers, player.order)
    
}

module.exports = function (server) {
    var io = require('socket.io')(server, {
        cors: {
            origin: require('../../../../config.json').frontUrl,
            methods: ["GET", "POST"]
        }
    });

    //checks if user can connect to room 
    //craete player object and add it to room
    io.on('connection',socket=>{
        let roomId = socket.handshake.query.roomId;
        let userId = socket.handshake.query.userId;
        let battleFormationId = socket.handshake.query.battleFormationId;
        if (!roomId || roomId == 'null') {
            socket.emit("error", "Incorrect roomId");
            socket.disconnect()
        } else if (!userId || userId == 'null') {
            socket.emit("error", "Incorrect userId");
            socket.disconnect()
        } else if (!roomsMap.has(roomId)){
            socket.emit("error", "This room doesn't exist");
            socket.disconnect()
        } 
        //TODO: bad place for checking players number in room
        // else if (roomsMap.get(roomId).maxPlayersNumber <= roomsMap.get(roomId).players.size) {
        //     socket.emit("error", "Room is full");
        //     socket.disconnect()
        // } 
        else {
            socket.join(roomId);
            socket.send("Conected.");
            addNewUserToRoom(socket, io, roomId, userId, battleFormationId);
        }
    });

    {
    // var sockets = [];
    // sockets.push(socketIo(app))
    // sockets.push(socketIo(server))
    // sockets.push(socketIo(http))
    // sockets.push(socketIo(3001))
    // var io = require('socket.io')(3001);
    //Whenever someone connects this gets executed
    // for (let i =0;i<sockets.length;i++){
    //     sockets[i].on('connection', function(socket) {
    //         console.log('A user connected with '+i);
    //         //Whenever someone disconnects this piece of code executed
    //         socket.on('disconnect', function () {
    //            console.log('A user disconnected');
    //         });
    //     });
    // }
    }
}



//tests....
let testPlayers = new Map()
for(let i=0;i<3;i++){
    testPlayers.set(i,{
        isPlayer:false,
        isReady:false,
        order:i,
        userId:-1
    })
}
roomsMap.set('1',{
    players: testPlayers,
    maxPlayersNumber:3,
    battleType:0,
    readyPlayersNumber : 0,
    isWaiting:true,
})
// setTimeout(() => {
//     battleFormationModel.getBattleFormation('12')
//         .then(res=>{
//             return res;
//         })
//         .then((err,res)=>{

//         })
//         .catch(err=>{

//         })
// },1500);

// basic_queries = require('../../../models/basic_seq_queries')
// basic_queries.selectAll('BattleFormation');