const path = require('path');

const contacts = require('./contacts');
const users = require('./users');
const projects = require('./projects');

const home = (req, res) => {
    res.sendFile(path.join(`${__dirname}/index.html`));
};

module.exports = {
    home,
    contacts,
    users,
    projects,
};