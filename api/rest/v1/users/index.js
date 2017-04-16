const cwd      = process.cwd();

const express  = require('express');
const path     = require('path');

const User     = require(path.join(cwd, './user'));
const handlers = require(path.join(cwd, './handlers')).rest;
const config   = require(path.join(cwd, './config'));

const app      = module.exports = express();

let store      = config.store,
    increment  = config.increment;


app.get('/', (req, res) => {
    req.validateQuery('offset', false, ['isEmpty', 'isNumber'], ['toNumber']);
    req.validateQuery('limit' , false, ['isEmpty', 'isNumber'], ['toNumber']);
    req.validateQuery('fields', false, ['isEmpty']);

    let errors = req.validationErrors();

    if (errors.length) {
        handlers.error(res, 400, errors);
    } else {
        let offset = req.query.offset !== undefined ? req.query.offset : 0,
            limit  = req.query.limit  !== undefined ? req.query.limit  : store.length,
            fields = req.query.fields !== undefined ? req.query.fields : '',

            users  = store.getByStep(offset, limit);

        users.length ? handlers.users(res, users.getByFields(fields)) : handlers.users(res, []);
    }
});

app.get('/:id', (req, res) => {
    req.validateParams('id', true, ['isEmpty', 'isNumber'], ['toNumber']);

    let errors = req.validationErrors(),
        user   = store.getById(req.params.id);

    errors.length ? handlers.error(res, 400, errors) : handlers.users(res, user ? user : []);
});

app.post('/', (req, res) => {
    req.validateBody('name' , true, ['isEmpty']);
    req.validateBody('score', true, ['isEmpty', 'isNumber'], ['toNumber']);

    let errors = req.validationErrors();

    if (errors.length) {
        handlers.error(res, 400, errors);
    } else {
        let user = new User(
            increment(),
            req.body.name,
            req.body.score
        );

        store.push(user);

        handlers.message(res, 1, 'user successfully created');
    }
});

app.put('/:id', (req, res) => {
    req.validateParams('id', true, ['isEmpty', 'isNumber'], ['toNumber']);

    let errors = req.validationErrors();

    if (errors.length) {
        handlers.error(res, 400, errors);
    } else {
        let user = store.getById(req.params.id);

        if (user) {
            req.validateBody('name' , true, ['isEmpty']);
            req.validateBody('score', true, ['isEmpty', 'isNumber'], ['toNumber']);

            errors = req.validationErrors();

            if (errors.length) {
                handlers.error(res, 400, errors);
            } else {
                user.setUser(req.body.name, req.body.score);
                handlers.message(res, 1, 'user successfully updated')
            }
        } else {
            handlers.error(res, 400, [{ type: 'client error', message: `could not be find user ${req.params.id}`}]);
        }
    }
});

app.delete('/:id', (req, res) => {
    req.validateParams('id', true, ['isEmpty', 'isNumber'], ['toNumber']);

    let errors = req.validationErrors();

    if (errors.length) {
        handlers.error(res, 400, errors)
    } else {
        if (store.removeById(req.params.id)) {
            handlers.message(res, 1, 'user successfully removed');
        } else {
            handlers.error(res, 400, [{ type: 'client error', message: `could not be find user ${req.params.id}`}]);
        }
    }
});

app.delete('/', (req, res) => {
    if (store.length) {
        store.removeAll();
    }

    handlers.message(res, 1, 'all users successfully removed');
});
