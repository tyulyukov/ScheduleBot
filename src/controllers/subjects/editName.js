const { Scenes } = require("telegraf")
const Subject = require("../../database/models/subject")
const { cancelKeyboard, cancelButton } = require("../../util/keyboards");
const { isValidSubjectName } = require("../../util/validator");

const editSubjectName = new Scenes.WizardScene("editSubjectName",
    async (ctx) => {
        if (!ctx.session.selectedSubject) {
            return await ctx.scene.enter('editSubject')
        }

        await ctx.replyWithHTML(`<b>Введите новое имя урока</b> \n\n📌 если не хотите менять имя нажмите кнопку <b>${cancelButton}</b>`, cancelKeyboard)
        return ctx.wizard.next()
    },
    async (ctx) => {
        if (!ctx.message || !ctx.message.text || !isValidSubjectName(ctx.message.text)) {
            await ctx.replyWithHTML('⚠️ <b>Введите настоящее имя урока</b> (<i>до 25 символов</i>)', cancelKeyboard);
            return;
        }

        const name = ctx.message.text
            .replaceAll("<", "")
            .replaceAll(">", "")

        if (name === ctx.session.selectedSubject.name) {
            await ctx.replyWithHTML('⚠️ <b>Имя должно отличаться от прошлого</b>', cancelKeyboard);
            return;
        }

        let subject = await Subject.findOne({ user: String(ctx.from.id), name: name })

        if (subject) {
            await ctx.replyWithHTML('⚠️ <b>Это имя уже занято</b>', cancelKeyboard);
            return;
        }

        ctx.session.selectedSubject.name = name
        await Subject.findOneAndUpdate({ _id: ctx.session.selectedSubject._id }, { name: name })

        await ctx.replyWithHTML("✅ Имя урока изменено")
        return await ctx.scene.enter('editSubject')
    },
)

editSubjectName.command('back', async (ctx) => await ctx.scene.enter('editSubject'));
editSubjectName.hears(cancelButton, async (ctx) => { await ctx.scene.enter('editSubject') });

module.exports = editSubjectName;