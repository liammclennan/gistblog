var request = require('request'),
  _ = require('underscore'),
  lastGet = new Date(2000,1,1),
  cache;

var Posts = function () {
  this.respondsWith = ['html','atom', 'json'];

  this.feed = function (req, resp, params) {  
    getGists(onGistsRetrieved, onErrorRetrievingGists, this);

    function onGistsRetrieved(app, body) {
      var feed = {
        gists: _.chain(body.gists)
          .filter(isBlogGist) 
          .map(toViewModel)
          .sortBy(date)
          .value().reverse()
      };

      //app.respond('<feed><title>Example feed</title></feed>', {
      app.respond(template, {
        format: 'txt'
      });    

      var template = "<feed> \n        <title>Example Feed</title>\n        <subtitle>A subtitle.</subtitle>\n               \n        <entry>\n                <title>Atom-Powered Robots Run Amok</title>\n                <summary>Some text.</summary>\n                <author>\n                      <name>John Doe</name>\n                      <email>johndoe.example.com</email>\n                </author>\n        </entry>\n \n</feed>";

    }

    function onErrorRetrievingGists(app, body, response) {
      app.respond({
        gists: [{
          id: 0,
          description: 'Github is broken', 
          filename: '',
          created_at: new Date(),
          url: 'https://gist.github.com/'
        }]
      });   
    }

  };

  this.index = function (req, resp, params) {
    getGists(onGistsRetrieved, onErrorRetrievingGists, this);

    function onGistsRetrieved(app, body) {
      app.respond({
        gists: _.chain(body.gists)
          .filter(isBlogGist)
          .map(toViewModel)
          .sortBy(date)
          .value().reverse()
      });    
    }

    function onErrorRetrievingGists(app, body, response) {
      app.respond({
        gists: [{
          id: 0,
          description: 'Github is broken', 
          filename: '',
          created_at: new Date(),
          url: 'https://gist.github.com/'
        }]
      });   
    }

  };

  function getGists(successCallback, errorCallback, app) {
    var gistListUrl = 'http://gist.github.com/api/v1/json/gists/liammclennan',
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
        errorCallback(app, body, response);
      }
    });
  }

  function isBlogGist(gist) {
      return /blog_.+\.md/.test(gist.files[0]);
    }

    function toViewModel(gist) {
      return { 
        id: gist.repo,
        description: gist.description, 
        filename: gist.files[0],
        created_at: new Date(gist.created_at),
        url: 'https://gist.github.com/' + gist.repo
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