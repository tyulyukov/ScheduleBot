const { Scenes } = require("telegraf")
const logger = require("../../util/logger");
const Schedule = require("../../database/models/schedule")
const { mainKeyboard, backKeyboard, backButton } = require("../../util/keyboards");

const schedule = new Scenes.BaseScene("schedule")

schedule.enter(async (ctx) => {
    const userId = String(ctx.from.id);

    let schedule = await Schedule.findOne({ user: userId })
    if (!schedule) {
        logger.info("New schedule has been created")

        schedule = new Schedule({
            user: userId,
            monday: [],
            tuesday: [],
            wednesday: [],
            thursday: [],
            friday: [],
            saturday: [],
            sunday: [],
        })

        await schedule.save()
    }

    await ctx.reply(JSON.stringify(schedule), backKeyboard);
})

schedule.leave(async (ctx) => {
    await ctx.reply("Главное меню", mainKeyboard);
});

schedule.command('back', async (ctx) => await ctx.scene.leave());
schedule.hears(backButton, async (ctx) => await ctx.scene.leave());

module.exports = schedule;