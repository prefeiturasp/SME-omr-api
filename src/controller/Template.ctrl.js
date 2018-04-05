"use strict";
var BaseController = require('./_BaseController'),
    TemplateBO = require('../lib/omr-base/business/Template.bo.js'),
    Config = require('../config/Config');

class TemplateController extends BaseController {

    /**
     * Template Controller
     * @class TemplateController
     * @extends BaseController
     */
    constructor(router) {
        super(TemplateBO, router, '/template/');

        if (Config.DeveloperDebug) {
            this.Bind().get(TemplateController.Authentication, this.Get.bind(this));
            this.Bind().post(TemplateController.Authentication, this.Create.bind(this));
            this.Bind(':id').get(TemplateController.Authentication, this.Get.bind(this));
            this.Bind(':id').put(TemplateController.Authentication, this.Update.bind(this));
            this.Bind(':id').delete(TemplateController.Authentication, this.Remove.bind(this));
        }
    }

    /**
     * Validate Template Authorization
     * @param req
     * @param res
     * @param failStatus
     * @returns {boolean}
     */
    static Authorization (req, res, failStatus) {
        if (req.UserInfo.isAdmin) return true;
        else {
            TemplateController.Send(req, res, failStatus || 401);
            return false;
        }
    }

    /**
     * Get Method
     * If Id is given in URL Call this.GetOne
     * Else Call this.GetByQuery
     * @param req               {Object}        Express Request Object
     * @param res               {Object}        Express Response Object
     */
    Get (req, res) {
        if (TemplateController.Authorization(req, res)) {
            super.Get(req, res);
        }
    }

    /**
     * Create One Document
     * @param req               {Object}        Express Request Object
     * @param res               {Object}        Express Response Object
     */
    Create (req, res) {
        if (TemplateController.Authorization(req, res)) {
            super.Create(req, res);
        }
    }

    /**
     * Update One Document
     * @param req               {Object}        Express Request Object
     * @param res               {Object}        Express Response Object
     */
    Update (req, res) {
        if (TemplateController.Authorization(req, res)) {
            super.Update(req, res);
        }
    }

    /**
     * Remove One Document
     * @param req               {Object}        Express Request Object
     * @param res               {Object}        Express Response Object
     */
    Remove (req, res) {
        if (TemplateController.Authorization(req, res)) {
            super.Remove(req, res);
        }
    }
}

module.exports = function (router) {
    return (router)? new TemplateController(router): TemplateController;
};