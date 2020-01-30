// Dependencies
var Discord = require('discord.js');
var client = new Discord.Client();
var moment = require('moment');
var jsonfile = require('jsonfile');
var request = require('request');
var schedule = require('node-schedule');

// Files
var matchDB = './gamehistory.json';
var heroDB = './herolist.json';
var credentials = require('./credentials.json');

// Required variables
var prefix = '!';
var steamID = 105178768;

updateHeroList();
updateRecentMatches(steamID);
var lastMatchID = getLastMatchID();

client.login('').then(atoken => console.log('logged in with token ' + atoken)).catch(console.error);

client.on('ready', () => {
  console.log('ready');
  client.user.setGame("Fornite with CLQ");
});

client.on('error', m => console.log('debug', m));
client.on('reconnecting', m => console.log('debug', m));


// Updates and stores recent matches of chosen player's in gamehistory.json file
function updateRecentMatches(steamID) {
  var url = "https://api.opendota.com/api/players/" + steamID + "/recentMatches";

  request(url, function(error, response, body) {
    var data = JSON.parse(body);
    var matchHistory = [];

    data.forEach(function(entry) {

      // Defining the info which will be put into the currencydb
      var match_id = entry.match_id;
      var player_slot = entry.player_slot;
      var radiant_win = entry.radiant_win;
      var duration = entry.duration;
      var game_mode = entry.game_mode;
      var lobby_type = entry.lobby_type;
      var hero_id = entry.hero_id;
      var kills = entry.kills;
      var deaths = entry.deaths;
      var assists = entry.assists;
      var xpm = entry.xp_per_min;
      var gpm = entry.gold_per_min;
      var last_hits = entry.last_hits;


      // Putting the info from above into an object
      matchHistory = [...matchHistory, {
        match_id,
        player_slot,
        radiant_win,
        duration,
        game_mode,
        lobby_type,
        hero_id,
        kills,
        deaths,
        assists,
        xpm,
        gpm,
        last_hits,
      }]
    });

    // Writing out the updated data into the currencydb (still forEach)
    jsonfile.writeFileSync(matchDB, matchHistory, {
      spaces: 2
    });

  });
}

function updateHeroList(steamID) {
  var url = "https://api.opendota.com/api/heroStats";

  request(url, function(error, response, body) {
    var data = JSON.parse(body);
    var heroList = [];

    data.forEach(function(entry) {

      // Defining the info which will be put into the currencydb
      var hero_id = entry.id;
      var name = entry.localized_name;


      // Putting the info from above into an object
      heroList = [...heroList, {
        hero_id,
        name,
      }]
    });

    // Writing out the updated data into the currencydb (still forEach)
    jsonfile.writeFileSync(heroDB, heroList, {
      spaces: 2
    });

  });
}

function getLastMatchID() {
  var recentMatches = jsonfile.readFileSync(matchDB);
  return recentMatches[0].match_id;
}

function getLastMatchInfo() {
  var recentMatches = jsonfile.readFileSync(matchDB);
  var matchInfo = [];

  matchInfo[0] = recentMatches[0].match_id;
  matchInfo[1] = recentMatches[0].player_slot;
  matchInfo[2] = recentMatches[0].radiant_win;
  matchInfo[3] = recentMatches[0].duration;
  matchInfo[4] = recentMatches[0].game_mode;
  matchInfo[5] = recentMatches[0].lobby_type;
  matchInfo[6] = recentMatches[0].hero_id;
  matchInfo[7] = recentMatches[0].kills;
  matchInfo[8] = recentMatches[0].deaths;
  matchInfo[9] = recentMatches[0].assists;
  matchInfo[10] = recentMatches[0].xpm;
  matchInfo[11] = recentMatches[0].gpm;
  matchInfo[12] = recentMatches[0].last_hits;

  return matchInfo;
}

function heroIDtoName(id) {
  var heroList = jsonfile.readFileSync(heroDB);
  for (var i in heroList) {
    if (heroList[i].hero_id == id) {
      return heroList[i].name;
    }
  }
  return "Hero not found";
}

