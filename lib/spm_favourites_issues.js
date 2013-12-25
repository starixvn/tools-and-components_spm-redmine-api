
module.exports = function(app){
	
	app.get('/issue/:id', function(req, res){	
		
		var d = [
			req.params.id || ''
		];
		
		// Get connection
		app.dbPool.getConnection(function(err, connection) {
			connection.query('call spm_favorities_issues_getbyuser(?);', d, function(err, results){
				if(err){
					res.send(err, 500);
				}
				else {
		 			res.end(JSON.stringify(results[0])); 			
				};
				
				connection.release();	
			});
		});
	});
	
	app.post('/issue', function(req, res){
			
		var errors = !app.validators.isInt(req.query.issueId + '0');
		if(errors) {
			res.send(null, 400);
			return;
		}
		
		app.dbPool.getConnection(function (err, connection) {	
			
			var d = [
				req.query.username || '', 
				req.query.issueId || 0
			];			
											
			connection.query('call spm_favorities_issues_insert(?,?);', d, function(err, results){
				if(err) {
					res.send(err, 500);
				}
				else if (results.affectedRows == 0) {
					res.send(err, 404);
				}
				else {
		 			res.end(null, 200);
				};
				
				connection.release();
			});						
		});
	});
	
	app.del('/issue', function(req, res){	
		var errors = !app.validators.isInt(req.query.issueId + '0');
		if(errors) {
			res.send(null, 400);
			return;
		}
		
		app.dbPool.getConnection(function (err, connection) {
			
			var d = [
				req.query.username || '', 
				req.query.issueId || 0
			];
											
			connection.query('call spm_favorities_issues_delete(?,?);', d, function(err, results){
				if(err) {
					res.send(err, 500);
				}
				else if (results.affectedRows == 0) {
					res.send(err, 404);
				}
				else {
		 			res.end(null, 200);
				}
				
				connection.release();
			});						
		});					
	});
};