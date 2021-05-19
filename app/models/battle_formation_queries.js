//queries to bd with battle formations and cells

/*
    {
        id,
        user_id,
        name,
        formation_type,
        BattleFormationCells:[
            {x,y,cell_type}
        ]
    }
*/

let models = require('./sequalizeModel/init_models');

getBattleFormationById = async (id) => {
    return models.BattleFormation().findByPk(id,{
        include: models.BattleFormationCell()
    }).then(res => {
        if (!res)
            return null;
        let battle_formation = { ...res.dataValues};
        battle_formation.BattleFormationCells = new Array();
        for(let i=0;i<10;i++){
            battle_formation.BattleFormationCells[i]=[];
            for(let j=0;j<10;j++){
                battle_formation.BattleFormationCells[i][j]=0;
            }
        }
        for (let cell of res.dataValues.BattleFormationCells){
            battle_formation.BattleFormationCells[cell.dataValues.y][ cell.dataValues.x] = cell.dataValues.cell_type;
        }
        return battle_formation;
    }).catch(err => {
        throw err.message;
    })
}

getBattleFormationsByUser = async(user_id) => {
    return await models.BattleFormation().findAll({
        attributes: ['id','name'],
        where:{
            user_id:user_id
        }
    }).then(res => {
        let battleFormations = [];
        for(let formation of res){
            battleFormations.push(formation.dataValues);
        }
        return battleFormations;
    }).catch(err => {
        throw err.message;
    });
};
getBattleFormationIdByUserAndName = (user_id,name) => {
    return models.BattleFormation().findAll({
        attributes: ['id'],
        where: {
            user_id: user_id,
            name:name
        }
    }).then(res => {
        return res[0]?res[0].dataValues:null;
    }).catch(err => {
        throw err.message;
    });
};

insertBattleFormationAndReturnId = (user_id, name)=>{
    return models.BattleFormation().create({
        user_id:user_id,
        name:name,
    }).then(res => {
        return getBattleFormationIdByUserAndName(user_id,name);
    }).catch(err => {
        throw err.message;
    });
};
deleteBattleFormation = (id) => {
    return models.BattleFormation().destroy({
        where:{
            id:id
        }
    }).then(res => {
        return res;
    }).catch(err => {
        throw err.message;
    })
}

updateBattleFormation = async (id, battleFormation) =>{
    try {
        await models.BattleFormation().update(battleFormation, { where: { id: id } });
        await models.BattleFormationCell().destroy({
            where: {
                battle_formation: id
            }
        });
        let cells = [];
        for(let i=0;i<10;i++){
            for(let j=0;j<10;j++){
                if (battleFormation.BattleFormationCells[i][j]!=0)
                    cells.push({ x: j, y: i, cell_type: battleFormation.BattleFormationCells[i][ j], battle_formation:id})
            }
        }
        await models.BattleFormationCell().bulkCreate(cells);
    }
    catch(e){
        throw e.message?e.message:e;
    }

    // return models.battleFormation.update(battleFormation, { where: { id: id }})
    // .then(res=>{
    //     return models.BattleFormationCell().destroy({
    //         where: {
    //             battle_formation: id
    //         }
    //     }).then(res => {
    //         return models.BattleFormationCell().bulkCreate(cells).then(res => {
    //             return res;
    //         })
    //             .catch(err => {
    //                 throw err.message;
    //             })

    //     }).catch(err => {
    //         throw err.message;
    //     })
    // }).catch(err => {
    //     throw err.message;
    // })
}


async function doCrudTest(){
    try{
        let bfsId = await insertBattleFormationAndReturnId(1,'crud test formation');
        let bfs = await getBattleFormationsByUser(1);
        bfs = await getBattleFormationById(bfsId.id);
        bfs.BattleFormationCells.push({ x: 2, y: 4, cell_type: 0 });
        bfs.BattleFormationCells.push({ x: 3, y: 4, cell_type: 0 });
        bfs = await updateBattleFormation(bfs.id, bfs.BattleFormationCells, bfs)
        bfs = await deleteBattleFormation(bfsId.id);
    }catch(e){
        console.log(e);
    }
}

module.exports.getBattleFormationById = getBattleFormationById;
module.exports.getBattleFormationsByUser = getBattleFormationsByUser;
module.exports.getBattleFormationIdByUserAndName = getBattleFormationIdByUserAndName;
module.exports.insertBattleFormationAndReturnId = insertBattleFormationAndReturnId;
module.exports.deleteBattleFormation = deleteBattleFormation;
module.exports.updateBattleFormation = updateBattleFormation;
module.exports.doCrudTest = doCrudTest;