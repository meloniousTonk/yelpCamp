var express = require("express"),
    app     = express();
    mongoose = require("mongoose");
    bodyParser = require("body-parser");
    methodOverride = require("method-override");

mongoose.connect("mongodb://localhost/yelp_camp");

var campgroundSchema = new mongoose.Schema({
    name: String,
    image: String,
    description: String,
    cost: Number,
    createdAt: { type: Date, default: Date.now },
    comments: [
        {
            text: String,
            createdAt: { type: Date, default: Date.now }
        }
    ]
});

var Campground = mongoose.model("Campground", campgroundSchema);

app.set("view engine","ejs");
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride('_method'));

app.get("/",function (req,res) {
    res.redirect("/campgrounds");
});

app.get("/campgrounds",function (req,res) {

    Campground.find({}, function(err, allCampgrounds){
        if(err){
            console.log(err);
        } else {
            console.log(allCampgrounds);
            res.render("index",{campgrounds: allCampgrounds});
        }
    });

});

app.post("/campgrounds",function (req, res) {
    Campground.create(req.body,function (err) {
        if(err) {
            console.log(err);
        } else {
            res.redirect("/campgrounds");
        }
    });
});

app.get("/campgrounds/new",function (req,res) {
    res.render("new");
});

app.get("/campgrounds/:id",function (req,res) {
    Campground.findOne({"_id" : req.params.id},function (err, foundCampground) {
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

app.get("/campgrounds/:id/comments/new",function (req, res) {
    Campground.findOne({"_id" : req.params.id},function (err, foundCampground) {
        if(err) {
            console.log(err);
        } else {
            res.render("newComment",{campground: foundCampground});
        }
    });
});

app.post("/campgrounds/:id/comments",function (req, res) {
    Campground.findOne({"_id" : req.params.id},function (err, foundCampground) {
        if(err) {
            console.log(err);
        } else {
            foundCampground.comments.push(req.body);
            foundCampground.save();
            res.redirect("/campgrounds/"+req.params.id);
        }
    });
});

app.get("/campgrounds/:id/comments/:commentID/edit",function (req, res) {
    Campground.findOne({"_id" : req.params.id},function (err, foundCampground) {
        if(err) {
            console.log(err);
        } else {
            foundCampground.comments.forEach(function (comment) {
                if(comment._id.equals(req.params.commentID)){
                    res.render("editComment",{campground: foundCampground, comment: comment});
                }
            });
        }
    });
});

app.put("/campgrounds/:id/comments/:commentID",function (req, res) {
    Campground.findOne({"_id" : req.params.id},function (err, foundCampground) {
        if(err) {
            console.log(err);
        } else {
            foundCampground.comments.forEach(function (comment) {
                if(comment._id.equals(req.params.commentID)){
                    comment.text = req.body.text;
                    foundCampground.save();
                    res.redirect("/campgrounds/"+req.params.id);
                }
            });
        }
    });
});

app.delete("/campgrounds/:id/comments/:commentID",function (req, res) {
    Campground.findOne({"_id" : req.params.id},function (err, foundCampground) {
        if(err) {
            console.log(err);
        } else {
            foundCampground.comments.forEach(function (comment,i) {
                if(comment._id.equals(req.params.commentID)){
                    foundCampground.comments.splice(i, 1);
                    foundCampground.save();
                    res.redirect("/campgrounds/"+req.params.id);
                }
            });
        }
    });
});

app.get("/login",function (req,res) {
    res.render("login");
});

app.get("/register",function (req,res) {
    res.render("register");
});

app.listen(3000,process.env.IP,function () {
    console.log("YelpCamp Server has started!! Copyright 2018")
});