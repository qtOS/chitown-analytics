var express = require('express');
var router = express.Router();
var http = require('http');
var https = require('https');
// var xml2js = require('xml2js');
// var parser = new xml2js.Parser();
var crime = require('../models/crime')
// var get_https = require("./get_https.js");


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { user: req.user });
});

router.post('/api', function(request, response, next) {
  // Requesting from City of Chicago: Crimes.
  requestResource('https://data.cityofchicago.org/resource/ijzp-q8t2.json?$limit=10000&$order=date&primary_type=HOMICIDE');

  crime.find(function(err, crimes) {
    if (err) {
      returnError(err);
    } else {
      response.json(crimes);
    }
  });
});


// ---------------
// To call: /narcotics?start=mmddyy&end=mmddyy
// ---------------

router.get('/api', function(request, response, next) {

  var primary = parseToCorrectString(request.param('primary').toUpperCase());
  var startPeriodTime = request.param('start');
  var endPeriodTime = request.param('end');

  console.log(primary);

  crime.find(function(error, incidents) {
    if (error) { console.log('items not found.'); };
    var reports = [];
    incidents.forEach(function(incident) {
      if (incident.primary_type == primary) {
        var incident_time = new Date(incident.date);
        if (compareDate(startPeriodTime, endPeriodTime, incident_time) === true) {
          reports.push(incident);
        };
      };
    });
    console.log(reports);
    response.json(reports);
  });
});

router.get('/data', function(request, response, next) {
  console.log(' root.');
  crime.find(function(error, data) {
    if (error) {console.log(error)};
    console.log(data);
    response.json(data);
  });
});

function returnError (error) {
  console.error('Error: ' + error.message);
};

function requestResource (url) {
  var data = "";
  var req = https.get(url, function(response) {
    console.log('Received response: ' + response.statusCode)
    var body = "";
    response.on('data', function (chunk) {
      body += chunk;
    });
    response.on('end', function () {
      if (response.statusCode === 200) {
        data = JSON.parse(body);

        // ---------------
        // For parsing XML.
        // var dajson;
        // var tempXML = parser.parseString(data, function (err, result) {
        //   dajson = result;
        //   console.dir(result);
        //   console.log('Done');
        // });
        // ---------------

        data.forEach(function(entry){
          crime.create(entry, function(error, data) {
            if (error) {console.log(error)};
            console.log('created: ' + data);
          });
        });
      }
      else {
        returnError({message: "Status code: " + http.STATUS_CODES[response.statusCode]});
      }
    });
    req.on("error", returnError);
  });
};


function compareDate (startPeriod, endPeriod, objTime) {
  // console.log(startPeriod + ', ' + endPeriod);
  var startString = startPeriod.substr(4,4) + '-' + startPeriod.substr(0,2) + '-' + startPeriod.substr(2,2) + 'T12:00:00';
  var endString = endPeriod.substr(4,4) + '\-' + endPeriod.substr(0,2) + '\-' + endPeriod.substr(2,2) + 'T12:00:00';
  // console.log(startString + ', ' + endString);
  var startTime = new Date(startString);
  var endTime = new Date(endString);
  // console.log(startTime + ', ' + endTime);

  if (startTime.getTime() <= objTime.getTime() && endTime.getTime() >= objTime.getTime()) {
    return true;
  };
  return false;
};

function parseToCorrectString (something) {
  var newString = '';
  for (var i = 0; i < something.length; i++) {
    if (something[i] == '-') {
      newString = newString + ' ';
    }
    else {
      newString = newString + something[i];
    };
  };
  return newString;
};

module.exports = router;
