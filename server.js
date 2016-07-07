var express = require('express');
var fs = require("fs");
var request = require('request')
var parseString = require('xml2js').parseString

var app = express();
var port = process.env.port || 3000

var branchList = [];

app.get('/', function (req, res) {

});

app.get('/branches/', function (req, res) {

    fetchRmvData(function (data) {
        for (var branchId in data.branches.branch) {
            if (data.branches.branch.hasOwnProperty(branchId)) {
                var branch = data.branches.branch[branchId];
                branchList[branch.town[0]].Licensing = branch.licensing[0];
                branchList[branch.town[0]].Registration = branch.registration[0];
            }
        }
        res.type('json');
        res.send(JSON.stringify(branchList, null, 4));
    });

});

var server = app.listen(port, function () {
    // Start listening

    var contents = fs.readFileSync("branches.json");
    var jsonContent = JSON.parse(contents);
    branchList = jsonContent;
});

function fetchRmvData(callback) {
    request('http://www.massdot.state.ma.us/feeds/qmaticxml/qmaticXML.aspx', function (err, response, body) {
        parseString(body, function (err, result) {
            callback(result);
        });
    });
}

