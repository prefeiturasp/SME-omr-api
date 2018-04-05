"use strict";
var async = require('async'),
    BaseController = require('./_BaseController'),
    TemplateBO = require('../lib/omr-base/business/Template.bo.js'),
    GroupBO = require('../lib/omr-base/business/Group.bo'),
    AggregationBO = require('../lib/omr-base/business/Aggregation.bo'),
    Config = require('../config/Config'),
    Enumerator = require('../class/Enumerator');

class AggregationController extends BaseController {

    /**
     * Aggregation Controller
     * @class AggregationController
     * @extends BaseController
     */
    constructor(router) {
        super(AggregationBO, router, '/aggregation/');

        if (Config.DeveloperDebug) {
            this.Bind().get(AggregationController.Authentication, this.Get.bind(this));
            this.Bind().post(AggregationController.Authentication, this.Create.bind(this));
            this.Bind(':id').get(AggregationController.Authentication, this.Get.bind(this));
            this.Bind(':id').put(AggregationController.Authentication, this.Update.bind(this));
            this.Bind(':id').delete(AggregationController.Authentication, this.Remove.bind(this));

            this.Bind('/template/:template_id/aggregation', true).get(AggregationController.Authentication, this.Get.bind(this));
            this.Bind('/template/:template_id/aggregation', true).post(AggregationController.Authentication, this.Create.bind(this));
            this.Bind('/template/:template_id/aggregation/:id', true).get(AggregationController.Authentication, this.Get.bind(this));
            this.Bind('/template/:template_id/aggregation/:id', true).put(AggregationController.Authentication, this.Update.bind(this));
            this.Bind('/template/:template_id/aggregation/:id', true).delete(AggregationController.Authentication, this.Remove.bind(this));
        }

        this.Bind('compose').post(AggregationController.Authentication, this.Compose.bind(this));
    }

