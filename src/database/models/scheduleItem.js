const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const scheduleItem = new Schema({
    time: Date,
    subject: {
        type: Schema.Types.ObjectId,
        ref: "Subject"
    }
});

scheduleItem
    .pre('find', function() {
        this.populate('subject');
    })
    .pre('findOne', function() {
        this.populate('subject');
    });

module.exports = mongoose.model("ScheduleItem", scheduleItem)