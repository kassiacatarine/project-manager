const Datastore = require('nedb');

const contactsName = 'contacts.db';
const projectsName = 'projects.db';
const usersName = 'users.db';
let db;

if (!db) {
    db = {
        users: new Datastore({
            filename: usersName,
            autoload: true,
            timestampData: true,
        }),
        projects: new Datastore({
            filename: projectsName,
            autoload: true,
            timestampData: true,
        }),
        contacts: new Datastore({
            filename: contactsName,
            autoload: true,
            timestampData: true,
        }),
    };
    console.log(`Banco ${db} pronto para uso`);
}

module.exports = db;