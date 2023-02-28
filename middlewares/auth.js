// import modules
const jwt = require('jwt-simple');
const moment = require('moment');
const jwtService = require('../services/jwt.service');
// import secret_key    
const secretKey = jwtService.secretKey;


// create authentication function
const auth = (req, res, next) => {
    // check if auth is in headers
    if ( !req.headers.authorization ) {
        return res.status(403).send({ error: "error", message: "Request doesn't have authentication header"});
    }
    // decode token
    const token = req.headers.authorization.replace(/['"]+/g,'')
    try {
        const payload = jwt.decode(token, secretKey);
        
        // check lifetime of token
        if( payload.exp <= moment().unix()) {
            return res.status(401).send({ 
                status: "error", 
                message: "Token expired" 
            });
        }

        // add user's data to request
        req.user = payload;
        
    } catch (err) {
        return res.status(404).send({ status: "error", message: "Invalid token" });
    }
  

    // call next function if everything is successful
    next();
};

module.exports = { auth };