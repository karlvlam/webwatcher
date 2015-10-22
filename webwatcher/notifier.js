'use strict';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
var fs = require('fs');
var url = require('url');
var http = require('request');
var log4js = require('log4js');

var logger = log4js.getLogger('LOG');

var checkNotifierType = {};
checkNotifierType['http'] = function(n){
	if (!n['method']) return false;

	// supported methods : GET, POST
	switch (n['method'].toUpperCase()){
		case 'GET':
			n['method'] = 'GET';
			break;
		case 'POST':
			n['method'] = 'POST';
			break;
		default:
			return false;
	}

	if (!n['url']) return false;

	// default timeout 5s
	var t = parseInt(n['timeout']);
	if (isNaN(t) || t < 5000){
		n['timeout'] = 5000;
	}else{
		n['timeout'] = t;
	}

	return true;
}

var runNotifierType = {};
runNotifierType['http'] = function(n, cb){
	var method = n['method'];
	var opt = {
		uri: n['url'],
		method: method,
		timeout: n['timeout'],
	}

	if (n['param']){
		if(method === 'GET'){
			opt.uri += '?' + require('querystring').stringify(n['param']);
		}
	}

	if(method === 'POST'){
		http.post({url:opt.uri, form: n.param}, function(err, res){

			if(err){
				logger.debug('ERROR', new Error('HTTP_ERROR'));
				logger.debug(err);
			}

			cb(err, {result:'OK'});
		});

		return;
	}

	http(opt, function(err, res){
		if(err){
			logger.debug('ERROR', new Error('HTTP_ERROR'));
			logger.debug(err);
		}
		cb(err, {result: 'OK'});
	});

}

function checkNotifier(conf, name){
	var n = conf[name]; // get the notifier by name
	if (typeof n !== 'object') return false;
	if (!n['type']) return false;

	var fun = checkNotifierType[n['type']];
	if(typeof fun !== 'function') return false;
	return fun(n);
}

function runNotifier(conf, name, cb){
	var n = conf[name]; // get the notifier by name
	if (typeof n !== 'object') return false;
	if (!n['type']) return false;

	var fun = runNotifierType[n['type']];
	if(typeof fun !== 'function') return false;
	fun(n, cb);
}


module.exports = {
	checkNotifier: checkNotifier,
	runNotifier: runNotifier,
}
