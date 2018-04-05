"use strict";
module.exports = {
    /**
     * Run HTTPS Server Instance over configuration
     * @param Options   {Object}    Https Connection Options
     * @param App       {Express}   ExpressJS App
     * @param Port      {int}       Connection Port
     */
    run: function(Options, App, Port) {
        var https   = require('https'),
            path    = require('path'),
            fs      = require('fs');

        https.createServer(
            {
                key:                    fs.readFileSync(path.join(__dirname, Options.key)),
                cert:                   fs.readFileSync(path.join(__dirname, Options.cert)),
                ca:                     fs.readFileSync(path.join(__dirname, Options.ca)),
                requestCert:            true,
                rejectUnauthorized:     false
            },
            App
        ).listen(
            Port
        );
        console.log("HTTPS Server on", Port);
    }
};