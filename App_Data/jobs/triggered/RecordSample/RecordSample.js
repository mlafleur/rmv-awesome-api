const request = require('request'); 
request("http://rmvapi.azurewebsites.net/record", function (err, response, body) { 
    if (err) console.log(err);
    else console.log('Worked');
});