const express = require('express')
const mongoose = require('mongoose')

const route = require('./routes/route')

const app = express()
const PORT = 3000

app.use(express.json())
app.use(express.urlencoded())


app.use('/', route)

// ================ redis connection======== 


mongoose.connect('mongodb+srv://newuser:newuser@cluster0.ghayzlv.mongodb.net/verlqy', {
    useNewUrlParser: true
})
    .then(() => console.log('mongoDB is connected'))
    .catch((e) => console.log('mongoDB connection error', e))

app.listen(PORT, () => {
    console.log(`express in running in port ${PORT}`);
})    