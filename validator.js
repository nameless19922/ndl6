function formatError(type, message) {
    return {
        type,
        message
    }
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

module.exports = (req, res, next) => {
    let errors = [];

    const processes = {
        trim: (param, query) => {
            return query[param].trim();
        },

        toNumber: (param, query) => {
            return parseInt(query[param], 10)
        }
    }

    const validators = {
        isEmpty: (param, query) => {
            return !query[param].length ? formatError('client error', `${param} is empty`) : null;
        },

        isNumber: (param, query) => {
            return !/^(?:[-+]?(?:0|[1-9][0-9]*))$/.test(query[param]) ? formatError('client error', `${param} must be a number`) : null;
        }
    };

    const places = ['body', 'query', 'params'];

    for (pl of places) {
        let place = pl;

        req[`validate${capitalize(place)}`] = (param, required, rules, treatments) => {
            if (req[place].hasOwnProperty(param)) {
                if (Array.isArray(rules)) {
                    for (rule of rules) {
                        if (validators.hasOwnProperty(rule)) {
                            let error = validators[rule](param, req[place]);

                            if (error) {
                                errors.push(error);
                            }
                        }
                    }
                }

                if (Array.isArray(treatments)) {
                    for (treatment of treatments) {
                        if (processes.hasOwnProperty(treatment)) {
                            req[place][param] = processes[treatment](param, req[place]);
                        }
                    }
                }
            } else {
                if (required) {
                    errors.push(
                        formatError('client error', `${param} don't isset`)
                    );
                }
            }
        }
    }

    req.validationErrors = () => {
        return errors;
    }

    next();
}