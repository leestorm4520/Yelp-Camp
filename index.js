const express=require('express');
const app=express();
const path=require('path');
const mongoose=require('mongoose');
const ejsMate=require('ejs-mate');
const session=require('express-session');
const flash=require('flash');
const methodOverride=require('method-override');
const ExpressError= require('./utils/ExpressError');
const wrapAsync=require('./utils/wrapAsync');
const passport=require('passport');
const LocalStrategy=require('passport-local');
const User=require('./models/user');

const userRoutes=require('./routes/users');
const campgroundRoutes=require('./routes/campgrounds');
const reviewRoutes=require('./routes/reviews');

mongoose.connect('mongodb://localhost:27017/yelp-camp',{
    useNewUrlParser:true,
    useUnifiedTopology:true,
    useCreateIndex:true,
    userFindAndModify:false
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
app.use(express.static(path.join(__dirname, 'public')))

const sessionConfig={
    secret:'thissecretshallneverbefound',
    resave:false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true,
        expires:DataTransfer.now()+1000*60*60*24*7,
        maxAge:1000*60*60*24*7
    }
}

app.use(session(sessionConfig));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session);
passport.use(new LocalStratregy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializedUser);


app.use((req, res, next)=>{
    console.log(req.session());
    res.locals.currentUser=req.user;
    res.locals.success=req.flash('success');
    res.locals.error=req.flash('error');
    next();
})

app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)


app.get('/', (req, res)=>{
    res.render('home')
})

app.all('*', (req,res,next)=>{
    next(new ExpressError('Page Not Found',404));
})

app.use((err,req,res,next)=>{
    const {status=500}=err;
    if(!err.message) err.message='Something went wrong';
    res.status(status).render('error',{err});
})
app.listen(3001,()=>{
    console.log('Server on port 3001');
})