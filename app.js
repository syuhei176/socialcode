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


app.post('/code/save', function (req, res) {
	var id = gen_id();
	var code = req.body.code;
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
	exec(id, args, function(err, result) {
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

function exec(id, args, callback) {
	var sandbox = {
		args : args,
		callback : callback,
		call : function(id, args, callback) {
			exec(id, args, callback);
		},
		http : require('http'),
		https : require('https')
	};
	var context = vm.createContext(sandbox);
	script.get(id, function(err, data) {
		if(err) {
			callback(err);
			return;
		}
		if(data == null) {
			callback('404');
			return;
		}
		var script = new vm.Script(data.script_code);
		script.runInContext(context);
	});
}