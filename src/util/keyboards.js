const { Markup } = require('telegraf')

const addButton = "➕ Добавить"
const deleteButton = "🗑️ Удалить"
const editButton = "✏️ Редактировать"

const editNameButton = "✏️ Редактировать имя"
const editLinksButton = "✏️ Редактировать ссылки"

const backButton = "↩️ Вернуться назад"
const backKeyboard = Markup.keyboard([backButton]).resize()

const cancelButton = "❌ Отмена"
const cancelKeyboard = Markup.keyboard([cancelButton]).resize()

const editCancelKeyboard = Markup.keyboard([
    [editNameButton],
    [editLinksButton],
    [cancelButton]
]).resize()

const acceptButton = "✅ Подтвердить"
const acceptCancelKeyboard = Markup.keyboard([
    [acceptButton],
    [cancelButton]
]).resize()

const saveButton = "💾 Сохранить"
const saveCancelKeyboard = Markup.keyboard([
    [saveButton],
    [cancelButton]
]).resize()

const addDeleteBackKeyboard = Markup.keyboard([
    [addButton],
    [editButton],
    [deleteButton],
    [backButton]
]).resize()

const addBackKeyboard = Markup.keyboard([
    [addButton],
    [backButton]
]).resize()

const deleteBackKeyboard = Markup.keyboard([
    [editButton],
    [deleteButton],
    [backButton]
]).resize()

const subjectsButton = "📚️ Уроки"
const scheduleButton = "🗓️ Расписание"
const mainKeyboard = Markup.keyboard([
    [subjectsButton],
    [scheduleButton]
]).resize()

const mondayButton = "Понедельник"
const tuesdayButton = "Вторник"
const wednesdayButton = "Среда"
const thursdayButton = "Четверг"
const fridayButton = "Пятница"
const saturdayButton = "Суботта"
const sundayButton = "Воскресенье"
const todayButton = "🌄 Сегодня"

const scheduleBackKeyboard = Markup.keyboard([
    [todayButton, mondayButton],
    [tuesdayButton, wednesdayButton],
    [thursdayButton, fridayButton],
    [saturdayButton, sundayButton],
    [backButton]
]).resize()

module.exports = { subjectsButton, scheduleButton, backButton, addButton, deleteButton, editButton, cancelButton,
                   saveButton, acceptButton, editLinksButton, editNameButton, mondayButton, tuesdayButton,
                   wednesdayButton, thursdayButton, fridayButton, saturdayButton, sundayButton, todayButton,
                   mainKeyboard, backKeyboard, addDeleteBackKeyboard, addBackKeyboard, deleteBackKeyboard,
                   cancelKeyboard, saveCancelKeyboard, acceptCancelKeyboard, editCancelKeyboard, scheduleBackKeyboard, }