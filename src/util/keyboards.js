const { Markup } = require('telegraf')

function getBackKeyboard() {
    const backKeyboardBack = "↩️Вернуться назад";
    const backKeyboard = Markup.keyboard([backKeyboardBack]).resize();

    return backKeyboard
};

function getMainKeyboard() {
    const mainKeyboardLessons = "📚️ Уроки";
    const mainKeyboardSchedule = "🗓️ Расписание";
    const mainKeyboard = Markup.keyboard([
            [mainKeyboardLessons],
            [mainKeyboardSchedule],
        ]
    ).resize();

    return mainKeyboard
};

module.exports = { getMainKeyboard, getBackKeyboard }