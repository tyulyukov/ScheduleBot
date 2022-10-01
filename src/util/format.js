function formatTextByNumber (number, texts) {
    number = Math.abs(number) % 100;
    const lastNumber = number % 10;

    if (number > 10 && number < 20)
        return texts[2];
    if (lastNumber > 1 && lastNumber < 5)
        return texts[1];
    if (lastNumber === 1)
        return texts[0];
    else
        return texts[2];
}

function formatTime(date) {
    const dateTime = new Date(date)
    return `${convert2digits(dateTime.getHours())}:${convert2digits(dateTime.getMinutes())}`
}

function convert2digits(number) {
    if (number < 10)
        return `0${number}`

    return number.toString()
}

module.exports = { formatTextByNumber, formatTime, convert2digits }