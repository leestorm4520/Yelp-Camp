const mongoose=require('mongoose');
const Review=require('./review');
const Schema=mongoose.SchemaType;

const UserSchema=new Schema({
    username: String,
    password:String,
    userEmail:String,
    reviews:[
        {
            type:Schema.Types.ObjectId,
            ref:'Review'
        }
    ]
});