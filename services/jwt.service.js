// import dependencies from modules
const jwt = require('jwt-simple');
const moment = require('moment');

// secret key
const secretKey = "SECRET_KEY_RED_SOCIAL_KEY_2999_3000_4000";

// implement a function that generate tokens
const generateToken = (user) => {
    const payload = {
        id: user._id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        role: user.role,
        image: user.image,
        iat: moment().unix(),
        exp: moment().add(30, 'days').unix()
    }
    
    // return jwt token
    return jwt.encode(payload, secretKey);
}

module.exports = { secretKey, generateToken };