var repository = require('../lib/repository');
var NodeCache = require("node-cache");
var _ = require('underscore');

var spmCache = new NodeCache( { stdTTL: 100, checkperiod: 120 } );

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
		
		spmCache.get("servers", function(err, value){
			if( !err && typeof value.servers === 'array' ){
				servers = value.servers;
			}
			else {
				repository.query('select * from spm_servers', function(err, result){
					if(!err) {
						servers = result;
						spmCache.set('servers', result);
					}
					else {
						servers = [];
					}					
				});
			}
		});			
		
		spmCache.get("databases", function(err, value){
			if( !err && typeof value.databases === 'array' ){
				databases = value.databases;
			}
			else {
				repository.query('select * from spm_databases', function(err, result){
					if(!err) {
						databases = result;
						spmCache.set('databases', result);
					}
					else {
						databases = [];
					}					
				});
			}
		});		
		
		spmCache.get("users", function(err, value){
			if( !err && typeof value.users === 'object' ){
				users = value.users;
			}
			else {
				repository.query('select id, login from users where INSTR(login, ".") > 0', function(err, result){
					if(!err) {
						users = result;
						spmCache.set('users', result);
					}
					else {
						users = [];
					}					
				});
			}
		});			
	
		repository.spm_storeprocedures_getbyissueid(params, function(err, stores){
			var result = {};
			result.err = err;
			
			if(!err) {				
				result.data = [];
				result.servers = [];
				result.databases = [];
				result.devs = [];
				result.sp_statuses = repository.sp_statuses;
				result.sp_actionTypes = repository.sp_actionTypes;
				
				_.each(stores, function(e, index, list){
					result.data.push([
						e.Server ? e.Server.Name : "",
						e.Database ? e.Database.Name : "",						
						e.Name,
						e.IsFunction,
						e.ActionName,
						e.Developer || "",						
						e.StatusName,
						e.Description,						
						e.Modifier ? e.Modifier.Username : "",
						e.Id,						
						e.Status,
						e.Server ? e.Server.Id : 0,
						e.Database ? e.Database.Id : 0
					]);
					
				});
				
				_.each(servers, function(e, index, list){
					result.servers.push(e.Name);					
				});
				
				_.each(users, function(e, index, list){
					result.devs.push(e.login);					
				});				
				
				_.each(databases, function(e, index, list){
					result.databases.push(e.Name);					
				});				
			}
			
			res.end(JSON.stringify(result));
		});		
	});		
};