//adding all necessary routes for signin, signup, check token and roles

//contains handlers for signupand signin
const authController = require('../controllers/auth/auth')

const testAuthController = require('../controllers/test/testAuth')
var authJwt = require('../middleware/authJwt');


module.exports = function(app) {
    app.use(function(req, res, next) {
      res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
      );
      next();
    });
  
    app.post(
      "/api/auth/signup",
      authController.signup
    );
  
    app.post("/api/auth/signin", authController.signin);


    
    app.get("/api/test/all", testAuthController.allAccess);

    app.get(
      "/api/test/user",
      [authJwt.verifyToken, authJwt.getMiddlewareToCheckUserRole(1)],
      testAuthController.userBoard
    );

    app.get(
      "/api/test/mod",
      [authJwt.verifyToken, authJwt.getMiddlewareToCheckUserRole(2)],
      testAuthController.moderatorBoard
    );

    app.get(
      "/api/test/admin",
      [authJwt.verifyToken, authJwt.getMiddlewareToCheckUserRole(3)],
      testAuthController.adminBoard
    );
};
