var azureStorage = require('azure-storage');

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

function getRecipientListsByAuthorized(log, authorizedRecipientLists, callback) {
    if (authorizedRecipientLists.length <= 0) {
	callback([]);
    }

    let connectionString = process.env.AzureWebJobsStorage;

    let tableService = azureStorage.createTableService(connectionString);

    tableService.createTableIfNotExists('recipientLists', function () {
	var baseQuery = new azureStorage.TableQuery()
	    .top(100);
	var query = baseQuery;
	var hasAny = authorizedRecipientLists.filter(function (rl) {
	    return rl.RecipientList === 'Any';
	}).length > 0;
	var i;
        var queryString = '';
        if (!hasAny) {
            for (i = 0; i < authorizedRecipientLists.length; i += 1) {
                queryString += 'RowKey eq \'' + authorizedRecipientLists[i] + '\'';
                if (i < authorizedRecipientLists.length - 1) {
                    queryString += ' OR ';
                }
            }
            query = query.where(queryString);
        }
	tableService.queryEntities('recipientLists', query, null, function (error, result, response) {
	    if (error) {
		log(JSON.stringify(error));
		callback([]);
	    } else {
		callback(result.entries.map(function (e) {
		    return {
			Code: e.RowKey._,
			Name: e.Name && e.Name._
		    };
		}));
	    }
	});
    });
}

module.exports = function (context, req) {
    context.log('Get recipient lists entry');
    var userID = req.headers['x-ms-client-principal-id'];
    context.log('User ID is ' + userID);

    getAuthorizedRecipientLists(userID, context.log, function (authorizedRecipientLists) {
	getRecipientListsByAuthorized(context.log, authorizedRecipientLists, function (recipientLists) {
	    context.res = {
		body: recipientLists
	    };
	    context.done();
	});
    });
};
