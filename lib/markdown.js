var md = require("node-markdown").Markdown,
    

markdown = {
    convert: function (input) {
        return md(input);
    }
};

module.exports = markdown;
