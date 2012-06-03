var About = function () {
  this.respondsWith = ['html'];

  	this.index = function (req, resp, params) {
  		this.respond({params: params});
	};
};

exports.About = About;
