var _ = require('underscore');
var mysql = require('mysql');

module.exports = (function(app){

	// Create mysql connection pool
	var pool   = mysql.createPool({
	  host     : 'localhost',
	  port	   : 3306,
	  user     : 'root',
	  password : '1234aa',
	  database: "redmine",
	  multipleStatements: true
	});
	
	var default_cb = function(err, results){
		console.log(err);
	};
	
	var sp_statuses = [
			'In Progress',
			'Done',
			'UAT [_xtest]',
			'UAT [_xpre]',
			'Not Required',
			'Released',
			'Pending',
			'UAT'
		];

	return {
		sp_statuses: sp_statuses,
		sp_actionTypes: ['A', 'D', 'E', 'Nested'],
		
		spm_storeprocedures_getbyissueid: function(params, cb){
			var cb = cb || default_cb;			
			pool.getConnection(function (err, connection) {
				
				if(err) {
					cb(err);
					return;
				};
	
				connection.query({ sql: 'call spm_storeprocedures_getbyissueid(?,?);', nestTables: true }, params, function(err, results) {
					if(err) {
						cb(err, 500);
					}
					else if (results.affectedRows == 0) {
						cb(err, 404);
					}
					else {
						
						var ds = [];
						_.each(results[0], function(element, index, list){
							element.sp.status = element.sp.status || 0;
							ds.push({
								Id: element.sp.id || 0,
								Name: element.sp.name || '',
								ModifiedDate: "0001-01-01T00:00:00",
								IsFunction: element.sp.isfunction ? element.sp.isfunction[0] === 1 : false,
								ActionName: element.sp.actionname,
								Status: element.sp.status,
								StatusName: (sp_statuses.length < element.sp.status || element.sp.status == 0) ? '' : sp_statuses[element.sp.status - 1],
								Description: element.sp.description || '',
								Developer: element.du.id ? element.du : null,
								Issue: {
									Tracker: null,
									Id: element.i.id,
									ProjectId: 0,
									CategoryId: 0,
									StatusId: 0,
									PriorityId: 0,
									StartDate: "0001-01-01T00:00:00",
									DueDate: "0001-01-01T00:00:00",		
									Assignee: null,
									Author: null,
									Parent: null,
									Name: element.i.Name,
									Description: ''
								},
								Modifier: element.u.id ? {
									Id: element.u.id,
									Username: element.u.Username
								} : null,
								Server: element.s.id ? {
									Id: element.s.id,
									Name: element.s.name
								} : null,
								Database: element.d.id ? {
									Id: element.d.id,
									Name: element.d.name
								} : null
							});
						});
						
			 			cb(null, ds);
					}
					
					connection.release();
				});			
				
			});
		},
		
		spm_storeprocedures_delete: function(params, cb){
			var cb = cb || default_cb;			
			pool.getConnection(function (err, connection) {
				
				if(err) {
					cb(err);
					return;
				}
				
				connection.query('call spm_storeprocedures_delete(?);', params, function(err, results){
					if(err) {
						cb(err, 500);
					}
					else if (results.affectedRows == 0) {
						cb(err, 404);
					}
					else {
			 			cb(null, 200);
					}
					
					connection.release();
				});						
			});						
		},
		
		spm_storeprocedures_insert: function(params, cb){
			var cb = cb || default_cb;			
			pool.getConnection(function (err, connection) {
				
				if(err) {
					cb(err);
					return;
				}
	
				connection.query('set @id=?; call spm_storeprocedures_insert(@id,?,?,?,?,?,?,?,?,?,?); select @id as id;', params, function(err, results){
					if(err) {
						cb(err, 500);
					}
					else {
						if(results.length === 3 && results[2].length === 1 && typeof (results[2][0].id) === 'number') {
			 				cb(null, results[2][0].id.toString());
			 			}
			 			else {
			 				cb(err, 500);
			 			}
					}
					
					connection.release();
				});						
			});					
			
		},
	
		spm_storeprocedures_updatestatus: function(params, cb){
			var cb = cb || default_cb;			
			pool.getConnection(function (err, connection) {
				
				if(err) {
					cb(err);
					return;
				}							
				
				connection.query('call spm_storeprocedures_updatestatus(?,?,?)', params, function(err, results){
					if(err) {
						cb(err, 500);
					}
					else {
						cb(null, results);
					}
				});
			});			
		},
	
		spm_users_getall: function(params, cb){
			var cb = cb || default_cb;			
			pool.getConnection(function(err, connection) {
				
				if(err) {
					cb(err);
					return;
				}			
				
				connection.query('call spm_users_getall;', function(err, results) {
					if(err){
						cb(err, 500);
					}
					else {
			 			cb(null, results[0]); 			
					};
					
					connection.release();	
				});
			});
		},
		
		spm_servers_getall: function(params, cb){
			var cb = cb || default_cb;			
			pool.getConnection(function(err, connection) {
				
				if(err) {
					cb(err);
					return;
				}			
				
				connection.query('call spm_servers_getall;', function(err, results){
					if(err){
						cb(err, 500);
					}
					else {
			 			cb(null, results[0]); 			
					};
					
					connection.release();	
				});
			});			
		},
		
		spm_servers_delete: function(params, cb){
			var cb = cb || default_cb;			
			pool.getConnection(function (err, connection) {	
				
				if(err) {
					cb(err);
					return;
				}						

				connection.query('call spm_servers_delete(?);', params, function(err, results){
					if(err) {
						cb(err, 500);
					}
					else if (results.affectedRows == 0) {
						cb(err, 404);
					}
					else {
			 			cb(null, 200);
					}
					
					connection.release();
				});						
			});			
		},
		
		spm_servers_insert: function(params, cb){
			var cb = cb || default_cb;
			pool.getConnection(function (err, connection) {
				
				if(err) {
					cb(err);
					return;
				}			
												
				connection.query('call spm_servers_insert(?,?,?,?,?,?);', params, function(err, results){
					if(err) {
						cb(err, 500);
					}
					else if (results.affectedRows == 0) {
						cb(err, 404);
					}
					else {
			 			cb(null, 200);
					}
					
					connection.release();
				});						
			});					
		},
		
		spm_databases_getall: function(params, cb){
			var cb = cb || default_cb;			
			pool.getConnection(function(err, connection) {
				
				if(err) {
					cb(err);
					return;
				}
				
				connection.query({sql: 'call spm_databases_getall;', nestTables: true}, function(err, results){
					if(err){
						cb(err, 500);
					}
					else {
						var ds = [];
						_.each(results[0], function(element, index, list){
							var d = element.d;
							if(d) {
								d.Server = element.s || {};
								d.Id = d.Id || 0;
								d.Server.Id = d.Server.Id || 0;
								d.Server.Name = d.Server.Name || '';
								ds.push(d);
							}
						});
						
			 			cb(null, ds); 			
					}
					
					connection.release();
				});
			});			
		},
		
		spm_databases_delete: function(params, cb){
			var cb = cb || default_cb;			
			pool.getConnection(function (err, connection) {	
				
				if(err) {
					cb(err);
					return;
				}									
												
				connection.query('call spm_databases_delete(?);', params, function(err, results){
					if(err) {
						cb(err, 500);
					}
					else if (results.affectedRows == 0) {
						cb(err, 404);
					}
					else {
			 			cb(null, 200);
					}
					
					connection.release();
				});						
			});			
			
		},
		
		spm_databases_insert: function(params, cb){
			var cb = cb || default_cb;			
			pool.getConnection(function (err, connection) {
				
				if(err) {
					cb(err);
					return;
				}
												
				connection.query('call spm_databases_insert(?,?,?,?,?,?);', params, function(err, results){
					if(err) {
						cb(err, 500);
					}
					else if (results.affectedRows == 0) {
						cb(err, 404);
					}
					else {
			 			cb(null, 200);
					}
					
					connection.release();
				});						
			});					
			
		},
		
		spm_favorities_issues_getbyuser: function(params, cb){
			var cb = cb || default_cb;			
			pool.getConnection(function(err, connection) {
				
				if(err) {
					cb(err);
					return;
				}			
				
				connection.query('call spm_favorities_issues_getbyuser(?);', params, function(err, results){
					if(err){
						cb(err, 500);
					}
					else {
			 			cb(null, results[0]); 			
					};
					
					connection.release();	
				});
			});			
				
		},
		
		spm_favorities_issues_insert: function(params, cb){
			var cb = cb || default_cb;			
			pool.getConnection(function (err, connection) {	
				
				if(err) {
					cb(err);
					return;
				}			
																	
				connection.query('call spm_favorities_issues_insert(?,?);', params, function(err, results){
					if(err) {
						cb(err, 500);
					}
					else if (results.affectedRows == 0) {
						cb(err, 404);
					}
					else {
			 			cb(null, 200);
					};
					
					connection.release();
				});						
			});
			
		},
		
		spm_favorities_issues_delete: function(params, cb){
			var cb = cb || default_cb;			
			pool.getConnection(function (err, connection) {
				
				if(err) {
					cb(err);
					return;
				}			
		
				connection.query('call spm_favorities_issues_delete(?,?);', params, function(err, results){
					if(err) {
						cb(err, 500);
					}
					else if (results.affectedRows == 0) {
						cb(err, 404);
					}
					else {
			 			cb(null, 200);
					}
					
					connection.release();
				});						
			});					
		},
	
		query: function(sql, cb){
			var cb = cb || default_cb;			
			pool.getConnection(function(err, connection) {
				
				if(err) {
					cb(err);
					return;
				}			
				
				connection.query(sql, function(err, results) {
					if(err){
						cb(err, 500);
					}
					else {
			 			cb(null, results); 			
					};
					
					connection.release();	
				});
			});
		}
	};
})();
