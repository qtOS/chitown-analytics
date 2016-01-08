var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var Mapinfo = new Schema({
  primarycrime: String,
  subcrime: String,
  timeStart: String,
  timeEnd: String
});

var Account = new Schema({
  username: String, //required names for passport
  password: String, //required names for passport
  email: String,
  map: [Mapinfo]
});

Account.plugin(passportLocalMongoose);

module.exports.Account = mongoose.model('Account', Account);
module.exports.Mapinfo = mongoose.model('Mapinfo', Mapinfo);
