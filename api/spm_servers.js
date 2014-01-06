var repository = require('../lib/repository');

module.exports = function(app){
	app.get('/server', function(req, res){	
		
		var d = {};
		
		repository.spm_servers_getall(d, function(err, result){
			if(!err) {
				res.send(JSON.stringify(result), 200);
			}
			else {
				res.send(err, result || 500);
			}
		});
	});
	
	app.del('/server', function(req, res){
		
		var errors = !app.validators.isInt(req.body.id);
		if(errors) {
			res.send(null, 400);
			return;
		}
		
		var d = [
			req.query.id
		];		
		
		repository.spm_servers_delete(d, function(err, result){
			if(!err) {
				res.send(result || null, 200);
			}
			else {
				res.send(err, result || 500);
			}
		});		
		
	});
	
	app.post('/server', function(req, res){
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
			req.query.ipLocal || '', 
			req.query.ipUat || '', 
			req.query.ipProduction || '', 
			req.query.description || ''
		];		
		
		repository.spm_servers_insert(d, function(err, result){
			if(!err) {
				res.send(result || null, 200);
			}
			else {
				res.send(err, result || 500);
			}
		});				
				
	});			
};