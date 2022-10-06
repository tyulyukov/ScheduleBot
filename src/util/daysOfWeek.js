function getLocalizedDayName(dayCode) {
    const days = {
        "Mon": "Понедельник",
        "Tues": "Вторник",
        "Wed": "Среда",
        "Thu": "Четверг",
        "Fri": "Пятница",
        "Sat": "Суббота",
        "Sun": "Воскресенье",
    }

    return days[dayCode]
}

function getDatabaseDayName(dayCode) {
    const days = {
        "Mon": "monday",
        "Tues": "tuesday",
        "Wed": "wednesday",
        "Thu": "thursday",
        "Fri": "friday",
        "Sat": "saturday",
        "Sun": "sunday",
    }

    return days[dayCode]
}

module.exports = { getDatabaseDayName, getLocalizedDayName, }