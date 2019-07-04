// ----------------- Node modules ------------

const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const async=require('async');
const assert = require('assert');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const Storage = require('dom-storage');

var sessionStorage = new Storage('./db.json', { strict: false, ws: '  ' });
// ------- Firebase settings --------------

var firebase = require("firebase/app");

// Add the Firebase products that you want to use
require("firebase/auth");
require("firebase/firestore");
require("firebase/database");

const firebaseConfig = {
  apiKey: "AIzaSyDnqgkjVefZFr-jHJqFCHkac-tGOdRwJG4",
  authDomain: "udghoshregistration.firebaseapp.com",
  databaseURL: "https://udghoshregistration.firebaseio.com",
  projectId: "udghoshregistration",
  storageBucket: "",
  messagingSenderId: "83845558524",
  appId: "1:83845558524:web:6b073349da2c723c"
};

firebase.initializeApp(firebaseConfig);

var database = firebase.database();

// ---------- firebase cloud store ---------------

var firestore = firebase.firestore();

// crypto module for random string gen
function encrypt(data, pass) {
  var cipher = crypto.createCipher('aes-256-ecb', pass);
  return cipher.update(data, 'utf8', 'hex') + cipher.final('hex');
};

function conversion(date){
  for(var i = 0; i < date.length; i++){
    if(date[i] == '/'){
      date = date.substr(0 , i) + '-' + date.substr(i + 1);
    }
  };
  return date;
};

// ---------- All setting done --------------

// --------- app settings ---------------
var app = express();
app.set('port', (process.env.PORT));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var server=app.listen(app.get('port'), function(){
  console.log('Server started on port '+app.get('port'));
});

// View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));

// ---------- GET Requests --------------

// udg_champ main website
app.get('/56139fb631d586607a3841992148761f78ae3f31', function(req,res,next){
	res.render('udg_champ');
});

// nossq main page
app.get('/e365d9caf9b7234a92d04292c74c4891befbbf25', function(req,res,next){
  res.render('nossq');
});

// error
app.get('/f62045a5685c29dcc61a2cafae030a68e1389db3', function(req,res,next){
  res.render('404');
});

// brochure
app.get('/525299210b55528ffbd19b7a50a4ef386e208f9d', function(req,res,next){
  res.render('brochure');
});

// CA
app.get('/4b3cdf59227ae23ae6373b6f95f6b7a7b39baf9e', function(req,res,next){
  res.render('CA');
});

// Gallery
app.get('/5e5c68e29abed08823b94f9bf4ad5108514d5100', function(req,res,next){
  res.render('gallery');
});

// Main
app.get('/', function(req,res,next){
  res.render('index');
});

// Main form 1
app.get('/acf00010c0c607c79a42343051745191985078f2', function(req,res,next){
  res.render('index_1', {msg: ''});
});

// Pronights
app.get('/f2adfb77c515a6bd0f82cf3c65ce60654f7f81b6', function(req,res,next){
  res.render('pronights');
});

// Social
app.get('/c6e7f21e897c7313fab5bd1ed06dd234c777e179', function(req,res,next){
  res.render('social');
});

// Team
app.get('/fb250db707f26b867234c570dfe12a67b0b4d71e', function(req,res,next){
  res.render('team');
});

// ---------- POST Requests --------------

