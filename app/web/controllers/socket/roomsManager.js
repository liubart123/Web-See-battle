//controlls collection of rooms
//add and remove rooms
//find appropriate room
//saves rooms' data to db

let model = require('../../../models/battle_room_queries');

let roomsCollection = [];

addNewRoom=(room)=>{
    let bf = [];
    //create empty battleFormation
    for(let i1=0;i1<10;i1++){
        bf[i1]=[];
        for (let j1 = 0; j1 < 10; j1++) {
            bf[i1][j1]=0;
        }
    }

    let testPlayers = []
    //create empty players for room
    for(let i=0;i<room.maxPlayersNumber;i++){
        testPlayers[i]={
            isPlayer:false,
            isReady:false,
            isPlaying:false,
            order:i,
            userId:-1,
            battleFormation: bf
        }
    }

    //defining id for new room
    let roomId= 0;
    for(;roomId<roomsCollection.length;roomId++){
        if(!roomsCollection[roomId]){
            break;
        }
    }

    roomsCollection[roomId]={
                players: testPlayers,
                maxPlayersNumber:room.maxPlayersNumber,
                gamePlaceOfNextLosedPlayer:room.maxPlayersNumber,
                battleType:room.battleType,
                readyPlayersNumber : 0,
                isWaiting:true,
                roomId:roomId,
                isBattleInAction:false,
            };
    return roomsCollection[roomId];
}
removeRoom=(room)=>{
    //TODO:check if nested objects are deleted
    model.insertBattle(room);
    delete roomsCollection[room.roomId];
}

/*
filter:{
    maxPlayers:int,
    minPlayers:int,
    battleTypes:[int]
}
*/
findRoomForBattle=(filter)=>{
    for(let i=0;i<roomsCollection.length;i++){
        if (roomsCollection[i] && checkIfRoomSuitsFilter(roomsCollection[i],filter)){
            return roomsCollection[i];
        }
    }
    return addNewRoom({
        maxPlayersNumber:filter.minPlayers,
        battleType:filter.battleTypes[0],
    });
}

checkIfRoomSuitsFilter=(room, filter)=>{
    return room.maxPlayersNumber>=filter.minPlayers &&
        room.maxPlayersNumber<=filter.maxPlayers &&
        filter.battleTypes.includes(room.battleType);
}

findRoomById=(id)=>{
    return roomsCollection[id];
}

module.exports = {
    addNewRoom,
    removeRoom,
    findRoomForBattle,
    findRoomById,
}




//tests....
// addNewRoom({
//     maxPlayersNumber:2,
//     battleType:0,
// })

// delete roomsCollection[room.roomId];