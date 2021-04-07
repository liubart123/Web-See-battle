//controller for signin and signup user
const config = require('../../../config/auth.config');
const basic_queries = require('../../../models/basic_seq_queries')

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");


insertNewUser=(req,role)=>{
    return basic_queries.insert("User",{
        user_name: req.body.username,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 8),
        role:role})
}

exports.signup = (req, response) => {
    //check login for dublicate
    basic_queries.selectOneByColumn('User',req.body.username,'user_name')
    .then(res=>{
      if (res!=null){
        response.status(400).send({
            error_message: "Failed! Username is already in use!"
        });
        return;
      }else {
        //check email for dublicate
        basic_queries.selectOneByColumn('User',req.body.email,'email')
        .then(res=>{
          if (res!=null){
            response.status(400).send({
                error_message: "Failed! Email is already in use!"
            });
            return;
          }else {
            //insert new user
            insertNewUser(req)
                .then(result=>{
                    if (result.error){
                        response.status(400).send({ error_message: JSON.stringify(result.error) });
                    }else {
                        response.sendStatus(201);
                    }
                })
                .catch(err => {
                    response.status(500).send({ error_message: JSON.stringify(err) });
                });
          }
        })
      }
    })
    .catch(err => {
        response.status(500).send({ error_message: JSON.stringify(err) });
    });

};

exports.signin = (req, response) => {
    basic_queries.selectOneByColumn('User',req.body.username,'user_name')
        .then(user=>{
            if (!user) {
                return response.status(400).send({ error_message: "User Not found." });
            }else if (user.error){
                return response.status(400).send({ error_message: user.error });
            }else{
                var passwordIsValid = bcrypt.compareSync(
                    req.body.password,
                    user.password
                );

                if (!passwordIsValid) {
                    return response.status(401).send({
                        accessToken: null,
                        error_message: "Invalid Password!"
                    });
                } else {
                    var token = jwt.sign({ id: user.id }, config.secret, {
                        expiresIn: 86400 // 24 hours
                    });
                    response.status(200).send({
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        role: user.role,
                        accessToken: token
                    });
                }


            }
        })
        .catch(err => {
            response.status(500).send({ error_message: JSON.stringify(err) });
        });
};