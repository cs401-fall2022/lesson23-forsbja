// var express = require('express');
// var router = express.Router();

// /* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });

// module.exports = router;


var express = require('express');
var router = express.Router();
const sqlite3 = require('sqlite3').verbose()

/* GET home page. */
router.get('/', function (req, res, next) {
  var db = new sqlite3.Database('mydb.sqlite3',
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err) => {
      if (err) {
        console.log("Getting error " + err);
        exit(1);
      }
      //Query if the table exists if not lets create it on the fly!
      db.all(`SELECT name FROM sqlite_master WHERE type='table' AND name='blog'`,
        (err, rows) => {
          if (rows.length === 1) {
            console.log("Table exists!");
            db.all(` select blog_id, blog_txt from blog`, (err, rows) => {
              console.log("returning " + rows.length + " records");
              res.render('index', { title: 'Express', data: rows });
            });
          } else {
            console.log("Creating table and inserting some sample data");
            db.exec(`create table blog (
                     blog_id INTEGER PRIMARY KEY AUTOINCREMENT,
                     blog_txt text NOT NULL);
                      insert into blog (blog_txt)
                      values ('Golly gee I do love to blog for thee!'),
                             ('Check out that gourd!');`,
              () => {
                db.all(` select blog_id, blog_txt from blog`, (err, rows) => {
                  res.render('index', { title: 'Express', data: rows });
                });
              });
          }
        });
    });
});

router.post('/add', (req, res, next) => {
  console.log("Adding new entry to table:");
  var db = new sqlite3.Database('mydb.sqlite3',
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err) => {
      if (err) {
        console.log("Getting error " + err);
        exit(1);
      }
      console.log("inserting " + req.body.blog);
      //Sanitized statements
      var stmt = db.prepare("insert into blog (blog_txt) values (?)")
      stmt.run(req.body.blog);
      stmt.finalize();
      res.redirect('/');
    }
  );
})

router.post('/edit', (req, res, next) => {
  console.log("Updating existing entry:");
  var db = new sqlite3.Database('mydb.sqlite3',
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err) => {
      if (err) {
        console.log("Getting error " + err);
        exit(1);
      }
      console.log("changing " + req.body.blogID + " to "+ req.body.blogContent);
      //Sanitized statements
      var stmt = db.prepare("update blog set blog_txt = ? where blog_id = ?")
      stmt.run(req.body.blogContent,req.body.blogID);
      stmt.finalize();
      res.redirect('/');
    }
  );
})

router.post('/delete', (req, res, next) => {
  console.log("deleting entry:");
  var db = new sqlite3.Database('mydb.sqlite3',
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err) => {
      if (err) {
        console.log("Getting error " + err);
        exit(1);
      }
      console.log("Removing: " + req.body.blog);
      //Sanitized statements
      var stmt = db.prepare('delete from blog where blog_id=?')
      stmt.run(req.body.blog);
      stmt.finalize();    
      res.redirect('/');
    }
  );
})

module.exports = router;