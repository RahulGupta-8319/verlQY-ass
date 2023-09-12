const postModel = require("../models/postModel")
const userModel = require("../models/userModel")
const mongoose = require("mongoose")

const checkObjectId = (id) => {

    let isValid = mongoose.Types.ObjectId.isValid(id)
    return isValid

}

const createPost = async (req, res) => {
    try {

        // console.log("inside create post", req.body);

        let data = req.body

        if (Object.keys(data).length == 0) return res.status(400).send({ status: false, data: "Please enter the details to create a post" })

        let { createdBy, message, sentBy, liked } = data

        //--------- mandatory field -------
        if (!createdBy) return res.status(400).send({ data: "createdBy is required" })
        if (!message) return res.status(400).send({ data: "message is required" })

        if (!checkObjectId(createdBy)) return res.status(400).send({ status: false, data: "incorrect Object ID" })

        let dt = new Date()
        data.createdAt = dt
        data.updatedAt = dt


        let tempComments = [{
            sentBy: sentBy,
            sentAt: dt,
            liked: [liked]
        }]

        data.comments = tempComments

        let postCreated = await postModel.create(data)
        res.status(200).send({ status: true, data: postCreated })

    } catch (error) {
        res.status(500).send({ status: false, data: error.message })
    }
}

const getPosts = async (req, res) => {
    try {

        let allposts = await postModel.find()
        if (allposts.length === 0)
            return res.status(404).send({ status: false, message: "No Post Avaiable" })

        return res.status(200).send({ status: true, data: allposts })

    } catch (error) {
        res.status(500).send({ status: false, data: error.message })
    }
}

const updatePost = async (req, res) => {
    try {

        let data = req.body

        let { createrId, postId, message } = data
        if (!createrId) return res.status(400).send({ status: false, data: " createrId required" })
        if (!postId) return res.status(400).send({ status: false, data: "postId required" })

        if (!checkObjectId(createrId)) return res.status(400).send({ status: false, data: "incorrect createrId ID" })
        if (!checkObjectId(postId)) return res.status(400).send({ status: false, data: "incorrect postId ID" })


        let findPostInDb = await postModel.findOne({ _id: postId })
        if (!findPostInDb) return res.status(400).send({ status: false, data: "Post not Found..!!" })

        // console.log("findPostInDb.createdBy", findPostInDb.createdBy.toString());
        // console.log("createrId", createrId);

        if (findPostInDb.createdBy.toString() !== createrId) return res.status(400).send({ status: false, data: "You can't update Other's Post" })

        let dt = new Date()

        // console.log(findPostInDb);

        let updatedPost = await postModel.findOneAndUpdate({ _id: postId }, { $set: { message: message, updatedAt: dt } }, { new: true })
        return res.status(200).send({ status: true, message: "Post Updated Successfully", data: updatedPost })


    } catch (error) {
        res.status(500).send({ status: false, data: error.message })
    }
}

const deletePost = async (req, res) => {

    try {
        // console.log('inside deleted post');
        let data = req.body

        let { createrId, postId } = data

        // console.log("postId",postId, typeof postId );

        if (!createrId) return res.status(400).send({ status: false, data: " createrId required" })
        if (!postId) return res.status(400).send({ status: false, data: "postId required" })

        if (!checkObjectId(createrId)) return res.status(400).send({ status: false, data: "incorrect createrId ID" })
        if (!checkObjectId(postId)) return res.status(400).send({ status: false, data: "incorrect postId ID" })


        let findPostInDb = await postModel.findOne({ _id: postId })
        if (!findPostInDb) return res.status(400).send({ status: false, data: "Post not Found..!!" })

        console.log(findPostInDb);

        if (findPostInDb.createdBy.toString() !== createrId) return res.status(400).send({ status: false, data: "You can't update Other's Post" })

        let deletedPost = await postModel.findOneAndDelete({ _id: postId }, { new: true })
        return res.status(200).send({ status: true, message: 'Post deleted successfully', data: deletedPost })

    } catch (error) {
        res.status(500).send({ status: false, data: error.message })
    }
}

module.exports = { createPost, getPosts, updatePost, deletePost }