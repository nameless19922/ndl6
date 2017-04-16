const express    = require('express');
const bodyParser = require('body-parser');

const api        = require('./api');
const validator  = require('./validator');
const handlers   = require('./handlers');

module.exports = port => {
    const app = express();

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(validator);
    app.use('/api', api);

    app.all('*', (req, res) => {
        res.json({ message: 'ok' });
    });

    app.use('/api/rest', (err, req, res, next) => {
        handlers.rest.error(res, 400, [{ type: 'client error', message: err.message}]);

        console.log(err.stack);
    });

    app.use('/api/rpc', (err, req, res, next) => {
        handlers.rpc.error(res, { "code": -32700, "message": err.message }, null);

        console.log(err.stack);
    });

    app.listen(port, () => {
        console.log(`Start http server at ${port}`);
    });
}