var fs = require('fs');

var data_path = __dirname + '/data.json';

module.exports = {
	data : {},
	open : function(cb) {
		var self = this;
		fs.readFile(data_path, 'utf8', function (err, text) {
			if(err) {
				cb(err);
				return;
			}
			self.data = JSON.parse(text);
			cb(null);
		});
	},
	save : function(id, content) {
		this.data[id] = content;
		fs.writeFile(data_path, JSON.stringify(this.data) , function (err) {
		    console.log(err);
		});
	},
	get : function(id, cb) {
		cb(null, this.data[id]);
	},
	list : function(cb) {
		cb(null, this.data);
	}
}