const { Scenes, Markup } = require("telegraf")
const logger = require("../../util/logger");
const Schedule = require("../../database/models/schedule")
const { backButton, backKeyboard, addButton, deleteBackKeyboard, addBackKeyboard, addDeleteBackKeyboard} = require("../../util/keyboards");
const {formatTextByNumber} = require("../../util/format");

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
}

function getInlineItemsKeyboard(items, page) {
    if (!page)
        page = 0;

    const paginatedItems = items.slice(page * scheduleItemsPerPage, page * scheduleItemsPerPage + scheduleItemsPerPage);

    const buttons = []
    for (const item of paginatedItems) {
        let button = `${item.name}`

        buttons.push([Markup.button.callback(button, item._id)])
    }

    buttons.push([
        Markup.button.callback(`⬅️`, prevPageButton),
        Markup.button.callback(`стр ${page + 1}/${Math.ceil(items.length / subjectPerPage)}`, pageButton),
        Markup.button.callback(`➡️`, nextPageButton),
    ])

    return Markup.inlineKeyboard(buttons)
}

scheduleDay.enter(async (ctx) => {
    if (!ctx.scene.state.scheduleItems) {
        await ctx.scene.enter('schedule')
    }

    const items = ctx.scene.state.scheduleItems
    const keyboard = getSubjectsManageKeyboard(ctx, items)

    if (items && items.length > 0) {
        const inlineSubjectsKeyboard = getInlineSubjectsKeyboard(items, 0)

        await ctx.replyWithHTML(`<b>Расписание (${items.length} из ${maxScheduleItemsLength})</b>`, keyboard);
        await ctx.replyWithHTML(`📌 Нажмите на урок из расписания для просмотра подробной информации, удаления и редактирования\n\n`, inlineSubjectsKeyboard)
    }
    else {
        await ctx.replyWithHTML(`У вас 0 уроков на этот день, добавьте новый с помощью кнопки <b>${addButton}</b>`, keyboard);
    }
})

scheduleDay.leave(async (ctx) => {

});

scheduleDay.command('back', async (ctx) => await ctx.scene.enter('schedule'));
scheduleDay.hears(backButton, async (ctx) => await ctx.scene.enter('schedule'));

module.exports = scheduleDay;