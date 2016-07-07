var express = require('express');
var fs = require("fs");
var request = require('request')
var parseString = require('xml2js').parseString

var app = express();
var port = process.env.port || 3000

var branchList = [];

app.get('/branches/', function (req, res) {
    updateBranchStatus(function (branchList) {
        res.type('json');
        res.send(JSON.stringify(branchList, null, 4));
    });
});

var server = app.listen(port, function () {
    getBranchList();
});


function updateBranchStatus(callback) {
    getRmvData(function (data) {
        for (var branchId in data.branches.branch) {
            if (data.branches.branch.hasOwnProperty(branchId)) {
                var branch = data.branches.branch[branchId];
                branchList[branch.town[0]].Licensing = branch.licensing[0];
                branchList[branch.town[0]].Registration = branch.registration[0];
            }
        }
        callback(branchList);
    });
}

function getBranchList(callback) {
    var contents = fs.readFileSync("branches.json");
    branchList = JSON.parse(contents);
    if (callback) callback(branchList);
}

function getRmvData(callback) {
    request('http://www.massdot.state.ma.us/feeds/qmaticxml/qmaticXML.aspx', function (err, response, body) {
        parseString(body, function (err, result) {
            if (callback) callback(result);
        });
    });
}

