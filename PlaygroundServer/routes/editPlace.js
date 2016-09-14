var express = require('express');
var path = require('path');
var busboy = require('connect-busboy');
var uuid = require('node-uuid');
var nodemailer = require('nodemailer');
var pgConstants = require("./pgConstants");
var AWS = require('aws-sdk');
var ObjectId = require('mongoose').Types.ObjectId; 


var router = express.Router();
router.use(busboy());

var m_req;
var m_data;

var bucketName = 'dimkak9-playground';
var AWSAccessKeyId = 'AKIAJZXFDL23SW5VRLCA';
var AWSSecretKey = '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';

AWS.config.update({
    accessKeyId: AWSAccessKeyId,
    secretAccessKey: AWSSecretKey
});

var s3 = new AWS.S3();
   

/* GET place info page. */
router.get('/', function(req, res, next) {
  m_req = req;
  
  req.placesDB.findOne({'_id' : new ObjectId(req.query.id)}).exec(function (err, result) {
    if (!err) {
      if (result != null) {
        res.render('editPlace', { 
          description : result.toObject().description,
          title:        'editPlace', 
          placeID :     m_req.query.id,
          latitude :    result.toObject().latitude, 
          longitude :   result.toObject().longitude,
          variation :   result.toObject().variation,
          images:       result.toObject().images,
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
  
  
  
  
  //res.render('editPlace', { title: 'editPlace', placeID:m_req.query.id});
});


router.post('/upload', function(req, res) {
  
  m_data = new Object();
  m_data['images'] = new Array();
  m_data['mainImagesPath'] = 'https://s3.amazonaws.com/dimkak9-playground/Places/';
  m_data["variation"] = [0,0,0,0,0,0];
  
  req.busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
    
    var unicFileName = uuid.v4() + path.extname(filename);
    
    file.fileRead = [];
    file.on('data', function(chunk) {
      this.fileRead.push ( chunk );
    }).on('end', function() {
      var folderKey = 'Places/' + unicFileName;
      
      var finalBuffer = Buffer.concat ( this.fileRead );

      var fileInst = {
          buffer  : finalBuffer,
          size    : finalBuffer.length,
          filename: filename,
          mimetype: mimetype
      };
      
      var params = { Bucket: bucketName, Key: folderKey, Body: fileInst.buffer, ACL: 'public-read' };

      s3.putObject(params, function (err, data) {

          if (err) {
              console.error(err);
          } else {
            console.log("File successfully uploaded to S3");
          }
      });
    });
  }).on('end', function(){
    console.log('END');
  }).on('finish', function(){
      console.log('finish, files uploaded');
      saveToDB(res);
  }).on('field', function(fieldname, val, fieldnameTruncated, valTruncated) {
    switch (fieldname) {
      case 'description':
      //case 'rating':
      case 'latitude':
      case 'longitude':
        m_data[fieldname] = val;
        break;
        
      case 'type0':
      case 'type1':
      case 'type2':
      case 'type3':
      case 'type4':
      case 'type5':
        m_data["variation"][fieldname.substring(4)] = 1;
        break;
        
      default:
        console.log('Field [' + fieldname + ']: value: ' + val);
        break;
    }
  });
  
  req.pipe(req.busboy);
});


function saveToDB(res) {
  
  var place = new m_req.placesDB();
  
  place.latitude = m_data['latitude'];
  place.longitude = m_data['longitude'];
  place.description = m_data['description'];
  place.images = m_data['images'];
  place.mainImagesPath = m_data['mainImagesPath'];
  place.variation = m_data['variation'];
  
  place.rating = 0;
  place.placeStatus = pgConstants.PLACESTATUS_NEW;
  place.creationDate = new Date();
  place.lastModifiedDate = new Date();//.toISOString().replace(/T/, ' ').replace(/\..+/, '');
  
  place.save( function(err) {
    // we've saved the dog into the db here
    if (err) {
      res.send(err); 
    }
    else {
      
      sendEmail(place._id);
      
      //res.redirect('back');
      res.send("ваша заявка была отправлена и будет рассмотрена в течении 48 часов. спасибо за участие");
      //res.send(200);
      //res.end();
    }
  });
  
  return;
}


function sendEmail(id) {
  var transporter = nodemailer.createTransport('smtps://dimkak9%40gmail.com:Mashka44@smtp.gmail.com');
 
// setup e-mail data with unicode symbols 
  var mailOptions = {
      from: '"Dima Kraynikov" <dimkak9@gmail.com>',     // sender address 
      to: 'dimkak9@gmail.com',                          // list of receivers   
      subject: 'Playground: New place wass added',      // Subject line 
      text: 'New place wass added (id = "' + id + '")', // plaintext body 
      html: 'New place wass added (id = "' + id + '")'  // html body 
  };

  //res.send('respond with a resource');
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
        return console.log(error);
    }
    
    console.log('Message sent: ' + info.response);
  });
}


module.exports = router;