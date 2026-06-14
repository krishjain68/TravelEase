const express=require("express");
const wrapAsync = require("../utils/wrapAsync");
const router=express.Router();
const User=require("../models/user.js")
const passport=require("passport")
router.get("/signup",(req,res)=>{
    res.render("users/signup.ejs")
})

router.post("/signup",wrapAsync(async(req,res)=>{
    try{
let {username,email,password}=req.body;
const newUser=new User({email,username})
const registeredUser=await User.register(newUser,password);
console.log(registeredUser)
req.flash("success","Welcome to Wanderlust !")
res.redirect("/listings")
    }

catch(e){
    req.flash("error",e.message);
    res.redirect("/signup")
}

}))

router.get("/login",(req,res)=>{

    res.render("users/login.ejs")

})
// routes/user.js (partial)
router.post("/login", (req, res, next) => {
  console.log("POST /login hit - body:", req.body);
  passport.authenticate("local", (err, user, info) => {
    console.log("passport.authenticate callback fired:", !!err, !!user, info);
    if (err) {
      console.error("Passport error:", err);
      req.flash("error", "Internal error during authentication");
      return res.redirect("/login");
    }
    if (!user) {
      console.warn("Auth failed:", info && info.message);
      req.flash("error", info && info.message ? info.message : "Invalid credentials");
      return res.redirect("/login");
    }
    req.logIn(user, (err) => {
      if (err) {
        console.error("req.logIn error:", err);
        req.flash("error", "Login failed");
        return res.redirect("/login");
      }
      console.log("Login success for:", user.username || user.email);
      req.flash("success", "Welcome back to Wanderlust");
      return res.redirect("/listings");
    });
  })(req, res, next);
});


// router.post(
//   "/login",
//   passport.authenticate("local", {
//     failureRedirect: "/login",
//     failureFlash: true,
//   }),
//   async (req, res) => {
//     req.flash("success", "Welcome back to Wanderlust");
//     res.redirect("/listings");
//   }
// );


module.exports=router;