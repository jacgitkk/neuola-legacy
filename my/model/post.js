
var mongodb = require('../db');

function Post(post) {
  this.title = post.title;
  this.body = post.body;
  this.author = post.author;
  this.state = post.state;
  this.date = post.date;
  this.catalog = post.catalog;
}

module.exports = Post;

Post.list = function list(catalog, callback) {
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }

    db.collection('posts', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }

      collection.find({catalog: catalog}).toArray(function(err, docs) {
        mongodb.close();
        if (err) {
          callback(err, null);
        } else {
          var posts = [];
          docs.forEach(function(doc, index) {
            var post = new Post(doc);
            posts.push(post);
          });
          callback(err, posts);
        }
      });

    });
  });
};

Post.get = function get(catalog, article, callback) {
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }

    db.collection('posts', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }

      collection.findOne({title: article, catalog: catalog}, 
        function(err, doc) {
          mongodb.close();
          if (doc) {
            var post = new Post(doc);
            callback(err, post);
          } else {
            callback(err, null);
          }
        });

    });
  });
}

Post.prototype.save = function save(callback) {
  var post = {
    title: this.title,
    body: this.body,
    author: this.author,
    date: this.date,
    state: this.state,
    catalog: this.catalog
  };
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }

    db.collection('posts', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }

      collection.ensureIndex(
        {title: post.title, catalog: post.catalog},
        {unique: true},
        function(err) {
          callback(err);
        });

      collection.save(post, {safe:true}, function(err, doc) {
        mongodb.close();
        callback(err);
      });

    });

  });
}