//middleware for autenthification
//verify token
//check role

const jwt = require("jsonwebtoken");
const config = require("../../config/auth.config")
const queries = require('../../models/basic_seq_queries');

verifyToken = (req, res, next) => {
  let token = req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send({
      message: "No token provided!"
    });
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: "Unauthorized!"
      });
    }
    req.userId = decoded.id;
    next();
  });
};

getMiddlewareToCheckUserRole = (role) => {
    return (req, res, next) => {
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
const authJwt = {
  verifyToken: verifyToken,
  getMiddlewareToCheckUserRole: getMiddlewareToCheckUserRole
};
module.exports = authJwt;