const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// SAFE import that works for all builds of passport-local-mongoose
let passportLocalMongoose = require("passport-local-mongoose");
passportLocalMongoose = passportLocalMongoose.default || passportLocalMongoose;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  }, 
   username: {
    type: String,
    required: true,
    unique: true
  },


});


userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
