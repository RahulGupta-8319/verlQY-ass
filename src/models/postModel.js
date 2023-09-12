// users - {name, email (unique), mobile, password(hashed) }

const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId

const postSchema = new mongoose.Schema({

    createdBy: {
        type: ObjectId,
        refs: "Users",
        required: true
    },
    createdAt: {
        type: Date,
        required: true
    },
    updatedAt: {
        type: Date,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    comments: [{
        sentBy: ObjectId,
        sentAt: Date,
        liked: [ObjectId]
    }]

}, { timestamps: true })



module.exports = mongoose.model('Post', postSchema)
