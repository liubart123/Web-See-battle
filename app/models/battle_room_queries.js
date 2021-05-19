//queries to bd with battle and battle_players
//this script can load new battle to db and read them
let models = require('./sequalizeModel/init_models');


/*

[
  {
    "id": 1,
    "startDate": null,
    "battleType": 0,
    "maxPlayersNumber": 3,
    "players": [
      {
        "id": 1,
        "battleId": 1,
        "userId": 1,
        "gamePlace": 1
      }
    ]
  },
]

*/

getAllBattles=async ()=>{
    
    let battles = await models.Battle().findAll({
        include:[{
            model:models.BattlePlayer(),
            as:'players'
        }]
    });
    let result = [];
    
    let json = JSON.stringify(battles);
    let jsn2 = JSON.parse(json);
    return jsn2;
}

insertBattle=async(battle)=>{
    let insertingBattle = {...battle};
    insertingBattle.roomId=undefined;
    let inserted = await models.Battle().create(battle);
    let playersToInsert = [];
    for(let i=0;i<battle.players.length;i++){
        playersToInsert.push({
            battleId:inserted.id,
            userId:battle.players[i].userId>0?battle.players[i].userId:undefined,
            gamePlace:battle.players[i].gamePlace
        })
    }
    inserted = await models.BattlePlayer().bulkCreate(playersToInsert);
    return inserted;
}

test = async ()=>{
    let asd = await getAllBattles();
    asd = await insertBattle({
        battleType:123,
        players:[
            {
                battleId:12,
                userId:-1,
                gamePlace:7
            }
        ]
    })
    asd = await getAllBattles();
}

// setTimeout(()=>{
//     test();
// },500);


exports.insertBattle=insertBattle;
exports.getAllBattles=getAllBattles;

