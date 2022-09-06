var express = require('express');
var router = express.Router();
let userHelper = require('../helpers/user-helpres')

// middlewear
let verifyUser = (req,res,next)=>{
  if(req.session._BR_USER){
    next()
  }else{
    res.redirect('/sign-in')
  }
}

/* GET home page. */
router.get('/', (req, res)=> {
  res.render('user/home', { title: 'Home | Bristles' });
});

// User Sign Up
router.get('/sign-up',(req,res)=>{
  if(req.session._BR_USER){
    res.redirect('/')
  }else if(req.session.error){
    res.render('user/sign-up',{title : "Sign Up","error":req.session.error})
    req.session.error = false
  }else{
    res.render('user/sign-up',{title : "Sign Up"})
  }
});

router.post('/sign-up',(req,res)=>{
  userHelper.doSignUp(req.body).then((response)=>{
     if(response.emailError){
      req.session.error = "Email Id existed"
      res.redirect('/sign-up')
    }else if(response){
      res.redirect('/sign-in')
    }
  })
});

// User Sign In
router.get('/sign-in',(req,res)=>{
  if(req.session._BR_USER){
    res.redirect('/')
  }else if(req.session.error){
    res.render('user/sign-in',{title : "Sign In","error":req.session.error})
    req.session.error = false
  }else{
    res.render('user/sign-in',{title : "Sign In"})
  }
});

router.post('/sign-in',(req,res)=>{
  userHelper.doSignIn(req.body).then((data)=>{
    if(data.emailError){
      req.session.error = "Invalid email id"
      res.redirect('/sign-in')
    }else if(data.passError){
      req.session.error = "Incorrect password"
      res.redirect('/sign-in')
    }else if(data){
      req.session._BR_USER = data
      res.redirect('/');
    }
  })
});

// User Sign Out

router.get('/sign-out',(req,res)=>{
  req.session._BR_USER = false
  res.redirect('/sign-in')
})

module.exports = router;
