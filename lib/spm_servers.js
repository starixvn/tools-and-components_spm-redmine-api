
module.exports = function(app){
	app.get('/server', function(req, res){	
		// Get connection
		app.dbPool.getConnection(function(err, connection) {
			
			if(err) {
				console.log(err);
				return;
			}			
			
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
			
			if(err) {
				console.log(err);
				return;
			}			
			
			var d = [
				req.query.id
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
		var errors = !app.validators.isInt(req.query.id + '0') 
						&& !app.validators.isInt(req.query.serverId + '0') 
						&& !app.validators.isInt(req.query.userId + '0');
		if(errors) {
			res.send(null, 400);
			return;
		}
		
		app.dbPool.getConnection(function (err, connection) {
			
			if(err) {
				console.log(err);
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