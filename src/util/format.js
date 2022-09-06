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

module.exports = { formatTextByNumber }