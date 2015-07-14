module.exports = {
	db : null,
	set_db : function(db) {
		this.db = db;
	},
	save : function(script_id, script_code, cb) {
		this.db.collection('script').insert({
			_id : script_id,
			script_code : script_code
		}, function(err) {
			cb(err);
		});
	},
	get : function(script_id, cb) {
		this.db.collection('script').findOne({
			_id : script_id
		}, function(err, doc) {
			cb(err, doc);
		});
	},
	list : function(cb) {
		this.db.collection('script').find({
		}).toArray(function(err, docs) {
			cb(err, docs);
		});
	},
	get_many : function() {

	},
	remove : function(script_id, cb) {
		this.db.collection('script').remove({
			_id : script_id
		}, function(err, doc) {
			cb(err, doc);
		});
	}
}