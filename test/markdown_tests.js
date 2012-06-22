var markdown = require('../lib/markdown'), 
    assert = require('assert'),
    content = "Hosted Backbone.js Server\n==========================\n\nThis morning I published my [zero-config backbone.js server](https://gist.github.com/2956872). \n\nIt is an in-memory, restful server that implements the protocol required by Backbone.js, which is basically the same as couchdb except that 'create' returns the new id. As such it can be used for any purpose requiring temporary resource persistence. The service provides no durability at all. If it restarts all of the data is lost.\n\nI'm now running a public instance at http://withouttheloop.com:3002. It works on my machine, don't blame me if it crashes your space shuttle. No warranty of any kind. Obviously. \n\nTo use with backbone set your model or collection's url property to `http://withouttheloop.com:3002/[yourresourcetype]`. Have a look at [this jsfiddle](http://jsfiddle.net/ynkJE/24/). If you run the example and look in Chrome's developer tools networking tab you will see:\n\n### Request\n\n```\nPOST /books HTTP/1.1\nHost: withouttheloop.com:3002\n```\n\n### Response\n\n```\nHTTP/1.1 200 OK\nX-Powered-By: Express\n\n{\"title\":\"Midnight in the garden of good and evil\",\"author\":\"John Berendt\"}\n```\n\nThe model is persisted to the hosted backbone server. \n\nThe set of supported operations (which match those required by backbone.js) is:\n\nCreate\n------\n\n```\n$ curl -X POST http://withouttheloop.com:3002/people -H \"Content-Type: application/json\" -d '{\"name\": \"Bob\", \"age\":\"28\"}'\n\n=> {id: 1}\n```\n\nUpdate\n------\n\nBob had a birthday\n\n```\n$ curl -X PUT http://withouttheloop.com:3002/people/1 -H \"Content-Type: application/json\" -d '{\"name\": \"Bob\", \"age\":\"29\", \"id\": 1}'\n\n=> OK\n```\n\nRead the Collection\n-------------------\n\n```\n$ curl http://withouttheloop.com:3002/people -H \"Content-Type: application/json\"\n\n=> [{\"name\":\"Jane\",\"age\":\"32\",\"id\":0},{\"name\":\"Bob\",\"age\":\"29\", \"id\":1}]\n```\n\nRead a Resource\n---------------\n\n```\n$ curl http://withouttheloop.com:3002/people/1 -H \"Content-Type: application/json\"\n\n=> {\"name\":\"Bob\",\"age\":\"29\", \"id\":1}\n```\n\nDestroy\n-------\n\n```\n$ curl -X DELETE http://withouttheloop.com:3002/people/1 -H \"Content-Type: application/json\"\n\n=> OK\n```";

describe('markdown', function () {

    describe('transform', function () {
        
        it('should convert markdown to html', function () {
            var converted = markdown.convert(content);
            assert.ok(converted.length && /<h1>Hosted Backbone.js Server<\/h1>/.test(converted));
        });
    
    });

});