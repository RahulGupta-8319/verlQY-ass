const express = require('express')
const router = express.Router()

const userController = require('../controllers/userController')
const postController = require('../controllers/postController')
const mw = require('../middlewares/middleware')

router.get('/' , (req, res)=> {
    res.send('hurreee you server is working..!!')
})

// *************** USER  ********************* //

router.post('/users', userController.createUser)
router.get('/users', userController.getAllUsers)
router.put('/users/:userId', userController.updateUserProfile)
router.delete('/users/:userId', userController.deleteUser)

router.post('/login', userController.loginUser)


// ***************** POST **************** //

router.post('/posts',mw.authentication, postController.createPost )
router.get('/posts',mw.authentication, postController.getPosts )
router.put('/posts',mw.authentication, mw.authorisation, postController.updatePost )
router.delete('/posts',mw.authentication,mw.authorisation, postController.deletePost )



router.all('*', (req, res)=> {
    res.status(404).send("page not found")
})
module.exports = router