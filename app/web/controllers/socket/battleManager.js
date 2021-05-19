//adds new handlers to sockets for battle
//handle user input
//change battle states

const e = require("cors");

let getPlayerStateForSending;
let getFullPlayerStateForSending;
let getRoomStateForSending;
//TODO:mport new module with this func
let deleteMapFromMap=require('./roomsManager').removeRoom;
let userModel = require('../../../models/user_queries');

//get empty double dim array 10x10
getEmptyShotMap=()=>{
    let res = [];
    for(let i=0;i<10;i++){
        res[i]=[];
        for(let j=0;j<10;j++){
            res[i][j]={type:0,owner:-1};
        }
    }
    // res[2][3].type=1;
    return res;
}

//return new cell type or -1 when shot is impossible
checkShotResult=(x,y,shotType,shotMap,battleFormation)=>{
    if (shotMap[y][x].type==0){
        if (battleFormation[y][x]!=0){
            return 2;   //hit
        }else{
            return 1;   //miss
        }
    }else{
        return -1;
    }
}

//make cells blocked around ship that was destroyed by this shot... if it was destroyed
//return true if ship was destroyed;
blockShipBofderIfItSink=(x,y,shotMap,battleFormation)=>{
    let shipCells = []; //cells where ship is placing
    shipCells.push({x,y});
    let angleOfShip = Math.PI/2; //vertiacal ship
    if (
        (x-1>=0 && 
            battleFormation[y][x-1]!=0) ||
        (x+1<10 &&
            battleFormation[y][x+1]!=0)
    ){
        angleOfShip = 0;
    }

    for(let cord = 1;cord<10;cord+=1){
        let newY = y + Math.round(Math.sin(angleOfShip))*cord;
        let newX = x + Math.round(Math.cos(angleOfShip))*cord;
        if (newY<0||newY>=10||newX<0||newX>=10)
            break;
        if (battleFormation[newY][newX]!=0){
            shipCells.push({x:newX,y:newY});
        }else {
            break;
        }
    }
    for(let cord = 1;cord<10;cord+=1){
        let newY = y - Math.round(Math.sin(angleOfShip))*cord;
        let newX = x - Math.round(Math.cos(angleOfShip))*cord;
        if (newY<0||newY>=10||newX<0||newX>=10)
            break;
        if (battleFormation[newY][newX]!=0){
            shipCells.push({x:newX,y:newY});
        }else {
            break;
        }
    }

    let isShipDestroyed = true;
    for(let shipCell of shipCells){
        if (shotMap[shipCell.y][shipCell.x].type!=2)
        {
            isShipDestroyed = false;
            break;
        }
    }

    if (isShipDestroyed){
        for(let shipCell of shipCells){
            for(let angle=0;angle<Math.PI*2;angle+=Math.PI/4){
                let newY = shipCell.y + Math.round(Math.sin(angle));
                let newX = shipCell.x + Math.round(Math.cos(angle));
                if (newY<0||newY>=10||newX<0||newX>=10)
                    continue;
                if (shotMap[newY][newX].type==0)
                    shotMap[newY][newX].type=3;
                if (shotMap[newY][newX].type==1)
                    shotMap[newY][newX].type=4;
            }
        }
    }

    return isShipDestroyed;
}

//returns true if all ships on bf are destroyed
checkIfAllShipsAreDestroyed=(shotMap,battleFormation)=>{
    let areAllDestroyed = true;
    for(let y=0;y<10;y++){
        for(let x=0;x<10;x++){
            if (battleFormation[y][x]!=0){
                if (shotMap[y][x].type!=2){
                    areAllDestroyed=false;
                    break;
                }
            }
        }
    }
    return areAllDestroyed;
}

makePlayerLosed=(player,room)=>{
    player.isPlaying=false;
    player.gamePlace = room.gamePlaceOfNextLosedPlayer;
    room.gamePlaceOfNextLosedPlayer--;
    if (player.isPlayer && player.socket){
        let FullPlayerStateForSending = getFullPlayerStateForSending(player);
        player.socket.emit('getPlayerInRoomState',FullPlayerStateForSending);
    }
}

sendRoomStateToAllPLayers=(room)=>{
    let sendingRoom = getRoomStateForSending(room);
    for(let pl of room.players){
        if (pl.isPlayer && pl.socket){
            pl.socket.emit('getCommonRoomState',sendingRoom);
        }
    }
}

startNewRound=(room)=>{
    room.roundNumber++;
    room.roundTime=room.maxRoundTime;

    for(let pl of room.players){
        pl.countOfShotsInRound = room.maxCountOfShotsInRound;
        if (pl.socket && pl.isPlayer && pl.isPlaying){
            let FullPlayerStateForSending = getFullPlayerStateForSending(pl);
            pl.socket.emit('getPlayerInRoomState',FullPlayerStateForSending);
        }
    }

    sendRoomStateToAllPLayers(room);
    beginNewTimer(room);
}
beginNewTimer=(room)=>{
    console.log('begin new timer');
    if (room.roundTimer)
        clearTimeout(room.roundTimer);
    room.roundTimer = setTimeout(()=>{
        startNewRound(room);
    },room.maxRoundTime*1000); 

}

