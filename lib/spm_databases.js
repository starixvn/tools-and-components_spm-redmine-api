var _ = require('underscore');

module.exports = function(app){
	// spm_database_getall
	app.get('/database', function(req, res){
		// Get connection
		app.dbPool.getConnection(function(err, connection) {
			
			if(err) {
				console.log(err);
				return;
			}
			
			connection.query({sql: 'call spm_databases_getall;', nestTables: true}, function(err, results){
				if(err){
					res.send(err);
				}
				else {
					var ds = [];
					_.each(results[0], function(element, index, list){
						var d = element.d;
						if(d) {
							d.Server = element.s;
							ds.push(d);
						}
					});
					
		 			res.end(JSON.stringify(ds)); 			
				}
				
				connection.release();
			});
		});
	});
	
	// spm_databases_delete
	app.del('/database', function(req, res){
		
		var errors = !app.validators.isInt(req.query.id + '0');
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
											
			connection.query('call spm_databases_delete(?);', d, function(err, results){
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
	
	// spm_databases_insert
	app.post('/database', function(req, res){
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
				req.query.description || '', 
				req.query.serverId || 0, 
				req.query.userLogin || '', 
				req.query.userPassword || ''
			];			
											
			connection.query('call spm_databases_insert(?,?,?,?,?,?);', d, function(err, results){
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