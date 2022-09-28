const { Scenes, Markup } = require("telegraf")
const logger = require("../../util/logger");
const Schedule = require("../../database/models/schedule")
const { backButton, backKeyboard, addButton, deleteBackKeyboard, addBackKeyboard, addDeleteBackKeyboard} = require("../../util/keyboards");
const {formatTextByNumber} = require("../../util/format");

const maxScheduleItemsLength = 50

const scheduleDay = new Scenes.BaseScene("scheduleDay")

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