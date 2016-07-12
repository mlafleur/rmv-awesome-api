const fs = require("fs");
const parseString = require('xml2js').parseString;
const request = require('request');
const moment = require('moment');
const azure = require('azure-storage');

const nconf = require('nconf');
nconf.file({ file: 'config.json' }).env();

exports.getBranchData = (callback) => {
    var contents = fs.readFileSync("./data/branches.json");
    if (callback) callback(JSON.parse(contents));
}

exports.getRmvData = (callback) => {
    request(nconf.get("RMV_FEED"), function (err, response, body) {
        parseString(body, function (err, result) {

            var list = {};
            for (var branchId in result.branches.branch) {
                if (result.branches.branch.hasOwnProperty(branchId)) {
                    var branch = result.branches.branch[branchId];
                    list[branch.town[0]] = {};
                    list[branch.town[0]].Licensing = branch.licensing[0];
                    list[branch.town[0]].Registration = branch.registration[0];
                    list[branch.town[0]].SampleTime = moment.utc().format();
                }
            }
            if (callback) callback(list);
        });
    });
}

exports.recordSample = (callback) => {
    this.getRmvData(function (rmvData) {
        var storageConnectionString = nconf.get("AZURE_STORAGE_CONNECTION_STRING");
        var tableSvc = azure.createTableService(storageConnectionString);
        var entGen = azure.TableUtilities.entityGenerator;

        tableSvc.createTableIfNotExists('rawSample', function (error, result, response) {
            for (var branch in rmvData) {
                var entity = {
                    PartitionKey: entGen.String(branch),
                    RowKey: entGen.String(moment.utc().valueOf().toString()),
                    Licensing: entGen.String(rmvData[branch].Licensing),
                    Registration: entGen.String(rmvData[branch].Registration)
                };

                tableSvc.insertEntity('rawSample', entity, function (error, result, response) {
                    if (!error) {
                        // result contains the ETag for the new entity
                    }
                });

            }

        });

        tableSvc.createTableIfNotExists('registrationSample', function (error, result, response) {
            for (var branch in rmvData) {
                if (rmvData[branch].Registration == 'Closed') continue;

                var entity = {
                    PartitionKey: entGen.String(branch),
                    RowKey: entGen.String(moment.utc().valueOf().toString()),
                    Registration: entGen.String(rmvData[branch].Registration)
                };

                tableSvc.insertEntity('registrationSample', entity, function (error, result, response) {
                    if (!error) {
                        // result contains the ETag for the new entity
                    }
                });

            }
        });

        tableSvc.createTableIfNotExists('licensingSample', function (error, result, response) {
            for (var branch in rmvData) {
                if (rmvData[branch].Licensing == 'Closed') continue;

                var entity = {
                    PartitionKey: entGen.String(branch),
                    RowKey: entGen.String(moment.utc().valueOf().toString()),
                    Licensing: entGen.String(rmvData[branch].Licensing)
                };

                tableSvc.insertEntity('licensingSample', entity, function (error, result, response) {
                    if (!error) {
                        // result contains the ETag for the new entity
                    }
                });

            }

        });

        callback(true);
    });
}

exports.mergeData = (branchData, rmvData, callback) => {
    for (var branch in branchData) {
        // Skip branches with no data returned
        if (!rmvData[branch]) continue;

        branchData[branch].SampleTime = rmvData[branch].SampleTime;

        if (rmvData[branch].Licensing != 'Closed') {
            branchData[branch].Licensing = rmvData[branch].Licensing;
            branchData[branch].LicensingString = moment.duration(rmvData[branch].Licensing).humanize();
        }

        if (rmvData[branch].Registration != 'Closed') {
            branchData[branch].Registration = rmvData[branch].Registration;
            branchData[branch].RegistrationString = moment.duration(rmvData[branch].Registration).humanize();
        }
    }
    if (callback) callback(branchData);

}