//start new round before current timer ends if room has appropriate state
checkRoomStateForNewRound=(room)=>{
    let toStartNewRound= true;
    for(let pl of room.players){
        if (pl.isPlayer && pl.isPlaying && pl.countOfShotsInRound!=0){
            toStartNewRound=false;
            break;
        }
    }
    if (toStartNewRound){
        startNewRound(room);
    }
}

//close match if there is one playing side, or zero
checkRoomStateForEndOfMatch=(room)=>{
    let countOfPlayers = 0;
    let lastPlayer;
    for(let pl of room.players){
        if (pl.isPlaying){
            countOfPlayers++;
            if (pl.isPlayer)
                lastPlayer=pl;
        }
    }
    if (countOfPlayers<=1){
        if (lastPlayer)
            makePlayerLosed(lastPlayer,room);
        closeBattle(room);
    }
}

createTakeShotHandler=(room,player)=>{
    return (x,y,shotType,targetOrder)=>{
                if (player.countOfShotsInRound<=0){ 
                    let FullPlayerStateForSending = getFullPlayerStateForSending(room.players[targetOrder]);
                    room.players[targetOrder].socket.emit('getPlayerInRoomState',FullPlayerStateForSending);
                    return;
                }
                if (room.players[targetOrder].isPlaying==false){
                    return;
                }
                if(!player.isPlaying)
                    return;
                let shotRes = checkShotResult(x,y,shotType,
                    room.players[targetOrder].shotMap,
                    room.players[targetOrder].battleFormation);
                if (shotRes!=-1){
                    room.players[targetOrder].shotMap[y][x].type=shotRes;
                    room.players[targetOrder].shotMap[y][x].owner=player.order;
                    if(blockShipBofderIfItSink(x,y,
                        room.players[targetOrder].shotMap,
                        room.players[targetOrder].battleFormation)){
                        if (checkIfAllShipsAreDestroyed(
                            room.players[targetOrder].shotMap,
                            room.players[targetOrder].battleFormation))
                        {
                            makePlayerLosed(room.players[targetOrder],room);
                            checkRoomStateForEndOfMatch(room);
                        }
                    }
                    
                    //if it was miss reduce count of shots for round for this player
                    if (shotRes==1){
                        player.countOfShotsInRound--;
                        let FullPlayerStateForSending = getFullPlayerStateForSending(player);
                        player.socket.emit('getPlayerInRoomState',FullPlayerStateForSending);
                        let playerStateForOtherPlayers = getPlayerStateForSending(player);
                        for(player2 of room.players){
                            if (!player2.socket || !player2.isPlayer)
                                continue;
                            player2.socket.emit('playerChanged', playerStateForOtherPlayers, player.order);
                        }
                    }

                    //TODO:do not send full state with battle formation for every shot
                    let playerStateForOtherPlayers = getPlayerStateForSending(room.players[targetOrder]);
                    for(player2 of room.players){
                        if (!player2.socket || !player2.isPlayer)
                            continue;
                        player2.socket.emit('playerChanged', playerStateForOtherPlayers, targetOrder);
                    }


                    checkRoomStateForNewRound(room);
                }
            }
}

//set room's and players' properties to respective values
///set necessary handlers for secket's events 
const startBattle = (room)=>{
    for(player of room.players){
        player.isPlaying=true;
        player.shotMap=getEmptyShotMap();
    }
    room.isBattleInAction=true;
    room.isWaiting=false;

    //TODO:different types of battle
    if (room.battleType==0){
        room.maxCountOfShotsInRound=room.players.length;
        room.maxRoundTime=60;
    }

    room.roundNumber=0;
    startNewRound(room);

    let intervalId = setInterval(() => {
        room.roundTime--;
    }, 1000);
    // room.roundTimeCounterInterval=intervalId;

    sendRoomStateToAllPLayers(room);
    //add handlers to socket events
    //send players roomstate with shotMaps
    for(player of room.players){
        onPlayerConnection(room,player);
        player.countOfShotsInRound=room.maxCountOfShotsInRound;
    }
}

onPlayerConnection = (room,player)=>{
    if (player.isPlayer==false || !player.socket)
        return;
    let FullPlayerStateForSending = getFullPlayerStateForSending(player);
    player.socket.emit('getPlayerInRoomState',FullPlayerStateForSending);

    player.socket.on('takeShot',createTakeShotHandler(room,player));
}

//responds for closing battle. Sends requests to players and call deleting from roomMap
closeBattle=(room)=>{
    for(let pl of room.players){
        if (pl.isPlayer && pl.socket){
            pl.socket.send('match is over');
            pl.socket.disconnect('match is over disconnect');
        }
        makePlayerLosed(pl,room);
        userModel.onPlayerPlayedMatch(pl.userId,pl.gamePlace,room.maxPlayersNumber);
    }
    deleteMapFromMap(room);
}


module.exports = function (
    getPlayerStateForSendingp,
    getFullPlayerStateForSendingp,
    getRoomStateForSendingp)
{
    getPlayerStateForSending=getPlayerStateForSendingp;
    getFullPlayerStateForSending=getFullPlayerStateForSendingp;
    getRoomStateForSending=getRoomStateForSendingp;
    return {
        startBattle:startBattle,     //room - parameter
        onPlayerConnection:onPlayerConnection,      //callback to handle player connection to BATTLE
        closeBattle:closeBattle,
    }
}