const db = require('../../config/database');
const utils = require('./utils');
const moment = require('moment');

const projects = {};

const DATE_FORMAT = 'DD/MM/YYYY';

projects.list = (req, res) => {
    const search = req.query;
    const limit = (search.limit) ? parseInt(search.limit, 10) : 10;
    const skip = (search.page) ? parseInt(search.page, 10) - 1 : 0;
    const sort = { name: 1 };

    delete search.page;
    delete search.limit;

    Object.keys(req.query).forEach((key) => {
        search[key] = new RegExp(req.query[key], 'i');
    });

    db.projects.find(search).skip(skip * limit).limit(limit).sort(sort)
        .exec((err, doc) => {
            if (err) { return res.status(500).json({ success: false, message: err }); }
            return res.json(doc);
        });
};

projects.insert = async(req, res) => {
    try {
        const project = utils.validateAndCreateObject(req.body, [
            'name',
            'start',
            'finish',
        ]);
        // return res.status(400).json({ success: false, message: 'Team must be array' });
        const validatedTeam = [];
        project.team.forEach((menber) => {
            validatedTeam.push(utils.validateAndCreateObject(menber, [
                '_id',
                'name',
                'email',
                'workload',
                'workloadProject',
            ]));
        });
        project.team = validatedTeam;
        const existTeam = await utils.verifyExistsArray(db.users, '_id', project.team.map(t => t._id));
        if (!existTeam) {
            return res.status(400).json({ success: false, message: 'Team are menbers invalid!' });
        }
        const start = moment(project.start);
        const finish = moment(project.finish);
        if (!start.isValid() || !finish.isValid()) {
            return res.status(400).json({ success: false, message: 'Dates are invalid!' });
        }
        project.start = start.format(DATE_FORMAT);
        project.finish = finish.format(DATE_FORMAT);
        project.boss = Object.assign({}, {
            ...req.user,
            password: undefined,
            iat: undefined,
        });
        db.projects.insert(project, (err, newDoc) => {
            if (err) { return res.status(500).json({ success: false, message: err }); }
            // console.log(`${newDoc._id} success written`);
            return res.json(newDoc);
        });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

projects.update = (req, res) => {
    if (!req.params.identifier) { return res.json({ success: false, message: 'parameter identifier can not be null' }); }

    db.projects.update({ _id: req.params.identifier }, req.body, (err, numReplaced) => {
        if (err) { return res.json({ success: false, message: err }); }

        if (numReplaced) { res.status(200).json({ success: true, message: `${req.params.identifier} success updated` }); }

        return res.status(500).end({ success: false, message: `can not find project ${req.params.identifier}` });
    });
};

projects.remove = (req, res) => {
    if (!req.params.identifier) { return res.json({ success: false, message: 'parameter identifier can not be null' }); }

    db.projects.remove({ _id: req.params.identifier }, { multi: false }, (err, numRemoved) => {
        if (err) { res.status(500).json({ success: false, message: err }); }

        if (numRemoved) { res.status(200).json({ success: true, message: `${req.params.identifier} success removed` }); }

        res.status(500).json({ success: false, message: `can not find project ${req.params.identifier}` });
    });
};

projects.get = (req, res) => {
    if (!req.params.identifier) { res.json({ success: false, message: 'parameter identifier can not be null' }); }

    db.projects.findOne({ _id: req.params.identifier }, (err, doc) => {
        if (err) { res.json({ success: false, message: err }); }

        if (!doc) { res.json({ success: false, message: 'Project can not be found. Maybe the identifier is wrong!' }); }

        res.json(doc);
    });
};

module.exports = projects;