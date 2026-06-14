
const mongoose=require("mongoose");
const review = require("./review");
const Schema=mongoose.Schema;
const Review=require("./review.js")
const listingSchema=new Schema({
title:{
    type:String,
    required : true,
},
description:String,
image: {
    type:String,
    default:"https://images.unsplash.com/photo-1651592708261-ffbd13828a09?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=735",
    set: (v)=>
        v===""
    ?"https://images.unsplash.com/photo-1651592708261-ffbd13828a09?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=735"
    : v,
},
//   image: {
//     filename: {
//       type: String,
//       default: "listingimage",
//     },
//     url: {
//       type: String,
//       default:
//         "https://images.unsplash.com/photo-1651592708261-ffbd13828a09?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=735",
//     },
//   },
price:Number,
location:String,
country:String,
reviews:[
    {
        type:Schema.Types.ObjectId,
        ref:"Review",
    }

],


});

listingSchema.post("findOneAndDelete",async(listing)=>{
if(listing){
await Review.deleteMany({_id:{$in :listing.reviews}})

}




})


const Listing=mongoose.model("Listing",listingSchema);
module.exports=Listing;