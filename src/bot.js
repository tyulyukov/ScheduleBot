require('dotenv').config()

const mongoose = require("mongoose")
const logger = require("./util/logger")

mongoose.connect(process.env.DB_CONNECTION_STRING, { useNewUrlParser: true, useUnifiedTopology: true })

mongoose.connection.on("error", function (err) {
    logger.error(err);
    process.exit(1);
})

mongoose.connection.once("open", function () {
    const { Telegraf } = require('telegraf');

    const bot = new Telegraf(process.env.BOT_TOKEN);
    bot.start((ctx) => ctx.reply('Welcome'));
    bot.help((ctx) => ctx.reply('Send me a sticker'));
    bot.on('sticker', (ctx) => ctx.reply('👍'));
    bot.hears('hi', (ctx) => ctx.reply('Hey there'));
    bot.command('schedule', (ctx) => {
        ctx.reply(`Hello ${ctx.update.message.from.first_name}`)
        console.log(ctx.message.from)
    })

    bot.launch();

    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
})

