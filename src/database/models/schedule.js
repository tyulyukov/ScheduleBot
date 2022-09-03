const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// IDK how to optimize this
const schedule = new Schema({
    user: {
        type: String,
        ref: "User"
    },

    monday: [{
        type: Schema.Types.ObjectId,
        ref: "ScheduleItem"
    }],
    tuesday: [{
        type: Schema.Types.ObjectId,
        ref: "ScheduleItem"
    }],
    wednesday: [{
        type: Schema.Types.ObjectId,
        ref: "ScheduleItem"
    }],
    thursday: [{
        type: Schema.Types.ObjectId,
        ref: "ScheduleItem"
    }],
    friday: [{
        type: Schema.Types.ObjectId,
        ref: "ScheduleItem"
    }],
    saturday: [{
        type: Schema.Types.ObjectId,
        ref: "ScheduleItem"
    }],
    sunday: [{
        type: Schema.Types.ObjectId,
        ref: "ScheduleItem"
    }],
});

module.exports = mongoose.model("Schedule", schedule)