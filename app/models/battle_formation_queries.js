//queries to bd with battle formations and cells


const models = require('./sequalizeModel/init_models');

getBattleFormation = (id) => {
    return models.BattleFormation.findByPk(id,{
        include: models.BattleFormationCell
    }).then(res => {
        let battle_formation = { ...res.dataValues};
        battle_formation.BattleFormationCells = new Array();
        for (let cell of res.dataValues.BattleFormationCells){
            delete cell.dataValues.id;
            delete cell.dataValues.battle_formation;
            battle_formation.BattleFormationCells.push(cell.dataValues);
        }
        return battle_formation;
    }).catch(err => {
        throw err.message;
    })
}

module.exports.getBattleFormation = getBattleFormation