const { Scenes } = require("telegraf")
const { cancelButton, editCancelKeyboard, editNameButton, editLinksButton } = require("../../util/keyboards");
const { deleteFromSession, saveToSession} = require("../../util/session");

const editSubject = new Scenes.BaseScene("editSubject")

editSubject.enter(async (ctx) => {
    if (!ctx.session.selectedSubject) {
        return await ctx.scene.enter('subjects')
    }

    await ctx.replyWithHTML(`✏️ Меню редактирования урока <b>${ctx.session.selectedSubject.name}</b> \n\n 📌 если не хотите редактировать урок нажмите кнопку <b>${cancelButton}</b>`, editCancelKeyboard)
})

editSubject.leave(async (ctx) => {
    if (ctx.session["isEditTransition"] !== true) {
        if (ctx.session.selectedSubject)
            deleteFromSession(ctx, "selectedSubject")
    }

    deleteFromSession(ctx, "isEditTransition")
})

editSubject.command('back', async (ctx) => await ctx.scene.enter('subjects'))
editSubject.hears(cancelButton, async (ctx) => { await ctx.scene.enter('subjects') })
editSubject.hears(editNameButton, async (ctx) => {
    saveToSession(ctx, "isEditTransition", true)
    await ctx.scene.enter('editSubjectName')
})
editSubject.hears(editLinksButton, async (ctx) => {
    /*saveToSession(ctx, "isEditTransition", true)
    await ctx.scene.enter('editSubjectLinks')*/
    await ctx.replyWithHTML(`⛔ Редактирование ссылок в разработке`, editCancelKeyboard)
})

module.exports = editSubject;