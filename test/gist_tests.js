var request = require('request'),
    gist = require('../lib/gist'),
    assert = require('assert');

describe('gist', function () {

    describe('read gist', function () {
        it('should do stuff', function (done) {
            gist.read({raw_url: 'https://gist.github.com/raw/2959428/af07255ee103d18607ef4c620048a75a6107aabd/blog_hosted_backbone_server.md'}, function (err, content) {
                assert.ok(content.length > 0 && /Hosted Backbone.js Server/.test(content));
                done();
            });   
        });
    });
    
})