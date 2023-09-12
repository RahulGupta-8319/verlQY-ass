// users - {name, email (unique), mobile, password(hashed) }

const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({

    name:{
        type:String,
        requierd:true
    },
    email:{
        type:String,
        requierd:true
    }, 
    mobile:{
        type:Number,
        requierd:true
    },
    password:{
        type:String,
        requierd:true
    }

}, {timestamps:true})

module.exports = mongoose.model('User', userSchema)
