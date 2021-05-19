//creates socket io connection
//handle socket cllients input
//does necessary calculations 
//and inform socket clients about them :3


/*
    events:
        (server) getCommonRoomState(room object)    //give info about room and other players to new player
        (server) getPlayerInRoomState(fullPlayerState object)   //give full player's info about himself... 
        (client) playerChanged(fullPlayerState)
        (server) playerChanged(playerState, int order)
        
        (client) takeShot(x,y,type,order)  //some player try to shoot in "order's" player's field, at x,y position
        //type: 0-default shot
        for messaging server calls "send" with object {error_message, message}. BUT IT IS IN BETA TESTING YET

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
const userModel = require('../../../models/user_queries')
const battleFormationValidator = require('./battleFormationManager')
const roomsManager = require('./roomsManager');
//key - roomid
/*
{
    players(array):[ 
        {
            userName:string
            matches:int     //total count of matches by player
            winrate:float   //total average place in game, 0 - the best, 1 - the worst
            reportsint  //count of reports on this player

            isPlayer:bool, if false this position will be placed by AI
            userId:int (player id in database)
            battleFormation: collection of cells, where ships were put. 10x10 table. doesnt change during active game
                [[
                    int    //type of ship in the cell {0-default(empty), 1-ship}
                ]]
            shotMap: collection of cells, where other players shooted. 10x10. 
                [[
                    type:int    //type of shot {0-default(empty),1-miss,2-hit,3-blocked,4-miss but now blocked}
                    owner:int   //order id of player, who did this shot
                ]]
            (to shot first shotMap is checked, can shot be made here? after that BF is checked)
            order:int (number of player in the room)
            isReady:bool,
            isPlaying:bool, //playing or losed
            socket,
            gamePlace:int,  //show result position of player in match, when game for him is over...
            countOfShotsInRound:int,    //number of possible shots for this player in this round
        }
    ]
    maxPlayersNumber:int
    readyPlayersNumber:int
    battleType:int
    isWaiting:bool
    isBattleInAction:bool,  //is there any active battle?
    roomId:int,
    gamePlaceOfNextLosedPlayer:int, //place that next losed player will get. After lose this var is decreased   
    roundTimer:timer,    //timer, executes whet current round is over
    roundTime:int,  //current time of round, if 0 - round is over...
    roundTimeCounterInterval:interval,  //interval for changing roundTimer
    maxRoundTime:int,  //seconds for every round
    roundNumber:int,    //number of current round, starts from 1
    maxCountOfShotsInRound:int,    
}
*/

//create player ojbect to send it to other players. They don't need to know too much about this player;)
let getPlayerStateForSending = (player) =>{
    let playerStateForOtherPlayers = {...player}
    playerStateForOtherPlayers.socket = undefined;
    playerStateForOtherPlayers.battleFormation=undefined;
    return playerStateForOtherPlayers;
}
let getFullPlayerStateForSending = (player) => {
    let res = {...player}
    res.socket = undefined;
    return res;
}
let getRoomStateForSending=(room)=>{
    let sendingRoomState = {...room};
    sendingRoomState.socket = undefined;
    sendingRoomState.roundTimer = undefined;
    sendingRoomState.players = [];
    for(let i=0;i<sendingRoomState.maxPlayersNumber;i++){
        let copy = getPlayerStateForSending(room.players[i]);
        sendingRoomState.players[i]=copy;
    }
    return sendingRoomState;
}

