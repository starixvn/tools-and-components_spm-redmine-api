
module.exports = function(app){
	
	app.put('/favourites_issues', function(req, res){		
		res.end('Not implemented.');				
	});			
	
	
	app.del('/favourites_issues/:id', function(req, res){			
		res.end('Delete ' + req.params.id + ' is not implemented.');
	});
	
	app.put('/favourites_issues', function(req, res){		
		res.end('Not implemented.');				
	});			
};