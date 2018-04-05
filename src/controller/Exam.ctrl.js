"use strict";
var BaseController = require('./_BaseController'),
    ExamBO = require('../lib/omr-base/business/Exam.bo.js'),
    Config = require('../config/Config');

class ExamController extends BaseController {

    /**
     * Exam Controller
     * @class ExamController
     * @extends BaseController
     */
    constructor(router) {
        super(ExamBO, router, '/exam/');

        if (Config.DeveloperDebug) {
            this.Bind().get(ExamController.Authentication, this.Get.bind(this));
            this.Bind(':id').get(ExamController.Authentication, this.Get.bind(this));
            this.Bind('/aggregation/:aggregation_id/exam', true).get(ExamController.Authentication, this.Get.bind(this));
            this.Bind('/aggregation/:aggregation_id/exam/:id', true).get(ExamController.Authentication, this.Get.bind(this));
        }
    }

    /**
     * Validate Exam Authorization
     * @param req
     * @param res
     * @param failStatus
     * @returns {boolean}
     */
    static Authorization (req, res, failStatus) {
        if (req.UserInfo.isAdmin) return true;
        else {
            ExamController.Send(res, failStatus || 401);
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
        if (ExamController.Authorization(req, res)) {
            if (!req.params.aggregation_id) super.Get(req, res);
            else super.Get(req, res, "aggregation_id", req.params.aggregation_id);
        }
    }

    /**
     * Create One Document
     * @param req               {Object}        Express Request Object
     * @param res               {Object}        Express Response Object
     */
    Create (req, res) {
        if (ExamController.Authorization(req, res)) {
            if (!req.params.aggregation_id) super.Create(req, res);
            else super.Create(req, res, "aggregation_id", req.params.aggregation_id);
        }
    }

    /**
     * Update One Document
     * @param req               {Object}        Express Request Object
     * @param res               {Object}        Express Response Object
     */
    Update (req, res) {
        if (ExamController.Authorization(req, res)) {
            if (!req.params.aggregation_id) super.Update(req, res);
            else super.Update(req, res, "aggregation_id", req.params.aggregation_id);
        }
    }

    /**
     * Remove One Document
     * @param req               {Object}        Express Request Object
     * @param res               {Object}        Express Response Object
     */
    Remove (req, res) {
        if (ExamController.Authorization(req, res)) {
            if (!req.params.aggregation_id) super.Remove(req, res);
            else super.Remove(req, res, "aggregation_id", req.params.aggregation_id);
        }
    }
}

module.exports = function (router) {
    return (router)? new ExamController(router): ExamController;
};