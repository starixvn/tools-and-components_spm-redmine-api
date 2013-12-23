

module.exports = function(app){
	
	app.put('/storeprocedures', function(req, res){		
		res.end('Not implemented.');				
	});			
	
	
	app.del('/storeprocedures/:id', function(req, res){			
		res.end('Delete ' + req.params.id + ' is not implemented.');
	});
	
	app.put('/storeprocedures', function(req, res){		
		res.end('Not implemented.');				
	});		
};