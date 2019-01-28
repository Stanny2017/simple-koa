module.exports = {

    /**
     * Get response body
     * 
     * @return {Mixed}
     */

    get body() {
        return this.res.body
    },

    /**
     * Set response body
     * 
     * @param {String|Buffer|Object|Stream} val
     */

    set body(val) {
        this.res.write(val)
    },

    /**
     * Get response status code 
     * 
     * @return {number}
     */

    get status() {
        return this.res.status
    },

    /**
     * Set response status code
     * 
     * @param {number} val
     */

    set status(code) {
        this.res.status = code
    }
}