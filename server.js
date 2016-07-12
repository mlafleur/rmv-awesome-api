const rmv = require('./lib/rmv.js');
const express = require('express');

var app = express();
var port = process.env.port || 3000

//var branchData;

app.get('/', function (req, res) {
    rmv.getBranchData(function (branchData) {
        rmv.getRmvData(function (rmvData) {
            rmv.mergeData(branchData, rmvData, function (result) {
                res.type('json');
                res.send(JSON.stringify(result, null, 4));
            });
        });
    });
});

app.get('/branches', function (req, res) {
    res.type('json');
    res.send(JSON.stringify(branchData, null, 4));
});

app.get('/rmv', function (req, res) {
    rmv.getRmvData(function (result) {
        res.type('json');
        res.send(JSON.stringify(result, null, 4));
    });
});

app.get('/record', function (req, res) {
    rmv.recordSample(function (result) {
        res.type('json');
        res.send(JSON.stringify(result, null, 4));
    });
});

var server = app.listen(port, function () {
//    rmv.getBranchData(function (data) { branchData = data });
});
