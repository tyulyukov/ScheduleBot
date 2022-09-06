function saveToSession(ctx, fieldName, data) {
    ctx.session[fieldName] = data;
}

function deleteFromSession(ctx, fieldName) {
    delete ctx.session[fieldName];
}

module.exports = { saveToSession, deleteFromSession }