//controller for signin and signup user
const config = require('../../../config/auth.config');
const basic_queries = require('../../../models/basic_seq_queries')

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");


insertNewUser=(req,role)=>{
    if (!role)
        role=5;
    return basic_queries.insert("User",{
        user_name: req.fields.username,
        email: req.fields.email,
        password: bcrypt.hashSync(req.fields.password, 8),
        role:role})
}

exports.signup = (req, response) => {
    //check login for dublicate
    basic_queries.selectOneByColumn('User', req.fields.username,'user_name')
    .then(res=>{
      if (res!=null){
        response.status(400).send({
            error_message: "Failed! Username is already in use!"
        });
        return;
      }else {
        //check email for dublicate
          basic_queries.selectOneByColumn('User', req.fields.email,'email')
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
    basic_queries.selectOneByColumn('User', req.fields.username,'user_name')
        .then(user=>{
            if (!user) {
                response.status(400).send({ error_message: "User Not found." });
            }else if (user.error){
                response.status(400).send({ error_message: user.error });
            }else{
                var passwordIsValid = bcrypt.compareSync(
                    req.fields.password,
                    user.password
                );

                if (!passwordIsValid) {
                    response.status(403).send({
                        accessToken: null,
                        error_message: "Invalid Password!"
                    });
                } else {
                    if (Date.parse(user.endOfBan) && Date.parse(user.endOfBan)>new Date()){
                        response.status(400).send({
                            accessToken: null,
                            error_message: "Ban until " + user.endOfBan
                        });
                    }else{
                        //todo: add config to jwt
                        var token = jwt.sign({ id: user.id, role:user.role }, config.secret, {
                            expiresIn: 86400 // 24 hours
                        });
                        response.cookie(
                            "token",
                            token,
                            {
                                maxAge: 86400,
                                signed: true,
                                httpOnly: true,
                                sameSite: 'strict'
                            }
                        )
                        response.status(200).send({
                            id: user.id,
                            username: user.username,
                            email: user.email,
                            role: user.role,
                            accessToken: token
                        });
                    }
                }


            }
        })
        .catch(err => {
            response.status(500).send({ error_message: JSON.stringify(err) });
        });
};


exports.logout = (req, response) => {
    response.clearCookie("token");
    response.send('logouted');
};