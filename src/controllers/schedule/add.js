const { Scenes, Markup} = require("telegraf")
const { backButton, cancelKeyboard, cancelButton } = require("../../util/keyboards");
const ScheduleItem = require("../../database/models/scheduleItem");
const Subject = require("../../database/models/subject");
const Schedule = require("../../database/models/schedule");
const { isValidTime } = require("../../util/validator");
const logger = require("../../util/logger")
const { convertTextToDateTime } = require("../../util/format");
const {getDatabaseDayName} = require("../../util/daysOfWeek");
const {saveToSession} = require("../../util/session");

const prevPageButton = 'scheduleSubjectsPrevPage'
const nextPageButton = 'scheduleSubjectsNextPage'
const pageButton = 'scheduleSubjectsPage'

const scheduleSubjectsPerPage = 5

function getInlineScheduleSubjectsKeyboard(scheduleSubjects, page) {
    if (!page)
        page = 0;

    const paginatedScheduleSubjects = scheduleSubjects.slice(page * scheduleSubjectsPerPage, page * scheduleSubjectsPerPage + scheduleSubjectsPerPage);

    const buttons = []
    for (const scheduleSubject of paginatedScheduleSubjects) {
        let button = `${scheduleSubject.name}`

        buttons.push([Markup.button.callback(button, scheduleSubject._id)])
    }

    buttons.push([
        Markup.button.callback(`⬅️`, prevPageButton),
        Markup.button.callback(`стр ${page + 1}/${Math.ceil(scheduleSubjects.length / scheduleSubjectsPerPage)}`, pageButton),
        Markup.button.callback(`➡️`, nextPageButton),
    ])

    return Markup.inlineKeyboard(buttons)
}

const addScheduleItem = new Scenes.WizardScene("addScheduleItem",
    async (ctx) => {
        const userId = String(ctx.from.id);

        ctx.wizard.state.scheduleItem = {}

        const subjects = await Subject.find({ user: userId })
        ctx.wizard.state.subjects = subjects

        const inlineSubjectsKeyboard = getInlineScheduleSubjectsKeyboard(subjects, 0)

        await ctx.replyWithHTML(`<b>Выберите урок</b>`, cancelKeyboard)
        await ctx.replyWithHTML(`📌 если не хотите добавлять урок в расписание нажмите кнопку <b>${cancelButton}</b>`, inlineSubjectsKeyboard)
        return ctx.wizard.next()
    },
    async (ctx) => {
        if (!ctx.callbackQuery || !ctx.callbackQuery.data) {
            await ctx.replyWithHTML('⚠️ <b>Выберите урок из списка</b>', cancelKeyboard);
            return;
        }

        if (!ctx.wizard.state.scheduleSubjectsPage)
            ctx.wizard.state.scheduleSubjectsPage = 0

        if (ctx.callbackQuery.data === prevPageButton) {
            if (ctx.wizard.state.scheduleSubjectsPage > 0) {
                ctx.wizard.state.scheduleSubjectsPage = ctx.wizard.state.scheduleSubjectsPage - 1
                await ctx.editMessageReplyMarkup(getInlineScheduleSubjectsKeyboard(ctx.wizard.state.subjects, ctx.wizard.state.scheduleSubjectsPage).reply_markup)
            }

            return await ctx.answerCbQuery()
        }
        else if (ctx.callbackQuery.data === nextPageButton) {
            if (ctx.wizard.state.scheduleSubjectsPage + 1 < Math.ceil(ctx.wizard.state.subjects.length / ctx.wizard.state.scheduleSubjectsPage)) {
                ctx.wizard.state.scheduleSubjectsPage = ctx.wizard.state.scheduleSubjectsPage + 1
                await ctx.editMessageReplyMarkup(getInlineScheduleSubjectsKeyboard(ctx.wizard.state.subjects, ctx.wizard.state.scheduleSubjectsPage).reply_markup)
            }

            return await ctx.answerCbQuery()
        }
        else if (ctx.callbackQuery.data === pageButton) {
            return await ctx.answerCbQuery()
        }

        const subjectId = String(ctx.callbackQuery.data)
        const subject = await Subject.findOne({ _id: subjectId })

        if (!subject) {
            await ctx.replyWithHTML('⚠️ <b>Выберите урок из списка</b>', cancelKeyboard);
            return await ctx.answerCbQuery()
        }

        ctx.wizard.state.scheduleItem.subject = subjectId

        await ctx.replyWithHTML(`<b>Введите время</b> на которое хотите поставить урок`, cancelKeyboard)
        return ctx.wizard.next()
    },
    async (ctx) => {
        if (!ctx.message || !ctx.message.text || !isValidTime(ctx.message.text)) {
            await ctx.replyWithHTML(`⚠️ <b>Введите корректное время</b>`, cancelKeyboard);
            return;
        }

        let datetime = convertTextToDateTime(ctx.message.text)
        ctx.wizard.state.scheduleItem.time = datetime

        // TODO set numerator and denominator in another step
        ctx.wizard.state.scheduleItem.numerator = true
        ctx.wizard.state.scheduleItem.denominator = true

        const scheduleItem = new ScheduleItem(ctx.wizard.state.scheduleItem)
        await scheduleItem.save()

        const schedule = await Schedule.findById(ctx.session.schedule._id)
        schedule[getDatabaseDayName(ctx.session.dayCode)].push(scheduleItem._id)

        await schedule.save()
        saveToSession(ctx, "schedule", schedule)

        await ctx.replyWithHTML("✅ Урок добавлен в расписание")

        await ctx.scene.enter('scheduleDay')
    },
)

addScheduleItem.command('back', async (ctx) => await ctx.scene.enter('scheduleDay'));
addScheduleItem.hears(cancelButton, async (ctx) => { await ctx.scene.enter('scheduleDay') })
addScheduleItem.hears(backButton, async (ctx) => await ctx.scene.enter('scheduleDay'));

module.exports = addScheduleItem;