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

// Create mysql connection pool
app.dbPool   = mysql.createPool({
  host     : 'localhost',
  port	   : 3306,
  user     : 'root',
  password : '1234aa',
  database: "redmine",
  multipleStatements: true
});

app.util = util;
app.validators = validators;

// Index host
app.get('/', function(req, res){	
	res.sendfile(__dirname + '/index.html');	
});

// Begin routing
require('./lib/spm_databases')(app);
require('./lib/spm_users')(app);
require('./lib/spm_servers')(app);
require('./lib/spm_favourites_issues')(app);
require('./lib/spm_storeprocedures')(app);

// Start application
app.listen(3000);
