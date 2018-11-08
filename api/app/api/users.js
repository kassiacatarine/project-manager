const db = require('../../config/database');
const jwt = require('jsonwebtoken');
const jwtSecret = require('../../config/secret');
const utils = require('./utils');

const users = {};

// usuários
users.login = (req, res) => {
    try {
        const login = utils.validateAndCreateObject(req.body, [
            'email',
            'password',
        ]);

        db.users.findOne(login).exec((err, doc) => {
            if (err) {
                res.status(500).json({ success: false, message: err });
            }
            // console.log('LOG IN DOC ===> ', doc);
            if (!doc || doc === null) {
                return res.status(400).json({ success: false, message: 'Password or email not match!' });
            }
            const token = jwt.sign(doc, jwtSecret);
            return res.json({
                token,
                user: Object.assign({}, {
                    ...doc,
                    password: undefined,
                }),
                at: new Date().toJSON(),
            });
        });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};


users.list = (req, res) => {
    const search = req.query;
    const limit = (search.limit) ? parseInt(search.limit, 10) : 10;
    const skip = (search.page) ? parseInt(search.page, 10) - 1 : 0;
    const sort = { name: 1 };

    delete search.page;
    delete search.limit;

    Object.keys(req.query).forEach((key) => {
        search[key] = new RegExp(req.query[key], 'i');
    });

    db.users.find(search).skip(skip * limit).limit(limit).sort(sort)
        .exec((err, doc) => {
            if (err) {
                return res.status(500).json({ success: false, message: err });
            }
            return res.json(doc.map(d => ({
                ...d,
                password: undefined,
                confirmPassword: undefined,
            })));
        });
};

users.register = async(req, res) => {
    try {
        const user = utils.validateAndCreateObject(req.body, [
            'name',
            'email',
            'password',
            'birth',
        ]);
        const emailExists = await utils.verifyExists(db.users, { email: user.email });
        if (emailExists) {
            return res.status(400).json({ success: false, message: `Insert user with email ${user.email} already exists` });
        }
        db.users.insert(user, (err, newDoc) => {
            if (err) {
                res.status(500).json({ success: false, message: err });
            }
            delete newDoc.password;
            res.json(newDoc);
        });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

users.update = (req, res) => {
    if (!req.params.identifier) { return res.json({ success: false, message: 'parameter identifier can not be null' }); }

    db.users.update({ _id: req.params.identifier }, req.body, (err, numReplaced) => {
        if (err) { return res.json({ success: false, message: err }); }

        if (numReplaced) { res.status(200).json({ success: true, message: `${req.params.identifier} success updated` }); }

        res.status(500).end({ success: false, message: `can not find user ${req.params.identifier}` });
    });
};

users.remove = (req, res) => {
    if (!req.params.identifier) { return res.json({ success: false, message: 'parameter identifier can not be null' }); }

    db.users.remove({ _id: req.params.identifier }, { multi: false }, (err, numRemoved) => {
        if (err) { res.status(500).json({ success: false, message: err }); }

        if (numRemoved) { res.status(200).json({ success: true, message: `${req.params.identifier} success removed` }); }

        res.status(500).json({ success: false, message: `can not find user ${req.params.identifier}` });
    });
};

users.get = (req, res) => {
    if (!req.params.identifier) { res.json({ success: false, message: 'parameter identifier can not be null' }); }

    db.users.findOne({ _id: req.params.identifier }, (err, doc) => {
        if (err) { res.json({ success: false, message: err }); }

        if (!doc) { res.json({ success: false, message: 'User can not be found. Maybe the identifier is wrong!' }); }

        res.json(doc);
    });
};

module.exports = users;