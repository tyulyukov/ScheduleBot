function isValidSubjectName(name) {
    return name.length < 25 && name.replaceAll("<", "").replaceAll(">", "").length > 0
}

function isValidHttpUrl(string) {
    return /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/gm.test(string)
}

module.exports = { isValidSubjectName, isValidHttpUrl }