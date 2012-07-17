var marked = require('marked'),
	request = require('request'),

markdown = {

	convertViaGithub: function (markdown, callback) {
		// see http://developer.github.com/v3/markdown/
		var url = 'https://api.github.com/markdown';
		
		var postBody = { text: markdown,
			mode: "gfm",
			context: "liammclennan"
		};

		request.post({url: url, json: postBody }, function (err, resp, body) {

			if (err || resp.statusCode != 200) {
				return callback(new Error('Failed to convert markdown, resp.statusCode = ' + resp.statusCode));
			}

			callback(null, body);
		});
	},

    convert: function (input) {
        return marked(input);
    }
};

module.exports = markdown;
