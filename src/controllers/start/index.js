const { Scenes } = require("telegraf")
const User = require("../../database/models/user")
const logger = require("../../util/logger");
const { getMainKeyboard } = require("../../util/keyboards");

const start = new Scenes.BaseScene("start")

start.enter(async (ctx) => {
    const userId = String(ctx.from.id);
    const user = await User.findById(userId);

    // add multiple languages support
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

        await newUser.save();
    }

    await Scenes.Stage.leave()
})

start.leave(async (ctx) => {
    await ctx.reply("Добро пожаловать в бот, который поможет вам в организации времени, и будет напоминать вам о предстоящих уроках!", getMainKeyboard());
});

start.command('back', async () => await Scenes.Stage.leave());

module.exports = start;