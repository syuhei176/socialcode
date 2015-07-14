var mongodb = require('mongodb');

var dbname = 'socialcode';
var host = '127.0.0.1';
var port = 27017;

module.exports = {
	open : function(cb) {
		var self = this;
		var server = new mongodb.Server(host, port, {});
		var db = new mongodb.Db(dbname, server, {safe : true});
		this.db = db;
		db.open(function (error, client) {
			if (error) throw error;
			if(!client) return;
			cb(null, db);
			/*
			client.authenticate(user, pass, function(err,data){
				if(err) throw err;
				if(data && cb) {
					cb(null, self.mongo_dbinstance);
				}
			});
			*/
		});
	},
	collection : function(name) {
		return this.db.collection(name);
	}
}
