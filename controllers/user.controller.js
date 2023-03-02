const User = require('../models/user.model');
const Follow = require('../models/follow.model');
const Publication = require('../models/publication.model');
const {validate} = require('../helpers/validate');

// this moudle let us to paginate every result of the search.
const mongoosePagination = require('mongoose-pagination');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

// import jwt service
const jwtService = require('../services/jwt.service');
const followService = require('../services/follow.service');

const pruebaUser = (req, res) => {
    return res.status(200).json({ message: "prueba", usuario: req.user });
}


// Register user method
const register = (req, res) => {
    // get data from request
    const params = req.body;

    // check if the data is valid
    if (!params.name || !params.email || !params.password || !params.nickname) {
        return res.status(400).json({ message: "missing data" });
    }

    // validacion avanzada
    try {
        validate(params);
    } catch (err) {
        return res.status(400).send({ status: "succes", message: "validacion no superada" });
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
            if ( error || !userStored ) return res.status(500).json({ states: "error", message: "error at saving user" })

            let userToSend =  userStored.toObject();
            delete userToSend.password;
            // return new user and a response object
            return res.status(200).json({
                userToSend,
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

            // generate a token
            const token = jwtService.generateToken(user);            
        
            // return a response with data.
            return res.status(200).json({
                status: "success", 
                message: "login", 
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    nickname: user.nickname
                },
                token
            });
    });
};

const userProfile = (req, res) => {
    // Get user id from request parameters
    const userId = req.params.id

    // request for user in database
    User.findById(userId)
        .select({password: 0, role: 0})
        .exec( async (err, userProfile) => {
            if( err || !userProfile ) {
                return res.status(404).send({ stat: "error", message: "user not found" });
            }

            // info de seguimiento
            const followInfo = await followService.followThisUser(req.user.id, userId)

            // return a responser with user profile
            // later we will show user follower
            return res.status(200).json({ 
                status: "success", 
                userProfile: userProfile,
                following: followInfo.following,
                follower: followInfo.follower
            });
    })
};

// retoruna un liasta de usuarios
const listUsers = (req, res) => {
    // get an specific page to list users.
    let page = 1;
    if (req.params.page) {
        page = req.params.page;
    }
    page = parseInt(page);
    
    // get a list of users with mongoose pagination
    const itemsPerPage = 5;
    
    User.find().select("-password -email -role -__v").sort('_id').paginate( page, itemsPerPage, async (err, users, total) => {
        if (err || !users ) {
            return res.status(404).json({
                status: "error", 
                message: "Not allowed users" 
            });
        }

        // get an array of user who follow other person and also follow me.
        const followUserIds = await followService.followUserIds(req.user.id);

        // return laterly informtion about user's followers.
        return res.status(200).send({
            stat: "success",
            users,
            page,
            total,
            itemsPerPage,
            pages: Math.ceil(total / itemsPerPage),
            user_following: followUserIds.following,
            user_follow_me: followUserIds.followers
        });
    })
}

const userUpdate = (req, res) => {
    // get user info to update
    const userIdentity = req.user;
    const userToUpdate = req.body;

    // check if user exists
    delete userToUpdate.iat;
    delete userToUpdate.exp;
    delete userToUpdate.role;
    delete userToUpdate.image;


    // search for user and update him
    User.find({
        $or: [
            { email: userToUpdate.email.toLowerCase() },
            { nickname: userToUpdate.nickname.toLowerCase() }
        ]
    }).exec(async (error, users) => {
        if (error) {
            return res.status(500).json({ message: "error creating new user", status: error });
        }

        let userIsSet = false;

        users.forEach(user => {
            if(user && user._id != userIdentity.id) userIsSet = true;
        });

        if ( userIsSet ) {
            return res.status(200).send({ status: "succes", message: "user data is already used" });
        }

        // if we find user passwrod encryp it.
        if (userToUpdate.password) {
            // encrypt user password
            const passwordEncripted = await bcrypt.hash(userToUpdate.password, 10);
            userToUpdate.password = passwordEncripted;

        } else {
            delete userToUpdate.password;
        }

        User.findByIdAndUpdate({_id: userIdentity.id}, userToUpdate, {new: true}, (error, userUpdate)=>{
            if (error || !userUpdate) 
                return res.status(500).send({
                    status: "succes", 
                    message: "error while updating user" 
                });
            
            return res.status(200).json({
                status: "success",
                message: "User updated", 
                user: userUpdate
            })
        })
    });
}

const upload = (req, res) => {
    // get image file and check if it exists
    if( !req.file ) {
        return res.status(404).send({
            status: "error",
            message: "request doesn't include image file"
        })
    }

    // get image filename 
    const image = req.file.originalname;

    // get file extension and check if it exists in allowed extensions,
    const imageSplit = image.split("\.");
    let extension = imageSplit[1];

    // if it is not in allowed extensions, delete file
    if( extension != "jpg" && extension != "png" && extension != "jpeg" && extension != "gif" ) {
        const filePath = req.file.path;
        const fileDeleted = fs.unlinkSync(filePath);
        return res.status(400).send({
            status: "error",
            message: "Image extension not allowed"
        })
    }
    // otherwise update user profile image
    User.findOneAndUpdate({_id: req.user.id}, {image: req.file.filename}, {new: true},(error, userUpdated) => {
        if( error || !userUpdated ) {
            return res.status(500).send({
                status: "error",
                message: "error while updating user"
            });
        }
        
        // finally return an object with user information
        return res.status(200).send({
            status: "success",
            user: userUpdated,
            file: req.file,
        }) 
    })
}

const avatar = (req, res) => {
    // get parameter from url
    const file = req.params.file;

    // mount image real path
    const filePath = `./uploads/avatars/${file}`;

    // check if image exists
    fs.stat(filePath, (error, exist) => {
        
        if(error || !exist) {
            return res.status(404).send({
                status: "error",
                message: "image not found"
            });
        }
        // return file
        return res.status(200).sendFile(path.resolve(filePath));
    })
}

const counters = async (req, res) => {
    let userId = req.user.id;

    if ( req.params.id ) userId = req.params.id

    try {
        const following = await Follow.count({user: userId})
        const followers = await Follow.count({followed: userId})
        const publications = await Publication.count({user: userId})

        return res.status(200).json({
            userId: userId,
            following: following,
            followers: followers,
            publications: publications
        })

    } catch (e) {
        return res.status(500).send({
            status: "error",
            message: "error while getting data"
        })
    }
}


module.exports = {
    pruebaUser,
    register,
    login,
    userProfile,
    listUsers,
    userUpdate,
    upload,
    avatar,
    counters
}

