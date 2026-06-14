const express=require("express")
const app=express();
const mongoose=require("mongoose");

const Listing=require("./models/listing.js");
const path=require("path");
const methodoverride=require("method-override")
const ejsMate=require("ejs-mate");
const wrapAsync=require("./utils/wrapAsync.js")

const ExpressError=require("./utils/ExpressError.js")
const session=require("express-session")
const flash=require("connect-flash")
const passport=require("passport")
const LocalStrategy=require("passport-local")
const User=require("./models/user.js")
const { listingSchema, reviewSchema }=require("./schema.js")
const Review=require("./models/review.js");
// add this to app.js (temporary)
const UserModel = require("./models/user");


const listingRouter=require("./routes/listing.js")
const reviewRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js")

const MONGO_URL='mongodb://127.0.0.1:27017/wanderlust';
main()
.then(()=>{
    console.log("connected to db")
})
.catch((err)=>{
    console.log(err)
})

async function main() {
  await  mongoose.connect(MONGO_URL);
}
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodoverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

const sessionOptions={
    secret:"mysupersecretstring",
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now() + 7*24*60*60*1000,
        maxAge: 7*24*60*60*1000,
        httpOnly:true,

    }
};

app.get("/", (req, res) => {
  console.log("Root hit — redirecting to /listings");
  res.redirect("/listings");
});



app.use(session(sessionOptions))
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())

passport.use(User.createStrategy());


passport.serializeUser(User.serializeUser())

passport.deserializeUser(User.deserializeUser())

app.use((req,res,next)=>{
res.locals.success=req.flash("success"),
res.locals.error=req.flash("error"),
next()

})
// temporary debug route - remove after testing
app.get("/debug-auth", async (req, res) => {
  const username = req.query.u || "krish jain";
  const password = req.query.p || "1234";
  console.log("DEBUG AUTH check for:", username, password);

  const authenticate = User.authenticate(); // returns a verify function
  authenticate(username, password, (err, user, options) => {
    console.log("DEBUG AUTH callback fired");
    console.log("err:", err);
    console.log("user:", user);
    console.log("options:", options);
    if (err) return res.status(500).send({ err });
    if (!user) return res.status(401).send({ ok: false, message: options && options.message });
    return res.send({ ok: true, user: { username: user.username, email: user.email } });
  });
});
// --- DEBUG 1: direct findOne test ---
app.get("/debug-find", async (req, res) => {
  try {
    const username = req.query.u || "krish jain";
    console.log("DEBUG FIND - looking for:", username);
    const user = await User.findOne({ username }).exec();
    console.log("DEBUG FIND - result:", !!user, user ? { username: user.username, _id: user._id } : null);
    return res.send({ ok: true, found: !!user, user: user ? { username: user.username, email: user.email } : null });
  } catch (e) {
    console.error("DEBUG FIND ERROR:", e);
    return res.status(500).send({ ok: false, error: e.message });
  }
});

// --- DEBUG 2: call model.authenticate() but also guard with timeout ---
app.get("/debug-auth-time", (req, res) => {
  const username = req.query.u || "krish jain";
  const password = req.query.p || "1234";
  console.log("DEBUG AUTH-TIME start for:", username, password);
  const authenticate = User.authenticate();

  const start = Date.now();
  let called = false;
  // safety fallback
  const to = setTimeout(() => {
    if (!called) {
      console.warn("DEBUG AUTH-TIME: callback not fired within 12s — probably very slow.");
      return res.status(504).send({ ok: false, message: "Auth callback timeout (12s)" });
    }
  }, 12000);

  authenticate(username, password, (err, user, info) => {
    called = true;
    clearTimeout(to);
    const took = Date.now() - start;
    console.log(`DEBUG AUTH-TIME callback fired (took ${took} ms)`);
    console.log("err:", err);
    console.log("user:", !!user, user ? { username: user.username, _id: user._id } : null);
    console.log("info:", info);
    if (err) return res.status(500).send({ ok: false, err: err.message, took });
    if (!user) return res.status(401).send({ ok: false, message: info && info.message, took });
    return res.send({ ok: true, user: { username: user.username, email: user.email }, took });
  });
});


// app.get("/demouser",async(req,res)=>{
// let fakeUser=new User({
// email:"student@gmail.com",
// username:"delta-student"

// })
// let registeredUser=await User.register(fakeUser,"helloworld");
// res.send(registeredUser);


// })
app.use("/listings",listingRouter)

app.use("/listings/:id/reviews",reviewRouter)

app.use("/",userRouter)
// app.get("/testListing",async(req,res)=>
// {
// let samplelisting=new Listing({
// title:"my new villa",
// description:"by the beach",
// price:1200,
// location:"calangute,goa",
// country:"India",


// });
//  await samplelisting.save();
//  console.log("sample was saved")
//  res.send("succesfull testing")


//     });
// add near top, after app.use(express.urlencoded(...)) and before routes


app.use((req,res,next)=>{
    next(new ExpressError(404,"Page not found"));
})

app.use((err,req,res,next)=>{
let {statusCode=500,message="something went wrong"}=err;
 res.status(statusCode).render("error.ejs",{err})
// res.status(statusCode).send(message);

    
})
app.listen(8080,()=>{
    console.log("app is listening at port 8080");
})