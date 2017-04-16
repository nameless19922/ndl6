module.exports = {
    rest: {
        error: (res, status, errors) => {
            res.status(status);
            res.json({errors});
        },

        users: (res, result) => {
            res.status(200);
            res.json({
                response: {
                    count: result.length,
                    users: result
                }
            })
        },

        message: (res, code, message) => {
            res.status(200);
            res.json({
                response: {
                    code,
                    message
                }
            });
        }
    },

    rpc: {
        response: (res, result, id) => {
            res.status(200);
            res.json({
                jsonrpc: '2.0',
                result,
                id
            });
        },

        error: (res, error, id) => {
            res.status(400);
            res.json({
                jsonrpc: '2.0',
                error,
                id
            });
        }
    }
}