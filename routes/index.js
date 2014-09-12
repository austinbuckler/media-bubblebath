var express = require('express');
var router = express.Router();
var fs = require('fs');

//REQUIRE API
var unirest = require('unirest');
var Instagram = require('instagram-node-lib');
var API500px = require('500px');
var twitter = require("node-twitter");
var COLOURlovers = require('colourlovers');
var youtube = require('youtube-feeds');

var file = require('../keys.json');

/*======================================
                          GET API KEYS
======================================*/
//GET API KEYS
var keys = {
  instakey: file.instagram_key,
  instasecret: file.instagram_secret,
  twitkey: file.twitter_key,
  twitsecret:file.twitter_secret,
  twittoken:file.twitter_token,
  twittokensecret:file.twitter_token_secret,
  pxkey:file.px_key
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
//SET 500PX KEY
var api500px = new API500px(keys.pxkey)

/*======================================
                          GET JSON FILES
======================================*/
//GET FILE
var instagramJSON = 'public/json/instagram.json';
var twitterJSON = 'public/json/twitter.json';
var fiveJSON = 'public/json/500px.json';
var colorJSON = 'public/json/color.json';
var soundJSON = 'public/json/sound.json';
var youtubeJSON = 'public/json/youtube.json'

router.get('/', function(req, res) {
  res.render('index', {title:"BUUBLR"});
});

/*======================================
                          CALLBACK FUNCTION
======================================*/
router.post('/', function(req, res) {

  var searchVariable = req.body.searchquery;

  youtube.httpProtocol = 'https';
  youtube.feeds.videos({q:searchVariable,'max-results':3}, function(err, youtubeData){
    if(err){
      console.log(err);
    } else{
      fs.writeFile(youtubeJSON, JSON.stringify(youtubeData,null,4), function (youtubeerr){
        if(youtubeerr instanceof Error){
          return;
        } else {
          console.log('write youtubeJSON');
        }
      });//end fs write
    }
  });

  api500px.photos.searchByTerm(searchVariable, {'sort': 'created_at', 'rpp':'3'}, function(error, fiveData) {
    fs.writeFile(fiveJSON, JSON.stringify(fiveData,null,4),function (err) {
      if(error){
        console.log(error);
      }else{
        if (err) {
          return;
        } else {
          console.log("JSON saved to " + fiveJSON);
        }
      }
    });
  });

  COLOURlovers.get('/palettes', {
    keywords:   searchVariable,
    sortBy:     'ASC',
    numResults: 5
  },function(error, colorData) {
    fs.writeFile(colorJSON, JSON.stringify(colorData,null,4), function (err){
      if(error){
        console.log(error);
      }else{
        if(err){
          return;
        } else {
          //console.log(colorData);
          console.log("JSON saved to" + colorJSON);
        }
      }
    });
  });

  Instagram.tags.recent({
    name: searchVariable,
    complete: function(data){
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
                var fiveData = (JSON.parse(fs.readFileSync('public/json/500px.json', 'utf8')));
                var colorData = (JSON.parse(fs.readFileSync('public/json/color.json', 'utf8')));
                var youtubeData = (JSON.parse(fs.readFileSync('public/json/youtube.json', 'utf8')));
                
                res.render('instagram', {title:"Media BubbleBath", searchTerm:searchVariable, YoutubeData:youtubeData, ColorData:colorData, InstagramData:instaData, TwitterData:twitData, FiveData: fiveData});
               }
             });
           });     
        }
      });
    }
  });









});



module.exports = router;