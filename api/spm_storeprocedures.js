var repository = require('../lib/repository');
var _ = require('underscore');

module.exports = function (app) {

    app.get('/storeprocedure', function (req, res) {
        req.assert('id', 'Invalid id').isInt();
        req.assert('includeChild', 'Invalid flag value').isIn(['true', 'false', 'True', 'False', '']);
        var errors = req.validationErrors();
        if (errors) {
            res.send(null, 400);
            return;
        };

        var d = [
			req.sanitize('id').toInt(),
			req.sanitize('includeChild').toBoolean(),
        ];

        repository.spm_storeprocedures_getbyissueid(d, function (err, result) {
            if (!err) {
                res.send(JSON.stringify(result));
            }
            else {
                res.send(JSON.stringify(err), result || 500);
            }
        });

    });

    app.del('/storeprocedure', function (req, res) {

        var errors = !app.validators.isInt(req.query.id + '0');
        if (errors) {
            res.send(null, 400);
            return;
        }

        // Resolve user name to id
        app.cache.get("users", function (err, value) {
            var users = [];

            if (!err && typeof value.users === 'object') {
                users = value.users;
            }

            var login = _.find(users, function (user) { return user.login == req.query.modifiedBy; });

            var d = [
			    req.sanitize('id').toInt(),
                login.id
            ];

            repository.spm_storeprocedures_delete(d, function (err, result) {
                if (!err) {
                    res.send(null, 200);
                }
                else {
                    res.send(JSON.stringify(err), result || 500);
                }
            });
        });

    });

    app.post('/storeprocedure', function (req, res) {
        var errors = !app.validators.isInt(req.query.id + '0')
						&& !app.validators.isIn(req.query.isFunction, ['true', 'false'])
						&& !app.validators.isInt(req.query.status + '0')
						&& !app.validators.isInt(req.query.serverId + '0')
						&& !app.validators.isInt(req.query.developerId + '0')
						&& !app.validators.isInt(req.query.databaseId + '0')
						&& !app.validators.isInt(req.query.issueId + '0');

        if (errors) {
            res.send(null, 400);
            return;
        };

        // Resolve user name to id
        app.cache.get("users", function (err, value) {
            var users = [];

            if (!err && typeof value.users === 'object') {
                users = value.users;
            }

            var login = _.find(users, function (user) { return user.login == req.query.modifiedBy; });

            var d = [
                req.sanitize('id').toInt() || 0,
                req.sanitize('serverId').toInt() || 0,
                req.sanitize('databaseId').toInt() || 0,
                req.query.name || '',
                req.sanitize('isFunction').toBoolean() || false,
                req.query.actionName || '',
                login.id,
                req.sanitize('status').toInt() || 0,
                req.query.description || '',
                req.sanitize('issueId').toInt() || 0,
                req.sanitize('developerId').toInt() || 0
            ];

            repository.spm_storeprocedures_insert(d, function (err, result) {
                if (!err) {
                    res.send(result || null, 200);
                }
                else {
                    res.send(JSON.stringify(err), result || 500);
                }
            });
        });

    });

    app.put('/storeprocedure', function (req, res) {

        var errors = !app.validators.isInt(req.query.statusId + 0);

        if (errors) {
            res.send(null, 400);
            return;
        }

        var d = [
			req.query.ids || '',
			req.sanitize('statusId').toInt() || 0,
			req.query.username || ''
        ];

        repository.spm_storeprocedures_updatestatus(d, function (err, result) {
            if (!err) {
                res.send(JSON.stringify(result), 200);
            }
            else {
                res.send(JSON.stringify(err), result || 500);
            }
        });
    });
};