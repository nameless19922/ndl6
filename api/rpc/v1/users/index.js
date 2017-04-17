const cwd = process.cwd();

const express  = require('express');
const path     = require('path');

const User     = require(path.join(cwd, './user'));
const handlers = require(path.join(cwd, './handlers')).rpc;
const config   = require(path.join(cwd, './config'));

const app      = module.exports = express();

let store      = config.store,
    increment  = config.increment;

const rpc = {
    getUsers: (res, params, id) => {
        let offset = 0,
            limit  = store.length,
            fields = '',

            users  = store.getByStep(offset, limit);

        if (typeof params !== 'undefined') {
            offset = typeof params.offset !== 'undefined' ? +params.offset : offset;
            limit  = typeof params.limit  !== 'undefined' ? +params.limit  : limit;
            fields = typeof params.fields !== 'undefined' ?  params.fields : fields;

            users  = store.getByStep(offset, limit);
        }

        users.length ? handlers.response(res, users.getByFields(fields), id) : handlers.response(res, [], id);
    },

    getUser: (res, params, id) => {
        let user = store.getById(+params.id);

        handlers.rpc.response(res, user ? user: [], id);
    },

    createUser: (res, params, id) => {
        if (typeof params.name === 'string' && typeof params.score === 'number') {
            store.push(
                new User(increment(), params.name, params.score)
            );

            handlers.response(
                res,
                { code: 1, message: 'user successfully created' },
                id
            );
        } else {
            handlers.error(
                res,
                { code: -32602, message: 'invalid method parameter(s).' },
                id
            );
        }
    },

    updateUser: (res, params, id) => {
        let user = store.getById(+params.id);

        if (user) {
            if (typeof params.name === 'string' && typeof params.score === 'number') {
                user.setUser(params.name, params.score);
                handlers.response(
                    res,
                    { code: 1, message: 'user successfully updated' },
                    id
                );
            } else {
                handlers.error(
                    res,
                    { code: -32602, message: 'invalid method parameter(s).' },
                    id
                );
            }
        } else {
            handlers.error(
                res,
                { code: -32600, message: 'could not be find user' },
                id
            );
        }
    },

    deleteUser: (res, params, id) => {
        if (store.removeById(+params.id)) {
            handlers.response(
                res,
                { code: 1, message: 'user successfully removed' },
                id
            );
        } else {
            handlers.error(
                res,
                { code: -32600, message: `could not be find user ${params.id}`},
                id
            );
        }
    },

    deleteAllUsers: (res, params, id) => {
        if (store.length) {
            store.removeAll();
        }

        handlers.response(
            res,
            { code: 1, message: 'all users successfully removed' },
            id
        );
    }
}

app.post('/', (req, res) => {
    req.validateBody('jsonrpc', true, ['isEmpty']);
    req.validateBody('method' , true, ['isEmpty']);
    req.validateBody('id'     , true);

    const methods = ['getUsers', 'getUser', 'createUser', 'updateUser', 'deleteUser', 'deleteAllUsers'];
    const method  = req.body.method;

    let errors = req.validationErrors();

    if (errors.length) {
        handlers.error(
            res,
            { code: -32600, error: errors[0].message },
            req.body.id
        );
    } else {
        if (methods.indexOf(method) !== -1) {
            rpc[req.body.method](res, req.body.params, req.body.id);
        } else {
            handlers.error(
                res,
                { code: -32601, error: 'The method does not exist / is not available.' },
                req.body.id
            );
        }
    }
});
