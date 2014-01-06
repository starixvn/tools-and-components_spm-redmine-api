/**
 * @author qui.nguyen
 */

var express = require('express'),
			  util				= require('util'),
			  mysql				= require('mysql'),
			  validators		= require('express-validator/node_modules/validator/lib/validators'),
			  expressValidator	= require('express-validator');
			  
var app = express();

app.use(express.bodyParser());
app.use(expressValidator());

app.util = util;
app.validators = validators;

app.use(express.static(__dirname + '/public'));

// Index host
app.get('/', function(req, res){	
	res.sendfile(__dirname + '/index.html');	
});

// Routing api
require('./api/spm_databases')(app);
require('./api/spm_users')(app);
require('./api/spm_servers')(app);
require('./api/spm_favourites_issues')(app);
require('./api/spm_storeprocedures')(app);

// Rounting widgets
require('./widgets/issue_storeprocedure')(app);

// Start application
app.listen(3000);
