#! /usr/bin/env node

var http = require('http');
var humanize = require('humanize');
var url = require('url');
var async = require('async');
var htmlparser = require('htmlparser2');
var _ = require('underscore');

if(process.argv.length != 3) {
  console.log("Usage: " + process.argv[1] + " <url to opendirectory root>");
  process.exit();
}


process.on('uncaughtException', function(ex) {
  console.log("Something went wrong: tanking on - " + ex);
});

var topUrl = process.argv[2];

var files = [];

var urlsHandled = {};

function getAndQueueLinks(weburl, cb) {
  var parser = new htmlparser.Parser({
    onopentag: function(name, attribs) {
      if(name == 'a' && attribs.href) {
        var urlto = url.resolve(weburl, attribs.href);
        if(urlto.length < topUrl.length) {
          return;
        }
        queue.push({
          url: urlto
        });
      }
    },
    onend: function(){return cb();}
  });

  http.get(weburl, function(res) {
    res.pipe(parser);
  });
}

var queue = async.queue(function(task, cb) {
  if(urlsHandled[task.url]) return cb();


  var u = url.parse(task.url);
  if(url.format(u).length < topUrl.length) return cb();

  console.log("Handling: " + task.url);
  urlsHandled[task.url] = true;

  var req = http.request({
    method: "HEAD",
    path: u.path,
    hostname: u.hostname,
    port: u.port,
  }, function(res) {
    files.push({
      url: task.url,
      headers: res.headers
    });

    if(/^text\/html/.test(res.headers['content-type'])) {
      return getAndQueueLinks(task.url, cb);
    } else {
      return cb();
    }
  });
  req.end();
}, 2);



function printStats() {
  console.log("Stats:");
  console.log("Files: " + files.length);
  console.log("Total size: " + humanize.filesize(files.map(function(f) {
    if(f.headers["content-length"]) {
      return parseInt(f.headers["content-length"]);
    } else {
      return 0;
    }
  }).reduce(function(l,r) { return l + r; })));
  console.log("Size and number by content-type: ");
  var types = _.uniq(_.map(files, function(f) {
    return f.headers["content-type"];
  }));
  types.forEach(function(t) {
    var foftype = _.select(files,function(f){return f.headers["content-type"] == t;});
    console.log("Type: " + t + ", Num: " + foftype.length + ", Size: " + humanize.filesize(foftype.map(function(f){return parseInt(f.headers["content-length"]) || 0; }).reduce(function(l,r){return l+r;})));
  });
}

queue.drain = function(){
  console.log("All done!");
  printStats();
};

queue.push({url: process.argv[2]});
