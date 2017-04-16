module.exports = class Store extends Array {
    getById(id) {
        if (Number.isInteger(id)) {
            let result = this.filter(item => item.id === id);

            return result.length ? result[0] : null;
        }

        return null;
    }

    removeById(id) {
        let index = this.findIndex(item => item.id === id);

        return index !== -1 ? this.splice(index, 1) : null;
    }

    removeAll() {
        if (this.length) {
            return this.splice(0, this.length);
        }

        return null;
    }

    getByStep(offset, limit) {
        let length = this.length;

        if (length && length > offset && offset >= 0 && limit > 0) {
            return this.slice(offset, offset + limit);
        }

        return [];
    }

    getByFields(fields) {
        if (typeof fields === 'string' && fields.length) {
            fields = fields.split(',');

            if (fields.length) {
                let current = [];

                fields.forEach(field => {
                    if (this[0].hasOwnProperty(field)) {
                        current.push(field);
                    }
                });

                if (current.length) {
                    return this.map(item => {
                        let user = {};

                        current.forEach(field => user[field] = item[field]);

                        return user;
                    });
                }
            }
        }

        return this;
    }
}