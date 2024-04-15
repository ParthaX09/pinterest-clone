var express = require('express');
var router = express.Router();

const userModel = require('./users');
const postModel = require('./posts');
const passport = require('passport');
const upload = require('./multer');

const localStrategy = require('passport-local');
// const { route } = require('../app');
passport.use(new localStrategy(userModel.authenticate()));

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.get('/login', function(req, res, next) {
  res.render('login', {error: req.flash('error') });
});

router.get("/feed", function(req, res, next){
  res.render('feed');
});


router.post('/upload', isLoggedIn, upload.single('file') , async function(req, res, next){
  if(!req.file){
    return res.status(404).send("no files were given");
  }

  //the file uploaded save it as a post, give the postid to user and the userid to post
  const user = await userModel.findOne({username: req.session.passport.user});
  const post = await postModel.create({
    image: req.file.filename,
    imageText :req.body.filecaption,
    user: user._id
  });

  user.posts.push(post._id);
  await user.save();
  res.redirect('/profile');
});


router.post("/register", function(req, res){
  const { username, email, fullname} = req.body;
  const userData = new userModel({username, email, fullname});

  userModel.register(userData, req.body.password)
  .then(function(){
    passport.authenticate("local")(req, res, function(){
      res.redirect("/profile");
    });
  });
});

router.get('/profile', isLoggedIn ,async function(req, res, next){
  const user = await userModel.findOne({
    username: req.session.passport.user
  })
  .populate('posts')
  res.render("profile", {user});
});


router.post("/login", passport.authenticate("local", {
  successRedirect: "/profile",
  failureRedirect: "/login",
  failureFlash: true     //when there is a failure in logging the page then the flash messages is shown this return a response to the login route 
}), function(req, res){
  
});


router.get("/logout", function(req, res){
  req.logout(function(err){
    if(err){ return next(err); }
    res.redirect('/');
  });
});


function isLoggedIn(req, res, next){
  if(req.isAuthenticated()) return next();
  res.redirect('/login');
}








// router.get('/createuser', async function(req, res, next) {
//   let createduser = await userModel.create({
//     username: 'harsh',
//     password: 'harsh',
//     posts: [],
//     email: 'harsh@male.com',
//     fullname: 'Harsh Vandana Sharma'
//   });

//   res.send(createduser);
// });


// router.get('/createpost', async function(req, res, next) {
//   let createdpost = await postModel.create({
//     postText: "Hello everyone",
//     user: "66197a7bb2997db96ee16649"              
//   })
//   let user = await userModel.findOne({ _id: "66197a7bb2997db96ee16649"});
//   user.posts.push(createdpost._id);
//   await user.save();
//   res.send("DONEEEEEE....");
// });


// router.get("/allusers", async function(req, res, next){
//   let user = await userModel.findOne({_id: "66197a7bb2997db96ee16649"});
//   res.send(user);
// });




module.exports = router;
