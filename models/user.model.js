const mongoose = require('mongoose');

const UserModel = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    surname: {
        type: String,
    },
    nickname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'role_user'
    },
    image: {
        type: String
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    password: {
        type: String,
        required: true
    }
});


// we can select a specific collection in database with third parameter.
// module.exports = mongoose.model('User', UserModel, 'users');

module.exports = mongoose.model('User', UserModel);