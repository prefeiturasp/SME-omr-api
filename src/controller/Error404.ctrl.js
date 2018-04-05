"use strict";
var BaseController;

BaseController = require('./_BaseController');

class Error404Controller extends BaseController {

    /**
     * Error 404 Controller
     * @class Error404Controller
     * @extends BaseController
     */
    constructor (router) {
        super(null, router, '*');
        this.Bind().all(this.All.bind(this));
    }

    /**
     * Get Page Handler
     * {ALL_METHODS} *
     * @param req {Object} ExpressJS Request Object
     * @param res {Object} ExpressJS Response Object
     */
    All (req, res) {
        Error404Controller.Send(req, res, 404);
    }
}

module.exports = function (router) {
    return router? new Error404Controller(router): Error404Controller;
};