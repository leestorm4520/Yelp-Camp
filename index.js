const express=require('express');
const app=express();
const path=require('path');
const mongoose=require('mongoose');
const ejsMate=require('ejs-mate');
const methodOverride=require('method-override');
const Campground=require('./models/campground');
const { resolveSoa } = require('dns');
const ExpressError= require('./utils/ExpressError');
const wrapAsync=require('./utils/wrapAsync');
const Joi=require('joi');
const {campgroundSchema}=require('./schemas');

mongoose.connect('mongodb://localhost:27017/yelp-camp',{
    useNewUrlParser:true,
    useUnifiedTopology:true
})
.then(()=>{
    console.log('Mongo Connection Open!!');
})
.catch(err=>{
    console.log('Error Opening Mongo!');
    console.log(err);
})
;

const db=mongoose.connection;
db.on('error',console.error.bind(console,'connection error:'));
db.once('open',()=>{
    console.log('Database connected');
})

app.engine('ejs', ejsMate);
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));

const validateCampground=(req,res,next)=>{
    const {error}=campgroundSchema.validate(req.body);
    if(error){
        const msg=error.details.map(el=>el.message).join(',')
        throw new ExpressError(msg,400)
    }
    else{
        next();
    }
}


app.get('/',(req,res)=>{
    res.render('home');
})

//Show all camps
app.get('/campgrounds', wrapAsync(async (req,res,next)=>{
    const campgrounds=await Campground.find({});
    res.render('campgrounds/index',{campgrounds});
}))

//Show the form to create new camp
app.get('/campgrounds/new',(req,res)=>{
    res.render('campgrounds/new');
})
//Create a new camp on the server
app.post('/campgrounds', validateCampground, wrapAsync(async (req,res,next)=>{
    // if(!req.body.campground) throw new ExpressError('Invalid Campground Data',400);
    
    const campground=new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}))

//Show a specific camp
app.get('/campgrounds/:id', wrapAsync(async (req,res,next)=>{
    const {id}=req.params;
    const campground= await Campground.findById(id);
    res.render('campgrounds/show',{campground});
}))


//Show the form to edit an existing camp
app.get('/campgrounds/:id/edit', wrapAsync(async (req,res,next)=>{
    const {id}=req.params;
    const campground=await Campground.findById(id);
    res.render('campgrounds/edit', {campground});
}))

//Edit a specific camp on the server
app.put('/campgrounds/:id', validateCampground, wrapAsync(async (req,res,next)=>{
    const {id}=req.params;
    const campground=await Campground.findByIdAndUpdate(id,req.body.campground,{runValidators:true, new:true});
    res.redirect(`/campgrounds/${campground._id}`);
}))

//Delete an existing camp
app.delete('/campgrounds/:id',wrapAsync(async (req,res)=>{
    const {id}=req.params;
    const campground=await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))

app.all('*', (req,res,next)=>{
    next(new ExpressError('Page Not Found',404));
})

app.use((err,req,res,next)=>{
    const {status=500}=err;
    if(!err.message) err.message='Something went wrong';
    res.status(status).render('error',{err});
})
app.listen(3000,()=>{
    console.log('Server on port 3000');
})