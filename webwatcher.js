'use strict';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0" 
var fs = require('fs');
var ini = require('node-ini');
var http = require('request');

var inifile = process.argv[2];

var conf = readini(inifile);
if (!conf){
    console.log('config file error!');
    process.exit(1);
}

function readini (file){
    var conf = ini.parseSync(file);
    if (!conf) return false;
    if (!conf.watcher) return false;
    var w = conf.watcher;
    if (!w.name || !w.url || !w.timeout || !w.healthcode || !w.checktime) 
        return false;

    var t = parseInt(w.timeout);
    if (isNaN(t) || t < 1000){
        w.timeout = 1000;
    }else{
        w.timeout = t; 
    }
    var t = parseInt(w.checktime);
    if (isNaN(t) || t < 5000){
        w.checktime = 5000;
    }else{
        w.checktime= t; 
    }
    var t = parseInt(w.healthcode);
    if (isNaN(t) || t < 0){
        w.healthcode = 200;
    }else{
        w.healthcode = t; 
    }

    return conf;
}
console.log(conf)

function runTest(job){
    var watcher = job.watcher;
    var opt = {
        uri: watcher.url,
        method: "GET",
        timeout: watcher.timeout,
    };
    http(opt, function(err,res){
        if(err){
            console.log(new Date(), err);
            return;
        }
        console.log(new Date(), res.statusCode);
    });
};

console.log(new Date(), 'Starts..');
setInterval(runTest, conf.watcher.checktime, conf);

