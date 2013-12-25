
module.exports = function(app){
	app.get('/server', function(req, res){	
		// Get connection
		app.dbPool.getConnection(function(err, connection) {
			connection.query('call spm_servers_getall;', function(err, results){
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
	
	app.del('/server', function(req, res){
		
		var errors = !app.validators.isInt(req.body.id);
		if(errors) {
			res.send(null, 400);
			return;
		}
		
		app.dbPool.getConnection(function (err, connection) {	
			
			var d = [
				req.body.id
			];
											
			connection.query('call spm_servers_delete(?);', d, function(err, results){
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
	
	app.post('/server', function(req, res){
		var errors = !app.validators.isInt(req.body.id + '0') 
						&& !app.validators.isInt(req.body.serverId + '0') 
						&& !app.validators.isInt(req.body.userId + '0');
		if(errors) {
			res.send(null, 400);
			return;
		}
		
		app.dbPool.getConnection(function (err, connection) {
			
			var d = [
				req.body.id || 0, 
				req.body.name || '', 
				req.body.ipLocal || '', 
				req.body.ipUat || '', 
				req.body.ipProduction || '', 
				req.body.description || ''
			];
											
			connection.query('call spm_servers_insert(?,?,?,?,?,?);', d, function(err, results){
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