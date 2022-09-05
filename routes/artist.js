var express = require('express');
var router = express.Router();
let artistHelper = require('../helpers/artist-helpers')

// middlewear
let verifyArtist = (req,res,next)=>{
  if(req.session._BR_ARTIST){
    next()
  }else{
    res.redirect('/artist/sign-in')
  }
}

/* GET home page. */
router.get('/', (req, res)=> {
  res.render('artist/overview', { title: 'Overview | Bristles' });
});

// User Sign Up
router.get('/sign-up',(req,res)=>{
  if(req.session._BR_ARTIST){
    res.redirect('/artist')
  }else if(req.session.error){
    res.render('artist/sign-up',{title : "Sign Up","error":req.session.error})
    req.session.error = false
  }else{
    res.render('artist/sign-up',{title : "Sign Up"})
  }
});

router.post('/sign-up',(req,res)=>{
  artistHelper.doSignUp(req.body).then((response)=>{
     if(response.emailError){
      req.session.error = "Email Id existed"
      res.redirect('/artist/sign-up')
    }else if(response){
      res.redirect('/artist/sign-in')
    }
  })
});

// User Sign In
router.get('/sign-in',(req,res)=>{
  if(req.session._BR_ARTIST){
    res.redirect('/artist')
  }else if(req.session.error){
    res.render('artist/sign-in',{title : "Sign In","error":req.session.error})
    req.session.error = false
  }else{
    res.render('artist/sign-in',{title : "Sign In"})
  }
});

router.post('/sign-in',(req,res)=>{
  artistHelper.doSignIn(req.body).then((data)=>{
    console.log(data);
    if(data.emailError){
      req.session.error = "Invalid email id"
      res.redirect('/artist/sign-in')
    }else if(data.passError){
      req.session.error = "Incorrect password"
      res.redirect('/artist/sign-in')
    }else if(data){
      req.session._BR_ARTIST = data
      res.redirect('/artist');
    }
  })
});

// User Sign Out

router.get('/sign-out',(req,res)=>{
  req.session._BR_ARTIST = false
  res.redirect('/artist/sign-in')
})

module.exports = router;
