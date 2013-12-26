var _ = require('underscore');

var statuses = [
	'In Progress',
	'Done',
	'UAT [_xtest]',
	'UAT [_xpre]',
	'Not Required',
	'Released',
	'Pending',
	'UAT'
];

module.exports = function(app){
	
	app.get('/storeprocedure', function(req, res){
		req.assert('id', 'Invalid id').isInt();
		req.assert('includeChild', 'Invalid flag value').isIn(['true', 'false', 'True', 'False', '']);
		var errors = req.validationErrors();
		if(errors) {
			res.send(null, 400);
			return;
		};
					
		app.dbPool.getConnection(function (err, connection) {
			
			if(err) {
				console.log(err);
				return;
			}			
			
			var d = [
				req.sanitize('id').toInt(), 
				req.sanitize('includeChild').toBoolean(),
			];

			connection.query({ sql: 'call spm_storeprocedures_getbyissueid(?,?);', nestTables: true }, d, function(err, results) {
				if(err) {
					console.log(err);
					res.send(err, 500);
				}
				else if (results.affectedRows == 0) {
					res.send(err, 404);
				}
				else {
					
					var ds = [];
					_.each(results[0], function(element, index, list){
						ds.push({
							Id: element.sp.id,
							Name: element.sp.name,
							IsFunction: element.sp.isfunction && element.sp.isfunction[0] === 1,
							ActionName: element.sp.actionname,
							Status: element.sp.status,
							StatusName: (statuses.length < element.sp.status && element.sp.status > 0) ? '' : statuses[element.sp.status - 1],
							Description: element.sp.description,
							Developer: element.du,
							Issue: {
								Id: element.i.id,
								Name: element.i.Name
							},
							Modifier: {
								Id: element.u.id,
								Username: element.u.Username
							},
							Server: {
								Id: element.s.id,
								Name: element.s.name
							},
							Database: {
								Id: element.d.id,
								Name: element.d.name
							}
						});
					});					
					
		 			res.end(JSON.stringify(ds));
				}
				
				connection.release();
			});						
		});
	});

	app.del('/storeprocedure/:id', function(req, res){
	
		var errors = !app.validators.isInt(req.params.id + '0');
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
				req.sanitize('id').toInt()
			];			
			
			connection.query('call spm_storeprocedures_delete(?);', d, function(err, results){
				if(err) {
					console.log(err);
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
	
	app.post('/storeprocedure', function(req, res){
		var errors = !app.validators.isInt(req.query.id + '0') 
						&& !app.validators.isIn(req.query.isFunction, ['true', 'false']) 
						&& !app.validators.isInt(req.query.status + '0')
						&& !app.validators.isInt(req.query.serverId + '0')
						&& !app.validators.isInt(req.query.developerId + '0')
						&& !app.validators.isInt(req.query.databaseId + '0')
						&& !app.validators.isInt(req.query.issueId + '0');
		
		if(errors) {
			res.send(null, 400);
			return;
		};
		
		app.dbPool.getConnection(function (err, connection) {
			
			if(err) {
				console.log(err);
				return;
			}			
			
			var d = [
				req.sanitize('id').toInt() || 0, 
				req.sanitize('serverId').toInt() || 0, 
				req.sanitize('databaseId').toInt() || 0, 
				req.query.name || '', 
				req.sanitize('isFunction').toBoolean() || false, 
				req.query.actionName || '',
				req.query.modifiedBy || '',
				req.sanitize('status').toInt() || 0,
				req.query.description || '',
				req.sanitize('issueId').toInt() || 0,
				req.sanitize('developerId').toInt() || 0
			];

			connection.query('set @id=?; call spm_storeprocedures_insert(@id,?,?,?,?,?,?,?,?,?,?); select @id as id;', d, function(err, results){
				if(err) {
					console.log(err);
					res.send(err, 500);
				}
				else {
					if(results.length === 3 && results[2].length === 1 && typeof (results[2][0].id) === 'number') {
		 				res.end(results[2][0].id.toString());
		 			}
		 			else {
		 				res.send(err, 500);
		 			}
				}
				
				connection.release();
			});						
		});				
	});		

	app.put('/storeprocedure', function(req, res){
		
		var errors = !app.validators.isInt(req.query.statusId + 0);
		
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
				req.query.ids || '',
				req.sanitize('statusId').toInt() || 0,
				req.query.username || ''
			];
			
			connection.query('call spm_storeprocedures_updatestatus(?,?,?)', d, function(err, results){
				if(err) {
					console.log(err);
					res.send(err, 500);
				}
				else {
					res.end(JSON.stringify(results));
				}
			});
		});
	});
};