// Main registration
app.post('/register', function(req,res,next){

if(req.body.password1 == req.body.password2) {
  uid = encrypt(req.body.name, req.body.password1);

  code = uid.substring(0,6);

  const output = `
    <p>We have recieved your message at ${new Date(Date.now()).toLocaleString()}</p>
    <p>Your one time code is: ${code}</p>
    <p>*This is an automatically generated mail. Please do not reply. For any further queries contact Udgosh core team*</p>`

  let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, 
    auth: {
      user: 'udghoshiitkresponses@gmail.com',
      pass: 'responses1234'
    },
    tls:{
      rejectUnauthorized:false
    }
  });


  let mailOptions = {
      from: '"Udghosh" <udghoshiitkresponses@gmail.com>', 
      to: req.body.mail,//  list of receivers
      subject: 'Message recieved',
      html: output
  };

  nameid = encrypt(req.body.name, "udghosh");

  mailid = encrypt(req.body.mail, "udghosh");

  let ref2 = firestore.collection('udghoshUsernames').doc(nameid);

  let ref = firestore.collection('udghoshMails').doc(mailid);

  let getDoc = ref2.get()
  .then(doc => {
    if (!doc.exists) {

        // unique username
        
        let getDoc = ref.get()
          .then(doc => {
            if (!doc.exists) {

              var item4 = {
                Username : req.body.name
              };
              ref2.set(item4);

              var item3 = {
                Mail : req.body.mail
              };

              // new user
              ref.set(item3).then(function(){
                transporter.sendMail(mailOptions, (error, info) => {
                  if (error) {
                    res.render('index_1', {msg: 'Mail verification failed, Please try again'})
                  }
                  else{
                    res.render('index_3', {msg: 'Verification mail sent.',  name : req.body.name, mail : req.body.mail, password : req.body.password1 })}
                  });
                }).catch(function(error){
                  res.render('index_1', {msg: 'Something went wrong, Please try again later.'});
                });

                }
            else{
              res.render('index_1', {msg: 'Sorry, this Mail Id already Registered.'});
            }
            })
          .catch(err => {
                res.render('index_1', {msg: 'Something went wrong, Please try again later.'});
              });
    }else{
      res.render('index_1', {msg: 'This username already exists, Please try again.'});
    }
  })
  .catch(err => {
      res.render('index_1', {msg: 'Something went wrong, Please try again later.'});
  });

  }else{
        res.render('index_1', {msg: 'The Passwords are inconsistent, Please try again.'});
  };

});

// step 2
app.post('/registerStep2', function(req,res,next){

  var item ={
    Username : req.body.name,
    Mail : req.body.mail,
    password : req.body.password.toString(),
    Contengency_Leader_Name : '',
    Head_Coach : '',
    Contact1: '',
    Contact2: '',
    College: '',
    City: '',
    PIN: '',
    Atheletics : '',
    Badminton : '',
    Cricket : '',
    Volleyball : '',
    Basketball : '',
    Skating : '',
    Chess : '',
    Hockey : '',
    Table_Tennis : '',
    Lawn_Tennis : '',
    Squash : '',
    Kho_Kho : '',
    Handball : '',
    Weightlifting: '',
    Powerlifting: '',
    Activity: 'False',
    Time: conversion(new Date(Date.now()).toLocaleString())
  };

  uid = encrypt(req.body.name, req.body.password);

  truecode = uid.substring(0,6);

  let ref = firestore.collection('udghoshRegisteration').doc(uid);

  let getDoc = ref.get()
  .then(doc => {
    if (!doc.exists) {
      if (truecode == req.body.code){
        ref.set(item).then(function(){
          res.render('index_1', {msg: 'Sucessfully Registered'});
        }).catch(function(error){
          res.render('index_1', {msg: 'Something went wrong, Please try again later.'});
        });
      }
      else{
        res.render('index_1', {msg: 'Verification Code is inconsistent, Please try again.'});
      }
    }else{
        res.render('index_1', {msg: 'Something went wrong, Please try again later.'});

    }
  })
  .catch(err => {
      res.render('index_1', {msg: 'Something went wrong, Please try again later.'});
  });

});

