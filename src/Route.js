"use strict";
module.exports = function(router) {
    require('./controller/User.ctrl')(router);
    require('./controller/Aggregation.ctrl')(router);
    require('./controller/Template.ctrl')(router);
    require('./controller/Exam.ctrl')(router);
    require('./controller/File.ctrl')(router);
    require('./controller/Error404.ctrl')(router);
};