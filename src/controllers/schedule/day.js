const { Scenes, Markup } = require("telegraf")
const { backButton, backKeyboard, addButton, deleteBackKeyboard, addBackKeyboard, addDeleteBackKeyboard, mainKeyboard} = require("../../util/keyboards");
const { formatTime } = require("../../util/format");
const { deleteFromSession, saveToSession } = require("../../util/session");
const ScheduleItem = require("../../database/models/scheduleItem");
const { getLocalizedDayName, getDatabaseDayName} = require("../../util/daysOfWeek");

const maxScheduleItemsLength = 50
const scheduleItemsPerPage = 5

const scheduleDay = new Scenes.BaseScene("scheduleDay")

const prevPageButton = 'schedulePrevPage'
const nextPageButton = 'scheduleNextPage'
const pageButton = 'schedulePage'

function getItemsManageKeyboard(ctx, items) {
    if (ctx.session.selectedItem) {
        if (items.length >= maxScheduleItemsLength)
            return deleteBackKeyboard
        else if (items.length === 0)
            return addBackKeyboard
    }
    else {
        if (items.length >= maxScheduleItemsLength)
            return backKeyboard
        else if (items.length === 0)
            return addBackKeyboard
    }

    if (!items || items.length === 0)
        return addBackKeyboard
    else if (items.length >= maxScheduleItemsLength && ctx.session.selectedItem)
        return deleteBackKeyboard
    else if (ctx.session.selectedItem)
        return addDeleteBackKeyboard
    else
        return addBackKeyboard
}

async function getInlineItemsKeyboard(items, page) {
    if (!page)
        page = 0;

    const paginatedItems = items.slice(page * scheduleItemsPerPage, page * scheduleItemsPerPage + scheduleItemsPerPage);

    const buttons = []
    for (const id of paginatedItems) {
        let scheduleItem = await ScheduleItem.findById(id.toString())
        let button = `${formatTime(scheduleItem.time)} - ${scheduleItem.subject.name}`

        buttons.push([Markup.button.callback(button, scheduleItem._id)])
    }

    buttons.push([
        Markup.button.callback(`⬅️`, prevPageButton),
        Markup.button.callback(`стр ${page + 1}/${Math.ceil(items.length / scheduleItemsPerPage)}`, pageButton),
        Markup.button.callback(`➡️`, nextPageButton),
    ])

    return Markup.inlineKeyboard(buttons)
}

scheduleDay.enter(async (ctx) => {
    if (!ctx.session.dayCode) {
        await ctx.scene.enter('schedule')
    }

    // TODO sort by date
    const items = ctx.session.schedule[getDatabaseDayName(ctx.session.dayCode)]
    items.sort((a, b) => new Date(b.time) - new Date(a.time));
    saveToSession(ctx, "scheduleItems", items)
    const keyboard = getItemsManageKeyboard(ctx, items)
    const dayName = getLocalizedDayName(ctx.session.dayCode)

    if (items && items.length > 0) {
        const inlineSubjectsKeyboard = await getInlineItemsKeyboard(items, 0)

        await ctx.replyWithHTML(`<b>${dayName}</b> (${items.length} из ${maxScheduleItemsLength})`, keyboard);
        await ctx.replyWithHTML(`📌 Нажмите на урок из расписания для просмотра подробной информации, удаления и редактирования\n\n`, inlineSubjectsKeyboard)
    }
    else {
        await ctx.replyWithHTML(`У вас 0 уроков на <b>${dayName}</b>, добавьте новый с помощью кнопки <b>${addButton}</b>`, keyboard);
    }
})

scheduleDay.leave(async (ctx) => {
    if (ctx.session["isTransition"] !== true) {
        deleteFromSession(ctx, "dayCode")
        deleteFromSession(ctx, "scheduleItems")
    }

    deleteFromSession(ctx, "isTransition")
});

scheduleDay.command('back', async (ctx) => await ctx.scene.enter('schedule'));
scheduleDay.hears(backButton, async (ctx) => await ctx.scene.enter('schedule'));
scheduleDay.hears(addButton, async (ctx) => {
    if (ctx.session.scheduleItems && ctx.session.scheduleItems.length >= maxScheduleItemsLength) {
        const keyboard = getItemsManageKeyboard(ctx, ctx.session.scheduleItems)
        await ctx.replyWithHTML(`🚫 <b>Нельзя</b> добавить уроков больше чем ${maxScheduleItemsLength}`, keyboard)
        return
    }

    saveToSession(ctx, "isTransition", true)
    await ctx.scene.enter('addScheduleItem')
})
scheduleDay.on('callback_query', async (ctx) => {
    if (!ctx.session.schedulePage)
        saveToSession(ctx, "schedulePage", 0)

    if (ctx.callbackQuery.data === prevPageButton) {
        if (ctx.session.schedulePage > 0) {
            saveToSession(ctx, "schedulePage", ctx.session.schedulePage - 1)
            await ctx.editMessageReplyMarkup(getInlineItemsKeyboard(ctx.session.scheduleItems, ctx.session.schedulePage).reply_markup)
        }

        return await ctx.answerCbQuery()
    }
    else if (ctx.callbackQuery.data === nextPageButton) {
        if (ctx.session.schedulePage + 1 < Math.ceil(ctx.session.scheduleItems.length / scheduleItemsPerPage)) {
            saveToSession(ctx, "schedulePage", ctx.session.schedulePage + 1)
            await ctx.editMessageReplyMarkup(getInlineItemsKeyboard(ctx.session.scheduleItems, ctx.session.schedulePage).reply_markup)
        }

        return await ctx.answerCbQuery()
    }
    else if (ctx.callbackQuery.data === pageButton) {
        return await ctx.answerCbQuery()
    }

    /*const subjectId = String(ctx.callbackQuery.data)

    if (ctx.session.selectedSubject && ctx.session.selectedSubject._id.toString() === subjectId)
        return await ctx.answerCbQuery()

    const subject = await Subject.findOne({ _id: subjectId })

    let subjectRepresentation = `📓 Выбранный урок: <b>${subject.name}</b>\n\n`
    for (const link of subject.links) {
        subjectRepresentation += `${link.name}: ${link.url}\n`
    }

    saveToSession(ctx, "selectedScheduleItem", subject)

    await ctx.editMessageText(subjectRepresentation, {
        reply_markup: getInlineItemsKeyboard(ctx.session.subjects, ctx.session.subjectsPage).reply_markup,
        parse_mode: "html"
    })
    await ctx.replyWithHTML(`✅ Выбран урок <b>${subject.name}</b>`, getSubjectsManageKeyboard(ctx, ctx.session.subjects))*/
    await ctx.answerCbQuery()
})

module.exports = scheduleDay;