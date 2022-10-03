function getLocalizedDayName(dayCode) {
    const days = {
        "пн": "Понедельник",
        "вт": "Вторник",
        "ср": "Среда",
        "чт": "Четверг",
        "пт": "Пятница",
        "ст": "Суббота",
        "нд": "Воскресенье",
    }

    return days[dayCode]
}

function getDatabaseDayName(dayCode) {
    const days = {
        "пн": "monday",
        "вт": "tuesday",
        "ср": "wednesday",
        "чт": "thursday",
        "пт": "friday",
        "ст": "saturday",
        "нд": "sunday",
    }

    return days[dayCode]
}

module.exports = { getDatabaseDayName, getLocalizedDayName, }