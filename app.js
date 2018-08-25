var express = require("express"),
    app     = express();

app.set("view engine","ejs");
app.use(express.static(__dirname + "/public"));


app.get("/",function (req,res) {
    res.render("index");
});

app.get("/campgrounds/new",function (req,res) {
    res.render("new");
});

app.get("/show",function (req,res) {
    res.render("show");
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