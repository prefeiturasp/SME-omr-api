"use strict";
var BaseController = require('./_BaseController'),
    UserBO = require('../lib/omr-base/business/User.bo.js');

class UserController extends BaseController {

    /**
     * User Controller
     * @class UserController
     * @param router {Router} Express Router Object
     * @extends BaseController
     */
    constructor(router) {
        super(UserBO, router, '/user/');
        this.Bind('signin').post(this.Login.bind(this));
        this.Bind(':id/refresh').post(this.RefreshToken.bind(this));
    }

    /**
     * Login Handler
     * @param req
     * @param res
     */
    Login (req, res) {
        if (!req.body.hasOwnProperty('login') && !req.body.hasOwnProperty('password')) UserController.Send(req, res, 403);
        else {
            this.BO.Login(req.body, function(err, data) {
                req.body = null;
                if (err) UserController.Send(req, res, 403, err, err);
                else UserController.Send(req, res, 200, data);
            });
        }
    }

    /**
     * Refresh Token Handler
     * POST /api/user/
     * @param req
     * @param res
     */
    RefreshToken (req, res) {
        if (!req.body.token && !req.params.id) UserController.Send(req, res, 403);
        else {
            this.BO.RefreshToken(req.params.id, req.body.token, function (err, data) {
                if (err && err.message == "403") UserController.Send(req, res, 403, null, "Invalid refresh token");
                else if (err) UserController.Send(req, res, 500, err, err);
                else UserController.Send(req, res, 200, data);
            });
        }
    }
}

module.exports = function (router) {
    return (router)? new UserController(router): UserController;
};
