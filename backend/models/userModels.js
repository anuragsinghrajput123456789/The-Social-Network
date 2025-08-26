
const mongoose = require("mongoose")

mongoose.connect("mongodb://localhost:27017/InstaClone")

const followerSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    date: {
       type: Date,
       default: Date.now
    }
})

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    followers: [followerSchema],
    password: {
        type: String,
        required: true
    }

})

module.exports = mongoose.model("User",userSchema)