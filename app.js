/**
 * @author qui.nguyen
 */

var express = require('express'),
			  util = require('util'),
			  https = require('https'),
			  fs = require('fs'),
			  mysql = require('mysql'),
			  validators = require('express-validator/node_modules/validator/lib/validators'),
			  expressValidator = require('express-validator'),
              NodeCache = require("node-cache");
			  
var key = fs.readFileSync('./ssl/server.key');
var cert = fs.readFileSync('./ssl/server.crt');

var https_options = {
  key: key,
  cert: cert
};

var app = express();

app.use(express.compress());
app.use(express.bodyParser());
app.use(expressValidator());

app.util = util;
app.validators = validators;
app.cache = new NodeCache({ stdTTL: 100, checkperiod: 120 });

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
var server = https.createServer(https_options, app).listen(3000);
// app.listen(3000);