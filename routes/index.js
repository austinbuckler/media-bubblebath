var express = require('express');
var router = express.Router();
var fs = require('fs');
var Instagram = require('instagram-node-lib');
var Flickr = require("node-flickr");
var twitter = require("node-twitter");

var file = require('../keys.json');

//GET API KEYS
var keys = {
  instakey: file.instagram_key,
  instasecret: file.instagram_secret,
  twitkey: file.twitter_key,
  twitsecret:file.twitter_secret,
  twittoken:file.twitter_token,
  twittokensecret:file.twitter_token_secret
};

//SET INSTAGRAM KEY
Instagram.set('client_id', keys.instakey);
Instagram.set('client_secret', keys.instasecret);

//SET TWITTER KEYS
var twitterCli = new twitter.SearchClient(
  keys.twitkey,
  keys.twitsecret,
  keys.twittoken,
  keys.twittokensecret
);

//GET FILE
var instagramJSON = 'public/json/instagram.json';
var twitterJSON = 'public/json/twitter.json';

router.get('/', function(req, res) {
  res.render('index', {title:"Media BubbleBath"});
});


router.post('/', function(req, res) {

  var searchVariable = req.body.searchquery;

  Instagram.tags.recent({
    name: searchVariable,
    complete: function(data){
      console.log(data);

      fs.writeFile(instagramJSON, JSON.stringify(data, null, 4), function(err) {
        if(err) {
          console.log(err);
        } else {
           twitterCli.search({'q':searchVariable}, function(err, twitResult) {
             fs.writeFile(twitterJSON, JSON.stringify(twitResult, null, 4), function(err) {
               if(err) {
                 console.log(err);
               } else {
                var instaData = (JSON.parse(fs.readFileSync('public/json/instagram.json', 'utf8')));
                var twitData = (JSON.parse(fs.readFileSync('public/json/twitter.json', 'utf8')));
                
                res.render('instagram', {title:"Media BubbleBath", searchTerm:searchVariable, InstagramData:instaData, TwitterData:twitData});
               }
             });
           });
            
        }
      });
    }
   });





});



module.exports = router;