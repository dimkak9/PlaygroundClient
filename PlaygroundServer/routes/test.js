var express = require('express');
var router = express.Router();

/* GET home page. */

var testPrm = 0;

router.get('/', function(req, res, next) {
    
    //var f3_test = f3;
    
    f3(req, res);
    
    
    
    //testPrm++;
    
    //req.ttt = 1;
    
    //f1(req);
    
  //setTimeout(f2, 2000, res, req);
  
});


function f3 (req, res) {
    var temp = 1;
    
    temp++;
    
    //f2();
    
    f4();
    
    function f4() {
        res.render('test', { title: 'Express', prm1: temp + " - " + getDateTime()});
    }
    
    
}


function f2 (req, res) {
    res.render('test', { title: 'Express', prm1: req.ttt + getDateTime()});
}
/*

function f1(req) {
    req.ttt ++;
}
*/

function getDateTime() {

    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return year + ":" + month + ":" + day + ":" + hour + ":" + min + ":" + sec;

}


module.exports = router;
