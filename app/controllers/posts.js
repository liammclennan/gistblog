var request = require('request'),
  _ = require('underscore'),
  lastGet = new Date(2000,1,1),
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
        var response = '<feed xmlns="http://www.w3.org/2005/Atom"><title>Withouttheloop.com</title>';
        _(this.gists).each(function (gist) {
          response += toEntryNode(gist);
        });
        return response + '</feed>';
      };

      app.respond(feed, {
        format: 'xml'
      });    

      function toEntryNode(gist) {
        return '<entry><title>' + gist.description + '</title><link href="' + gist.url + '" /></entry>';
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
        lastGet = new Date();
        successCallback(app, body);
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
    return { 
      id: gist.id,
      description: gist.description, 
      created_at: new Date(gist.created_at),
      url: 'https://gist.github.com/' + gist.id
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