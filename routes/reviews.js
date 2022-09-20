const express=require('express');
const router=express.Router();
const wrapAsync=require('../utils/ExpressError');
const {reviewSchema}=require('../schemas.js');
const {isLoggedIn}=require('../middleware');

const ExpressError=require('../utils/ExpressError')
const Review=require('../models/review');
const Campground = require('../models/campground');

const validateCampground=(req, res, next)=>{
    const {error}=reviewSchema.validate(req.body);
    if(error){
        const msg=error.details.map(el=>el.message).join(',')
        throw new ExpressError(msg, 400)
    }
    else{
        next();
    }
}


//Create a review
router.get('/', isLoggedIn, validateReview, wrapAsync(async(req, res, next)=>{
    const campground=await campground.findbyId(req.params.id);
    const review=new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Create a review');
    res.redirect(`/campgrounds/${campground._id}`);

}))

//Delete a review
router.get('/:reviewId', isLoggedIn, wrapAsync(async(req, res, next)=>{
    const {id, reviewId}=req.params;
    await Campground.findByIdAndUpdate(id,{pull:{review:reviewId}});
    await Review.findByIdAndDelete(req.params.reviewId);
    req.flash('sucess', 'Delete a review')
    res.redirect(`/campgrounds/${id}`)
}))

module.exports=router