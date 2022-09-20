const express = require("express")
require('dotenv').config()

const mongoose = require("mongoose")
const logger = require("./util/logger")

const app = express();

const PORT = process.env.PORT || 3000;
const URL = 'https://light-schedule.herokuapp.com';

mongoose.connect(process.env.DB_CONNECTION_STRING, { useNewUrlParser: true, useUnifiedTopology: true })

mongoose.connection.on("error", function (err) {
    logger.error(err)
    process.exit(1)
})

mongoose.connection.once("open", async function () {
    const { Telegraf, Scenes, Telegram } = require('telegraf')
    const { session } = require('telegraf-session-mongoose')

    const start = require("../src/controllers/start/index")

    const subjects = require("../src/controllers/subjects/index")
    const addSubject = require("../src/controllers/subjects/add")
    const deleteSubject = require("../src/controllers/subjects/delete")
    const editSubject = require("../src/controllers/subjects/edit")
    const editSubjectName = require("../src/controllers/subjects/editName")

    const schedule = require("../src/controllers/schedule/index")
    const scheduleDay = require("../src/controllers/schedule/day")

    const { mainKeyboard, subjectsButton, scheduleButton } = require("./util/keyboards")

    const bot = new Telegraf(process.env.BOT_TOKEN)

    const stage = new Scenes.Stage([
        start,
        subjects,
        schedule,
        addSubject,
        deleteSubject,
        editSubject,
        editSubjectName,
        scheduleDay
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

    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));

    await bot.launch({
        webhook: {
            domain: URL,
            port: PORT,
        }
    })

    const webhookStatus = await Telegram.getWebhookInfo();
    logger.info(webhookStatus);
})

/*function startDevMode(bot) {
    logger.info('Starting a bot in development mode');

    (`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/deleteWebhook`).then(() =>
        bot.startPolling()
    );
}

async function startProdMode(bot) {


    // If webhook not working, check UFW that probably blocks a port...
    logger.debug('Starting a bot in production mode');

    app.use(await bot.createWebhook({ domain: webhookDomain }));
    await bot.telegram.setWebhook(`https://light-schedule.herokuapp.com:${process.env.WEBHOOK_PORT}/${process.env.TELEGRAM_TOKEN}`);

    await bot.startWebhook(`/${process.env.TELEGRAM_TOKEN}`, tlsOptions, +process.env.WEBHOOK_PORT);

    const webhookStatus = await Telegram.getWebhookInfo();
    console.log('Webhook status', webhookStatus);
}*/
