var express = require('express');
var router = express.Router();
var ObjectId = require('mongoose').Types.ObjectId; 

   

/* GET place info page. */
router.get('/', function(req, res, next) {
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);
    
  var searchID = req.query.id;
  req.placesDB.findOne({'_id' : new ObjectId(req.query.id)}).exec(function (err, result) {
    if (!err) {
      if (result != null) {
        res.render('placeinfonew', { 
            title: 'Place info'
          , description:result._doc.description
          , placeid:searchID
          , mainImagesPath:result._doc.mainImagesPath
          , variation:result._doc.variation
          , likes:result._doc.likes
          , list:result
          , imagesArr:result._doc.images
          , bUserConnected:req.query.bUserConnected
          , debug:req.query.debug
          ,rating:result._doc.rating.toFixed(1)
      });
      }
      else {
        res.render('placeinfonew', { 
            title: 'Place info'
          , description:'None'
          , placeid:''
          , imagesArr:null
        });
        console.log("not results"); 
      }
    } else {
     console.log("object not found"); 
    }
  });
});

module.exports = router;




