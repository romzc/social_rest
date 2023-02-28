const User = require('../models/user.model');
const bcrypt = require('bcrypt');


const pruebaUser = (req, res) => {
    return res.status(200).json({ message: "prueba" });
}


// Register user method
const register = (req, res) => {
    // get data from request
    const params = req.body;

    // check if the data is valid
    if (!params.name || !params.email || !params.password || !params.nickname) {
        return res.status(400).json({ message: "missing data" });
    }

    // check if user is already registered
    User.find({
        $or: [
            { email: params.email.toLowerCase() },
            { nickname: params.nickname.toLowerCase() }
        ]
    }).exec(async (error, users) => {
        if (error) {
            return res.status(500).json({ message: "error creating new user", status: error });
        }
        if (users && users.length >= 1) {
            return res.status(200).send({ status: "succes", message: "user already exist" });
        }

        // encrypt user password
        const passwordEncripted = await bcrypt.hash(params.password, 10);
        params.password = passwordEncripted;

        // create new user
        let newUser = new User(params);

        // save user to database
        newUser.save((error, userStored) => {
            if (error || !userStored) return res.status(500).json({ states: "error", message: "error at saving user" })

            // return new user and a response object
            return res.status(200).json({
                userStored,
                status: "succes",
                message: "user created"
            });
        });
    });
}

const login = (req, res) => {
    // get data from request body
    const data = req.body;

    if (!data.email || !data.password) {
        return res.status(400).json({ status: "error", message: "missing data" });
    }

    // find user in database
    User.findOne({ email: data.email })
        //.select({"password" : 0})
        .exec((error, user) => {
            if (error || !user) return res.status(404).json({ states: "error", message: "user doesn't exist" });
        
            // check if his password is correct
            const pwd = bcrypt.compareSync(data.password, user.password)
            if(!pwd) return res.status(400).json({ states: "error", message:"password error"})

            // return a token
            const token = false;            
        
            // return a response with data.
            return res.status(200).json({
                status: "success", 
                message: "login", 
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    nickname: user.nickname
                },
                token
            });
    });
};

module.exports = {
    pruebaUser,
    register,
    login
}

