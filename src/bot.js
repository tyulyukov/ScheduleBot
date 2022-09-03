require('dotenv').config()

const mongoose = require("mongoose")
const logger = require("./util/logger")


mongoose.connect(process.env.DB_CONNECTION_STRING, { useNewUrlParser: true, useUnifiedTopology: true })

mongoose.connection.on("error", function (err) {
    logger.error(err)
    process.exit(1)
})

mongoose.connection.once("open", async function () {
    const { Telegraf, Scenes, session } = require('telegraf')

    const start = require("../src/controllers/start/index")
    const { getMainKeyboard } = require("./util/keyboards");

    const bot = new Telegraf(process.env.BOT_TOKEN)
    logger.info("Bot was started")

    const stage = new Scenes.Stage([
        start,
    ]);

    bot.use(session());
    bot.use(stage.middleware());

    bot.command('back', async (ctx) => await ctx.reply("Возврат назад", getMainKeyboard()));
    bot.start(async (ctx) => {
        await ctx.scene.enter('start')
    });

    bot.catch(err => logger.error(err))

    await bot.launch();

    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
})

