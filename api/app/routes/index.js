// const api = require('../api');

// module.exports = function (app) {

//     app.route('/v1')
//         .get(api.home);

//     app.route('/v1/contacts')
//         .post(api.insert)
//         .get(api.list);

//     app.route('/v1/contacts/:identifier')
//         .delete(api.remove)
//         .get(api.search)
//         .put(api.update);

//     app.route('/v1/generate/:count')
//         .get(api.generate);

//     app.all('*', (req, res) => {
//         res.redirect('/v1');
//     });
// };

const api = require('../api');
const jwtMiddleware = require('express-jwt');
const jwtSecret = require('../../config/secret');
const defaultApp = require('express');

const withUrlPrefix = url => `/api${url}`;


module.exports = (app = defaultApp) => {
    app.use(withUrlPrefix('/'), jwtMiddleware({ secret: jwtSecret }).unless({
        path: [
            withUrlPrefix('/home'),
            withUrlPrefix('/login'),
            withUrlPrefix('/register'),
        ],
    }));
    app.use(withUrlPrefix('/'), (err, req, res, next) => {
        if (err.name === 'UnauthorizedError') {
            return res.status(401).json({ success: false, message: 'Unauthorized token' });
        }
        return next();
    });

    app.route(withUrlPrefix('/home'))
        .get(api.home);

    // usuários
    app.post(withUrlPrefix('/login'), api.users.login);
    // .post(api.users.login);

    app.post(withUrlPrefix('/register'), api.users.register);
    // .post(api.users.register);

    app.route(withUrlPrefix('/users'))
        // .post(api.users.insert)
        .get(api.users.list);

    app.route(withUrlPrefix('/users/:identifier'))
        .delete(api.users.remove)
        .get(api.users.get)
        .put(api.users.update);

    // projetos
    app.route(withUrlPrefix('/projects'))
        .post(api.projects.insert)
        .get(api.projects.list);

    app.route(withUrlPrefix('/projects/:identifier'))
        .delete(api.projects.remove)
        .get(api.projects.get)
        .put(api.projects.update);

    // contatos
    app.route(withUrlPrefix('/contacts'))
        .post(api.contacts.insert)
        .get(api.contacts.list);

    app.route('/contacts/:identifier')
        .delete(api.contacts.remove)
        .get(api.contacts.search)
        .put(api.contacts.update);

    // app.route('/generate/:count')
    //     .get(api.generate);


    // not found
    app.all('*', (req, res) => {
        res.redirect(withUrlPrefix('/home'));
    });
};