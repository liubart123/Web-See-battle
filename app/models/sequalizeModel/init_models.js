//creating sequalize models
const Sequelize = require('sequelize')
let User,BattleFormation,BattleFormationCell;
let sequelizeRecieved;
exports.init = (sequelize)=>{
    sequelizeRecieved=sequelize;
    User = sequelize.define(
        'User',
        {
            id:{type:Sequelize.INTEGER,primaryKey:true,
                autoIncrement: true,
                unique: true},
            user_name:{type:Sequelize.STRING,allowNull:false},
            email:{type:Sequelize.STRING,allowNull:true},
            password:{type:Sequelize.STRING,allowNull:false},
            role:{type:Sequelize.INTEGER,defaultValue: 0},      //0-guest, 5-user, 10- moderator, 15-admin
            matches:{type:Sequelize.INTEGER,defaultValue:0},
            winrate:{type:Sequelize.FLOAT,defaultValue:0},
            reports:{type:Sequelize.INTEGER,defaultValue:0},
            endOfBan:{type:Sequelize.DATE,allowNull:true}, 
        },
        {
            sequelize,
            tableName: 'user',
            timestamps: false
        }
    );
    BattleFormation = sequelize.define(
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

    BattleFormationCell = sequelize.define(
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

    
    Battle = sequelize.define(
        'Battle',
        {
            id: {
                type: Sequelize.INTEGER, primaryKey: true,
                autoIncrement: true,
                unique: true
            },
            startDate:{
                type:Sequelize.DATE,
                allowNull:true,
                field:'start_date',
            },
            battleType:{
                type: Sequelize.TINYINT,
                allowNull: true,
                field:'battle_type',
            },
            maxPlayersNumber:{
                type: Sequelize.TINYINT,
                allowNull: true,
                field:'max_players_number',
            }
        },
        {
            sequelize,
            tableName: 'battle',
            timestamps: false
        }
    );

    BattlePlayer = sequelize.define(
        'BattlePlayer',
        {
            battleId: {
                type: Sequelize.INTEGER, allowNull: false,
                references: { model: Battle, key: 'id' },
                field:'battle_id',
            },
            userId: {
                type: Sequelize.INTEGER, allowNull: true,
                references: { model: User, key: 'id' },
                field:'user_id',
            },
            gamePlace:{
                type: Sequelize.TINYINT,
                allowNull: true,
                field:'game_place',
            }
        },
        {
            sequelize,
            tableName: 'battle_player',
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
    User.hasMany(BattlePlayer,{
        foreignKey:'userId'
    })
    Battle.hasMany(BattlePlayer,{
        foreignKey:'battleId',
        as:'players'
    })
    // BattleFormationCell.belongsTo(BattleFormation)



}
exports.User=()=>User;
exports.BattleFormation=()=>BattleFormation;
exports.BattleFormationCell=()=>BattleFormationCell;
exports.Battle=()=>Battle;
exports.BattlePlayer=()=>BattlePlayer;
exports.sequelize=()=>sequelizeRecieved;