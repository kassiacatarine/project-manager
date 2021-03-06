const _ = require('lodash');
const faker = require('faker/locale/pt_BR');
const path = require('path');

let db = require('../../config/database');
let contacts = {};


contacts.insert = (req, res) => {
    try {
        const contact = utils.validateAndCreateObject(req.body, [
            'name',
            'email',
        ]);
        db.insert(contact, function(err, newDoc) {
            if (err) { return res.status(500).json({ success: false, message: err }); }
            // console.log(`${newDoc._id} success written`);
            res.json(newDoc._id);
        });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

contacts.list = (req, res) => {

    const search = req.query;
    const limit = (search.limit) ? parseInt(search.limit) : 10;
    const skip = (search.page) ? parseInt(search.page) - 1 : 0;
    const sort = { firstName: 1 };

    //TODO: Sort object from request
    // const sortBy = (search.propertyName) ? search.propertyName : 'firstName';
    // const direction = (search.direction) ? search.direction : 1;
    // Object.defineProperty(sort, propertyName, { value: direction });

    delete search.page;
    delete search.limit;

    Object.keys(req.query).forEach(key => search[key] = new RegExp(req.query[key], 'i'));

    db.find(search).skip(skip * limit).limit(limit).sort(sort).exec(function(err, doc) {
        if (err)
            res.status(500).json({
                success: false,
                message: err
            });
        res.json(doc);
    });
};

contacts.update = (req, res) => {
    if (!req.params.identifier)
        return res.json({
            success: false,
            message: `parameter identifier can not be null`
        });

    db.update({ _id: req.params.identifier }, req.body, function(err, numReplaced) {
        if (err)
            return res.json({
                success: false,
                message: err
            });

        if (numReplaced)
            res.status(200).json({
                success: true,
                message: `${req.params.identifier} success updated`
            });

        res.status(500).end({
            success: false,
            message: `can not find contact ${req.params.identifier}`
        });
    });
};

contacts.remove = (req, res) => {
    if (!req.params.identifier) { return res.json({ success: false, message: 'parameter identifier can not be null' }); }

    db.projects.remove({ _id: req.params.identifier }, { multi: false }, (err, numRemoved) => {
        if (err) { res.status(500).json({ success: false, message: err }); }

        if (numRemoved) { res.status(200).json({ success: true, message: `${req.params.identifier} success removed` }); }

        res.status(500).json({ success: false, message: `can not find contact ${req.params.identifier}` });
    });
};

contacts.search = (req, res) => {
    if (!req.params.identifier)
        res.json({
            success: false,
            message: `parameter identifier can not be null`
        });

    db.findOne({ _id: req.params.identifier }, function(err, doc) {
        if (err)
            res.json({
                success: false,
                message: err
            });

        if (!doc)
            res.json({
                success: false,
                message: `Contact can not be found. Maybe the identifier is wrong!`
            });

        res.json(doc);
    });
};

contacts.generate = (req, res) => {
    console.log(req.params.count);
    let count = (req.params.count == null || req.params.count == undefined) ? 10 : req.params.count;

    db.remove({}, { multi: true });

    _.times(count, (index) => {
        let contact = {
            "firstName": faker.name.firstName(),
            "lastName": faker.name.lastName(),
            "email": faker.internet.email(),
            "gender": (index % 2 == 0) ? "m" : "f",
            "info": {
                "avatar": faker.internet.avatar(),
                "company": faker.company.companyName(),
                "address": faker.address.streetAddress(),
                "phone": faker.phone.phoneNumber(),
                "comments": faker.lorem.sentences()
            },
            "isFavorite": faker.random.boolean()
        };
        db.insert(contact, function(err, newDoc) {
            if (err)
                res.status(500).json({
                    success: false,
                    message: `generate concts error: ${err}`
                });


            console.log('Adicionado com sucesso: ' + newDoc._id);
        });
    });

    res.json({
        success: true,
        message: `${count} contacts inserted`
    });
};


module.exports = contacts;