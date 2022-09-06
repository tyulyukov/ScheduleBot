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
        await ctx.replyWithMarkdownV2(`*Введите имя урока* \n\n📌 если не хотите добавлять урок нажмите кнопку *${cancelButton}*`, cancelKeyboard)
        return ctx.wizard.next()
    },
    async (ctx) => {
        if (!ctx.message || !ctx.message.text || ctx.message.text.length >= 25) {
            await ctx.replyWithMarkdownV2('*Введите настоящее имя урока* \\(_до 25 символов_\\)', cancelKeyboard);
            return;
        }

        ctx.wizard.state.subject.name = ctx.message.text
        await ctx.replyWithMarkdownV2(`*Введите название сервиса* на который вы хотите добавить ссылку \\(_Zoom, Classroom, Эл\\. Книга и тд_\\) \n\n📌 если не хотите добавлять ссылку на сервис \\- нажмите кнопку *${saveButton}*`, saveCancelKeyboard)
        return ctx.wizard.next()
    },
    async (ctx) => {
        if (!ctx.message || !ctx.message.text || ctx.message.text.length >= 25) { // TODO validation on spec symbols
            await ctx.reply('*Введите настоящее название сервиса* \\(_до 25 символов_\\)', saveCancelKeyboard);
            return;
        }

        ctx.wizard.state.link.name = ctx.message.text
        await ctx.replyWithMarkdownV2(`*Вставьте ссылку на сервис* \n\n📌 если не хотите добавлять ссылку на сервис \\- нажмите кнопку *${saveButton}*`, saveCancelKeyboard)
        return ctx.wizard.next()
    },
    async (ctx) => {
        if (!ctx.message || !ctx.message.text || !ctx.message.text.startsWith('http://') && !ctx.message.text.startsWith('https://')) {
            await ctx.replyWithMarkdownV2(`*Вставьте только ссылку* \\(начинается на http:// или https://\\)`, saveCancelKeyboard);
            return;
        }

        ctx.wizard.state.link.url = ctx.message.text
        let link = new Link(ctx.wizard.state.link)
        link = await link.save()
        ctx.wizard.state.subject.links.push(link._id)

        if (ctx.wizard.state.subject.links.length >= maxLinksCount) {
            return await saveSubject(ctx)
        }

        await ctx.replyWithMarkdownV2(`*Введите еще одно название сервиса* на который вы хотите добавить ссылку \\(_Zoom, Classroom, Эл\\. Книга и тд_\\) \n\n📌 если не хотите добавлять ссылку на сервис \\- нажмите кнопку *${saveButton}*`, saveCancelKeyboard)
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
        await ctx.reply("✅ Урок добавлен")
        deleteFromSession(ctx, "selectedSubject")
        return await ctx.scene.enter('subjects')
    }
}

module.exports = addSubject;