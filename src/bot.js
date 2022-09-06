require('dotenv').config()

const mongoose = require("mongoose")
const logger = require("./util/logger")

mongoose.connect(process.env.DB_CONNECTION_STRING, { useNewUrlParser: true, useUnifiedTopology: true })

mongoose.connection.on("error", function (err) {
    logger.error(err)
    process.exit(1)
})

mongoose.connection.once("open", async function () {
    const { Telegraf, Scenes } = require('telegraf')
    const { session } = require('telegraf-session-mongoose')

    const start = require("../src/controllers/start/index")

    const subjects = require("../src/controllers/subjects/index")
    const addSubject = require("../src/controllers/subjects/add")
    const deleteSubject = require("../src/controllers/subjects/delete")

    const schedule = require("../src/controllers/schedule/index")

    const { mainKeyboard, subjectsButton, scheduleButton } = require("./util/keyboards")

    const bot = new Telegraf(process.env.BOT_TOKEN)
    logger.info("Bot was started")

    const stage = new Scenes.Stage([
        start,
        subjects,
        schedule,
        addSubject,
        deleteSubject
    ]);

    bot.use(session({ collectionName: 'sessions' }));
    bot.use(stage.middleware());

    bot.command('back', async (ctx) => await ctx.reply("Главное меню", mainKeyboard));

    bot.start(async (ctx) => {
        await ctx.scene.enter('start')
    });

    bot.hears(subjectsButton, async (ctx) => {
        await ctx.scene.enter('subjects')
    })

    bot.hears(scheduleButton, async (ctx) => {
        await ctx.scene.enter('schedule')
    })

    bot.catch(err => {
        logger.error(err.message)
        console.error(err)
    })

    await bot.launch();

    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
})