app.post('/login', function(req,res){
  
  // Taking inputs
  var inputusername = req.body.uname;
  var inputuserpassword = req.body.upassword;

  // generating user Id
  uid = encrypt(inputusername, inputuserpassword);

  let ref = firestore.collection('udghoshRegisteration').doc(uid);

  let getDoc = ref.get()
  .then(doc => {
    if (!doc.exists) {

      // no such user exists
      res.render('index_1', {msg: 'User not Found'});

    } else {
        // user exists
        var item2 = {
          Activity : 'True'
        }
        var updates = { password: inputuserpassword };

        var keys = encrypt(inputusername, "udghosh");

        sessionStorage.setItem(keys, updates);

        ref.update(item2).then(function(){

        let getDoc2 = ref.get()
        .then(doc2 => {
      
            var datausers = doc2.data();

            res.render('dashboard', {c_l_n: datausers['Contengency_Leader_Name'],
                                     h_c:  datausers['Head_Coach'],
                                     p_c_n: datausers['Contact1'] ,
                                     a_c_n:  datausers['Contact2'],
                                     c_f_n:  datausers['College'],
                                     e_m_i:  datausers['Mail'],
                                     c_s:  datausers['City'],
                                     p_c:  datausers['PIN'],
                                     at: datausers['Atheletics'],
                                     ba:datausers['Badminton'],
                                     bb:datausers['Basketball'],
                                     fb:datausers['Football'],
                                     hk:datausers['Hockey'],
                                     vb:datausers['Volleyball'],
                                     kk:datausers['Kho_Kho'],
                                     tt:datausers['Table_Tennis'],
                                     lt:datausers['Lawn_Tennis'],
                                     sq:datausers['Squash'],
                                     cs:datausers['Chess'],
                                     wl:datausers['Weightlifting'],
                                     pl:datausers['Powerlifting'],
                                     hk:datausers['Hockey'],
                                     sk: datausers['Skating'],
                                     ck:datausers['Cricket'],
                                     hb:datausers['Handball'],
                                     wdv: encrypt(inputusername, "udghosh")});
            });
  })
  };
  })
  .catch(err => {
    res.render('index_1', {msg: 'Something went wrong, Please try again later.'});
  });
});

// Logout
app.post('/logout', function(req,res,next){
    // key from
    sessionStorage.removeItem(key);
});


// registration details editing rights
app.post('/register_change', function(req,res){

  var item = {};

  if(req.body.c_l_n != ''){
    item['Contengency_Leader_Name'] = req.body.c_l_n;
  };
  if(req.body.h_c != ''){
    item['Head_Coach'] = req.body.h_c;
  };
  if(req.body.c_f_n != ''){
    item['College'] = req.body.c_f_n;
  };
  if(req.body.p_c_n != ''){
    item['Contact1'] = req.body.p_c_n;
  };
  if(req.body.a_c_n != ''){
    item['Contact2'] = req.body.a_c_n;
  };
  if(req.body.c_s != ''){
    item['City'] = req.body.c_s;
  };
  if(req.body.p_c != ''){
    item['PIN'] = req.body.p_c;
  };

  var keys = encrypt(req.body.name, "udghosh");
  var pass = sessionStorage.getItem(keys);

  // generating user Id
  uid = encrypt(req.body.name, pass['password']);

  let ref = firestore.collection('udghoshRegisteration').doc(uid);

  let getDoc = ref.get()
  .then(doc => {
    if (!doc.exists) {

      // no such user exists
      res.render('index_1', {msg: 'Invalid Credentials while updating Registration details'});
      sessionStorage.removeItem(keys);

    } else {
      
      ref.update(item).then(function(){

        let getDoc2 = ref.get()
        .then(doc => {
          var datausers = doc.data();
          res.render('dashboard', {c_l_n: datausers['Contengency_Leader_Name'],
                                     h_c:  datausers['Head_Coach'],
                                     p_c_n: datausers['Contact1'] ,
                                     a_c_n:  datausers['Contact2'],
                                     c_f_n:  datausers['College'],
                                     e_m_i:  datausers['Mail'],
                                     c_s:  datausers['City'],
                                     p_c:  datausers['PIN'],
                                     at: datausers['Atheletics'],
                                     ba:datausers['Badminton'],
                                     bb:datausers['Basketball'],
                                     fb:datausers['Football'],
                                     hk:datausers['Hockey'],
                                     vb:datausers['Volleyball'],
                                     kk:datausers['Kho_Kho'],
                                     tt:datausers['Table_Tennis'],
                                     lt:datausers['Lawn_Tennis'],
                                     sq:datausers['Squash'],
                                     cs:datausers['Chess'],
                                     wl:datausers['Weightlifting'],
                                     pl:datausers['Powerlifting'],
                                     hk:datausers['Hockey'],
                                     sk: datausers['Skating'],
                                     ck:datausers['Cricket'],
                                     hb:datausers['Handball'],
                                     wdv: encrypt(req.body.name, "udghosh")});
        });
  })
  .catch(err => {
    console.log('Error getting document', err);
    sessionStorage.removeItem(keys);
    res.render('index_1', {msg: 'Something went wrong, Please try again later.'});
});
}
});

});

