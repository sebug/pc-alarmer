var azureStorage = require('azure-storage');
var request = require('request');


// Lol, duplication. But for the moment that's fine
function getAuthorizedRecipientLists(userID, log, callback) {
    let connectionString = process.env.AzureWebJobsStorage;
    let tableService = azureStorage.createTableService(connectionString);
    tableService.createTableIfNotExists('authorizedRecipientLists', function () {
        var query = new azureStorage.TableQuery()
            .top(100)
            .where('PartitionKey eq ?', userID);
        tableService.queryEntities('authorizedRecipientLists', query, null, function (error, result, response) {
            if (error) {
                log(JSON.stringify(error));
                callback([]);
            } else {
                log('Successfully queried authorized recipient lists');
                callback(result.entries.map(function (r) {
                    return {
                        UserID: r.PartitionKey._,
                        RecipientList: r.RowKey._
                    };
                }));
            }
        });
    });
}

function getRecipientListByCode(log, authorizedRecipientLists, code, callback) {
    if (authorizedRecipientLists.length <= 0) {
        callback([]);
    }

    let connectionString = process.env.AzureWebJobsStorage;

    let tableService = azureStorage.createTableService(connectionString);

    tableService.createTableIfNotExists('recipientLists', function () {
        var baseQuery = new azureStorage.TableQuery()
            .top(100);
        var query = baseQuery;
        var isAuthorized = authorizedRecipientLists.filter(function (rl) {
            return rl.RecipientList === 'Any' || rl.RecipientList === code;
        }).length > 0;
	if (!isAuthorized) {
	    callback(null);
	} else {
	    tableService.retrieveEntity('recipientLists', 'prod', code, function (error, result) {
		if (error) {
		    log(JSON.stringify(error));
		    callback(null);
		} else {
		    callback({
			Code: result.RowKey._,
			Name: result.Name._
		    });
		}
	    });
	}
    });
}

function getSMSApiKey(userID, log, callback) {
    let connectionString = process.env.AzureWebJobsStorage;
    let tableService = azureStorage.createTableService(connectionString);

    tableService.createTableIfNotExists('apiKeys', function () {
	tableService.retrieveEntity('apiKeys', 'prod', userID, function (error, result) {
	    if (error) {
		log(JSON.stringify(error));
		callback(null);
	    } else {
		callback({
		    UserID: result.RowKey._,
		    Value: result.Value && result.Value._
		});
	    }
	});
    });
}

function getRecipients(code, log, callback) {
    let connectionString = process.env.AzureWebJobsStorage;
    let tableService = azureStorage.createTableService(connectionString);

    tableService.createTableIfNotExists('recipients', function () {
	var query = new azureStorage.TableQuery()
	    .top(100)
	    .where('PartitionKey eq ?', code);
	tableService.queryEntities('recipients', query, null, function (error, result, response) {
	    if (error) {
		log(JSON.stringify(error));
		callback([]);
	    } else {
		log('Found entries!');
		callback(result.entries.map(function (r) {
		    return {
			Code: r.PartitionKey._,
			Number: r.RowKey._
		    };
		}));
	    }
	});
    });
}

function sendMessage(log, apiKey, sender, message, number) {
    const payload = {
        from: sender,
        to: number.replace(/ /g, ''),
        text: message
    };
    const options = {
        uri: 'https://api.swisscom.com/messaging/sms',
        headers: {
            client_id: apiKey,
            'Content-Type': 'application/json',
            'SCS-Version': '2'
        },
        body: JSON.stringify(payload),
        method: 'POST'
    };
    request(options, function (err, res, body) {
        if (err) {
            log(JSON.stringify(err));
        }
        if (body) {
            log(body);
        }
    });
}


module.exports = function (context, req) {
    context.log('Get recipient lists entry');
    var userID = req.headers['x-ms-client-principal-id'];
    context.log('User ID is ' + userID);

    var code = req.body.code;
    context.log('Code is ' + code);
    var message = req.body.message;

    getAuthorizedRecipientLists(userID, context.log, function (authorizedRecipientLists) {
        getRecipientListByCode(context.log, authorizedRecipientLists, code, function (recipientList) {
	    context.log('Got recipient list ' + JSON.stringify(recipientList));
	    getSMSApiKey(userID, context.log, function (apiKey) {
		if (!apiKey) {
		    context.log('No API key found');
		    context.res = {
			status: 500,
			body: 'No API key found'
		    };
		    context.done();
		} else {
		    context.log(apiKey.Value);
		    getRecipients(code, context.log, function (recipients) {
			for (let recipient of recipients) {
			    sendMessage(context.log, apiKey, 'A friendly sender', message, recipient.Number);
			}
			context.res = {
			    body: recipients
			};
			context.done();
		    });
		}
	    });
        });
    });
};
