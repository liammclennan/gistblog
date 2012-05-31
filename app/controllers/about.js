var request = require('request'),
  _ = require('underscore'),
  lastGet = new Date(2000,1,1),
  cache;

var About = function () {
  this.respondsWith = ['html'];

  	this.index = function (req, resp, params) {
  		this.respond({params: params});
	};
};

exports.About = About;