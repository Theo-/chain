# Chain.js

Chain.js is a pipeline wrap on top of node-mysql. It allows easy pipelining of requests. See examples.

# Setup

```javascript
/**
 * 1. configure your connection pool
 */
var connectionPool = null;
```

First you must give Chain.js a pool of connection. Chain.js will automatically parallelize your requests up to the limit of the pool
and free the connections one by one when the requests are done.

# Examples

### 1. Linking user to posts

Let's assume you have a table with blogs posts of users. And each blog post has a field referencing to a user id `uid`.

```javascript
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
  .pipe("uid", function(uid, done) {
    // You can reuse a chain inside!
    return new Chain()
              .query("SELECT * FROM users WHERE uid=?", [
                uid
              ])
              .replaceOne("user", done);
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

### 2. Linking posts to users

Now let's do it the other way around!

```javascript
new Chain()
  .query("SELECT * FROM users")
  /**
   * Here the data looks like this:
   * [
   *    {firstName: 'a', lastName: 'b' .. },
   *    {firstName: 'c', lastName: 'd' .. },
   *    {firstName: 'e', lastName: 'f' .. },
   * ]
   */
  .pipe("uid", function(uid, done) {
    // You can reuse a chain inside!
    return new Chain()
              .query("SELECT * FROM posts WHERE uid=?", [
                uid
              ])
              .replace("posts", done);
  })
  /**
   * Now the data looks like this:
   * [
   *    {firstName: 'a', lastName: 'b' .., posts: [ .. posts .. ] },
   *    {firstName: 'c', lastName: 'd' .., posts: [ .. posts .. ] },
   *    {firstName: 'e', lastName: 'f' .., posts: [ .. posts .. ] },
   * ]
   */
  .done(function(data) {
    // data contains the populated request
  });
```

# Licence

MIT Licence.