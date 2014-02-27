var repository = require('../lib/repository');
var _ = require('underscore');


module.exports = function(app){	
	app.get('/widgets/issue/:id/storeprocedure.html', function(req, res){	
		res.sendfile(__dirname + '/issue_storeprocedure.html');
	});	
	
	app.get('/widgets/issue/:id/storeprocedure.json', function(req, res){	
				
		req.assert('id', 'Invalid id').isInt();
		// req.assert('includeChild', 'Invalid flag value').isIn(['true', 'false', 'True', 'False', '']);
		var errors = req.validationErrors();
		if(errors) {
			res.send(null, 400);
			return;
		};
					
		var params = [
			req.sanitize('id').toInt(), 
			true, // includeChild
		];
		
		var servers = null;
		var databases = null;
		var users = null;
		
		app.cache.get("servers", function(err, value){
			if( !err && typeof value.servers === 'array' ){
				servers = value.servers;
			}
			else {
				repository.query(
					'select * from spm_servers where isdeleted = 0'					
					, function(err, result){
					if(!err) {
						servers = result;
						app.cache.set('servers', result);
					}
					else {
						servers = [];
					}
				});
			}
		});
		
		app.cache.get("databases", function (err, value) {
			if( !err && typeof value.databases === 'array' ){
				databases = value.databases;
			}
			else {
				repository.query(
					'select * from spm_databases where isdeleted = 0'					
					, function(err, result){
					if(!err) {
						databases = result;
						app.cache.set('databases', result);
					}
					else {
						databases = [];
					}					
				});
			}
		});		
		
		app.cache.get("users", function (err, value) {
			if( !err && typeof value.users === 'object' ){
				users = value.users;
			}
			else {
				repository.query('select id, login from users where INSTR(login, ".") > 0', function(err, result){
					if(!err) {
						users = result;
						app.cache.set('users', result);
					}
					else {
						users = [];
					}	
				});
			}
		});			
	
		repository.spm_storeprocedures_getbyissueid2(params, function(err, stores){
			var result = {};
			result.err = err;
			
			if(!err) {				
				result.data = [];
				result.servers = [];
				result.databases = [];
				result.devs = [];
				result.sp_statuses = [];
				result.sp_actionTypes = repository.sp_actionTypes;				
				result.data = stores;
				result.issueId = req.sanitize('id').toInt();
				
				_.each(servers, function(e, index, list){
					result.servers.push({id: e.Id, name: e.Name});					
				});
				
				_.each(users, function(e, index, list){
					result.devs.push({id: e.id, name: e.login});					
				});				
				
				_.each(databases, function(e, index, list){
					result.databases.push({id: e.Id, name: e.Name, serverId: e.ServerId});					
				});
				
				_.each(repository.sp_statuses, function(e, index, list){
					result.sp_statuses.push({id: index + 1, name: e});					
				});					
			}
			
			res.end(JSON.stringify(result));
		});		
	});		
};