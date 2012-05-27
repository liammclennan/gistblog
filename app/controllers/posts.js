var request = require('request'),
  _ = require('underscore');

var Posts = function () {
  this.respondsWith = ['html', 'json', 'xml', 'js', 'txt'];

  this.index = function (req, resp, params) {
    var gistListUrl = 'http://gist.github.com/api/v1/json/gists/liammclennan',
      app = this;

    request({ url: gistListUrl, json:true }, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        app.respond({
          gists: _.chain(body.gists)
            .filter(function (gist) {
              return /blog_.+\.md/.test(gist.files[0]);
            })
            .map(function (gist) {
              return { 
                id: gist.repo,
                description: gist.description, 
                filename: gist.files[0],
                created_at: new Date(gist.created_at),
                url: 'https://gist.github.com/' + gist.repo
              };
            })
            .sortBy(function (gist) {
              return gist.created_at;
            })
            .value()
        });
      }
    });
  };

  this.add = function (req, resp, params) {
    this.respond({params: params});
  };

  this.create = function (req, resp, params) {
    // Save the resource, then display index page
    this.redirect({controller: this.name});
  };

  this.show = function (req, resp, params) {
    this.respond({params: params});
  };

  this.edit = function (req, resp, params) {
    this.respond({params: params});
  };

  this.update = function (req, resp, params) {
    // Save the resource, then display the item page
    this.redirect({controller: this.name, id: params.id});
  };

  this.remove = function (req, resp, params) {
    this.respond({params: params});
  };

};

exports.Posts = Posts;

