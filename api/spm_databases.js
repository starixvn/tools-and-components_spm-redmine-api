var repository = require('../lib/repository');

module.exports = function(app){
	// spm_database_getall
	app.get('/database', function(req, res){
		
		var d = {};
		
		repository.spm_databases_getall(d, function(err, result){
			if(!err) {
				res.send(JSON.stringify(result), 200);
			}
			else {
				res.send(err, result || 500);
			}
		});		
	});
	
	// spm_databases_delete
	app.del('/database', function(req, res){
		
		var errors = !app.validators.isInt(req.query.id + '0');
		if(errors) {
			res.send(null, 400);
			return;
		}
		
		var d = [
			req.query.id
		];			
		
		repository.spm_databases_delete(d, function(err, result){
			if(!err) {
				res.send(result || null, 200);
			}
			else {
				res.send(err, result || 500);
			}
		});	
	});
	
	// spm_databases_insert
	app.post('/database', function(req, res){
		var errors = !app.validators.isInt(req.query.id + '0') 
						&& !app.validators.isInt(req.query.serverId + '0') 
						&& !app.validators.isInt(req.query.userId + '0');
		if(errors) {
			res.send(null, 400);
			return;
		}
		
		var d = [
			req.query.id || 0, 
			req.query.name || '', 
			req.query.description || '', 
			req.query.serverId || 0, 
			req.query.userLogin || '', 
			req.query.userPassword || ''
		];			
		
		
		repository.spm_databases_insert(d, function(err, result){
			if(!err) {
				res.send(result || null, 200);
			}
			else {
				res.send(err, result || 500);
			}
		});			
		
	});	
};