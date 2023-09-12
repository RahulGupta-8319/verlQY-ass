const jwt = require("jsonwebtoken")
const postModel = require("../models/postModel")
const mongoose = require("mongoose")

const redis_client = require("../redis_connect.js")

const { getAccessToken } = require("../controllers/userController")




const authentication = async (req, res, next) => {
    try {
        let token = req.headers["x-access-key"]
        if (!token) return res.status(400).send({ status: false, data: "token is not present for authentication" })
        let decodeToken = jwt.verify(token, "accesstoken")
        if (!decodeToken) return res.status(401).send({ status: false, data: "authentication failed" })
        req.decodeToken = decodeToken
        // console.log(decodeToken);
        next()
    } catch (error) {

        if (error.message == 'jwt expired') {

            let refreshToken = req.headers["x-refresh-key"]
            if (!refreshToken)
                return res.status(400).send({ status: false, data: "refreshToken is not present " })

            let decodeRefreshToken = jwt.verify(refreshToken, "refreshToken")

            if (!decodeRefreshToken)
                return res.status(401).send({ status: false, data: "unauthenticated refresh Token " })


            console.log("userId", decodeRefreshToken.userId);

            let getRefTokenInRedis = await redis_client.get(decodeRefreshToken.userId)
            if (getRefTokenInRedis == null)
                return res.status(401).send({ status: false, data: "userId doesn't exist with this refresh toke" })

            console.log("getRefTokenInRedis", getRefTokenInRedis);

            let upadteToken = await getAccessToken(decodeRefreshToken.userId)


            res.status(200).send({ status: true, message:"First set Your Token",data: upadteToken })
        } else {

            res.status(500).send({ status: false, data: error.message })
        }
    }
}

const authorisation = async (req, res, next) => {
    try {
        let postId = req.body.postId
        if (!mongoose.Types.ObjectId.isValid(postId)) return res.status(400).send({ status: false, data: "post id validation failed" })
        let post = await postModel.findById(postId).select({ createdBy: 1, _id: 0 })
        if (!post) return res.status(404).send({ status: false, data: "post is not found" })
        let Id1 = post.createdBy.toString()


        let Id = req.decodeToken.userId
        // console.log(Id1, Id);
        if (Id1 !== Id) return res.status(403).send({ status: false, data: "You are not authorised" })
        next()
    } catch (error) {
        res.status(500).send({ status: false, data: error.message })
    }

}

module.exports = { authentication, authorisation }