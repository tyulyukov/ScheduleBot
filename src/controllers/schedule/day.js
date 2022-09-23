const { Scenes } = require("telegraf")
const logger = require("../../util/logger");
const Schedule = require("../../database/models/schedule")
const { backButton, backKeyboard} = require("../../util/keyboards");

const scheduleDay = new Scenes.BaseScene("scheduleDay")

scheduleDay.enter(async (ctx) => {
    if (!ctx.scene.state.scheduleItems) {
        await ctx.scene.enter('schedule')
    }

    const items = ctx.scene.state.scheduleItems

    logger.info(ctx.scene.state)

    await ctx.reply(JSON.stringify(items, null, 2), backKeyboard)
})

scheduleDay.leave(async (ctx) => {

});

scheduleDay.command('back', async (ctx) => await ctx.scene.enter('schedule'));
scheduleDay.hears(backButton, async (ctx) => await ctx.scene.enter('schedule'));

module.exports = scheduleDay;