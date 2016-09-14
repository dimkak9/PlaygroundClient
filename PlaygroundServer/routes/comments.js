var express = require('express');
var ObjectId = require('mongoose').Types.ObjectId; 
var bodyParser   = require('body-parser');

var urlencodedParser = bodyParser.urlencoded({ extended: false })
var router = express.Router();

var m_req;


/* GET place info page. */
router.get('/', function(req, res, next) {
  m_req = req;
  var searchID = req.query.id;
  req.placesDB.findOne({'_id' : new ObjectId(req.query.id)},{ "comments": { "$slice": -10 }}).exec(function (err, result) {
    if (!err) {
      if (result != null) {
        res.render('comments', { 
          comments:result._doc.comments.reverse()
      });
      }
      else {
        res.render('comments', { 
            comments:null
        });
        console.log("comments page: not results"); 
      }
    } else {
     console.log("comments page: object not found"); 
    }
  });
});


router.post('/addComment', urlencodedParser, function(req, res) {
  
  var comment = {
    userid : req.body.userID,
    comment : req.body.comment,
    date : new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
  }

  m_req.placesDB.update({ "_id": req.body.placeID },
    {$addToSet: { comments: comment }},
    {  safe: true, upsert: true},
    function(err, numAffected) {
      if(err) {
        //handle error
      }
      else { 
        //if (numAffected.nModified === 1) {
          //res.redirect('back');
          //res.end(comment);
          res.send(comment);
        //
      }
    }
  );
});


module.exports = router;