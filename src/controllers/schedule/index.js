const { Scenes } = require("telegraf")
const logger = require("../../util/logger");
const Schedule = require("../../database/models/schedule")
const { mainKeyboard, scheduleBackKeyboard, backButton, mondayButton, tuesdayButton, wednesdayButton, thursdayButton,
    fridayButton, saturdayButton, sundayButton, todayButton } = require("../../util/keyboards");
const { saveToSession, deleteFromSession } = require("../../util/session");

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

    saveToSession(ctx, "schedule", schedule)
    await ctx.replyWithHTML(`📅 <b>Ваше расписание</b> \n\n📌 для просмотра подробной информации выберите день недели`, scheduleBackKeyboard);
})

schedule.leave(async (ctx) => {
    if (ctx.session["isTransition"] !== true) {
        deleteFromSession(ctx, "schedule")
        await ctx.replyWithHTML("📋 <b>Главное меню</b>", mainKeyboard);
    }

    deleteFromSession(ctx, "isTransition")
});

schedule.command('back', async (ctx) => await ctx.scene.leave());
schedule.hears(backButton, async (ctx) => await ctx.scene.leave());
schedule.hears(mondayButton, async (ctx) => { await enterScheduleDayScene(ctx, ctx.session.schedule.monday) })
schedule.hears(tuesdayButton, async (ctx) => { await enterScheduleDayScene(ctx, ctx.session.schedule.tuesday) })
schedule.hears(wednesdayButton, async (ctx) => { await enterScheduleDayScene(ctx, ctx.session.schedule.wednesday) })
schedule.hears(thursdayButton, async (ctx) => { await enterScheduleDayScene(ctx, ctx.session.schedule.thursday) })
schedule.hears(fridayButton, async (ctx) => { await enterScheduleDayScene(ctx, ctx.session.schedule.friday) })
schedule.hears(saturdayButton, async (ctx) => { await enterScheduleDayScene(ctx, ctx.session.schedule.saturday) })
schedule.hears(sundayButton, async (ctx) => { await enterScheduleDayScene(ctx, ctx.session.schedule.sunday) })
schedule.hears(todayButton, async (ctx) => {
    // TODO locale with user`s timezone
    const dayOfWeek = new Date(ctx.message.date * 1000).toLocaleString("ua", { weekday: 'short' })
    await enterScheduleDayScene(ctx, getScheduleDay(ctx.session.schedule, dayOfWeek))
})

async function enterScheduleDayScene(ctx, items) {
    saveToSession(ctx, "isTransition", true)
    saveToSession(ctx, "scheduleItems", items)
    await ctx.scene.enter('scheduleDay')
}

async function getScheduleDay(schedule, dayOfWeek) {
    const days = {
        "пн": schedule.monday,
        "вт": schedule.tuesday,
        "ср": schedule.wednesday,
        "чт": schedule.thursday,
        "пт": schedule.friday,
        "ст": schedule.saturday,
        "нд": schedule.sunday,
    }

    return days[dayOfWeek]
}

module.exports = schedule;