const Follow = require('../models/follow.model')

const followUserIds = async ( identityUserId ) => {

    try {
        // sacar info seguimiento
        let following = await Follow.find({user: identityUserId})
            .select({followed:1, _id: 0})
            .exec();
                                    
        let followers = await Follow.find({followed: identityUserId})
            .select({user:1, _id: 0})
            .exec();

        // procesor array de identificadores

        const followingClean = [];

        following.forEach(follow => {
            followingClean.push(follow.followed)
        })

        const followersClean = [];

        followers.forEach(follow => {
            followersClean.push(follow.user)
        })

        return {
            following: followingClean,
            followers: followersClean
        }
    } catch (err) {
        return {}
    }
};

const followThisUser = async ( identityUserId, profileUserId ) => {
    // sacar info seguimiento, yo somo usuario lo sigo a el
    let following = await Follow.findOne({user: identityUserId, followed: profileUserId})
             
    // si yo como usuario y el me sigue a mi
    let follower = await Follow.findOne({user: profileUserId, followed: identityUserId})


    return {
        following,
        follower
    }
}

module.exports = { followUserIds, followThisUser };