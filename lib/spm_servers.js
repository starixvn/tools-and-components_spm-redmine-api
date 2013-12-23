
module.exports = function(app){
	app.get('/servers', function(req, res){	
		// Get connection
		app.dbPool.getConnection(function(err, connection) {		
			connection.query('call spm_servers_getall', function(err, rows, fields){
				if(err){
					res.send(err, 500);
				}
				else {
		 			res.end(JSON.stringify(rows)); 			
				};
				
				connection.release();	
			});
		});
	});
	
	app.del('/servers/:id', function(req, res){			
		res.end('Delete ' + req.params.id + ' is not implemented.');
	});
	
	app.put('/servers', function(req, res){		
		res.end('Not implemented.');				
	});			
};