const {Schema, model} = require('mongoose')

const PublicationModel = Schema({
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    }, 
    text: {
        type: String,
        required: true
    },
    file: {
        type: String
    },
    create_at: {
        type: Date,
        default: Date.now
    }
})

module.exports = model("Publication", PublicationModel, "publications")