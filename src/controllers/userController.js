const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const userModel = require('../models/userModel')

// const redis_client = require("../redis_connect.js")


const nameRegex = /^[a-z A-Z]+$/
const mobileRegex = /^[0-9]{10}$/
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d).{8,15}$/

const checkObjectId = (id) => {

    let isValid = mongoose.Types.ObjectId.isValid(id)
    return isValid

}

const generateRefreshToken = async (user_id) => {

    let issuingTime = Math.floor(Date.now() / 1000)
    let expirationTime = issuingTime + 60 * 60 * 24 * 30    // 1month valid

    let payload = {
        userId: user_id,
        iat: issuingTime,
        exp: expirationTime
    }

    const refresh_token = jwt.sign(payload, "refreshToken")

    // let setRefreshToekn = await redis_client.set(user_id.toString(), JSON.stringify(refresh_token))

    return refresh_token;
}


const getAccessToken = async (user_id) => {

    const access_token = generateAccessToken(user_id);
    const refresh_token = await generateRefreshToken(user_id);
    return { access_token, refresh_token }

}

function generateAccessToken(user_id) {

    let issuingTime = Math.floor(Date.now() / 1000)
    let expirationTime = issuingTime + 60*60*24

    let payload = {
        userId: user_id,
        iat: issuingTime,
        exp: expirationTime
    }

    let access_token = jwt.sign(payload, 'accesstoken')

    return access_token

}

const passEncryption = async (pass) => {

    const salt = await bcrypt.genSalt(10)
    let encryptedPassword = await bcrypt.hash(pass, salt)

    return encryptedPassword
}



const createUser = async (req, res) => {
    try {

        let body = req.body

        // validation
        if (Object.keys(body).length == 0) return res.status(400).send({ status: false, message: "please provide data in request body " });

        let { name, mobile, email, password } = body

        if (!name) return res.status(400).send({ status: false, message: "Name is Required" })
        if (!nameRegex.test(name)) return res.status(400).send({ status: false, message: "Name can contain only small & capital latter EG:'verlq tech'" })

        if (!mobile) return res.status(400).send({ status: false, message: "Mobile NUmber is mandatory" })
        if (!mobileRegex.test(mobile)) return res.status(400).send({ status: false, message: "ENVALID NUMBER: mobile number should contain only number with 10 digits" })

        if (!email) return res.status(400).send({ status: false, message: "Email is Required" })
        if (!emailRegex.test(email)) return res.status(400).send({ status: false, message: "ENVALID EMAIL eg:verlq123@gmail.com" })

        if (!password) return res.status(400).send({ status: false, message: "write password" })
        if (!passwordRegex.test(password)) return res.status(400).send({ status: false, message: "write srong password contain atleast 1 latter & 1 digit  characters between 8-15 " })

        // ******** unique email ***** //
        let isPresentEmail = await userModel.findOne({ email })
        if (isPresentEmail) return res.status(400).send({ status: false, message: "this email is already register" })

        // ******password encryption****//

        let pass = await passEncryption(password)
        body.password = pass

        const createdUser = await userModel.create(body);
        return res.status(201).send({ status: true, message: "User created successfully", data: createdUser });

    } catch (error) {
        res.status(500).send({ status: false, error: error.message })
    }
}

const getAllUsers = async (req, res) => {

    try {

        let allUsers = await userModel.find()

        if (allUsers.length === 0) return res.status(404).send({ status: false, message: "No User Found" })

        return res.status(200).send({ status: true, message: "All users details", data: allUsers });

    } catch (error) {
        res.status(500).send({ status: false, error: error.message })
    }

}

const loginUser = async (req, res) => {
    try {
        let body = req.body

        let { email, password } = body

        if (Object.keys(body).length == 0) return res.status(400).send({ status: false, message: "please provide email and password" })

        //search in databse
        let findUserInDb = await userModel.findOne({ email })
        if (!findUserInDb) return res.status(404).send({ status: false, message: "No user exist with this Email." });

        //password check
        let validPassword = await bcrypt.compare(password, findUserInDb.password)
        if (!validPassword) return res.status(404).send({ status: false, message: "password is incorrect" });

        // console.log(payload);

        let access_token = generateAccessToken(findUserInDb._id)
        let refresh_token = await generateRefreshToken(findUserInDb._id)

        res.header('x-access-key', access_token)
        res.header('x-refresh-key', refresh_token)

        return res.status(201).send({ status: true, message: 'Success', data: { userId: `${findUserInDb._id}`, data: { access_token, refresh_token } } });

    } catch (error) {
        res.status(500).send({ status: false, error: error.message })
    }

}

const deleteUser = async (req, res) => {
    try {
        let userId = req.params.userId

        // console.log("userId ",userId, typeof userId);

        if (!checkObjectId(userId))
            return res.status(404).send({ status: false, message: "Invalid User ID" });

        let deletedUser = await userModel.findOneAndDelete({ _id: userId }, { new: true })

        if (!deletedUser)
            return res.status(404).send({ status: false, message: "No User Found..!!" });

        return res.status(200).send({ status: true, message: 'User deleted successfully', data: deletedUser })

    } catch (error) {
        res.status(500).send({ status: false, error: error.message })
    }

}

const updateUserProfile = async (req, res) => {
    try {

        let body = req.body
        let userId = req.params.userId

        if (!checkObjectId(userId))
            return res.status(400).send({ status: false, message: "Invalid User ID" });

        if (Object.keys(body).length == 0)
            return res.status(400).send({ status: false, message: "Write what you want to update." });

        let { name, mobile, email, password } = body

        if (name) {
            if (!nameRegex.test(name)) return res.status(400).send({ status: false, message: "Name can contain only small & capital latter EG:'verlq tech'" })
        }

        if (mobile) {
            if (!mobileRegex.test(mobile)) return res.status(400).send({ status: false, message: "ENVALID NUMBER: mobile number should contain only number with 10 digits" })
        }

        if (email) {

            if (!emailRegex.test(email)) return res.status(400).send({ status: false, message: "ENVALID EMAIL eg:verlq123@gmail.com" })

            // ******** unique email ***** //
            let isPresentEmail = await userModel.findOne({ email })
            if (isPresentEmail) return res.status(400).send({ status: false, message: "this email is already register" })

        }

        if (password) {
            if (!passwordRegex.test(password)) return res.status(400).send({ status: false, message: "write strong password contain atleast 1 latter & 1 digit  characters between 8-15 " })

            // ******password encryption****//
            let pass = await passEncryption(password)
            password = pass
        }

        let update = await userModel.findByIdAndUpdate({ _id: userId }, { $set: { name: name, mobile: mobile, email: email, password: password } }, { new: true })
        if (!update) return res.status(404).send({ status: true, message: "User doesn't exist",  })

        return res.status(200).send({ status: true, message: "User profile updated", data: update })

    } catch (error) {
        res.status(500).send({ status: false, error: error.message })
    }
}




module.exports = { createUser, getAllUsers, loginUser, deleteUser, updateUserProfile, getAccessToken }