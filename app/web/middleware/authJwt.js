//middleware for autenthification
//verify token
//check role

//sets req.userId

const jwt = require("jsonwebtoken");
const config = require("../../config/auth.config")
const queries = require('../../models/basic_seq_queries');


verifyToken = (req, res, next) => {
  let token = req.headers["x-access-token"];
    if (!token){
        if (req.signedCookies.token)
            token = req.signedCookies.token;
        else {
            if (req.cookies.token)
                token = req.cookies.token;
        }
    }
    //generate guest's token if doesn't exist 
  if (!token) {
        let user = {
            id:-1,
            role:0,
        }
        token = jwt.sign({ id: user.id, role:user.role }, config.secret, {
                        expiresIn: 86400 // 24 hours
                    });
        res.cookie(
            "token",
            token,
            {
                maxAge: 86400,
                signed: true,
                httpOnly: true,
                sameSite: 'strict'
            }
        )
                    // response.status(200).send({
                    //     username: 'guest!!!!',
                    //     role: user.role,
                    //     accessToken: token
                    // });
    
        req.userId = user.id;
        req.role = user.role;
        next();
  }else {
    jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
            return res.status(401).send({
                message: "Invalid token"
            });
        }
        req.userId = decoded.id;
        req.role = decoded.role;
        next();
    });
  }

};

getMiddlewareToCheckUserRole = (role) => {
    return (req, res, next) => {
        if(req.role!=undefined){
             if (req.role<role){
                    res.status(403).send({
                    message: `Require ${role} role`
                    });
                    return;
                }else{
                    next();
                    return;
                }
        }else {
            queries.selectOne("User",req.userId)
                .then(result=>{
                    if (result.error || result.role<role){
                        res.status(403).send({
                        message: `Require ${role} role`
                        });
                        return;
                    }else{
                        next();
                        return;
                    }
                })
            }
        }
}
const authJwt = {
  verifyToken: verifyToken,
  getMiddlewareToCheckUserRole: getMiddlewareToCheckUserRole
};
module.exports = authJwt;