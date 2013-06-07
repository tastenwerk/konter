/**
 * konter
 *
 * a rock solid and small content repository and web framework
 * for complex web projects
 *
 * Copyright 2013 by TASTENWERK
 *
 * License: GPLv3
 *
 */

var nodemailer = require("nodemailer")
  , fs = require('fs')
  , config = require( __dirname + '/../config' );

var mailer = module.exports = {};

/**
 * deliver a new email
 * to the given list of receivers
 *
 * @api public
 */
mailer.deliver = function deliver( options, callback ){
  var smtpTransport = nodemailer.createTransport("SMTP", config.mailerSettings );
  var version = JSON.parse( fs.readFileSync( __dirname+'/../../package.json' ) ).version;

  konter.logger.info('sending mail to: ', options.to );
  konter.logger.info(options.html || options.text);
  var mailOptions = {
      from: config.mailer.from,
      to: options.to,
      subject: options.subject,
      headers: {
        'X-Mailer': 'TASTENbOX sendmail (by TASTENWERK) v'+version
      }
  }
  if( options.html )
    mailOptions.html = options.html;
  if( options.text )
    mailOptions.text = options.text;
  else
    mailOptions.generateTextFromHTML = true;
  if( options.bcc )
    mailOptions.bcc = options.bcc;

  smtpTransport.sendMail(mailOptions, function(err, response){
      smtpTransport.close();
      callback( err, response );
  });
}
