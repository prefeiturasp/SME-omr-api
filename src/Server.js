"use strict";
module.exports = {
    /**
     * Run HTTP Server Instance over configuration
     * @param App       {Express}   ExpressJS App
     * @param Port      {int}       Connection Port
     */
    run: function(App, Port) {
        App.listen(Port);
        console.log("HTTP Server on", Port);
    }
};