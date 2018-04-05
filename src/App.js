"use strict";
var express             = require('express'),
    bodyParser          = require('body-parser'),
    morgan              = require('morgan'),
    path                = require('path'),
    CORS                = require('cors'),
    app                 = express(),
    router              = express.Router(),
    Config              = require(path.join(__dirname, 'config', 'Config')),
    Enumerator          = require(path.join(__dirname, 'class', 'Enumerator')),
    ExpressMiddleware   = require(path.join(__dirname, 'class', 'ExpressMiddleware')),
    mongo;

/**
 *
 * @exports setup
 * @exports runHTTP
 * @exports runHTTPS
 */
var Server = module.exports = {
    /**
     * Server Setup
     */
    setup: function() {
        Config.init();

        mongo = require('./lib/omr-base/class/Database')(Config.MongoDB);
        require('./lib/omr-base/class/Log')({
            db: mongo.db,
            connectionString: Config.MongoDB,
            label: Enumerator.LogType.API,
            level: Config.KeepLogLevel
        });

        app.use(CORS());
        app.use(bodyParser.json());
        app.use(bodyParser.json({ type: 'application/json' }));

        //ExpressJS Global Error Handler
        app.use(ExpressMiddleware.ErrorHandler);
        //ExpressJS Global Request Handler
        app.use(ExpressMiddleware.Handler);

        app.use(morgan(Config.Env));

        require('./Route')(router);

        app.use('/api', router);
    },

    /**
     * Http Server Init
     */
    runHTTP: function () {
        var http        = require(path.join(__dirname, 'Server'));
        http.run(
            app,
            Config.Port
        );
    },

    /**
     * Https Server Init
     */
    runHTTPS: function() {
        var https   = require(path.join(__dirname, 'Server.SSL'));
        https.run(
            {
                key:                    Config.SSL.OPTIONS.KEY,
                cert:                   Config.SSL.OPTIONS.CRT,
                ca:                     Config.SSL.OPTIONS.CA
            },
            app,
            Config.SSL.PORT
        );
    }
};

Server.setup();
Server.runHTTP();

if (Config.SSL) {
    Server.runHTTPS();
}