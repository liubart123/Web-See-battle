//creating sequalize models
const Sequelize = require('sequelize')
exports.init = (sequelize)=>{
    const User = sequelize.define(
        'User',
        {
            id:{type:Sequelize.INTEGER,primaryKey:true,
                autoIncrement: true,
                unique: true},
            user_name:{type:Sequelize.STRING,allowNull:false},
            email:{type:Sequelize.STRING,allowNull:true},
            password:{type:Sequelize.STRING,allowNull:false},
            role:{type:Sequelize.INTEGER,defaultValue: 0},
        },
        {
            sequelize,
            tableName: 'user',
            timestamps: false
        }
    );

    const BattleFormation = sequelize.define(
        'BattleFormation',
        {
            id: {
                type: Sequelize.INTEGER, primaryKey: true,
                autoIncrement: true,
                unique: true
            },
            name: { type: Sequelize.STRING, allowNull: false },
            formation_type: { 
                type: Sequelize.TINYINT, defaultValue: 0,
            },
            user_id:{
                type:Sequelize.INTEGER,allowNull:true,
                references:{model:User,key:'id'}
            }
        },
        {
            sequelize,
            tableName: 'battle_formation',
            timestamps: false
        }
    );

    const BattleFormationCell = sequelize.define(
        'BattleFormationCell',
        {
            x: {
                type: Sequelize.TINYINT,
                allowNull: false
            },
            y: {
                type: Sequelize.TINYINT,
                allowNull: false
            },
            cell_type: {
                type: Sequelize.TINYINT,
                allowNull: false
            },
            battle_formation: {
                type: Sequelize.INTEGER, allowNull: false,
                references: { model: BattleFormation, key: 'id' }
            }
        },
        {
            sequelize,
            tableName: 'battle_formation_cell',
            timestamps: false
        }
    );

    // i don't need pk in  this table but without it sequalize can't do queries wih joining this table. 
    //sequalize just return onyl first element of join...
    // BattleFormationCell.removeAttribute('id');

    User.hasMany(BattleFormation, {
        foreignKey: 'user_id'
    })
    BattleFormation.hasMany(BattleFormationCell,{
        foreignKey:'battle_formation'
    })
    // BattleFormationCell.belongsTo(BattleFormation)

    exports.User = User;
    exports.BattleFormation = BattleFormation;
    exports.BattleFormationCell = BattleFormationCell;
}