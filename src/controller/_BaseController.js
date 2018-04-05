"use strict";
var jwt, Config, Enumerator;

jwt = require('jsonwebtoken');
Config = require('../config/Config');
Enumerator = require('../class/Enumerator');

class BaseController {

    /**
     * BaseController
     * @class BaseController
     * @param business          {Object}        Business Instance
     * @param router            {Router}        ExpressJS Router Reference
     * @param baseRoutePath     {String=}       Base Route Path
     * @constructor
     */
    constructor (business, router, baseRoutePath) {
        if (business) this.BO = new business(Config, Enumerator);
        this.Router = router;
        this.BaseRoutePath = baseRoutePath;
    }

    /**
     * Bind Path in ExpressJS Router
     * @param path              {String=}       Route Path, default is ''
     * @param ignoreBase        {Boolean=}      Ignore Base Route Path, default false
     * @return {Route}                          ExpressJS Route Instance
     */
    Bind(path, ignoreBase) {
        if (!ignoreBase) path = this.BaseRoutePath + (path || '');
        return this.Router.route(path);
    }

    /**
     * Send Response to Express
     * @param req               {Object}         Express Request Object
     * @param res               {Object}         Express Response Object
     * @param status            {Number}         Response Status Code
     * @param object            {Object=}        Response Object
     * @param log               {String|Object=} Log Information
     * @param level             {Number=}        Enumerator.LogLevel, default is INFORMATION
     * @static
     */
    static Send(req, res, status, object, log, level) {

        BaseController.SetLog(req, status, log, level);

        if (object && String(status).match(/400|401|403|404|412|500/) && Config.SendErrorOnResponse) res.status(status).json({message: object.message});
        else if (object && String(status).match(/200|201/)) res.status(status).json(object);
        else res.status(status).end();
    }

    /**
     * Send File
     * @param req               {Object}         Express Request Object
     * @param res               {Object}         Express Response Object
     * @param filePath          {String}         Normalized File Path
     * @static
     */
    static SendFile(req, res, filePath) {
        try {
            res.sendFile(filePath);
        } catch (err) {
            BaseController.Send(req, res, 500, err, err);
        }
    }

    /**
     * Let Request Logs
     * @param req               {Object}         Express Request Object
     * @param status            {String|Number}  Http Status Code
     * @param log               {String|Object=} Log Information
     * @param level             {Number=}        Enumerator.LogLevel, default is INFORMATION
     * @static
     */
    static SetLog(req, status, log, level) {
        var user, message;

        status = status.toString();

        if (!level) {
            if (status == '500') level = Enumerator.LogLevel.ERROR;
            else if (status.match(/401|403|404|412/)) level = Enumerator.LogLevel.WARNING;
            else if (status == '200') level = Enumerator.LogLevel.INFORMATION;
        }

        if (!log) {
            if (status == '500') log = "Internal server error";
            else if (status.match(/401|403/)) log = "Permission denied";
            else if (status == '412') log = "Precondition Failed";
            else if (status == '404') log = "Resource not found";
            else if (status == '200') log = "Resource loaded";
        }

        if (req.UserInfo) {
            user = {
                _id: req.UserInfo._id,
                login: req.UserInfo.login,
                authType: Config.Auth.TYPE
            }
        }

        message = log.hasOwnProperty('message')? log.message: log;

        logger.log(level, log, {
            resource: {
                path: req.originalUrl,
                method: req.method,
                queryString: req.query
            },
            detail: {
                user: user,
                header: req.headers,
                body: req.body,
                httpStatusCode: status,
                description: log
            }
        });
    }

    /**
     * User Authentication Middleware
     * @param req               {Object}        Express Request Object
     * @param res               {Object}        Express Response Object
     * @param next              {Function}      Express Next Function
     */
    static Authentication(req, res, next) {
        if (req.TokenError) BaseController.Send(req, res, 403, req.TokenError, req.TokenError);
        else next();
    }

    /**
     * Get Method
     * If Id is given in URL Call this.GetOne
     * Else Call this.GetByQuery
     * @param req               {Object}            Express Request Object
     * @param res               {Object}            Express Response Object
     * @param parentField       {String=}           Field Identifier of Parent Resource
     * @param parentValue       {String|Number=}    Identifier of Parent Resource
     */
    Get (req, res, parentField, parentValue) {
        if (req.params.id) this.GetOne(req, res, parentField, parentValue);
        else if (req.body || req.query) this.GetByQuery(req, res, parentField, parentValue);
    }

    /**
     * Get Document By Id
     * @param req               {Object}            Express Request Object
     * @param res               {Object}            Express Response Object
     * @param parentField       {String=}           Field Identifier of Parent Resource
     * @param parentValue       {String|Number=}    Identifier of Parent Resource
     */
    GetOne (req, res, parentField, parentValue) {
        this.BO.GetById(
            req.params.id,
            function(err, data) {
                if (err) BaseController.Send(req, res, 500, err, err);
                else if (!data) BaseController.Send(req, res, 404);
                else BaseController.Send(req, res, 200, data);
            }, parentField, parentValue
        );
    }

    /**
     * Get Document By Query
     * @param req               {Object}            Express Request Object
     * @param res               {Object}            Express Response Object
     * @param parentField       {String=}           Field Identifier of Parent Resource
     * @param parentValue       {String|Number=}    Identifier of Parent Resource
     */
    GetByQuery (req, res, parentField, parentValue) {
        var where = {},
            fields = null,
            limit = null,
            sort = null;

        if (req.method == "POST") {
            where = req.body.where;
            fields = req.body.fields;
            limit = req.body.limit;
            sort = req.body.sort;
        } else if (req.method == "GET") {
            fields = req.query.fields;
            limit = req.query.limit;
            sort = req.query.sort;

            for (let q in req.query) {
                if (req.query.hasOwnProperty(q) && !q.match(/fields|sort|limit/)) {
                    where[q] = req.query[q];
                }
            }
        }

        this.BO.GetByQuery(
            where,
            fields,
            limit,
            sort,
            function(err, data){
                if (err) BaseController.Send(req, res, 500, err, err);
                else BaseController.Send(req, res, 200, data);
            }, parentField, parentValue
        );
    }

