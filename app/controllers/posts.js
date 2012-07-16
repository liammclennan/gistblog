var request = require('request'),
  _ = require('underscore'),
  gist = require('../../lib/gist'),
  markdown = require('../../lib/markdown'),
  lastGet = new Date(2000,1,1),
  async = require('async'),
  cache;

var Posts = function () {
  this.respondsWith = ['html','atom', 'json'];

  this.feed = function (req, resp, params) {  
    getGists(onGistsRetrieved, this);

    function onGistsRetrieved(app, body) {
      var feed = {
        gists: _.chain(body)
          .filter(isBlogGist)
          .map(toViewModel)
          .sortBy(date)
          .value().reverse()
      };

      feed.toXml = function () {

        var lastUpdated = _.chain(this.gists)
          .max(function (entry) { return entry.updated_at; })
          .value();

        var response = '<?xml version="1.0" encoding="utf-8"?>\n' +
          '<feed xmlns="http://www.w3.org/2005/Atom"><title>Withouttheloop.com</title>\n' +
          '<id>http://withouttheloop.com/</id>\n' +
          '<link rel="self" href="http://withouttheloop.com/feed" />\n' +
          '<updated>' + new Date().toJSON() + '</updated>'; // TODO: how to fix this?

        _(this.gists).each(function (gist) {
          response += toEntryNode(gist);
          response += '\n';
        });
        return response + '</feed>';
      };

      app.respond(feed, {
        format: 'xml'
      });

      function toEntryNode(gistEntry) {
        return '\n<entry>\n<title>' + gistEntry.description + '</title>' +
          '<link  href="' + gistEntry.url + '" />\n' +
          '<id>' + gistEntry.url + '</id>\n' +
          '<content type="html"><![CDATA[' + gistEntry.content_html + ']]></content>\n' +
          '<updated>' + gistEntry.updated_at.toJSON() + '</updated>\n' +
          '<author><name>Liam McLennan</name></author>' +
          '</entry>\n';
      }
    }
  };

  this.index = function (req, resp, params) {
    getGists(onGistsRetrieved, this);

    function onGistsRetrieved(app, body) {
      app.respond({
        gists: _.chain(body)
          .filter(isBlogGist)
          .map(toViewModel)
          .sortBy(date)
          .value().reverse()
      });    
    }

  };

  function getGists(successCallback, app) {
    var gistListUrl = 'https://api.github.com/users/liammclennan/gists',
      age = (new Date() - lastGet) / 60000;

    console.log(age);
    if (age < 5) {
      successCallback(app, cache);
      return undefined;
    } 

    request({ url: gistListUrl, json: true }, function (error, response, body) {
      console.log('get from github');
      if (!error && response.statusCode == 200) {
        cache = body;

        // NOTE: the two arrays must match elements by index, exactly
        var cacheBlogItemArray = _.chain(cache).filter(isBlogGist).toArray().value();
        console.log('cache item array count %s', cacheBlogItemArray.length);
        var asyncTasks = _.chain(body)
          .filter(isBlogGist)
          .map(function (rawGist) { return rawGist.files[_(rawGist.files).keys()[0]].raw_url; })
          .map(function (raw_url) { return async.apply(gist.read, { raw_url: raw_url }); })
          .toArray()
          .value();

        console.log('getting raw markdown for each blog gist');
        async.parallel(asyncTasks, function onGotRawMarkdown(err, items) {
          if (err) {
            console.log("LOG: failed to get raw markdown, using cache. error = %j, items = %j", err);
            successCallback(app, cache);
          }
          else {

            // put the markdown back into the correct items (the cached copy)
            // since async will give us the items in the correct order, we can
            // can use the index to put the HTML content back into the cached item
            _.chain(items).toArray().each(function (content_md, index) {
              cacheBlogItemArray[index].content_html = markdown.convert(content_md);
            });

            lastGet = new Date();
            successCallback(app, body);
          }
        });
      } else {
        console.log("LOG: failed to get gists from github. Using cache.");
        successCallback(app, cache);
      }
    });
  }

  function isBlogGist(gist) {
   var fileName = gist.files[_(gist.files).keys()[0]].filename;
    return /blog_.+\.md/.test(fileName);
  } 

  function toViewModel(gist) {
    var firstFile = gist.files[_(gist.files).keys()[0]];
    return { 
      id: gist.id,
      description: gist.description, 
      created_at: new Date(gist.created_at),
      updated_at: new Date(gist.updated_at),
      url: 'https://gist.github.com/' + gist.id,
      commentsSummaryText: gist.comments > 0 ? gist.comments + ' comments' : 'no comments yet', 
      content_html: gist.content_html,
      raw_url: firstFile.raw_url
    };
  }

  function date(gist) {
    return gist.created_at;
  }

};

exports.Posts = Posts;

// mock request
// request = function(options, callback) {
//   callback(null, { statusCode: 200 }, {
//     gists: [
//       {
//         repo: 1,
//         description: 'blah title',
//         files: ['blog_blah.md'],
//         created_at: new Date().toString()
//       },
//       {
//         repo: 2,
//         description: 'foo title',
//         files: ['blog_foo.md'],
//         created_at: new Date().toString()
//       }
//     ]
//   })
// };