// events change details rights
app.post('/events_change', function(req,res,next){
  var item = {};

  if(req.body.atheletics != ''){
    item['Atheletics'] = req.body.atheletics;
  };

  if(req.body.badminton != ''){
    item['Badminton'] = req.body.badminton;
  };

  if(req.body.football != ''){
    item['Football'] = req.body.football;
  };

  if(req.body.volleyball != ''){
    item['Volleyball'] = req.body.volleyball;
  };

  if(req.body.cricket != ''){
    item['Cricket'] = req.body.cricket;
  };

  if(req.body.skating != ''){
    item['Skating'] = req.body.skating;
  };

  if(req.body.lawn != ''){
    item['Lawn_Tennis'] = req.body.lawn;
  };

  if(req.body.tt != ''){
    item['Table_Tennis'] = req.body.tt;
  };

  if(req.body.squash != ''){
    item['Squash'] = req.body.squash;
  };

  if(req.body.handball != ''){
    item['Handball'] = req.body.handball;
  };

  if(req.body.powerlifting != ''){
    item['Powerlifting'] = req.body.powerlifting;
  };

  if(req.body.weightlifting != ''){
    item['Weightlifting'] = req.body.weightlifting;
  };

  if(req.body.chess != ''){
    item['Chess'] = req.body.chess;
  };

  if(req.body.hockey != ''){
    item['Hockey'] = req.body.hockey;
  };

  if(req.body.basketball != ''){
    item['Basketball'] = req.body.basketball;
  };

  if(req.body.kho != ''){
    item['Kho_Kho'] = req.body.kho;
  };

  var keys = encrypt(req.body.name, "udghosh");
  var pass = sessionStorage.getItem(keys);

  // generating user Id
  uid = encrypt(req.body.name, pass['password']);

  let ref = firestore.collection('udghoshRegisteration').doc(uid);

  let getDoc = ref.get()
  .then(doc => {
    if (!doc.exists) {

      // no such user exists
      res.render('index_1', {msg: 'Invalid Credentials while updating Events details'});
      sessionStorage.removeItem(keys);

    } else {
      
      ref.update(item).then(function(){

        let getDoc2 = ref.get()
        .then(doc => {
          var datausers = doc.data();
          res.render('dashboard', {c_l_n: datausers['Contengency_Leader_Name'],
                                     h_c:  datausers['Head_Coach'],
                                     p_c_n: datausers['Contact1'] ,
                                     a_c_n:  datausers['Contact2'],
                                     c_f_n:  datausers['College'],
                                     e_m_i:  datausers['Mail'],
                                     c_s:  datausers['City'],
                                     p_c:  datausers['PIN'],
                                     at: datausers['Atheletics'],
                                     ba:datausers['Badminton'],
                                     bb:datausers['Basketball'],
                                     fb:datausers['Football'],
                                     hk:datausers['Hockey'],
                                     vb:datausers['Volleyball'],
                                     kk:datausers['Kho_Kho'],
                                     tt:datausers['Table_Tennis'],
                                     lt:datausers['Lawn_Tennis'],
                                     sq:datausers['Squash'],
                                     cs:datausers['Chess'],
                                     wl:datausers['Weightlifting'],
                                     pl:datausers['Powerlifting'],
                                     hk:datausers['Hockey'],
                                     sk: datausers['Skating'],
                                     ck:datausers['Cricket'],
                                     hb:datausers['Handball'],
                                     wdv: encrypt(req.body.name, "udghosh")});
        });
  })
  .catch(err => {
    console.log('Error getting document', err);
    sessionStorage.removeItem(keys);
    res.render('index_1', {msg: 'Some Error occured, Please try again later.'});
});
}
});
});



// --------- forms ---------------


// Send data from form to mail and datbase
app.post("/form_responses",function(req,res){
  const output = `
  <style>
  table, td, th {  
    border: 1px solid #ddd;
    text-align: left;
  }
  
  table {
    border-collapse: collapse;
    width: 100%;
  }
  
  th, td {
    padding: 15px;
  }
  </style>
  <p>We have recieved your message at ${new Date(Date.now()).toLocaleString()}</p>
  <table border="2px">  
    <tr> <th>Name</th><td> ${req.body.name}</td></tr>
    <tr><th>Email</th><td> ${req.body.email}</td></tr>
    <tr><th>Message</th><td> ${req.body.message}</td></tr>
  </table>
  <p>*This is an automatically generated mail. Please do not reply. For any further queries contact Udgosh core team*</p>
 `;
 let transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, 
  auth: {
      user: 'udghoshiitkresponses@gmail.com',
      pass: "responses1234"
  },
  tls:{
    rejectUnauthorized:false
  }
});


