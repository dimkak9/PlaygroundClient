var express = require('express');
var path = require('path');
var busboy = require('connect-busboy');
var uuid = require('node-uuid');
var nodemailer = require('nodemailer');
var pgConstants = require("./pgConstants");
var AWS = require('aws-sdk');
var jimp = require("jimp");
var router = express.Router();
var credentialsAS3 = require("./credentialsAS3.jssecure");

router.use(busboy());

AWS.config.update({
    accessKeyId: credentialsAS3.accessKeyId,
    secretAccessKey: credentialsAS3.secretAccessKey
});

var s3 = new AWS.S3();
   

/* GET place info page. */
router.get('/', function(req, res, next) {
  res.render('addPlace', { title: 'addPlace', latitude:req.query.lat, longitude:req.query.lng});
});



router.post('/upload', function(req, res) {
  
  var m_bStep1Finished = false;
  var m_bStep2Finished = false;
  var m_bCountOfEllements = 1;
  
  var m_data = new Object();
  m_data['images'] = new Array();
  m_data['mainImagesPath'] = 'https://s3.amazonaws.com/dimkak9-playground/Places';
  m_data["variation"] = [0,0,0,0,0,0];
  
  req.busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
    
    var unicFileName = uuid.v4() + path.extname(filename);
    
    file.fileRead = [];
    file.on('data', function(chunk) {
      this.fileRead.push ( chunk );
    }).on('end', function() {
      
      m_bCountOfEllements ++;
      // save medium size
      
      m_data['images'].push(unicFileName);
      
      var finalBuffer = Buffer.concat ( this.fileRead );
      
      fff (finalBuffer, mimetype, unicFileName, 'Big', uploadMed);
    });
  }).on('end', function(){
    console.log('END');
  }).on('finish', function(){
      console.log('finish, files uploaded');
      m_bCountOfEllements --;
      m_bStep1Finished = true;
      sendResponceToClient();
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

  function sendResponceToClient() {
    console.log("sendResponceToClient m_bStep1Finished=" + m_bStep1Finished + " m_bStep2Finished=" + m_bStep2Finished);
    if (m_bStep1Finished && m_bStep2Finished) {
      res.send("ваша заявка была отправлена и будет рассмотрена в течении 48 часов. спасибо за участие");
    }
  }
  
  
  function uploadMed(finalBuffer, mimetype, unicFileName) {
    fff(finalBuffer, mimetype, unicFileName, 'Med', uploadSmall);
  }
  
  function uploadSmall(finalBuffer, mimetype, unicFileName) {
    fff(finalBuffer, mimetype, unicFileName, 'Small', onUploadFinished);
  }
  
  function onUploadFinished(finalBuffer, mimetype, unicFileName) {
    m_bCountOfEllements--;
    
    if (m_bCountOfEllements == 0) {
      saveToDB();
    }
  }
  
  
  function fff(finalBuffer, mimetype, unicFileName, size, cb) {
    jimp.read(finalBuffer, function (err, data) {
      if (err) throw err;
      
      if (size != 'Big') {
        data.resize(jimp.AUTO, getSize(size));
      }
           
      data.getBuffer( mimetype, function(err, data) {
        if (err) {
          console.error(err);
        } else {
          //                           //Big   
          sendToS3(data, unicFileName, size, mimetype, cb);  
        }
      });
    });
  }
  
  function getSize(size) {
    var retCode;
    switch (size) {
      case 'Big':
        // code
        break;
      case 'Med':
        retCode = 365;
        break;
      case 'Small':
        retCode = 100;
        break;
    }
    
    return retCode;
  }
  
  
  
  function sendToS3(buffer, filename, suffix, mimetype, cb) {
    console.log("call sendToS3");
    var folderKey = 'Places_' + suffix + '/' + filename;
        
    var fileInst = {
        buffer  : buffer,
        size    : buffer.length,
        filename: filename,
        mimetype: mimetype
    };
    
    var params = { Bucket: credentialsAS3.bucketName, Key: folderKey, Body: fileInst.buffer, ACL: 'public-read' };
  
    s3.putObject(params, function (err, data) {
        
        console.log("s3 complete event err=" + err);
        
        if (err) {
            console.error(err);
        } else {
          console.log("File successfully uploaded to S3");
          //m_bCountOfEllements--;
          
          cb(buffer, mimetype, filename);
        }
    });
  }
  
  
  function saveToDB() {
    
    var place = new req.placesDB();
    
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
        
        m_bStep2Finished = true;
        sendResponceToClient();
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
});


module.exports = router;