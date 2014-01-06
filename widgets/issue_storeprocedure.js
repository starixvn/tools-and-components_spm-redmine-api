
module.exports = function(app){	
	app.get('/widgets/issue/:id/storeprocedure.html', function(req, res){	
		res.sendfile(__dirname + '/issue_storeprocedure.html');
	});
	
	app.get('/widgets/issue/:id/storeprocedure.json', function(req, res){	
		
		res.sendfile('./public/grid.json');

	});	
	
	
};