let mailOptions = {
    from: '"Udghosh" <udghoshiitkresponses@gmail.com>', 
    to: req.body.email,//  list of receivers
    subject: 'Message Sucessfully recieved',
    html: output
};
// send mail with defined transport object
transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        return console.log(error);
    }
    });
  savemsg(req.body.name, req.body.email, req.body.message,)
  res.redirect("/");
});


function makeid(length) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function savemsg(name, email, password){
    var uid = makeid(16);
    var pos1 = Math.floor(Math.random() * 16);
    var add1 = makeid(2);
    uid = uid.substring(0,pos1) + add1 + uid.substring(pos1);
    var pos2 = Math.floor(Math.random() * 18);
    var add2 = makeid(2);
    uid = uid.substring(0,pos2) + add2 + uid.substring(pos2);

    var date = new Date(Date.now()).toLocaleString();

    for(var i = 0; i < date.length; i++){
      if(date[i] == '/'){
        date = date.substr(0 , i) + '-' + date.substr(i + 1);
      }
    };

    uid = date + uid;

    var newMessageRef= database.ref('forms_responses').child(uid);
    newMessageRef.set({
      name : name,
      date : new Date(Date.now()).toLocaleString(),
      email : email,
      message : password
    });
}

// -------- more post reqs -----------

app.post('/a3d96738d3a6c3c6b1f9571b680ba99c', function(req,res,next){     // dashboard
  // logout code
  
  var key = req.body.rdx;
  sessionStorage.removeItem(key);

  res.redirect('/');      //home
});

app.post('/1378950eae52994823daf87092150d84', function(req,res,next){     // dashboard
  // logout code
  
  var key = req.body.rdx;
  sessionStorage.removeItem(key);
  res.redirect('/e365d9caf9b7234a92d04292c74c4891befbbf25');      //noosq
});
app.post('/278c4289711e58413eb96c52f4256385', function(req,res,next){     // dashboard
  // logout code
  
  var key = req.body.rdx;
  sessionStorage.removeItem(key);
  res.redirect('/56139fb631d586607a3841992148761f78ae3f31');      //udgchamps
});
app.post('/events1', function(req,res,next){     // dashboard
  res.redirect('/events');      //events
});
app.post('/e9d0861b5a2cfbd95c2da252aecc7941', function(req,res,next){     // dashboard
  // logout code
  
  var key = req.body.rdx;
  sessionStorage.removeItem(key);
  res.redirect('/c6e7f21e897c7313fab5bd1ed06dd234c777e179');      //social
});
app.post('/b0615d8ce8ea8d73e33c48103cca252b', function(req,res,next){     // dashboard
  // logout code
  
  var key = req.body.rdx;
  sessionStorage.removeItem(key);
  res.redirect('/4b3cdf59227ae23ae6373b6f95f6b7a7b39baf9e');      //CA
});

app.post('/18c2d8d0e3d6293a44828dc223d66a72', function(req,res,next){     // dashboard
  // logout code
  
  var key = req.body.rdx;
  sessionStorage.removeItem(key);
  res.redirect('/5e5c68e29abed08823b94f9bf4ad5108514d5100');      //gallery
});

app.post('/067488b6cb869ee496849a0dc02fd4a7', function(req,res,next){     // dashboard
  // logout code
  
  var key = req.body.rdx;
  sessionStorage.removeItem(key);
  res.redirect('/f2adfb77c515a6bd0f82cf3c65ce60654f7f81b6');      //pronights
});

app.post('/f0ab7b2ad394d1b39df81b81c759417e', function(req,res,next){     // dashboard
  // logout code
  
  var key = req.body.rdx;
  sessionStorage.removeItem(key);
  res.redirect('/fb250db707f26b867234c570dfe12a67b0b4d71e');      //team
});

app.post('/e558b2c957c59a6c9999d7f54947176e', function(req,res,next){     // dashboard
  // logout code
  
  var key = req.body.rdx;
  sessionStorage.removeItem(key);
  res.redirect('/');      //team
});