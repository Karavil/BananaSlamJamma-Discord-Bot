function createLobby() {
  var steam = require("steam"),
    util = require("util"),
    fs = require("fs"),
    crypto = require("crypto"),
    dota2 = require("../"),
    steamClient = new steam.SteamClient(),
    steamUser = new steam.SteamUser(steamClient),
    steamFriends = new steam.SteamFriends(steamClient),
    Dota2 = new dota2.Dota2Client(steamClient, true);


  var onSteamLogOn = function onSteamLogOn(logonResp) {
      if (logonResp.eresult == steam.EResult.OK) {
        steamFriends.setPersonaState(steam.EPersonaState.Busy); // to display your steamClient's status as "Online"
        steamFriends.setPersonaName(global.config.steam_name); // to change its nickname
        util.log("Logged on.");
        Dota2.launch();
        Dota2.on("ready", function() {
          console.log("Node-dota2 ready.");


          Dota2.createPracticeLobby({
              "game_name": "node-dota2",
              "server_region": dota2.ServerRegion.PERFECTWORLDTELECOM,
              "game_mode": dota2.schema.lookupEnum('DOTA_GameMode').values.DOTA_GAMEMODE_AR,
              "series_type": 2,
              "game_version": 1,
              "allow_cheats": false,
              "fill_with_bots": false,
              "allow_spectating": true,
              "pass_key": "password",
              "radiant_series_wins": 0,
              "dire_series_wins": 0,
              "allchat": true
            },
            function(err, body) {
              console.log(JSON.stringify(body));
            });
          setTimeout(function() {
            Dota2.leavePracticeLobby(function(err, body) {
              console.log(JSON.stringify(body));
            });
          }, 60000);

        });
        Dota2.on("unready", function onUnready() {
          console.log("Node-dota2 unready.");
        });
        Dota2.on("chatMessage", function(channel, personaName, message) {
          // util.log([channel, personaName, message].join(", "));
        });
        Dota2.on("guildInvite", function(guildId, guildName, inviter) {
          // Dota2.setGuildAccountRole(guildId, 75028261, 3);
        });
        Dota2.on("unhandled", function(kMsg) {
          util.log("UNHANDLED MESSAGE " + dota2._getMessageName(kMsg));
        });
        // setTimeout(function(){ Dota2.exit(); }, 5000);
      }
    },
    onSteamServers = function onSteamServers(servers) {
      util.log("Received servers.");
      fs.writeFile('servers', JSON.stringify(servers), (err) => {
        if (err) {
          if (this.debug) util.log("Error writing ");
        } else {
          if (this.debug) util.log("");
        }
      });
    },
    onSteamLogOff = function onSteamLogOff(eresult) {
      util.log("Logged off from Steam.");
    },
    onSteamError = function onSteamError(error) {
      util.log("Connection closed by server: " + error);
    };

  steamUser.on('updateMachineAuth', function(sentry, callback) {
    var hashedSentry = crypto.createHash('sha1').update(sentry.bytes).digest();
    fs.writeFileSync('sentry', hashedSentry)
    util.log("sentryfile saved");
    callback({
      sha_file: hashedSentry
    });
  });
}



// Login, only passing authCode if it exists
var logOnDetails = {
  "account_name": global.config.steam_user,
  "password": global.config.steam_pass,
};
if (global.config.steam_guard_code) logOnDetails.auth_code = global.config.steam_guard_code;
if (global.config.two_factor_code) logOnDetails.two_factor_code = global.config.two_factor_code;

try {
  var sentry = fs.readFileSync('sentry');
  if (sentry.length) logOnDetails.sha_sentryfile = sentry;
} catch (beef) {
  util.log("Cannae load the sentry. " + beef);
}

steamClient.connect();
steamClient.on('connected', function() {
  steamUser.logOn(logOnDetails);
});
steamClient.on('logOnResponse', onSteamLogOn);
steamClient.on('loggedOff', onSteamLogOff);
steamClient.on('error', onSteamError);
steamClient.on('servers', onSteamServers);

/////////////////////////////////////////////////////////////////////////////////

var Discord = require('discord.js');
var client = new Discord.Client();

// Load config
global.config = require("./config");

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
      if (msg.content.startsWith(global.config.prefix) {
        if (msg.content.substring(1,msg.content.length) == 'inhouse'
      }
});

client.login('token');


    /////////////////////////////////////////////////////////////////////
