const { Scenes, Markup } = require("telegraf")
const { backButton, backKeyboard, addButton, deleteBackKeyboard, addBackKeyboard, addDeleteBackKeyboard, mainKeyboard} = require("../../util/keyboards");
const { formatTime } = require("../../util/format");
const {deleteFromSession, saveToSession} = require("../../util/session");

const maxScheduleItemsLength = 50
const scheduleItemsPerPage = 5

const scheduleDay = new Scenes.BaseScene("scheduleDay")

const prevPageButton = 'prevPage'
const nextPageButton = 'nextPage'
const pageButton = 'page'

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

function getInlineItemsKeyboard(items, page) {
    if (!page)
        page = 0;

    const paginatedItems = items.slice(page * scheduleItemsPerPage, page * scheduleItemsPerPage + scheduleItemsPerPage);

    const buttons = []
    for (const item of paginatedItems) {
        let button = `${formatTime(item.time)} - ${item.name}`

        buttons.push([Markup.button.callback(button, item._id)])
    }

    buttons.push([
        Markup.button.callback(`⬅️`, prevPageButton),
        Markup.button.callback(`стр ${page + 1}/${Math.ceil(items.length / scheduleItemsPerPage)}`, pageButton),
        Markup.button.callback(`➡️`, nextPageButton),
    ])

    return Markup.inlineKeyboard(buttons)
}

scheduleDay.enter(async (ctx) => {
    if (!ctx.session.scheduleItems) {
        await ctx.scene.enter('schedule')
    }

    const items = ctx.session.scheduleItems
    const keyboard = getItemsManageKeyboard(ctx, items)

    if (items && items.length > 0) {
        const inlineSubjectsKeyboard = getInlineItemsKeyboard(items, 0)

        await ctx.replyWithHTML(`<b>Расписание (${items.length} из ${maxScheduleItemsLength})</b>`, keyboard);
        await ctx.replyWithHTML(`📌 Нажмите на урок из расписания для просмотра подробной информации, удаления и редактирования\n\n`, inlineSubjectsKeyboard)
    }
    else {
        await ctx.replyWithHTML(`У вас 0 уроков на этот день, добавьте новый с помощью кнопки <b>${addButton}</b>`, keyboard);
    }
})

scheduleDay.leave(async (ctx) => {
    if (ctx.session["isTransition"] !== true) {
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

module.exports = scheduleDay;