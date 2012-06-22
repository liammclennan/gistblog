var apiRoot = 'https://api.github.com/',
    request = require('request'),

gist = {
    
    // options      {raw_url: ''}
    // callback     function (err, content)
    read: function (options, callback) {
        request({ url: options.raw_url, json: true }, function (error, response, body) {
            if (error || response.statusCode !== 200) { 
                callback(error);
                return;
            }
            callback(null, body);
        });
    }

};

module.exports = gist;