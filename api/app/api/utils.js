const validateAndCreateObject = (object, keys = []) => {
    keys.forEach((key) => {
        if (!object[key]) {
            throw new Error(`Object not valid its not give key: ${key}`);
        }
    });
    return Object.assign({}, object);
};

const verifyExists = (db, property) => new Promise((resolve, reject) => {
    db.findOne(property).exec((err, doc) => {
        if (err) { reject(err); }
        if (doc) {
            resolve(true);
        }
        resolve(false);
    });
});

const verifyExistsArray = async(db, propertyName, arrayValues) => {
    const verifyArray = await Promise.all(arrayValues.map(value => new Promise(async(resolve) => {
        const query = {};
        query[propertyName] = value;

        console.log(query);
        const exist = await verifyExists(db, query);

        console.log('EXISTS ===>', exist);
        resolve(exist);
    })));
    return verifyArray.includes(true);
};

module.exports = {
    validateAndCreateObject,
    verifyExists,
    verifyExistsArray,
};