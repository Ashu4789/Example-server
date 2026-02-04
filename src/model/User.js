const mongoose=require('mongoose');

const userSchema=new mongoose.Schema({
    name:{type:String},
    email:{type:String,required:true,unique:true},
    password:{type:String},
    googleId:{type:String,required:false},
    resetOtp: { type: String },
    resetOtpExpiry: { type: Date },
    resetPasswordLastRequestedAt: { type: Date }

});


module.exports =mongoose.model('User',userSchema);