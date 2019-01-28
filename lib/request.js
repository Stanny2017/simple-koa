const url = require('url')

module.exports = {


    /**
     * Get the request URL 
     */

    get url() {
        return this.req.url
    },

    /**
     * Get parsed query-string
     * 
     * @return {Object}
     */

    get query() {
        return url.parse(this.req.url, true).query
    }
}