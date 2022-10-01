const { Scenes } = require("telegraf")
const { backButton, cancelKeyboard, cancelButton, saveCancelKeyboard, saveButton } = require("../../util/keyboards");
const { isValidSubjectName } = require("../../util/validator");

const addScheduleItem = new Scenes.WizardScene("addScheduleItem",
    async (ctx) => {
        const userId = String(ctx.from.id);

        ctx.wizard.state.scheduleItem = {}

        await ctx.replyWithHTML(`<b>Выберите урок</b>`, cancelKeyboard)
        await ctx.replyWithHTML(`📌 если не хотите добавлять урок в расписание нажмите кнопку <b>${cancelButton}</b>`, )
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

        let subject = await Subject.findOne({ user: String(ctx.from.id), name: name })

        if (subject) {
            await ctx.replyWithHTML('⚠️ <b>Это имя уже занято</b>', cancelKeyboard);
            return;
        }

        ctx.wizard.state.subject.name = name

        await ctx.replyWithHTML(`<b>Введите название сервиса</b> на который вы хотите добавить ссылку (<i>Zoom, Classroom, Эл. Книга и тд</i>) \n\n📌 если не хотите добавлять ссылку на сервис - нажмите кнопку <b>${saveButton}</b>`, saveCancelKeyboard)
        return ctx.wizard.next()
    },
)

addScheduleItem.command('back', async (ctx) => await ctx.scene.enter('scheduleDay'));
addScheduleItem.hears(cancelButton, async (ctx) => { await ctx.scene.enter('scheduleDay') })
addScheduleItem.hears(backButton, async (ctx) => await ctx.scene.enter('scheduleDay'));

module.exports = addScheduleItem;