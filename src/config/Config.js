"use strict";
var ConfigBase = require('../lib/omr-base/config/Config');

class Config extends ConfigBase {

    /**
     * Get Service Port Number
     * @return {Number}         Port Number
     */
    static get Port () {
        return Config.resource.APP_PORT || 8080;
    }

    /**
     * Get Environment
     * @return {String}         Environment
     */
    static get Env () {
        return Config.resource.APP_ENV || 'dev'
    }

    /**
     * Get SSL Configuration
     * @return {Object|Boolean} SSL Configuration, if SSL is disabled return false
     */
    static get SSL () {
        var Object = {
            PORT:       Config.resource.SSL_PORT || 443,
            OPTIONS:    {
                CA:         Config.resource.SSL_CA || 'cert/ca/ca.crt.pem',
                KEY:        Config.resource.SSL_KEY || 'cert/server/server.key.pem',
                CRT:        Config.resource.SSL_CRT || 'cert/server/server.crt.pem'
            }
        };

        if (Config.resource.SSL) return Object;
        else return false;
    }

    /**
     * Get Auth Configuration
     * @return {Object}         Auth Configuration
     */
    static get Auth () {
        return {
            TYPE: 0,
            GLOBAL: {
                SECRET:         Config.resource.APP_SECRET || '$2a$08$fHQ2QB5gR7TI2bwiztC2HucuTJ.GG0yMdPFyGtuKDgsCOvx5FxNjm',
                EXPIRATION: {
                    TOKEN:      Config.resource.TOKEN_EXPIRATION || "24h",
                    REFRESH:    Config.resource.REFRESH_EXPIRATION || (1000 * 60 * 60 * 24)
                }
            }
        }
    }

    /**
     * Get SendErrorOnResponse Configuration
     * If true, Error Object will be sent
     * @return {*|boolean}      Send Error On Response Configuration
     */
    static get SendErrorOnResponse() {
        return Config.resource.SEND_ERROR_ON_RESPONSE || false;
    }

    /**
     * Get Authentication Header Key Configuration
     * @return {String}         Header Key
     */
    static get AuthenticationHeaderKey() {
        return Config.resource.AUTHENTICATION_HEADER_KEY || 'x-access-token'
    }
}

module.exports = Config;