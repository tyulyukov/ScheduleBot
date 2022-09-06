const { Markup } = require('telegraf')

const addButton = "➕ Добавить"
const deleteButton = "🗑️ Удалить"
const editButton = "✏️ Редактировать "

const backButton = "↩️ Вернуться назад"
const backKeyboard = Markup.keyboard([backButton]).resize()

const cancelButton = "❌ Отмена"
const cancelKeyboard = Markup.keyboard([cancelButton]).resize()

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

module.exports = { subjectsButton, scheduleButton, backButton, addButton, deleteButton, editButton, cancelButton,
                   saveButton, acceptButton,
                   mainKeyboard, backKeyboard, addDeleteBackKeyboard, addBackKeyboard, deleteBackKeyboard,
                   cancelKeyboard, saveCancelKeyboard, acceptCancelKeyboard }