const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const user = new Schema({
    _id: String,
    username: String,
    fullName: String,
    createdAt: {
        type: Date,
        default: Date.now,
    },
    lastActivityAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model("User", user)