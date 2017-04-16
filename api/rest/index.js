const express = require('express');
const app     = module.exports = express();

app.use('/v1', require('./v1'));


