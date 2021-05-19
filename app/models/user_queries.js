
const models = require('./sequalizeModel/init_models');

getUser=async(id)=>{
    let res = await models.User().findByPk(id);
    return res;
}

onPlayerPlayedMatch=async(id,place,maxPlace)=>{
    let user = await getUser(id);
    if (!user)
        return;
    user.matches++;
    user.winrate = user.winrate/user.matches + (place/maxPlace)/user.matches;
    await user.save();
}

getBestUsers= async ()=>{
    let res = await models.User().findAll({
        order: models.sequelize().literal('matches * (1-winrate) + (matches/2)*winrate desc')
    });
    let result = [];
    for(let user of res){
        let enoughUser = {};
        enoughUser.userName = user.user_name;
        enoughUser.matches = user.matches;
        enoughUser.winrate = user.winrate;
        enoughUser.reports = user.reports;
        result.push(enoughUser)
    }
    return result;
}

reportUser = async(id)=>{
    let user = await getUser(id);
    if (!user)
        return;
    user.reports++;
    await user.save();
}

banUser = async(id,endOfBan)=>{
    let user = await getUser(id);
    if (!user)
        return;
    user.endOfBan=endOfBan;
    await user.save();
}
changeUserRole = async(username,role)=>{
    let user = await models.User().findOne({
        where:{
            user_name:username
        }
    });
    if (!user)
        return;
    user.role=role;
    await user.save();
}

module.exports.getUser = getUser;
module.exports.onPlayerPlayedMatch = onPlayerPlayedMatch;
module.exports.getBestUsers = getBestUsers;
module.exports.reportUser = reportUser;
module.exports.banUser = banUser;
module.exports.changeUserRole = changeUserRole;