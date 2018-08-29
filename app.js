var express = require("express"),
    app     = express(),
    mongoose = require("mongoose"),
    bodyParser = require("body-parser"),
    methodOverride = require("method-override"),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose");



mongoose.connect("mongodb://localhost/yelp_camp");

var campgroundSchema = new mongoose.Schema({
    name: String,
    image: String,
    description: String,
    cost: Number,
    createdAt: { type: Date, default: Date.now },
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ]
});

var Campground = mongoose.model("Campground", campgroundSchema);

var commentSchema = mongoose.Schema({
    text: String,
    createdAt: { type: Date, default: Date.now },
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    }
});

var Comment = mongoose.model("Comment", commentSchema);

var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    isAdmin: {type: Boolean, default: false}
});

UserSchema.plugin(passportLocalMongoose);

var User = mongoose.model("User", UserSchema);

app.set("view engine","ejs");
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride('_method'));

app.use(require("express-session")({
    secret: "All hails the ZoSo!!!",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    next();
});

app.get("/",function (req,res) {
    res.redirect("/campgrounds");
});

app.get("/campgrounds",function (req,res) {

    Campground.find({}, function(err, allCampgrounds){
        if(err){
            console.log(err);
        } else {
            res.render("index",{campgrounds: allCampgrounds});
        }
    });

});

app.post("/campgrounds",isLoggedIn ,function (req, res) {
    Campground.create(req.body,function (err) {
        if(err) {
            console.log(err);
        } else {
            res.redirect("/campgrounds");
        }
    });
});

app.get("/campgrounds/new",isLoggedIn ,function (req,res) {
    res.render("new");
});

app.get("/campgrounds/:id",function (req,res) {
    Campground.findOne({"_id" : req.params.id}).populate("comments").exec(function (err,foundCampground) {
        if(err) {
            console.log(err);
        } else {
            res.render("show",{campground: foundCampground});
        }
    });
});


app.get("/campgrounds/:id/edit", function (req, res) {
    Campground.findOne({"_id" : req.params.id},function (err, foundCampground) {
        if(err) {
            console.log(err);
        } else {
            res.render("edit",{campground: foundCampground});
        }
    });
});

app.put("/campgrounds/:id",function (req,res) {
    Campground.findOneAndUpdate({"_id" : req.params.id}, {
        name: req.body.name,
        image: req.body.image,
        description: req.body.description,
        cost: req.body.cost
    } ,function (err, foundCampground) {
        if(err) {
            res.redirect("back")
        } else {
            res.redirect(foundCampground._id);
        }
    })
});

app.delete("/campgrounds/:id",function (req,res) {
    Campground.findOneAndDelete({"_id" : req.params.id}, function (err) {
        if (err) {
            res.redirect("back")
        } else {
            res.redirect("/campgrounds");
        }
    });
});

app.get("/campgrounds/:id/comments/new",isLoggedIn ,function (req, res) {
    Campground.findOne({"_id" : req.params.id},function (err, foundCampground) {
        if(err) {
            console.log(err);
        } else {
            res.render("newComment",{campground: foundCampground});
        }
    });
});

app.post("/campgrounds/:id/comments",isLoggedIn ,function (req, res) {
    Campground.findOne({"_id" : req.params.id},function (err, foundCampground) {
        if(err) {
            console.log(err);
        } else {
            Comment.create(req.body,function (err,commentCreated) {
                if(err){
                    console.log(err);
                } else {
                    console.log(commentCreated);
                    commentCreated.save();
                    foundCampground.comments.push(commentCreated._id);
                    foundCampground.save();
                    res.redirect("/campgrounds/"+req.params.id)
                }
            });
        }
    });
});

app.get("/campgrounds/:id/comments/:commentID/edit",function (req, res) {
    Campground.findOne({"_id" : req.params.id},function (err, foundCampground) {
        if(err) {
            console.log(err);
        } else {
            Comment.findOne({"_id" : req.params.commentID},function (err, foundComment) {
                res.render("editComment",{campground: foundCampground, comment: foundComment});
            });
        }
    });
});

app.put("/campgrounds/:id/comments/:commentID",function (req, res) {
    Comment.findOneAndUpdate({"_id" : req.params.commentID}, req.body, function (err) {
        if(err) {
            console.log(err);
        } else {
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

app.delete("/campgrounds/:id/comments/:commentID",function (req, res) {
    Comment.findOneAndDelete({"_id" : req.params.commentID}, function (err) {
        if(err) {
            console.log(err);
        } else {
            res.redirect("/campgrounds/" + req.params.id);
        }
    })
});

app.get("/register",function (req,res) {
    res.render("register");
});

app.post("/register",function (req,res) {
    User.register(new User({username: req.body.username}),req.body.password,function (err, user) {
        if(err) {
            console.log(err);
            res.render("register");
        } else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/campgrounds");
            });
        }
    });
});

app.get("/login",function (req,res) {
    res.render("login");
});

app.post("/login", passport.authenticate("local",
    {
        successRedirect: "/campgrounds",
        failureRedirect: "/login"
    }
) , function (req,res) {
});

app.get("/logout",function (req, res) {
    req.logout();
    res.redirect("/campgrounds");
});

function isLoggedIn(req,res,next) {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

app.listen(3000,process.env.IP,function () {
    console.log("YelpCamp Server has started!! Copyright 2018")
});