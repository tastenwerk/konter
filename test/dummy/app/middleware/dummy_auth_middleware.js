var DummyAuth = module.exports = {
  
  check: function( req, res, next ){
    console.log('check');
    next();
  }

}