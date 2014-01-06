var repository = require('../lib/repository');

module.exports = function(app){
	
	app.get('/issue/:id', function(req, res){	
		
		var d = [
			req.params.id || ''
		];
		
		repository.spm_favorities_issues_getbyuser(d, function(err, result){
			if(!err) {
				res.send(JSON.stringify(result), 200);
			}
			else {
				res.send(err, result || 500);
			}
		});	

	});
	
	app.post('/issue', function(req, res){
			
		var errors = !app.validators.isInt(req.query.issueId + '0');
		if(errors) {
			res.send(null, 400);
			return;
		}
	
		var d = [
			req.query.username || '', 
			req.query.issueId || 0
		];			
				
		repository.spm_favorities_issues_insert(d, function(err, result){
			if(!err) {
				res.send(result || null, 200);
			}
			else {
				res.send(err, result || 500);
			}
		});			
		
	});
	
	app.del('/issue', function(req, res){	
		var errors = !app.validators.isInt(req.query.issueId + '0');
		if(errors) {
			res.send(null, 400);
			return;
		}
		
		var d = [
			req.query.username || '', 
			req.query.issueId || 0
		];		
		
		repository.spm_favorities_issues_delete(d, function(err, result){
			if(!err) {
				res.send(result || null, 200);
			}
			else {
				res.send(err, result || 500);
			}
		});		
					
	});
};