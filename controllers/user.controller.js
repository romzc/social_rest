const User = require('../models/user.model');
const bcrypt = require('bcrypt');


const pruebaUser = (req, res) => {
    return res.status(200).json({ message: "prueba"});
}


// Register user method
const register = (req, res) => {
    // get data from request
    const params = req.body;

    // check if the data is valid
    if ( !params.name || !params.email || !params.password || !params.nickname ) {
        return res.status(400).json({ message: "missing data" });
    }
    
    // check if user is already registered
    User.find({$or: [
        {email: params.email.toLowerCase()},
        {nickname: params.nickname.toLowerCase()}
    ]}).exec( async (error, users) => {
        if( error ) {
            return res.status(500).json({ message: "error creating new user", status: error});
        } 
        if ( users && users.length >= 1 ) {
            return res.status(200).send({ status: "succes", message: "user already exist"});
        }
        
        // encrypt user password
        const passwordEncripted = await bcrypt.hash(params.password, 10);
        params.password = passwordEncripted;
        
        // create new user
        let newUser = new User(params);

        // save user to database
        newUser.save((error, userStored) => {
            if( error  || !userStored ) return res.status(500).json({states:"error",message:"error at saving user"})
            
            // return new user and a response object
            return res.status(200).json({
                userStored,
                status: "succes",
                message: "user created"
            });
        });        
    });
}

module.exports = {
    pruebaUser,
    register
}

