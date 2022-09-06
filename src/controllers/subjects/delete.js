const { Scenes } = require("telegraf")
const logger = require("../../util/logger")
const Subject = require("../../database/models/subject")
const { cancelButton, acceptButton, acceptCancelKeyboard } = require("../../util/keyboards");
const { deleteFromSession } = require("../../util/session");

const deleteSubject = new Scenes.BaseScene("deleteSubject")

deleteSubject.enter(async (ctx) => {
    if (!ctx.session.selectedSubject) {
        return await ctx.scene.enter('subjects')
    }

    await ctx.replyWithMarkdownV2(`⚠️ Вы действительно хотите удалить урок ${ctx.session.selectedSubject.name}? \n\n 📌 При удалении урок автоматически удалится в расписании`, acceptCancelKeyboard)
})

deleteSubject.leave(async (ctx) => {

})

deleteSubject.command('back', async (ctx) => await ctx.scene.enter('subjects'));
deleteSubject.hears(cancelButton, async (ctx) => { await ctx.scene.enter('subjects') })
deleteSubject.hears(acceptButton, async (ctx) => {
    await Subject.deleteOne({ _id: ctx.session.selectedSubject._id })
    deleteFromSession(ctx, "selectedSubject")
    await ctx.reply("✅ Урок удален")
    await ctx.scene.enter('subjects')
})

module.exports = deleteSubject;