var updateChannel;
// Discord bot, returning on command
client.on('message', msg => {

  if (msg.content.startsWith('!setChannel')) {
    var args = msg.content.split(/[ ]+/);
    updateChannel = msg.guild.channels.find('name', args[1]);
    msg.channel.send("Update messages will be sent in " + args[1]);

    var j = schedule.scheduleJob('00 * * * * *', function() {
      console.log("Checking for match updates: 00");
      updateRecentMatches(steamID);
      var tempMatchID = getLastMatchID();

      if (tempMatchID !== lastMatchID) {
        sendMatchMessage();
        lastMatchID = tempMatchID;
      }
    });

    var j = schedule.scheduleJob('20 * * * * *', function() {
      console.log("Checking for match updates: 20");
      updateRecentMatches(steamID);
      var tempMatchID = getLastMatchID();

      if (tempMatchID !== lastMatchID) {
        sendMatchMessage();
        lastMatchID = tempMatchID;
      }
    });

    var j = schedule.scheduleJob('40 * * * * *', function() {
      console.log("Checking for match updates: 40");
      updateRecentMatches(steamID);
      var tempMatchID = getLastMatchID();

      if (tempMatchID !== lastMatchID) {
        sendMatchMessage();
        lastMatchID = tempMatchID;
      }
    });
  }

  if (msg.content.startsWith('!forceMessage')) {
    sendMatchMessage();
  }

  function sendMatchMessage() {
    var matchInfo = getLastMatchInfo();

    // Defining the info which will be put into the currencydb
    var match_id = matchInfo[0];
    var player_slot = matchInfo[1];
    var radiant_win = matchInfo[2];
    var duration = matchInfo[3];
    var game_mode = matchInfo[4];
    var lobby_type = matchInfo[5];
    var hero_id = matchInfo[6];
    var kills = matchInfo[7];
    var deaths = matchInfo[8];
    var assists = matchInfo[9];
    var xpm = matchInfo[10];
    var gpm = matchInfo[11];
    var last_hits = matchInfo[12];

    var gameWon;
    console.log(player_slot);
    console.log(radiant_win);
    //Check if the player won or lost the game
    if ((player_slot < 100) & (radiant_win == true)) {
      console.log('x');
      gameWon = "true";
    } else if ((player_slot < 100) & (radiant_win == false)) {
      gameWon = "false";
      console.log('x2');
    } else if ((player_slot > 100) & (radiant_win == true)) {
      gameWon = "false";
      console.log('x3');
    } else if ((player_slot > 100) & (radiant_win == false)) {
      gameWon = "true";
      console.log('x4');
    } else {
      gameWon = "error";
    }

    var minutes = Math.floor(duration / 60);
    var seconds = duration - minutes * 60;

    var embed;
    console.log(gameWon);
    if (gameWon == "true") {
      embed = new Discord.RichEmbed()
        .setColor(0x00FF1E)
        .setDescription(':yum:' + ' BSJ **WON** a game as ' + heroIDtoName(hero_id) +
      '\n\n**Kills: **' + kills + ' **Deaths:** ' + deaths + ' **Assists:** ' + assists +
      '\n**GPM: **' + gpm + " **XPM: **" + xpm + " **CS: **" + last_hits +
      '\n**Duration: **' + minutes + ' minutes | **Game ID: ** ' + match_id +
      '\n\n[OpenDota Link](https://www.opendota.com/matches/' + match_id + ')');
    }

    else if (gameWon == "false") {
      embed = new Discord.RichEmbed()
        .setColor(0xFF0000)
        .setDescription(':cold_sweat:' + ' BSJ **LOST** a game as ' + heroIDtoName(hero_id) +
      '\n\n**Kills: **' + kills + ' **Deaths:** ' + deaths + ' **Assists:** ' + assists +
      '\n**GPM: **' + gpm + " **XPM: **" + xpm + " **CS: **" + last_hits +
      '\n**Duration: **' + minutes + ":" + seconds + ' | **Game ID: ** ' + match_id +
      '\n\n[OpenDota Link](https://www.opendota.com/matches/' + match_id + ')');
    }

    updateChannel.send(embed);
    console.log("Just sent a match update.");

  }
});
