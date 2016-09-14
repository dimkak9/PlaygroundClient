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
  req.placesDB.findOne({'_id' : new ObjectId(req.query.id)}).exec(function (err, result) {
    if (!err) {
      if (result != null) {
        res.render('ratingInfo', { 
          rating:result._doc.rating.toFixed(1)
      });
      }
      else {
        res.render('ratingInfo', { 
            rating: 0
        });
        console.log("ratingInfo page: not results"); 
      }
    } else {
     console.log("ratingInfo page: object not found"); 
    }
  });
});


module.exports = router;