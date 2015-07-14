var express = require('express');
var app = express();
var vm = require('vm');
var bodyParser = require('body-parser');
var db = require('./server/mongodb');
var script = require('./server/script');

db.open(function() {
	console.log('open');
	script.set_db(db);
});

app.use(bodyParser.json());
var codes = {};

app.all('*', function(req, res, next) {
    var origin = req.headers.origin;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-type, X-PINGOTHER');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

    /*
    if(origin && (origin.match(/mlkcca.com$/) || origin.match(/localhost(:\d+)?$/) ) ) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
    }*/
    next();
});


var pre_code = '';

app.post('/code/save', function (req, res) {
	var id = gen_id();
	var code = req.body.code;
	if(code == '' || pre_code == code) {
		res.json({
			err : "Invalid Code"
		});
		return;
	} 
	pre_code = code;
	script.save(id, code, function() {
		res.json({
			err : null,
			c : id
		});
	});
});

app.get('/code/exec/:id', function (req, res) {
	var id = req.params.id;
	var args = JSON.parse(req.param('args'));
	script.get(id, function(err, data) {
		if(err) {
			callback(err);
			return;
		}
		if(data == null) {
			callback('404');
			return;
		}
		exec(data.script_code, args, function(err, result) {
			res.json({err:err, result:result});
		});
	});
});

app.get('/code/test', function (req, res) {
	var code = req.param('code');
	exec(code, {}, function(err, result) {
		res.json({err:err, result:result});
	});
});

app.get('/code/remove/:id', function (req, res) {
	var id = req.params.id;
	script.remove(id, function(err) {
		res.json({
			err : err
		});
	});
});

app.get('/code/list', function (req, res) {
	script.list(function(err, data) {
		if(err == '404') {
			res.status(404).json({err : 'Not Found'});
			return
		}
		if(err == '500') {
			res.status(500).json({err : 'Internal Server Error'});
			return
		}
		res.json({err:null,c:data});
	});
});



app.listen(8005);


/*****Private Function*****/

function gen_id() {
	var id = new Date().getTime().toString(36);
	return id + '-' + random_str(8) + '-' + random_str(8);
	function random_str(n) {
		if(n == 0) return '';
		return random_char() + random_str(n - 1);
	}
	function random_char() {
		var a = "abcdefghijklmnopqrstuvwxyz0123456789";
		return a[Math.floor(Math.random() * a.length) % a.length];
	}
}

var global = {};

function exec(script_code, args, callback) {
	var sandbox = {
		global : global,
		args : args,
		callback : callback,
		call : function(id, args, callback) {
			exec(id, args, callback);
		},
		http : require('http'),
		https : require('https')
	};
	var context = vm.createContext(sandbox);
	var script = new vm.Script(script_code);
	try {
		script.runInContext(context);
	}catch(e) {
		callback('500');
	}
}