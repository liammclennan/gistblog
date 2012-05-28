var request = require('request'),
  _ = require('underscore');

var Posts = function () {
  this.respondsWith = ['html', 'json', 'xml', 'js', 'txt'];

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

  function getGists(successCallback, errorCallback, app) {
    var gistListUrl = 'http://gist.github.com/api/v1/json/gists/liammclennan';
    request({ url: gistListUrl, json: true }, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        successCallback(app, body);
      } else {
        errorCallback(app, body, response);
      }
    });
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