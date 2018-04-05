'use strict';
var jwt = require('jsonwebtoken'),
    Enumerator = require('../class/Enumerator'),
    Config = require('../config/Config');

class ExpressMiddleware {

    /**
     * Global ExpressJS Error Handler
     * @param err {Object} ExpressJS Error Object
     * @param req {Object} ExpressJS Request Object
     * @param res {Object} ExpressJS Response Object
     * @param next {Function} ExpressJS Next Function
     * @static
     */
    static ErrorHandler(err, req, res, next) {
        var user, status, body, token;
        status = err.status || '500';
        token = req.headers[Config.AuthenticationHeaderKey];

        jwt.verify(token, Config.Auth.GLOBAL.SECRET, function(jwtErr, decoded) {
            if (!jwtErr) req.UserInfo = decoded;

            if (req.UserInfo) {
                user = {
                    _id: req.UserInfo._id,
                    login: req.UserInfo.login,
                    authType: Config.Auth.TYPE
                }
            }

            if (!req.originalUrl.match(/signin/)) body = { requestBody: err.body.toString() };

            logger.error(err.message, {
                resource: {
                    path: req.originalUrl,
                    method: req.method,
                    queryString: req.query
                },
                detail: {
                    user: user,
                    header: req.headers,
                    body: body,
                    httpStatusCode: status,
                    description: err
                }
            });
        });

        if (Config.SendErrorOnResponse) res.status(status).json(err);
        else res.status(status).end();
    }

    /**
     * Global ExpressJS Request Handler
     * @param req {Object} ExpressJS Request Object
     * @param res {Object} ExpressJS Response Object
     * @param next {Function} ExpressJS Next Function
     * @static
     */
    static Handler(req, res, next) {
        var token;

        token = req.headers[Config.AuthenticationHeaderKey];

        jwt.verify(token, Config.Auth.GLOBAL.SECRET, function(jwtErr, decoded) {
            if (!jwtErr) req.UserInfo = decoded;
            else req.TokenError = jwtErr;

            next();
        });
    }
}

module.exports = ExpressMiddleware;