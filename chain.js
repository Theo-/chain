/**
 * Created by theoszymkowiak on 2016-07-16.
 *
 * Chain is a tool to chain sql queries
 * in order to puplate fields easily
 *
 * Chain uses pipelines to populate
 * queries
 *
 * Ex:
 *
 * Chain.new()
 *      .query("SELECT * FROM newsfeed WHERE ?", [arg1])
 *      .pipe("eid", function(eid, done) {
 *
 *      })
 *      .done(function(chained) {
 *      })
 */
 
/**
 * 1. configure your connection pool
 */
var connectionPool = null;

var Chain = function() {
    this.isChain = true;
    this.data = null;
    this.connection = null;
    this.chainCallback = [];

    this.new = function() {
        var newChain = new Chain();
        return newChain;
    }.bind(this);

    this.query = function(query, args) {
        var me = this;

        connectionPool.acquire(function(err, connection) {
            this.connection = connection;

            this.connection.query(
                query,
                args,
                function(err, rows) {
                    me.data = rows;
                    me._next();
                }
            );
        }.bind(this));

        return this;
    }.bind(this);

    this._next = function() {
        // Go to the next callback
        var call = this.chainCallback.shift();
        if(call) {
            call();
        }
    }.bind(this);

    this.pipe = function(key, chain) {
        var me = this;

        me.chainCallback.push(function() {
            console.log("piping");
            var data = me.data;
            var requests = 0;
            var requestsDone = 0;

            for(var i = 0; i < data.length; i++) {
                requests++;
                var row = data[i];

                (function(row, key) {
                    chain(row[key], function(data, newKey) {
                        var key = newKey || key;
                        row[key] = data;
                        requestDone();
                    });
                })(row, key);
            }

            function requestDone() {
                requestsDone++;

                if(requestsDone == requests) {
                    me._next();
                }
            }
        });

        return this;
    }.bind(this);

    this.done = function(callback) {
        var me = this;

        me.chainCallback.push(function() {
            me.connection.release();
            callback(me.data);

            me._next();
        });

        return this;
    }.bind(this);

    this.replace = function(key, callback) {
        var me = this;

        me.chainCallback.push(function() {
            me.connection.release();
            callback(me.data, key);

            me._next();
        });

        return this;
    }.bind(this);

    this.replaceOne = function(key, callback) {
        var me = this;

        me.chainCallback.push(function() {
            me.data = me.data[0];

            me.replace(key, callback);

            me._next();
        });

        return this;
    }.bind(this);
};

module.exports = Chain;