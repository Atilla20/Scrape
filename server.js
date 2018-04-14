var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

var PORT = process.env.PORT || 3000;

//Scraping tools
var axios = require("axios");
var cheerio = require("cheerio");

// Requiring the models
var db = require("./models");

//Initializing Express
var app = express();

//Configuring middleware

//Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({extended: true}));

//Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

//If deployed use the deployed database. Otherwise use the local one. 
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/scrape";

//Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI, {
    useMongoClient: true
});


// A GET route for scraping the echoJS website
app.get("/scrape", function(req, res) {
    //First, we grab the body of the html with request
    axios.get("http://www.echojs.com/").then(function(response) {
        var $ = cheerio.load(response.data);

        //grab every h2 within an article tag, and do the following:
        $("article h2").each(function(i, element) {
            //Save an empty result object
            var result = {};

            //Add text and href of every link, and save them as propertie
            result.title = $(this)
                .children("a")
                .text();
            result.link = $(this)
                .children("a")
                .attr("href");

            //Create a new article using the result object
            db.Article.create(result)
                .then(function(dbArticle) {
                    //View the added result in the console
                    console.log(dbArticle);
                })
                .catch(function(err) {
                    //throw error
                    return res.json(err);
                });
        });
        //If Scrape was successful then send message: 
        res.send("Scrape Complete");
    });
});

//Route for retrieving articles
app.get("/articles", function(req, res) {
   db.Article.find({})
   .then(function(dbArticle) {
       res.json(dbArticle);
   })
   .catch(function(err) {
       res.json(err);
   });
});

app.get("/articles:id", function(req, res) {
    //Using id, prepare query that finds the matching one in db
    db.Article.findOne({_id: req.params.id})
    //.. and then bring the notes that are associated with that particular article
    .populate("note")
    .then(function(dbArticle) {
        res.json(dbArticle);
    })
    .catch(function(err) {
        res.json(err);
    });
});

app.post("/articles/:id", function(req,res) {
    //Create a new note 
    db.Note.create(req.body)
        .then(function(dbNote) {
            returndb.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new:true });
        })
        .then(function(dbArticle) {
            res.json(dbArticle);
        })
        .catch(function(err) {
            res.json(err);
    });
});



//Start the server
app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
});