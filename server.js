const rmv = require('./lib/rmv.js');

const express = require('express');

var app = express();
var port = process.env.port || 3000


app.get('/', function (req, res) {
    rmv.getAll(function (result) {
        res.type('json');
        res.send(JSON.stringify(result, null, 4));

    });
});

app.get('/branches', function (req, res) {
    rmv.getBranchData(function (result) {
        res.type('json');
        res.send(JSON.stringify(result, null, 4));
    });
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

/*
app.get('/branches/', function (req, res) {
    updateBranchStatus(function (branchList) {
        res.type('json');
        res.send(JSON.stringify(branchList, null, 4));
    });
});
*/

var server = app.listen(port, function () {

    //getBranchList();
});

/*

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


function getRmvData(callback) {
    request('http://www.massdot.state.ma.us/feeds/qmaticxml/qmaticXML.aspx', function (err, response, body) {
        parseString(body, function (err, result) {
            if (callback) callback(result);
        });
    });
}

*/