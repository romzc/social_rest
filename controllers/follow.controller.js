const Follow = require('../models/follow.model');
const User = require('../models/user.model');
const mongoosePaginate = require('mongoose-pagination');
const followService = require('../services/follow.service')

const pruebaFollow = (req, res) => {
    return res.status(200).json({ message: "prueba"});
}
// save following action
const save = (req, res) => {
    // get user data from body
    const body = req.body;

    // get user id
    const identity = req.user;

    // create a new follow object
    const userToFollow = new Follow({
        user: identity.id,
        followed: body.followed
    });


    // save follow object
    userToFollow.save((error, followStored) => {
        if ( error || !followStored ) {
            return res.status(500).json({ 
                message: "Error al guardar el follow" 
            });
        }

        return res.status(200).json({ 
            Follow: followStored 
        });
    });
}

const unfollow = (req, res) => {
    // get user id
    const userId = req.user.id;

    // get user id that user follows and remove it from follow list.
    const followId = req.params.id;

    // find a document with those ids and remove them.
    Follow.find({
        user: userId, 
        followed: followId
    }).remove((error, followRemove) => {
          
        if ( error ||!followRemove ) {
            return res.status(500).json({ 
                message: "Unfollow action failed" 
            });
        }

        return res.status(200).json({
            status: "success", 
            message: "Unfollow action successful"
        });
    })
}

// list all users who I follow.
const following = (req, res) => {
    // get user id
    let userId = req.user.id;
    // check if user id exists in url parameters
    if ( req.params.id ) userId = req.params.id;

    let page = 1;
    // check if number page is in url parameters
    if ( req.params.page ) page = req.params.page;
    // number of users who I want to return

    const itemsPerPage = 5;
    // find follow, papulate user data and paginate result.
    Follow.find({user: userId})
        .populate("user followed", "-password -role -__v -email")
        .paginate(page, itemsPerPage, async (error, follows, total) => {
            
            // get an array of user who follow other person and also follow me.
            const followUserIds = await followService.followUserIds(req.user.id);

            return res.status(200).json({
                status: "success", 
                message: "Following action, users who I follow",
                follows,
                total,
                pages: Math.ceil(total / itemsPerPage),
                user_followging: followUserIds.following,
                user_follow_me: followUserIds.followers
            })
        })
}


// list all users who follow me
const followers = (req, res) => {
    // get user id
    let userId = req.user.id;
    // check if user id exists in url parameters
    if ( req.params.id ) userId = req.params.id;

    let page = 1;
    // check if number page is in url parameters
    if ( req.params.page ) page = req.params.page;
    // number of users who I want to return

    const itemsPerPage = 5;
    // find follow, papulate user data and paginate result.
    Follow.find({followed: userId})
    .populate("user", "-password -role -__v -email")
    .paginate(page, itemsPerPage, async (error, follows, total) => {
        
        // get an array of user who follow other person and also follow me.
        const followUserIds = await followService.followUserIds(req.user.id);

        return res.status(200).json({
            status: "success", 
            message: "Following action, users who follow me",
            follows,
            total,
            pages: Math.ceil(total / itemsPerPage),
            user_followging: followUserIds.following,
            user_follow_me: followUserIds.followers
        })
    })
}

module.exports = {
    pruebaFollow,
    save,
    unfollow,
    following,
    followers
}