const battleManager= require('./battleManager')(getPlayerStateForSending,getFullPlayerStateForSending,getRoomStateForSending);
//add almost all event handlers to user's socket
let addNewUserToRoom = async (socket, io, roomId, userId) => {
    //CREATING OBJECTS ON SERVER
    let room = roomsManager.findRoomById(roomId);   // roomsMap.get(roomId)
    if (!room){
        socket.emit("error", "There is no such room...");
        socket.disconnect()
        return;
    }

    let player;
    if (room.isBattleInAction){
        let playerOrder = 0;
        for (; playerOrder < room.maxPlayersNumber;playerOrder++){
            if (room.players[playerOrder].userId==userId &&
                room.players[playerOrder].isPlayer==false &&
                room.players[playerOrder].isPlaying==true
                ){
                    player = room.players[playerOrder];
                    break;
                }
        }
            if (!player) {
                socket.emit("error", "Room is in battle");
                socket.disconnect()
                return;
            }
    }else if (room.isWaiting){
        let playerOrder = 0;
        for (; playerOrder < room.maxPlayersNumber;playerOrder++){
            if (!room.players[playerOrder].isPlayer)
                break;
        }
        if (!room.players[playerOrder] || room.players[playerOrder].isPlayer) {
            socket.emit("error", "Room is full");
            socket.disconnect()
            return;
        }
        player = room.players[playerOrder];
    }
    if (userId!=-1){
        let dbUser = await userModel.getUser(userId);
        if (dbUser){
            if (Date.parse(dbUser.endOfBan)>new Date()){
                socket.emit("error", "YOu are banned until " + dbUser.endOfBan);
                socket.disconnect()
            }
            player.userName = dbUser.user_name;
            player.matches = dbUser.matches;
            player.reports = dbUser.reports;
            player.winrate = dbUser.winrate;
        }
    }else {
        //user guest
        player.userName = 'GUEST axaxax';
        player.matches = 0;
        player.reports = 0;
        player.winrate = 1;
    }
    player.userId = userId;
    player.isPlayer = true;
    player.isReady = false;
    player.socket = socket;


    //BINDING HANDLERS
    socket.on('disconnect', () => {
        
        player.isPlayer = false;
        if (!room.isWaiting)
            player.isReady = false;
        if (!room.isBattleInAction)
            player.userId=-1;

        
        let toCloseRoom=true;
        for(let pl of room.players){
            if (
                (room.isBattleInAction && pl.isPlayer && pl.isPlaying) ||
                (room.isWaiting && pl.isPlayer)
            ){
                toCloseRoom=false;
                break;
            }
        }
        if (toCloseRoom){
            if (room.isBattleInAction && player.isPlaying==true)
                battleManager.closeBattle(room);
            else if (room.isWaiting)
                roomsManager.removeRoom(room);
            //TODO:delete room from map
        }

        let playerStateForOtherPlayers = getPlayerStateForSending(player)
        io.to(roomId).emit('playerChanged', playerStateForOtherPlayers, player.order)

    });
    socket.on('playerChanged',(newPlayerState)=>{
        if (room.isBattleInAction) 
            return;
        //SETTING NEW VALUES OF PLAYER
        let validationError;
        if (!newPlayerState.isReady){
            validationError=false;
        } else {
            validationError = battleFormationValidator.checkBfIsValid(newPlayerState.battleFormation);
            socket.emit('error', validationError)
        }
        if (validationError){
            player.isReady = false;
        } else {
            player.isReady = newPlayerState.isReady;
        }
        player.battleFormation = newPlayerState.battleFormation;
        //SENDING UPDATED INFO TO OTHERS PLAYERS
        let playerStateForOtherPlayers = getPlayerStateForSending(player)
        for (let pl of room.players) {
            if (pl.userId != player.userid && pl.isPlayer && pl.socket){
                pl.socket.emit('playerChanged', playerStateForOtherPlayers, player.order)
            }
        }
        //io.to(roomId).emit('playerChanged', playerStateForOtherPlayers, player.order)
        socket.emit('getPlayerInRoomState', getFullPlayerStateForSending(player));

        let areAllReady = true;
        for(let pl of room.players){
            if (pl.isReady==false)
            {
                areAllReady = false;
                break;
            }
        }
        if (areAllReady){
            //TODO:add fucntion to remove room from map of rooms is match is over...    
            battleManager.startBattle(room);
        }
    })

    //SENDING PLAYER INFO ABOUT HIMSELF AND ROOM
    // let sendingRoomState = {
    //     isWaiting:room.isWaiting,
    //     maxPlayersNumber : room.maxPlayersNumber,
    //     battleType:room.battleType,
    //     players:new Array()
    // }
    let sendingRoomState = getRoomStateForSending(room);
    socket.emit('getCommonRoomState', sendingRoomState);

    //GET FORMATION FROM FORMATION_ID AND SEND IT TO CURENT PLAYER

    socket.emit('getPlayerInRoomState', getFullPlayerStateForSending(player));
    
    //SENDING INFO ABOUT NEW PLAYER TO OTHER PLAYERS
    let playerStateForOtherPlayers = getPlayerStateForSending(player)
    io.to(roomId).emit('playerChanged', playerStateForOtherPlayers, player.order)

    if (room.isBattleInAction){
        battleManager.onPlayerConnection(room,player);
    }
    
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
        if (!roomId || roomId == 'null') {
            socket.emit("error", "Incorrect roomId");
            socket.disconnect()
        } 
        // else if (!userId || userId == 'null') {
        //     socket.emit("error", "Incorrect userId");
        //     socket.disconnect()
        // } 
        else if (!roomsManager.findRoomById(roomId)){
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
            if (!userId){
                userId=-2;
            }
            addNewUserToRoom(socket, io, roomId, userId);
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




// let battleManager= require('./battleManager')(getPlayerStateForSending,getFullPlayerStateForSending,getRoomStateForSending);
// battleManager.startBattle(roomsMap.get('1'));

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