    /**
     * Create One Document
     * @param req               {Object}            Express Request Object
     * @param res               {Object}            Express Response Object
     * @param parentField       {String=}           Field Identifier of Parent Resource
     * @param parentValue       {String|Number=}    Identifier of Parent Resource
     */
    Create (req, res, parentField, parentValue) {
        if (!Array.isArray(req.body)) {
            this.BO.Create(
                req.body,
                function (err, data) {
                    if (err) BaseController.Send(req, res, 500, err, err);
                    else BaseController.Send(req, res, 200, data);
                }, parentField, parentValue
            );
        } else this.CreateList(req, res, parentField, parentValue);
    }

    /**
     * Create a List of Documents
     * @param req               {Object}            Express Request Object
     * @param res               {Object}            Express Response Object
     * @param parentField       {String=}           Field Identifier of Parent Resource
     * @param parentValue       {String|Number=}    Identifier of Parent Resource
     */
    CreateList (req, res, parentField, parentValue) {
        if (Array.isArray(req.body)) {
            if (req.body.length > 0) {
                this.BO.CreateList(
                    req.body,
                    function(err, data) {
                        if (err) BaseController.Send(req, res, 500, err, err);
                        else BaseController.Send(req, res, 200, data);
                    }, parentField, parentValue
                );
            } else {
                BaseController.Send(req, res, 500, {message: "Content List MUST NOT BE EMPTY"}, {message: "Content List MUST NOT BE EMPTY"});
            }
        } else {
            BaseController.Send(req, res, 500, {message: "Content Body MUST BE A LIST"}, {message: "Content Body MUST BE A LIST"});
        }
    }

    /**
     * Update One Document
     * @param req               {Object}            Express Request Object
     * @param res               {Object}            Express Response Object
     * @param parentField       {String=}           Field Identifier of Parent Resource
     * @param parentValue       {String|Number=}    Identifier of Parent Resource
     */
    Update (req, res, parentField, parentValue) {
        if (req.params.id) {
            this.BO.Update(
                req.params.id,
                req.body,
                function (err, data) {
                    if (err) BaseController.Send(req, res, 500, err, err);
                    else BaseController.Send(req, res, 200, data);
                }, parentField, parentValue
            );
        } else this.UpdateList(req, res, parentField, parentValue);
    }

    /**
     * Update a List of Documents
     * @param req               {Object}            Express Request Object
     * @param res               {Object}            Express Response Object
     * @param parentField       {String=}           Field Identifier of Parent Resource
     * @param parentValue       {String|Number=}    Identifier of Parent Resource
     */
    UpdateList (req, res, parentField, parentValue) {
        var ids = req.body.ids,
            data = req.body.data;

        if (Array.isArray(ids) && Array.isArray(data)) {
            if (ids.length == data.length && ids.length > 0) {
                this.BO.UpdateList(
                    ids,
                    data,
                    function(err, data) {
                        if (err) BaseController.Send(req, res, 500, err, err);
                        else BaseController.Send(req, res, 200, data);
                    }, parentField, parentValue
                );
            } else {
                BaseController.Send(req, res, 500, {message: "Quantity of Ids and Data MUST BE EQUAL"}, {message: "Quantity of Ids and Data MUST BE EQUAL"});
            }
        } else {
            BaseController.Send(req, res, 500, {message: "Ids and Data MUST BE GREATER THAN 0"}, {message: "Ids and Data MUST BE GREATER THAN 0"});
        }
    }

    /**
     * Remove One Document
     * @param req               {Object}            Express Request Object
     * @param res               {Object}            Express Response Object
     * @param parentField       {String=}           Field Identifier of Parent Resource
     * @param parentValue       {String|Number=}    Identifier of Parent Resource
     */
    Remove (req, res, parentField, parentValue) {
        if (req.params.id) {
            this.BO.Remove(
                req.params.id,
                function (err) {
                    if (err) BaseController.Send(req, res, 500, err, err);
                    else BaseController.Send(req, res, 204);
                }, parentField, parentValue
            );
        } else this.RemoveList(req, res, parentField, parentValue);
    };

    /**
     * Remove a List of Documents
     * @param req               {Object}            Express Request Object
     * @param res               {Object}            Express Response Object
     * @param parentField       {String=}           Field Identifier of Parent Resource
     * @param parentValue       {String|Number=}    Identifier of Parent Resource
     */
    RemoveList (req, res, parentField, parentValue) {
        var ids = req.body.ids;
        if (Array.isArray(ids)) {
            if (ids.length > 0) {
                this.BO.RemoveList(
                    ids,
                    function(err) {
                        if (err) BaseController.Send(req, res, 500, err, err);
                        else BaseController.Send(req, res, 204);
                    }, parentField, parentValue
                );
            } else {
                BaseController.Send(req, res, 500, {message: "Content List MUST NOT BE EMPTY"}, {message: "Content List MUST NOT BE EMPTY"});
            }
        } else {
            BaseController.Send(req, res, 500, {message: "Content Body MUST BE A LIST"}, {message: "Content Body MUST BE A LIST"});
        }
    };
}

module.exports = BaseController;