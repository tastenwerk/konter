var AuthMiddleware = module.exports = {};

AuthMiddleware.checkDummy = function( req, res, next ){
  console.log('auth dummy');
  next();
}