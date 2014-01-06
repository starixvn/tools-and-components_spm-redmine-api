var repository = require('../lib/repository');

module.exports = function(app){	
	app.get('/user', function(req, res){
		
		var d = {};
		
		repository.spm_users_getall(d, function(err, result){
			if(!err) {
				res.send(JSON.stringify(result), 200);
			}
			else {
				res.send(err, result || 500);
			}
		});	
	});
		
	app.del('/user', function(req, res){
		res.end('Delete ' + req.query.id + ' is not implemented.');
	});
	
	app.post('/user', function(req, res){
		res.end('Not implemented.');				
	});
};