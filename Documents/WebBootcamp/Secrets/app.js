//jshint esversion:6
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt= require("mongoose-encryption");
const passport = require("passport");
const GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;
mongoose.set('strictQuery', false);
const app = express();

app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));


mongoose.connect('mongodb://127.0.0.1:27017/userDB');

const userSchema= new mongoose.Schema({
  email: String,
  password: String
});

userSchema.plugin(encrypt,{secret: process.env.SECRET, encryptedFields: ["password"]});

const User = new mongoose.model("User", userSchema);

passport.use(new GoogleStrategy({
    clientID:     '277449934367-pq6votdl29od1m7q64928m6jgdkgh3kk.apps.googleusercontent.com',
    clientSecret: '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',
    callbackURL: "http://yourdomain:3000/auth/google/callback",
    passReqToCallback   : true
  },

  function(request, accessToken, refreshToken, profile, done) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return done(err, user);
    });
  }
));

app.get("/", function(req,res){
  res.render("home");
});

app.get("/login", function(req,res){
  res.render("login");
});

app.get("/register", function(req,res){
  res.render("register");
});

app.get('/auth/google',
  passport.authenticate('google', { scope:
      [ 'email', 'profile' ] }
));

app.get( '/auth/google/callback',
	passport.authenticate( 'google', {
		successRedirect: '/auth/google/success',
		failureRedirect: '/auth/google/failure'
}));

app.get( '/auth/google/callback',
    passport.authenticate( 'google', {
        successRedirect: '/auth/google/success',
        failureRedirect: '/auth/google/failure'
}));

app.post("/register",function(req,res){
    const newUser = new User({
      email:req.body.username,
      password:req.body.password
    });
    newUser.save(function(err){
      if(err){
        console.log(err);
      }else{
        res.render("secrets");
      }
    })
});

app.post("/login",function(req,res){
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({email: username}, function(err, foundUser){
    if(err){
      console.log(err);
    }else{
      if(foundUser){
        if(foundUser.password===password){
          res.render("secrets");
        }
      }
    }
  });
});




app.listen(3000,function(){
  console.log("Server started on port 3000.");
});
