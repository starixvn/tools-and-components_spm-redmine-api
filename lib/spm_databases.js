var _ = require('underscore');

module.exports = function(app){
	// spm_database_getall
	app.get('/databases', function(req, res){	
		// Get connection
		app.dbPool.getConnection(function(err, connection) {		
			connection.query({sql: 'call spm_database_getall', nestTables: '_'}, function(err, results){
				if(err){
					res.send(err);
				}
				else {									
		 			res.end(JSON.stringify(results)); 			
				}
				
				connection.release();
			});
		});
	});
	
	// spm_databases_delete
	app.del('/databases/:id', function(req, res){
		
		req.assert('id', 'Invalid database id').isInt();
		var errors = req.validationErrors();
		if(errors) {
			res.send('There have been validation errors: ' + app.util.inspect(errors), 400);
			return;
		}
		
		app.dbPool.getConnection(function (err, connection) {									
			connection.query('call spm_databases_delete(' + req.sanitize('id').toInt() +  ');', function(err, rows, fields){
				if(err){
					res.send(err, 500);
				}
				else {
		 			res.end(JSON.stringify(rows)); 			
				}
				
				connection.release();
			});						
		});
	});
	
	app.put('/databases', function(req, res){		
		res.end('Not implemented.');				
	});	
};