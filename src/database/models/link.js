const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const link = new Schema({
    name: String,
    url: String
});

module.exports = mongoose.model("Link", link)