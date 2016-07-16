# Chain.js

Chain.js is a pipeline wrap on top of node-mysql. It allows easy pipeling of requests. See examples.

# Setup

```
/**
 * 1. configure your connection pool
 */
var connectionPool = null;
```

First you must give Chain.js a pool of connection. Chain.js will automatically parallelize your requests until the limit of the pool
and free the connection when the requests are done.

# Examples

Let's assume you have a table with blogs posts of users. And each blog post has a field referencing to a user id `uid`.

```
new Chain()
  .query("SELECT * FROM posts")
  /**
   * Here the data looks like this:
   * [
   *    {uid: 1, title: "...", content: ".."},
   *    {uid: 1, title: "...", content: ".."},
   *    {uid: 2, title: "...", content: ".."}
   * ]
   */
  .pipeline("uid", function(done) {
    // You can reuse a chain inside!
    return new Chain()
              .query("SELECT * FROM users WHERE uid=?", [
                uid
              ])
              .replace("user", done);
  })
  /**
   * Now the data looks like this:
   * [
   *    {uid: 1, user: { .. user object for uid 1 .. }, title: "...", content: ".."},
   *    {uid: 1, user: { .. user object for uid 1 .. }, title: "...", content: ".."},
   *    {uid: 2, user: { .. user object for uid 2 .. }, title: "...", content: ".."}
   * ]
   */
  .done(function(data) {
    // data contains the populated request
  });
```

# Licence

MIT Licence.