const { Scenes, Markup } = require("telegraf")
const Subject = require("../../database/models/subject")
const { mainKeyboard, addDeleteBackKeyboard, addBackKeyboard, deleteBackKeyboard, backButton, addButton, deleteButton, backKeyboard } = require("../../util/keyboards");
const { saveToSession, deleteFromSession } = require("../../util/session");
const { formatTextByNumber } = require("../../util/format")
const logger = require("../../util/logger")

const maxSubjectsLength = 50
const subjectPerPage = 5

const subjects = new Scenes.BaseScene("subjects")

const prevPageButton = 'prevPage'
const nextPageButton = 'nextPage'
const pageButton = 'page'

function getSubjectsManageKeyboard(ctx, subjects) {
    if (ctx.session.selectedSubject) {
        if (subjects.length >= maxSubjectsLength)
            return deleteBackKeyboard
        else if (subjects.length === 0)
            return addBackKeyboard
    }
    else {
        if (subjects.length >= maxSubjectsLength)
            return backKeyboard
        else if (subjects.length === 0)
            return addBackKeyboard
    }

    if (!subjects || subjects.length === 0)
        return addBackKeyboard
    else if (subjects.length >= maxSubjectsLength && ctx.session.selectedSubject)
        return deleteBackKeyboard
    else if (ctx.session.selectedSubject)
        return addDeleteBackKeyboard
    else
        return addBackKeyboard
}

function getInlineSubjectsKeyboard(subjects, page) {
    if (!page)
        page = 0;

    const paginatedSubjects = subjects.slice(page * subjectPerPage, page * subjectPerPage + subjectPerPage);

    const buttons = []
    for (const subject of paginatedSubjects) {
        let button = `${subject.name}`

        if (subject.links.length !== 0)
            button += ` (${subject.links.length} ${formatTextByNumber(subject.links.length, ['ссылка', 'ссылки', 'ссылок'])})`

        buttons.push([Markup.button.callback(button, subject._id)])
    }

    buttons.push([
        Markup.button.callback(`⬅️`, prevPageButton),
        Markup.button.callback(`стр ${page + 1}/${Math.ceil(subjects.length / subjectPerPage)}`, pageButton),
        Markup.button.callback(`➡️`, nextPageButton),
    ])

    return Markup.inlineKeyboard(buttons)
}

subjects.enter(async (ctx) => {
    const userId = String(ctx.from.id);

    const subjects = await Subject.find({ user: userId })
    saveToSession(ctx, "subjects", subjects)

    const keyboard = getSubjectsManageKeyboard(ctx, subjects)

    if (subjects && subjects.length > 0) {
        const inlineSubjectsKeyboard = getInlineSubjectsKeyboard(subjects, 0)

        await ctx.replyWithHTML(`<b>Уроки (${subjects.length} из ${maxSubjectsLength})</b>`, keyboard);
        await ctx.replyWithHTML(`📌 Нажмите на урок для просмотра подробной информации, удаления и редактирования\n\n`, inlineSubjectsKeyboard)
    }
    else {
        await ctx.replyWithHTML(`У вас 0 уроков, добавьте новый с помощью кнопки <b>${addButton}</b>`, keyboard);
    }
})

subjects.leave(async (ctx) => {
    if (ctx.session["isTransition"] !== true) {
        deleteFromSession(ctx, "subjects")
        deleteFromSession(ctx, "selectedSubject")

        await ctx.replyWithHTML("📋 <b>Главное меню</b>", mainKeyboard);
    }

    deleteFromSession(ctx, "subjectsPage")
    deleteFromSession(ctx, "isTransition")
});

subjects.command('back', async (ctx) => await ctx.scene.leave());
subjects.hears(backButton, async (ctx) => await ctx.scene.leave());
subjects.hears(addButton, async (ctx) => {
    if (ctx.session.subjects && ctx.session.subjects.length >= maxSubjectsLength) {
        const keyboard = getSubjectsManageKeyboard(ctx, ctx.session.subjects)
        await ctx.replyWithHTML(`🚫 <b>Нельзя</b> добавить уроков больше чем ${maxSubjectsLength}`, keyboard)
        return
    }

    saveToSession(ctx, "isTransition", true)
    await ctx.scene.enter('addSubject')
})
subjects.hears(deleteButton, async (ctx) => {
    if (!ctx.session["selectedSubject"]) {
        const keyboard = getSubjectsManageKeyboard(ctx, ctx.session.subjects)
        await ctx.replyWithHTML(`🚫 <b>Выберите</b> урок для удаления`, keyboard)
        return
    }

    saveToSession(ctx, "isTransition", true)
    await ctx.scene.enter('deleteSubject')
})
subjects.on('callback_query', async (ctx) => {
    if (!ctx.session.subjectsPage)
        saveToSession(ctx, "subjectsPage", 0)

    if (ctx.callbackQuery.data === prevPageButton) {
        if (ctx.session.subjectsPage > 0) {
            saveToSession(ctx, "subjectsPage", ctx.session.subjectsPage - 1)
            await ctx.editMessageReplyMarkup(getInlineSubjectsKeyboard(ctx.session.subjects, ctx.session.subjectsPage).reply_markup)
        }

        return await ctx.answerCbQuery()
    }
    else if (ctx.callbackQuery.data === nextPageButton) {
        if (ctx.session.subjectsPage + 1 < Math.ceil(ctx.session.subjects.length / subjectPerPage)) {
            saveToSession(ctx, "subjectsPage", ctx.session.subjectsPage + 1)
            await ctx.editMessageReplyMarkup(getInlineSubjectsKeyboard(ctx.session.subjects, ctx.session.subjectsPage).reply_markup)
        }

        return await ctx.answerCbQuery()
    }
    else if (ctx.callbackQuery.data === pageButton) {
        return await ctx.answerCbQuery()
    }

    const subjectId = String(ctx.callbackQuery.data)

    if (ctx.session.selectedSubject && ctx.session.selectedSubject._id.toString() === subjectId)
        return await ctx.answerCbQuery()

    const subject = await Subject.findOne({ _id: subjectId })

    let subjectRepresentation = `📓 Выбранный урок: <b>${subject.name}</b>\n\n`
    for (const link of subject.links) {
        subjectRepresentation += `${link.name}: ${link.url}\n`
    }

    saveToSession(ctx, "selectedSubject", subject)

    await ctx.editMessageText(subjectRepresentation, {
        reply_markup: getInlineSubjectsKeyboard(ctx.session.subjects, ctx.session.subjectsPage).reply_markup,
        parse_mode: "html"
    })
    await ctx.replyWithHTML(`✅ Выбран урок <b>${subject.name}</b>`, getSubjectsManageKeyboard(ctx, ctx.session.subjects))
    await ctx.answerCbQuery()
})

module.exports = subjects;