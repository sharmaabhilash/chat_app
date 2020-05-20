const generateMessage = (userName, text) => {
    return {
        userName: userName,
        text: text,
        createdAt: new Date().getTime()
    };
}

const generateLocationMessage = (userName, url) => {
    return {
        userName: userName,
        url: url,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage
};