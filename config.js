const User     = require('./user');
const Store    = require('./store');

module.exports = {
    port:      process.env.PORT || 3000,

    store:     new Store(),

    increment: User.autoIncrement()
}