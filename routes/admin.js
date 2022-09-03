var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/sign-in', (req, res, next)=> {
  res.send('respond with a admin');
});

module.exports = router;
