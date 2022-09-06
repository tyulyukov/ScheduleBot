const { Scenes } = require("telegraf")
const User = require("../../database/models/user")
const logger = require("../../util/logger");
const { mainKeyboard } = require("../../util/keyboards");

const start = new Scenes.BaseScene("start")

start.enter(async (ctx) => {
    const userId = String(ctx.from.id);
    const user = await User.findById(userId);

    // TODO add multiple languages support
    if (!user) {
        logger.info('New user has been created');

        let fullName = ctx.from.first_name
        if (ctx.from.last_name)
            fullName += ' ' + ctx.from.last_name

        const newUser = new User({
            _id: userId,
            username: ctx.from.username,
            fullName: fullName,
        });

        await newUser.save()
    }

    await ctx.scene.leave()
})

start.leave(async (ctx) => {
    await ctx.reply("Добро пожаловать в бот, который поможет вам в организации времени, и будет напоминать вам о предстоящих уроках!", mainKeyboard)
});

start.command('back', async (ctx) => {
    await ctx.scene.leave()
});

module.exports = start;