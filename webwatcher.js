'use strict';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0" 
var fs = require('fs');
var ini = require('ini');
var http = require('request');

var inifile = process.argv[2];

var conf = readini(inifile);
if (!conf){
    console.log('config file error!');
    process.exit(1);
}

function readini (file){
    var conf = ini.parse(fs.readFileSync(file, 'utf-8'));
    if (!conf) return false;

    // [watcher] setting
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

    // success & fail must be array
    if (!w.success) w.success = [];
    if (!w.fail) w.fail = [];
    if (!Array.isArray(w.success)){
        console.log("config error: success must be string array")
        return false;
    }
    if (!Array.isArray(w.fail)){
        console.log("config error: fail must be string array")
        return false;
    }

    for (var i=0; i < w.success.length; i++){
        if (!checkNotifier(conf, w.success[i])){
            console.log("config error: success notifier format error")
            return false;
        };
    }
    for (var i=0; i < w.fail.length; i++){
        if (!checkNotifier(conf, w.fail[i])){
            console.log("config error: fail notifier format error")
            return false;
        };
    }


    return conf;
}

function checkNotifier(conf, name){
    var n = conf[name];
    if (typeof n !== 'object') return false;
    

    return true;
} 

console.log(JSON.stringify(conf,null,2))

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
        if (res.statusCode === job.healthcode){
            // TODO: success action?
            return;
        }

        // TODO: fail action
    });
};

console.log(new Date(), 'Starts..');
setInterval(runTest, conf.watcher.checktime, conf);

