var http = require('http');
var request = require('request');
var q = require('q');
var express = require('express');
var app = express();

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// list all swagger document urls
var listUrl = ['http://192.168.1.191:7007/docs', 'http://192.168.1.191:7010/docs'];

// general infor of your application
var info = { title: 'Example API', version: '1.0' };
app.get('/', function(req, res) {
    getApis(listUrl).then(function(data){
        var ret = data.reduce(function(a, i){
            if (!a) {
                a = i;
            }
            else{
                // combines paths
                for (key in i.paths){
                    a.paths[key] = i.paths[key];
                }
                // combines definitions
                for (key in i.definitions){
                    a.definitions[key] = i.definitions[key];
                }
            }
            return a;
        }, false);
        ret.info = info;
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(ret));
    }); 
});

// Start web server at port 3000
var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Combines swaggers http://%s:%s', host, port);
});

// get swagger json data from urls
var getApis = function(urls){
    var the_promises = [];
    urls.forEach(function(url){
        var def = q.defer();
        request(url, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                body = JSON.parse(body);
                def.resolve(body)
            }
        });
        the_promises.push(def.promise);
    });
    return q.all(the_promises);
}