    /**
     * Validate Aggregation Authorization
     * @param req
     * @param res
     * @param failStatus
     * @returns {boolean}
     */
    static Authorization (req, res, failStatus) {
        if (req.UserInfo.isAdmin) return true;
        else {
            AggregationController.Send(req, res, failStatus || 401);
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
        if (AggregationController.Authorization(req, res)) {
            if (!req.params.template_id) super.Get(req, res);
            else super.Get(req, res, "template_id", req.params.template_id);
        }
    }

    /**
     * Create One Document
     * @param req               {Object}        Express Request Object
     * @param res               {Object}        Express Response Object
     */
    Create (req, res) {
        if (AggregationController.Authorization(req, res)) {
            if (!req.params.template_id) super.Create(req, res);
            else super.Create(req, res, "template_id", req.params.template_id);
        }
    }

    /**
     * Update One Document
     * @param req               {Object}        Express Request Object
     * @param res               {Object}        Express Response Object
     */
    Update (req, res) {
        if (AggregationController.Authorization(req, res)) {
            if (!req.params.template_id) super.Update(req, res);
            else super.Update(req, res, "template_id", req.params.template_id);
        }
    }

    /**
     * Remove One Document
     * @param req               {Object}        Express Request Object
     * @param res               {Object}        Express Response Object
     */
    Remove (req, res) {
        if (AggregationController.Authorization(req, res)) {
            if (!req.params.template_id) super.Remove(req, res);
            else super.Remove(req, res, "template_id", req.params.template_id);
        }
    }

    /**
     * Create Aggregation, Template and Groups
     * @param req               {Object}        Express Request Object
     * @param res               {Object}        Express Response Object
     */
    Compose (req, res) {
        var Group, Template, queue, gList;
        if (AggregationController.Authorization(req, res)) {
            Group = new GroupBO();
            Template = new TemplateBO();
            queue = [];

            if (req.body.group && req.body.group.length > 0) {
                gList = {};
                req.body.group.forEach(function (e, i) {
                    queue.push(function (_callback) {
                        AggregationController.getGroup(e.externalId, e.type, Group)
                            .then(function (data) {
                                var fnSuccess, fnError;
                                fnSuccess = function (doc) {
                                    gList['_' + i] = doc.id;
                                    _callback(null, doc);
                                };
                                fnError = function (err) {
                                    _callback(err);
                                };

                                if (data.length > 0) {
                                    AggregationController.updateGroup(data[0]._id, e, Group)
                                        .then(fnSuccess)
                                        .catch(fnError);
                                } else {
                                    AggregationController.createGroup(e, Group)
                                        .then(fnSuccess)
                                        .catch(fnError);
                                }
                            })
                            .catch(function (err) {
                                _callback(err);
                            })
                    })
                })
            }

            async.parallel(
                queue,
                function (err) {
                    if (err) AggregationController.Send(req, res, 500, err);
                    else {
                        AggregationController.getTemplate(req.body.template.externalId, Template)
                            .then(function (data) {
                                var fnSuccess, fnError;
                                fnSuccess = function (doc) {
                                    AggregationController.getAggregation(doc, gList, req.body.externalId, this.BO)
                                        .then(function (data) {
                                            if (data.length == 0) {
                                                AggregationController.createAggregation(doc, gList, req.body.externalId, req.body.paginate, this.BO)
                                                    .then((doc) => {
                                                        AggregationController.Send(req, res, 200, doc);
                                                    })
                                                    .catch((err) => {
                                                        AggregationController.Send(req, res, 500, err);
                                                    })
                                            } else {
                                                if (data[0].processStatus == Enumerator.ProcessStatus.RAW || data[0].processStatus == Enumerator.ProcessStatus.ERROR || data[0].processStatus == Enumerator.ProcessStatus.FINISHED)
                                                {
                                                    AggregationController.updateAggregation(data[0]._id, doc, gList, req.body.externalId, req.body.paginate, false, this.BO)
                                                    .then(() => {
                                                        data[0].processStatus = Enumerator.ProcessStatus.RAW;
                                                        AggregationController.Send(req, res, 200, data[0]);
                                                    })
                                                    .catch((err) => {
                                                        AggregationController.Send(req, res, 500, err);
                                                    });
                                                } else {
                                                    AggregationController.updateAggregation(data[0]._id, doc, gList, req.body.externalId, req.body.paginate, true, this.BO)
                                                    .then(() => {
                                                        data[0].processStatus = Enumerator.ProcessStatus.RAW;
                                                        AggregationController.Send(req, res, 200, data[0]);
                                                    })
                                                    .catch((err) => {
                                                        AggregationController.Send(req, res, 500, err);
                                                    });
                                                }
                                            }
                                        }.bind(this))
                                        .catch(function (err) {
                                            AggregationController.Send(req, res, 500, err);
                                        });
                                };
                                fnError = function (err) {
                                    AggregationController.Send(req, res, 500, err);
                                };

                                if (data.length > 0) {
                                    AggregationController.updateTemplate(data[0]._id, req.body.template, Template)
                                        .then(fnSuccess.bind(this))
                                        .catch(fnError.bind(this));
                                } else {
                                    AggregationController.createTemplate(req.body.template, Template)
                                        .then(fnSuccess.bind(this))
                                        .catch(fnError.bind(this));
                                }
                            }.bind(this))
                            .catch(function (err) {
                                AggregationController.Send(req, res, 500, err);
                            });
                    }
                }.bind(this)
            );
        }
    }

    /**
     * Get Template by External Id
     * @param externalId       {String}        Template External ID
     * @param BO                {Object}        Template Business
     * @return {Promise}
     */
    static getTemplate (externalId, BO) {
        return new Promise(function (resolve, reject) {
            BO.GetByQuery(
                {externalId: externalId},
                null,
                null,
                null,
                function (err, data) {
                    if (err) reject(err);
                    else resolve(data);
                }
            );
        });
    }

    /**
     * Create Template
     * @param template          {Object}        Template Data
     * @param BO                {Object}        Template Business
     * @static
     * @return {Promise}
     */
    static createTemplate (template, BO) {
        return new Promise(function (resolve, reject) {
            BO.Create(
                template,
                function (err, doc) {
                    if (err) reject(err);
                    else resolve(doc);
                }
            );
        });
    }

    /**
     * Update Template
     * @param id                {String}        Template ID
     * @param template          {Object}        Template Data
     * @param BO                {Object}        Template Business
     * @static
     * @return {Promise}
     */
    static updateTemplate (id, template, BO) {
        return new Promise(function (resolve, reject) {
            BO.Update(
                id,
                template,
                function (err, doc) {
                    if (err) reject(err);
                    else resolve(doc);
                }
            )
        })
    }

    /**
     * Get Group by External Id and Type
     * @param externalId        {String}        Group External ID
     * @param type              {Number}        Group Type
     * @param BO                {Object}        Group Business
     * @static
     * @return {Promise}
     */
    static getGroup (externalId, type, BO) {
        return new Promise(function (resolve, reject) {
            BO.GetByQuery(
                {
                    externalId: externalId,
                    type: type
                },
                null,
                null,
                null,
                function (err, doc) {
                    if (err) reject(err);
                    else resolve(doc);
                }
            );
        });
    }

    /**
     * Create Group
     * @param group             {String}        Group Data
     * @param BO                {Object}        Group Business
     * @static
     * @return {Promise}
     */
    static createGroup (group, BO) {
        return new Promise(function (resolve, reject) {
            BO.Create(
                group,
                function (err, doc) {
                    if (err) reject(err);
                    else resolve(doc);
                }
            );
        });
    }

    /**
     * Create Group
     * @param id                {String}        Group ID
     * @param group             {String}        Group Data
     * @param BO                {Object}        Group Business
     * @static
     * @return {Promise}
     */
    static updateGroup (id, group, BO) {
        return new Promise(function (resolve, reject) {
            BO.Update(
                id,
                group,
                function (err, doc) {
                    if (err) reject(err);
                    else resolve(doc);
                }
            );
        });
    }

    /**
     * Get Aggregation by ExternalId, Template and Groups
     * @param template          {Object}        Template Data
     * @param groups            {Object}        Group List
     * @param externalId        {String}        Aggregation External ID
     * @param BO                {Object}        Aggregation Business
     * @static
     * @return {Promise}
     */
    static getAggregation (template, groups, externalId, BO) {
        var where;
        return new Promise(function (resolve, reject) {
            where = {
                externalId: externalId,
                '_template.externalId': template.externalId
            };

            for (let key in groups) {
                if (groups.hasOwnProperty(key)) {
                    where['_group.' + key] = groups[key];
                }
            }

            BO.GetByQuery(
                where,
                null,
                null,
                null,
                function (err, data) {
                    if (err) reject(err);
                    else resolve(data);
                }
            );
        });
    }

    /**
     * Create Aggregation
     * @param template          {Object}        Template Data
     * @param groups            {Object}        Group List
     * @param externalId        {String}        Aggregation External ID
     * @param paginate
     * @param BO                {Object}        Aggregation Business
     * @static
     * @return {Promise}
     */
    static createAggregation (template, groups, externalId, paginate, BO) {
        return new Promise((resolve, reject) => {
            paginate = paginate || false;
            BO.Create(
                {
                    externalId: externalId,
                    paginate: paginate,
                    _template: {
                        ref: template._id,
                        externalId: template.externalId
                    },
                    _group: groups,
                    sync: {
                        total: 0,
                        sent: 0
                    }
                },
                (err, doc) => {
                    if (err) reject(err);
                    else resolve(doc);
                }
            );
        });
    }

    /**
     *
     * @param id {String}
     * @param template {Object}
     * @param groups {Object}
     * @param externalId {String}
     * @param paginate {Boolean}
     * @param queue {Boolean}
     * @param BO {Object}
     * @return {Promise}
     */
    static updateAggregation(id, template, groups, externalId, paginate, queue, BO) {
        return new Promise((resolve, reject) => {
            var data = {
                externalId: externalId,
                paginate: paginate || false,
                hasQueue: queue,
                _template: {
                    ref: template._id,
                    externalId: template.externalId
                },
                _group: groups
            };

            if (!queue) data.processStatus = Enumerator.ProcessStatus.RAW;

            BO.Update(
                id,
                data,
                (err, res) => {
                    if (err) reject(err);
                    else resolve(res);
                }
            )
        })
    }
}

module.exports = function (router) {
    return (router)? new AggregationController(router): AggregationController;
};