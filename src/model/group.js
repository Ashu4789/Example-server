const mongoose=require('mongoose');

const userSchema=new mongoose.Schema({
    name:{type:String,required:true},
    description:{type:String,required:false},
    adminEmail:{type:String,required:true},
    creatAt:{type:Date,default:Date.now()},
    membersEmail:[String],
    thumbnail:{type:String,require:false},
    paymentStatus:{
        amount:Number,
        currency:String,
        date:Date,
        isPaid:Boolean
    }

});


module.exports =mongoose.model('Group',userSchema);