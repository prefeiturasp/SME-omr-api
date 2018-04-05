"use strict";
var fs = require('fs'),
    path = require('path'),
    Config = require('../config/Config'),
    Enumerator = require('../class/Enumerator'),
    BaseController = require('./_BaseController'),
    ExamBusiness = require('../lib/omr-base/business/Exam.bo');

class FileController extends BaseController{
    constructor(router) {
        super(ExamBusiness, router, '/file/');
        this.Bind('equalized').get(this.getEqualized.bind(this));
        this.Bind('equalized/:exam_id').get(this.getEqualized.bind(this));
        this.Bind('result').get(this.getResult.bind(this));
        this.Bind('result/:exam_id').get(this.getResult.bind(this));
        this.Bind('original').get(this.getOriginal.bind(this));
        this.Bind('original/:exam_id').get(this.getOriginal.bind(this));
    }

    /**
     * Get Equalized File
     * @param req
     * @param res
     */
    getEqualized(req, res) {
        var path = `${Config.FileResource.PATH.BASE}${Config.FileResource.DIRECTORY.EQUALIZED}`,
            id = req.params.exam_id || req.query.examId || req.query.externalId;

        this.getFile(req, res, path, id, req.query.externalId? true: false);
    }

    /**
     * Get Result File
     * @param req
     * @param res
     */
    getResult(req, res) {
        var path = `${Config.FileResource.PATH.BASE}${Config.FileResource.DIRECTORY.RESULT}`,
            id = req.params.exam_id || req.query.examId || req.query.externalId;

        this.getFile(req, res, path, id, req.query.externalId? true: false, req.query.preProcessing? '_pre': '');
    }

    /**
     * Get Original File
     * @param req
     * @param res
     */
    getOriginal(req, res) {
        var path = `${Config.FileResource.PATH.BASE}${Config.FileResource.DIRECTORY.ORIGINAL}`,
            id = req.params.exam_id || req.query.examId || req.query.externalId;

        this.getFile(req, res, path, id, req.query.externalId? true: false);
    }

    /**
     * Get File
     * @param req
     * @param res
     * @param path
     * @param id
     * @param external
     * @param suffix
     */
    getFile(req, res, path, id, external, suffix) {
        suffix = suffix || '';
        this.BO.getFile(id, path, external, Enumerator.FileExtensions.PNG, suffix)
            .then((filePath) => {
                FileController.SendFile(req, res, filePath);
            })
            .catch((err) => {
                if (err.code === 'ENOENT') FileController.Send(req, res, 404, err, err);
                else FileController.Send(req, res, 500, err, err);
            });
    }
}

module.exports = function (router) {
    return (router)? new FileController(router): FileController;
};