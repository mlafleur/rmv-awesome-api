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
        var tableSvc = azure.createTableService(nconf.get("AZURE_STORAGE_ACCOUNT"), nconf.get("AZURE_STORAGE_ACCESS_KEY"));
        tableSvc.createTableIfNotExists('mytable', function (error, result, response) {
            if (!error) {
                // Table exists or created
                var batch = new azure.TableBatch();
                for (var branch in rmvData) {

                    var sample = {
                        PartitionKey: { '_': branch },
                        RowKey: { '_': moment.utc() }
                    };

                    if (rmvData[branch].licensing == 'Closed') sample.Licensing = -1;
                    else sample.Licensing = rmvData[branch].licensing;

                    if (rmvData[branch].registration == 'Closed') sample.Registration = -1;
                    else sample.Registration = rmvData[branch].registration;

                    batch.insertEntity(sample, { echoContent: true });
                }
            
                tableSvc.executeBatch('mytable', batch, function (error, result, response) {
                    if (!error) {
                        // Batch completed
                        callback(result);
                    }
                });
            }    
        });
    });
}

exports.getAll = (callback) => {
    var me = this;
    me.getBranchData(function (branchData) {
        me.getRmvData(function (rmvData) {
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
        });
    });

}