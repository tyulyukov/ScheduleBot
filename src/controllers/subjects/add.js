const { Scenes } = require("telegraf")
const logger = require("../../util/logger")
const Subject = require("../../database/models/subject")
const Link = require("../../database/models/link")
const { backButton, cancelKeyboard, cancelButton, saveCancelKeyboard, saveButton } = require("../../util/keyboards");
const { deleteFromSession } = require("../../util/session");

const maxLinksCount = 5

const addSubject = new Scenes.WizardScene("addSubject",
    async (ctx) => {
        const userId = String(ctx.from.id);

        ctx.wizard.state.subject = {}
        ctx.wizard.state.subject.links = []
        ctx.wizard.state.subject.user = userId
        ctx.wizard.state.link = {}
        await ctx.replyWithHTML(`<b>Введите имя урока</b> \n\n📌 если не хотите добавлять урок нажмите кнопку <b>${cancelButton}</b>`, cancelKeyboard)
        return ctx.wizard.next()
    },
    async (ctx) => {
        if (!ctx.message || !ctx.message.text || ctx.message.text.length >= 25) {
            await ctx.replyWithHTML('⚠️ <b>Введите настоящее имя урока</b> (<i>до 25 символов</i>)', cancelKeyboard);
            return;
        }

        const name = ctx.message.text
            .replaceAll("<", "")
            .replaceAll(">", "")

        if (name === '') {
            await ctx.replyWithHTML(`⚠️ <b>Введите настоящее имя урока без этих символов</b>`, cancelKeyboard);
            return;
        }

        let subject = await Subject.findOne({ user: String(ctx.from.id), name: name })

        if (subject) {
            await ctx.replyWithHTML('⚠️ <b>Это имя уже занято</b>', cancelKeyboard);
            return;
        }

        ctx.wizard.state.subject.name = name

        await ctx.replyWithHTML(`<b>Введите название сервиса</b> на который вы хотите добавить ссылку (<i>Zoom, Classroom, Эл. Книга и тд</i>) \n\n📌 если не хотите добавлять ссылку на сервис - нажмите кнопку <b>${saveButton}</b>`, saveCancelKeyboard)
        return ctx.wizard.next()
    },
    async (ctx) => {
        if (!ctx.message || !ctx.message.text || ctx.message.text.length >= 25) { // TODO validation on spec symbols
            await ctx.replyWithHTML('<b>⚠️ Введите настоящее название сервиса</b> (_до 25 символов_)', saveCancelKeyboard);
            return;
        }

        ctx.wizard.state.link.name = ctx.message.text

        await ctx.replyWithHTML(`<b>Вставьте ссылку на сервис</b> \n\n📌 если не хотите добавлять ссылку на сервис - нажмите кнопку <b>${saveButton}</b>`, saveCancelKeyboard)
        return ctx.wizard.next()
    },
    async (ctx) => {
        if (!ctx.message || !ctx.message.text) {
            await ctx.replyWithHTML(`⚠️ <b>Вставьте только ссылку</b>`, saveCancelKeyboard);
            return;
        }

        if (!isValidHttpUrl(ctx.message.text)) {
            await ctx.replyWithHTML(`⚠️ <b>Вставьте правильную ссылку</b>`, saveCancelKeyboard);
            return;
        }

        ctx.wizard.state.link.url = ctx.message.text
        let link = new Link(ctx.wizard.state.link)
        link = await link.save()
        ctx.wizard.state.subject.links.push(link._id)

        if (ctx.wizard.state.subject.links.length >= maxLinksCount) {
            return await saveSubject(ctx)
        }

        await ctx.replyWithHTML(`<b>Введите еще одно название сервиса</b> на который вы хотите добавить ссылку (<i>Zoom, Classroom, Эл. Книга и тд</i>) \n\n📌 если не хотите добавлять ссылку на сервис - нажмите кнопку <b>${saveButton}</b>`, saveCancelKeyboard)
        return ctx.wizard.selectStep(2)
    }
)

addSubject.command('back', async (ctx) => await ctx.scene.enter('subjects'));
addSubject.hears(cancelButton, async (ctx) => { await ctx.scene.enter('subjects') })
addSubject.hears(backButton, async (ctx) => await ctx.scene.enter('subjects'));
addSubject.hears(saveButton, saveSubject);

async function saveSubject(ctx) {
    if (ctx.wizard.state.subject && ctx.wizard.state.subject.name) {
        logger.info(`New subject ${ctx.wizard.state.subject.name} has been created`)

        const subject = new Subject(ctx.wizard.state.subject)
        await subject.save()
        await ctx.replyWithHTML("✅ Урок добавлен")
        deleteFromSession(ctx, "selectedSubject")
        return await ctx.scene.enter('subjects')
    }
}

function isValidHttpUrl(string) {
    return /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/gm.test(string)
}

module.exports = addSubject;