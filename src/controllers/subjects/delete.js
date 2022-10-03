const { Scenes } = require("telegraf")
const Subject = require("../../database/models/subject")
const Schedule = require("../../database/models/schedule")
const ScheduleItem = require("../../database/models/scheduleItem")
const { cancelButton, acceptButton, acceptCancelKeyboard } = require("../../util/keyboards");
const { deleteFromSession } = require("../../util/session");

const deleteSubject = new Scenes.BaseScene("deleteSubject")

deleteSubject.enter(async (ctx) => {
    if (!ctx.session.selectedSubject) {
        return await ctx.scene.enter('subjects')
    }

    await ctx.replyWithHTML(`⚠️ Вы действительно хотите удалить урок <b>${ctx.session.selectedSubject.name}</b>? \n\n 📌 При удалении урок автоматически удалится в расписании`, acceptCancelKeyboard)
})

deleteSubject.leave(async (ctx) => {
    if (ctx.session.selectedSubject)
        deleteFromSession(ctx, "selectedSubject")
})

deleteSubject.command('back', async (ctx) => await ctx.scene.enter('subjects'));
deleteSubject.hears(cancelButton, async (ctx) => { await ctx.scene.enter('subjects') })
deleteSubject.hears(acceptButton, async (ctx) => {
    const userId = String(ctx.from.id);
    const subjectId = ctx.session.selectedSubject._id
    const scheduleItemsToDelete = await ScheduleItem.find({ subject: subjectId })

    await Schedule.updateOne({ user: userId }, {
        $pullAll: {
            monday: scheduleItemsToDelete,
            tuesday: scheduleItemsToDelete,
            wednesday: scheduleItemsToDelete,
            thursday: scheduleItemsToDelete,
            friday: scheduleItemsToDelete,
            saturday: scheduleItemsToDelete,
            sunday: scheduleItemsToDelete,
        },
    });

    await ScheduleItem.deleteMany({ subject: subjectId })
    await Subject.deleteOne({ _id: subjectId })

    await ctx.reply("✅ Урок удален")
    await ctx.scene.enter('subjects')
})

module.exports = deleteSubject;