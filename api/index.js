const express = require('express');
const app     = module.exports = express();

app.use('/rest', require('./rest'));
app.use('/rpc',  require('./rpc'));