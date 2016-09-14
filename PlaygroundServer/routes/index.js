var express = require('express');
var router = express.Router();
var fileSystem = require('fs');
var path = require('path');
var XmlWriter = require('simple-xml-writer').XmlWriter;


function createDocument(result, response) {
  var data = new XmlWriter(function(el) {
    el('kml', function(el, at) {
      at('xmlns', 'http://www.opengis.net/kml/2.2');
      el('Document', function(el, at) {
        el('name', 'KmlFile');
        el('Style', function(el, at) {
          at('id', 'west_campus_style')
          el('IconStyle', function(el, at) {
            el('Icon', function(el, at) {
              el('href', 'http://playthelariver.com/wp-content/uploads/icon_playground.png');
            });
          });
          el('BalloonStyle', function(el, at) {
            el ('bgColor', 'ffff00');
            el ('textColor', 'fffffff');
            el('text', function(el, at, text) {
                text('$[iframe]');
            });
            el ('displayMode', 'default');
          });
        });
        result.forEach(function (element, index, array) {
          el('Placemark', function(el, at) {
              el ('name', 'Play ground ' + index);
              el ('styleUrl', '#west_campus_style');
              el ('description', function(el, at, text) {
                  text(element.description);
              });
              el ('ExtendedData', function(el, at, text) {
                  el ('Data', function(el, at) {
                    at('name', 'iframe')
                    el ('value', function (el, at, text) {
                      text("id=" + element._id);
                    });
                  });
              });
             el ('Point', function(el, at, text) {
                el ('coordinates', function (el, at, text) {
                  text(element.longitude);
                  text(', ');
                  text(element.latitude);
                  text(', 0');
                });
              });
            });
          })
      });
    });
  }, { addDeclaration: true });

  fileSystem.open("readme.kml", "w", 0644, function(err, file_handle) {
    if (!err) {
        // Записываем в конец файла readme.txt фразу "Copyrighted by Me"
        // при открытии в режиме "a" указатель уже в конце файла, и мы передаём null
        // в качестве позиции
        fileSystem.write(file_handle, data, null, 'utf8', function(err, written) {
            if (!err) {
                console.log('Всё прошло хорошо');
                // 
                
                sendKmlFile(response);
            } else {
                console.log('Произошла ошибка при записи');
            }
        });
    } else {
        // Обработка ошибок при открытии
    }
  });
}


function sendKmlFile (response) {
    var filePath = path.join(__dirname, '/../bin/readme.kml');
    var stat = fileSystem.statSync(filePath);
    
    response.writeHead(200, {
      'Content-Type': 'application/vnd.google-earth.kml+xml',
      'Content-Length': stat.size,
      'Content-Disposition': 'attachment; filename=readme.kml'
    });
    
    var readStream = fileSystem.createReadStream(filePath);
    readStream.pipe(response);
}

var m_req
/* GET home page. */
router.get('/', function(req, res, next) {
  m_req = req;
  var debugPrm = 0;
  if (req.query.debug != undefined) {
    debugPrm = req.query.debug;
  }
  
  var showAllPrm = 0;
  if (req.query.showall != undefined) {
    showAllPrm = req.query.showall;
  }
  
  res.render('index', { title: 'Playground', debug:debugPrm, showall:showAllPrm});
});


/* GET test page. */
router.get('/places', function(req, res, next) {
  
    var lat = req.query.lat;
    var lng = req.query.lng;
    var zoom = req.query.zoom;
    var mapWidth = req.query.mapWidth;
    var mapHeight = req.query.mapHeight
    
    if (typeof lat != 'undefined' && typeof lng != 'undefined' && typeof zoom != 'undefined') {   
      
      var latitudeLoc = lat;
      var longitudeLoc = lng;
      var radiusW = getZoomRatio(zoom)*mapWidth/120000/2;
      var radiusH = getZoomRatio(zoom)*mapHeight/140000/2;
      
      req.placesDB.find(
        {
          latitude:{$gte: (latitudeLoc - radiusW), $lte:(Number(latitudeLoc) + Number(radiusW))},
          longitude:{$gte: (longitudeLoc - radiusH), $lte:(Number(longitudeLoc) + Number(radiusH))},
          //placeStatus:{$ne:(req.query.showall == "1" ? "" : "new")}
        }
      ).exec(function (err, result) {
        if (!err) {
          console.log("!!!!!!! OK !!!!!!!!!!\n" + result.length);
          
          createDocument(result, res);
          
        } else {
          console.log("!!!!!!! NO !!!!!!!!!!\n" + err);
        }
      });
    }
    else
    {
      //response.end("OK!!!")
      res.render('error', { title: 'Error'});
    }
});

function getZoomRatio(i_zoom) {
  var retVal;
  switch (i_zoom) {
    case '0': retVal = 156367.87; break;
    case '1': retVal = 78183.93; break;
    case '2': retVal = 39091.97; break;
    case '3': retVal = 19545.98; break;
    case '4': retVal = 9772.99; break;
    case '5': retVal = 4886.50; break;
    case '6': retVal = 2443.25; break;
    case '7': retVal = 1221.62; break;
    case '8': retVal = 610.81; break;
    case '9': retVal = 305.41; break;
    case '10': retVal = 152.70; break;
    case '11': retVal = 76.35; break;
    case '12': retVal = 38.18; break;
    case '13': retVal = 19.09; break;
    case '14': retVal = 9.54; break;
    case '15': retVal = 4.77; break;
    case '16': retVal = 2.39; break;
    case '17': retVal = 1.19; break;
    case '18': retVal = 0.60; break;
    default:  console.error('getZoomRatio: uncknown zoom size' + i_zoom);  break;
  }
  
  return retVal;
}


router.post('/like', function(req, res) {
  
    m_req.placesDB.update({ "_id": req.query.placeID },
      {$addToSet: { likes: req.query.userID }},
      {  safe: true, upsert: true},
      function(err, numAffected) {
        if(err) {
          //handle error
        }
        else { 
          if (numAffected.nModified === 1) {
            res.end(req.query.userID);
          }
        }
      }
    );
});


router.post('/dislike', function(req, res) {
  
    m_req.placesDB.update({ "_id": req.query.placeID },
      {$pull: { likes: req.query.userID }},
      {  safe: true, upsert: true},
      function(err, numAffected) {
        if(err) {
          //handle error
        }
        else { 
          if (numAffected.nModified === 1) {
            res.end(req.query.userID);
          }
        }
      }
    );
});


module.exports = router;