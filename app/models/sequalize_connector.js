//creating ocnnection of sequalize to db
//calling creation of sequalize models

const Sequelize = require('sequelize')
const sequelize = new Sequelize("pskp_course", 
    "pskp_user",
    "ZAQwsxcderfv123", 
        {
            dialect: "mssql",
            host: "localhost"
        });
// const queries = require('./queries/queries')
const models = require('./sequalizeModel/init_models');


//db init
sequelize.authenticate()
.then(()=>{
    console.log('db connection was created!');
    models.init(sequelize)
    // queries.selectAll('faculties')
    //     .then(res=>console.log(res))
    //     .catch(err=>console.log(`error: ${err}`))
})
.catch(err=>console.log(`connection error: ${err}`))

module.exports = sequelize;