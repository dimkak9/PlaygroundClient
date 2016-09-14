var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');

/* GET users listing. */
router.get('/', function(req, res, next) {
  //res.send('respond with a resource');
  res.render('SendEmail');
});


var transporter = nodemailer.createTransport('smtps://dimkak9%40gmail.com:Mashka44@smtp.gmail.com');
 
// setup e-mail data with unicode symbols 
var mailOptions = {
    from: '"Dima Kraynikov" <dimkak9@gmail.com>', // sender address 
    to: 'dimkak9@gmail.com', // list of receivers 
    subject: 'Playground: New place wass added', // Subject line 
    text: 'Hello world', // plaintext body 
    html: '<b>Hello world</b>' // html body 
};

router.get('/test', function(req, res, next) {
  //res.send('respond with a resource');
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            //return console.log(error);
            res.send(error);
        }
        else 
        {
            res.send('Message sent: ' + info.response);
        }
    });
});
 
// send mail with defined transport object 






module.exports = router;
