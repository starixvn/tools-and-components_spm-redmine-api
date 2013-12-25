
module.exports = function(app){	
	app.get('/user', function(req, res){
		// Get connection
		app.dbPool.getConnection(function(err, connection) {
			connection.query('call spm_users_getall;', function(err, results){
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
		
	app.del('/user', function(req, res){
		res.end('Delete ' + req.params.id + ' is not implemented.');
	});
	
	app.post('/user', function(req, res){
		res.end('Not implemented.');				
	});
};