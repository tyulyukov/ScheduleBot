const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const subject = new Schema({
    name: String,
    links: [{
        type: Schema.Types.ObjectId,
        ref: 'Link'
    }],
    user: {
        type: String,
        ref: 'User'
    }
});

subject
    .pre('find', function() {
        this.populate('links');
    })
    .pre('findOne', function() {
        this.populate('links');
    });

module.exports = mongoose.model("Subject", subject)