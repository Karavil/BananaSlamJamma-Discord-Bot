'use strict';

const Discord = require('discord.js');
const request = require('superagent');
const fs = require('fs');

const client = new Discord.Client({
  fetchAllMembers: false,
  apiRequestMethod: 'sequential'
});

let TourneyRole;
let CheckinRole;
let PlayerListChannel;
let PlayerListArray = [];

client.login('Mjg5NjY3ODg1NDMyMDQ1NTY4.C6PtwQ.0zt8KfglEf0ewwQt88oR_KYYTKE').then(atoken => console.log('logged in with token ' + atoken)).catch(console.error);

client.on('ready', () => {
  console.log('ready');
});

client.on('error', m => console.log('debug', m));
client.on('reconnecting', m => console.log('debug', m));

client.on('message', message => {
  if (true) {
    let NameAndID = `${message.author.username}#${message.author.discriminator}`
    let noSpaceNameAndID = NameAndID.replace(/\s+/g, '');
    var mRole = message.guild.roles.find("name", "Moderators");
    if (message.content.startsWith('!jointourney')) {
      try {
        var args = message.content.split(/[ ]+/);
      } catch (err) {
        message.channel.sendMessage('**ERROR**: Please make sure you are using the right format! `Example: !jointourney 3538 https://www.dotabuff.com/players/179648045` Please make sure to enter your dotabuff and `EXACT` mmr!');
      }

      let tRole = message.guild.roles.find("name", "Tourney");
      let bRole = message.guild.roles.find("name", "Banned");
      let sRole = message.guild.roles.find("name", "Standin");

      if (message.member.roles.has(tRole.id)) {
        message.channel.sendMessage('Nope, can\'t do that! You are already signed up.');
      } else if (getSignupStat() === false) {
        message.channel.sendMessage('**Signups are currently closed.**');
      } else if (message.member.roles.has(bRole.id)) {
        message.channel.sendMessage('Nope, can\'t do that! You are **BANNED**, please contact an admin if this is an error.');
      } else if (message.member.roles.has(sRole.id)) {
        message.channel.sendMessage('Nope, can\'t do that! You are signed up as a stand-in, use !leavetourney if you want to be removed from the stand-in list.');
      } else if (args.length > 3) {
        message.channel.sendMessage('**ERROR**: Please make sure you are entering your **MMR** and **DotaBuff link** correctly! **Example:** `!jointourney 3538 https://www.dotabuff.com/players/179648045`');
      } else if (args.length < 3) {
        message.channel.sendMessage('**ERROR**: Please make sure you are entering your **MMR** and **DotaBuff link** correctly! **Example:** `!jointourney 3538 https://www.dotabuff.com/players/179648045`');
      } else if (args.length == 3 && is_int(args[1]) && !(is_int(args[2])) && args[2].length > 19) {
        message.member.addRole(tRole.id);
        message.channel.sendMessage('**You have been added to the sub tourney.** Make sure to show up on `July 15th, 4 PM PST (7 PM EST)`');

        let tChannel = message.guild.channels.find('name', 'player-list');

        const embed = new Discord.RichEmbed()
          .setColor(0x00AE86)
          .setAuthor(`${message.author.username}#${message.author.discriminator}`, message.author.avatarURL)
          .setDescription(`**MMR: **` + args[1] + `** DotaBuff:** ` + args[2]);

        tChannel.sendEmbed(embed);
        console.log(noSpaceNameAndID);
        addPlayer(noSpaceNameAndID, args[1], args[2], '0');
        //var stream = fs.createWriteStream('players.txt', {
        //  'flags': 'a'
        //});
        //stream.write(`${message.author.username}#${message.author.discriminator} ` + args[1] + " " + args[2]);
        //stream.end(" \n");

      } else {
        message.channel.sendMessage('**ERROR**: Please make sure you are entering your **MMR** and **DotaBuff link** correctly! **Example:** `!jointourney 3538 https://www.dotabuff.com/players/179648045`');
      }
      //message.author.addRole('roleid1v1');
    }
    else if (message.content.startsWith('!setup') && message.member.roles.has(mRole.id)) {

      message.guild.createRole({
        name: 'Tourney'
      }).then(role => {
        message.channel.sendMessage(`Made role ${role.name}, role id is ${role.id}`);
        TourneyRole = `${role.id}`;
      }).catch(console.error);

      message.channel.guild.createChannel('player-list', 'text')
        .then(channel => {
          console.log(`Created new channel. Channel id is ${channel.id}`);
          PlayerListChannelID = `${channel.id}`;
          channel.setTopic('List of players who are currently signedup to play in the 1v1 tourney');
      });

      message.guild.createRole({
        name: 'Checkin'
      }).then(role => {
        message.channel.sendMessage(`Made role ${role.name}, role id is ${role.id}`);
        CheckinRole = `${role.id}`;
      }).catch(console.error);

      message.guild.createRole({
        name: 'Standin'
      }).then(role => {
        message.channel.sendMessage(`Made role ${role.name}, role id is ${role.id}`);
      }).catch(console.error);
    }
    else if (message.content.startsWith('!playerlist')) {
      loadPlayerList();
      generateDiscordPlayerlist();
    }
    else if (message.content.startsWith('!confirmedlist')) {
      loadPlayerList();
      generateDiscordCheckedInPlayerlist();
    }
    else if (message.content.startsWith('!mmrlist')) {
      loadPlayerList();
      generateDiscordPlayerAndMMR();
    }
    else if (message.content.startsWith('!standinlist')) {
      loadPlayerList();
      generateDiscordStandinPlayerlist();
    }
    else if (message.content.startsWith('!removeplayer') && message.member.roles.has(mRole.id)) {
      try {
        var args = message.content.split(/[ ]+/);
      } catch (err) {
        console.log(err);
      }
      if (args.length == 2) removePlayer(args[1]);
      else {
        message.channel.sendMessage("**ERROR:** Please do !removeplayer DiscordUsername#DiscordID");
      }
    }
    else if (message.content.startsWith('!addplayer ') && message.member.roles.has(mRole.id)) {
      try {
        var args = message.content.split(/[ ]+/);
      } catch (err) {
        console.log(err);
      }
      if (args.length == 5) {
        addPlayer(args[1], args[2], args[3], args[4]);
        message.channel.sendMessage('**Added player: **' + args[1]);
      }
      else {
        message.channel.sendMessage('**ERROR:** Please use the right format to manually add a player. `!addplayer DiscordName#DiscordIDNumber MMR DotabuffLink`');
      }
    }
    else if (message.content.startsWith('!checkin')) {

      let tRole = message.guild.roles.find("name", "Tourney");
      let bRole = message.guild.roles.find("name", "Banned");
      let cRole = message.guild.roles.find("name", "Checkin");

      if (getCheckinStat() === false){
        message.channel.sendMessage('**Check-ins are currently not allowed, please visit the `Announcements` channel for updates on check-in time.**');
      } else if (message.member.roles.has(cRole.id)) {
        message.channel.sendMessage('**You are already checked in!** The tournament will start soon!');
      } else if (message.member.roles.has(tRole.id)) {
        message.member.addRole(cRole.id);
        checkInPlayer(noSpaceNameAndID);
        message.channel.sendMessage('**Thanks for checking in!** The tournament will start soon!');
      } else {
        message.channel.sendMessage('**You cannot check-in as you were not signed up for the tournament!**');
      }
    }
    else if (message.content.startsWith('!fill')) {
      try {
        var args = message.content.split(/[ ]+/);
      } catch (err) {
        message.channel.sendMessage('**ERROR**: Please make sure you are using the right format! `Example: !jointourney 3538 https://www.dotabuff.com/players/179648045` Please make sure to enter your dotabuff and `EXACT` mmr!');
      }

      let tRole = message.guild.roles.find("name", "Tourney");
      let bRole = message.guild.roles.find("name", "Banned");
      let cRole = message.guild.roles.find("name", "Checkin");
      let sRole = message.guild.roles.find("name", "Standin");

      if (message.member.roles.has(bRole.id)) {
        message.channel.sendMessage('You cannot sign up as a stand-in as you are **BANNED** from BSJ tourneys.');
      } else if (message.member.roles.has(cRole.id)) {
        message.channel.sendMessage('**You are already checked in, you cannot be a player and a standin at the same time!**');
      } else if (message.member.roles.has(tRole.id)) {
        message.channel.sendMessage('**You are already signed up for the tournament, you cannot be a player and a standin at the same time!**');
      } else if (args.length == 3 && is_int(args[1]) && !(is_int(args[2])) && args[2].length > 19) {
        message.member.addRole(sRole.id);
        addPlayer(noSpaceNameAndID, args[1], args[2], '2');
        message.channel.sendMessage('**You are now signed up as a stand-in.** If players are missing you might be invited to play in the sub tourney. Good luck!');
      } else {
        message.channel.sendMessage('**ERROR**: Please make sure you are using the right format! `Example: !standin 3538 https://www.dotabuff.com/players/179648045` Please make sure to enter your dotabuff and `EXACT` mmr!');
      }
    }
    else if (message.content.startsWith('!opensignup') && message.member.roles.has(mRole.id)) {
      message.channel.sendMessage('Signups are now open.');
      openSignups();
    }
    else if (message.content.startsWith('!closesignup') && message.member.roles.has(mRole.id)) {
      message.channel.sendMessage('Signups are now closed.');
      closeSignups();
    }
    else if (message.content.startsWith('!opencheckin') && message.member.roles.has(mRole.id)) {
      message.channel.sendMessage('Check-ins are now open, and signups have been automatically closed.');
      openCheckins();
    }
    else if (message.content.startsWith('!closecheckin') && message.member.roles.has(mRole.id)) {
      message.channel.sendMessage('Check-ins are now closed.');
      closeCheckins();
    }
    else if (message.content.startsWith('!leavetourney')) {

      let tRole = message.guild.roles.find("name", "Tourney");
      let cRole = message.guild.roles.find("name", "Checkin");
      let sRole = message.guild.roles.find("name", "Standin");

      if (message.member.roles.has(sRole.id)) {
        removePlayer(noSpaceNameAndID);
        message.member.removeRole(sRole.id);
      } else if (message.member.roles.has(tRole.id) && getCheckinStat() === false) {
        removePlayer(noSpaceNameAndID);
        message.member.removeRole(tRole.id);
        message.member.removeRole(cRole.id);
        message.member.removeRole(sRole.id);
      } else if (getCheckinStat() === true) {
        message.channel.sendMessage('**Cannot leave the tournament right now as check-ins are open, please contact an Admin.**');
      } else {
        message.channel.sendMessage('**You cannot leave the tournament as you are not signed up!** (If this is an error please contact an Admin)');
      }
    }
  }

  function loadPlayerList() {
    var fs = require('fs');
    PlayerListArray = [];
    PlayerListArray = fs.readFileSync('players.txt').toString().split("\n");
  }

  function addPlayer(discordID, mmr, dBuffLink, checkInStatus) {
    var fs = require('fs');
    loadPlayerList();
    var updatedFile = fs.createWriteStream('players.txt');
    PlayerListArray[PlayerListArray.length-1] = discordID + " " + mmr + " " + dBuffLink + " " + checkInStatus;
    for (let i = 0; i < PlayerListArray.length ; i++) {
      updatedFile.write(PlayerListArray[i] + '\n');
    }
    updatedFile.end();
    loadPlayerList();
  }

  function removePlayer(discordID) {
    var fs = require('fs');
    loadPlayerList();
    var updatedFile = fs.createWriteStream('players.txt');
    let removeCount = 0;
    for (let i = 0; i < PlayerListArray.length-1 ; i++) {
      let pArgs = PlayerListArray[i].split(/[ ]+/);
      if (pArgs[0] !== discordID) {
        updatedFile.write(PlayerListArray[i] + '\n');
      }
      else if (pArgs[0] == discordID) {
        message.channel.sendMessage('**UPDATE:** ' + pArgs[0] +' has been removed from the player list.');
        removeCount++;
      }
    }
    if (removeCount == 0) message.channel.sendMessage('**ERROR:** Player not found. Please format names like this: **DiscordUsername#DiscordIDNumber**');
    updatedFile.end();
    loadPlayerList();
  }

  function editPlayer(option) {

  }

  function generateDiscordPlayerlist() {
    loadPlayerList();
    let amountOfPlayer = PlayerListArray.length-1;
    if (PlayerListArray.length == 1) {
      message.channel.sendMessage('No players are signed up right now.');
    }
    else {
      message.channel.sendMessage(`Signed up players **(${PlayerListArray.length-1})**:`);
      let arrayToDiscord = "";
      for (let i = 0; i < PlayerListArray.length-1 && i < 20; i++) {
        arrayToDiscord = arrayToDiscord + "`" + PlayerListArray[i] + "`\n";
        if (i == PlayerListArray.length-2 | i == 19) {
          message.channel.sendMessage(arrayToDiscord);
        }
      }
      let arrayToDiscord2 = "";
      for (let i = 20; i < PlayerListArray.length-1 && i < 40; i++) {
        arrayToDiscord2 = arrayToDiscord2 + "`" + PlayerListArray[i] + "`\n";
        if (i == PlayerListArray.length-2 | i == 39) {
          message.channel.sendMessage(arrayToDiscord2);
        }
      }
      let arrayToDiscord3 = "";
      for (let i = 40; i < PlayerListArray.length-1 && i < 60; i++) {
        arrayToDiscord3 = arrayToDiscord3 + "`" + PlayerListArray[i] + "`\n";
        if (i == PlayerListArray.length-2 | i == 59) {
          message.channel.sendMessage(arrayToDiscord3);
        }
      }
      let arrayToDiscord4 = "";
      for (let i = 60; i < PlayerListArray.length-1 && i < 80; i++) {
        arrayToDiscord4 = arrayToDiscord4 + "`" + PlayerListArray[i] + "`\n";
        if (i == PlayerListArray.length-2 | i == 79) {
          message.channel.sendMessage(arrayToDiscord4);
        }
      }
      let arrayToDiscord5 = "";
      for (let i = 80; i < PlayerListArray.length-1 && i < 100; i++) {
        arrayToDiscord = arrayToDiscord + "`" + PlayerListArray[i] + "`\n";
        if (i == PlayerListArray.length-2 | i == 99) {
          message.channel.sendMessage(arrayToDiscord);
        }
      }
      let arrayToDiscord6 = "";
      for (let i = 100; i < PlayerListArray.length-1 && i < 120; i++) {
        arrayToDiscord = arrayToDiscord + "`" + PlayerListArray[i] + "`\n";
        if (i == PlayerListArray.length-2 | i == 119) {
          message.channel.sendMessage(arrayToDiscord);
        }
      }
    }
  }

  function generateDiscordCheckedInPlayerlist() {
    loadPlayerList();
    let checkedInDiscord = "Checked in players: \n";
    let checkedInCount = 0;
    let maxMessageLimit = 30;
    let checkedInArray = [];
    message.channel.sendMessage(checkedInDiscord);
      for (let i = 0; i < PlayerListArray.length-1; i++) {
        let pArgs = PlayerListArray[i].split(/[ ]+/);
        if (pArgs[3] == "1") {
          checkedInArray[checkedInCount] = "`" + pArgs[0] + " " + pArgs[1] + "`\n";
          checkedInCount++;
        }
      }
      let arrayToDiscord = "";
      for (let i = 0; i < checkedInArray.length && i < 30; i++) {
        arrayToDiscord = arrayToDiscord + checkedInArray[i];
        if (i == checkedInArray.length-1 | i == 29) {
          message.channel.sendMessage(arrayToDiscord);
        }
      }
      let arrayToDiscord2 = "";
      for (let i = 30; i < checkedInArray.length && i < 60; i++) {
        arrayToDiscord2 = arrayToDiscord2 + checkedInArray[i];
        if (i == checkedInArray.length-1 | i == 59) {
          message.channel.sendMessage(arrayToDiscord2);
        }
      }
      let arrayToDiscord3 = "";
      for (let i = 60; i < checkedInArray.length && i < 90; i++) {
        arrayToDiscord3 = arrayToDiscord3 + checkedInArray[i];
        if (i == checkedInArray.length-1 | i == 89) {
          message.channel.sendMessage(arrayToDiscord3);
        }
      }
      let arrayToDiscord4 = "";
      for (let i = 90; i < checkedInArray.length && i < 120; i++) {
        arrayToDiscord4 = arrayToDiscord4 + checkedInArray[i];
        if (i == checkedInArray.length-1 | i == 119) {
          message.channel.sendMessage(arrayToDiscord4);
        }
      }
      let playerCountString = `There are currently **${checkedInCount}** out of **${PlayerListArray.length-1}** players checked in.`;
      message.channel.sendMessage(playerCountString);
  }

  function generateDiscordStandinPlayerlist() {
    loadPlayerList();
    let checkedInDiscord = "Stand-in player list: \n";
    let checkedInCount = 0;
    let maxMessageLimit = 30;
    let checkedInArray = [];
    message.channel.sendMessage(checkedInDiscord);
      for (let i = 0; i < PlayerListArray.length-1; i++) {
        let pArgs = PlayerListArray[i].split(/[ ]+/);
        if (pArgs[3] == "2") {
          checkedInArray[checkedInCount] = "`" + pArgs[0] + " " + pArgs[1] + "`\n";
          checkedInCount++;
        }
      }
      let arrayToDiscord = "";
      for (let i = 0; i < checkedInArray.length && i < 30; i++) {
        arrayToDiscord = arrayToDiscord + checkedInArray[i];
        if (i == checkedInArray.length-1 | i == 29) {
          message.channel.sendMessage(arrayToDiscord);
        }
      }
      let arrayToDiscord2 = "";
      for (let i = 30; i < checkedInArray.length && i < 60; i++) {
        arrayToDiscord2 = arrayToDiscord2 + checkedInArray[i];
        if (i == checkedInArray.length-1 | i == 59) {
          message.channel.sendMessage(arrayToDiscord2);
        }
      }
      let arrayToDiscord3 = "";
      for (let i = 60; i < checkedInArray.length && i < 90; i++) {
        arrayToDiscord3 = arrayToDiscord3 + checkedInArray[i];
        if (i == checkedInArray.length-1 | i == 89) {
          message.channel.sendMessage(arrayToDiscord3);
        }
      }
      let arrayToDiscord4 = "";
      for (let i = 90; i < checkedInArray.length && i < 120; i++) {
        arrayToDiscord4 = arrayToDiscord4 + checkedInArray[i];
        if (i == checkedInArray.length-1 | i == 119) {
          message.channel.sendMessage(arrayToDiscord4);
        }
      }
      let playerCountString = `There are currently **${checkedInCount}** players signed up to stand-in.`;
      message.channel.sendMessage(playerCountString);
  }

  function generateDiscordPlayerAndMMR() {
    loadPlayerList();
    let checkedInDiscord = "All players: \n";
    let checkedInCount = 0;
    let maxMessageLimit = 30;
    let checkedInArray = [];
    message.channel.sendMessage(checkedInDiscord);
      for (let i = 0; i < PlayerListArray.length-1; i++) {
        let pArgs = PlayerListArray[i].split(/[ ]+/);
        checkedInArray[checkedInCount] = "`" + pArgs[0] + " " + pArgs[1] + "`\n";
        checkedInCount++;

      }

      let swapped;
      do {
        swapped = false;
        for (var i=0; i < checkedInArray.length-1; i++) {
          let firstArgs = checkedInArray[i].split(/[ ]+/);
          let secondArgs = checkedInArray[i+1].split(/[ ]+/);
          if (firstArgs[1] > secondArgs[1]) {
              var temp = checkedInArray[i];
              checkedInArray[i] = checkedInArray[i+1];
              checkedInArray[i+1] = temp;
              swapped = true;
          }
        }
      } while (swapped);

      let arrayToDiscord = "";
      for (let i = 0; i < checkedInArray.length && i < 30; i++) {
        arrayToDiscord = arrayToDiscord + checkedInArray[i];
        if (i == checkedInArray.length-1 | i == 29) {
          message.channel.sendMessage(arrayToDiscord);
        }
      }
      let arrayToDiscord2 = "";
      for (let i = 30; i < checkedInArray.length && i < 60; i++) {
        arrayToDiscord2 = arrayToDiscord2 + checkedInArray[i];
        if (i == checkedInArray.length-1 | i == 59) {
          message.channel.sendMessage(arrayToDiscord2);
        }
      }
      let arrayToDiscord3 = "";
      for (let i = 60; i < checkedInArray.length && i < 90; i++) {
        arrayToDiscord3 = arrayToDiscord3 + checkedInArray[i];
        if (i == checkedInArray.length-1 | i == 89) {
          message.channel.sendMessage(arrayToDiscord3);
        }
      }
      let arrayToDiscord4 = "";
      for (let i = 90; i < checkedInArray.length && i < 120; i++) {
        arrayToDiscord4 = arrayToDiscord4 + checkedInArray[i];
        if (i == checkedInArray.length-1 | i == 119) {
          message.channel.sendMessage(arrayToDiscord4);
        }
      }
      let playerCountString = `There are currently **${PlayerListArray.length-1}** players signed up.`;
      message.channel.sendMessage(playerCountString);
  }

  function checkInPlayer(discordID) {
    var fs = require('fs');
    loadPlayerList();
    var updatedFile = fs.createWriteStream('players.txt');
    for (let i = 0; i < PlayerListArray.length-1 ; i++) {
      let pArgs = PlayerListArray[i].split(/[ ]+/);
      if (pArgs[0] !== discordID) {
        updatedFile.write(PlayerListArray[i] + '\n');
      }
      else if (pArgs[3] == "1"){
        message.channel.sendMessage('You are already checked in, the tournament will start soon!');
      }
      else if (pArgs[0] == discordID) {
        PlayerListArray[i] = pArgs[0] + " " + pArgs[1] + " " + pArgs[2] + " " + "1";
        updatedFile.write(PlayerListArray[i] + '\n');
      }
    }
    updatedFile.end();
    loadPlayerList();
  }
});

function is_int(value){
  if((parseFloat(value) == parseInt(value)) && !isNaN(value)){
      return true;
  } else {
      return false;
  }
}

function openSignups() {
  var fs = require('fs');
  let OptionsArray = [];
  OptionsArray = fs.readFileSync('options.txt').toString().split("\n");
  let oArgs = OptionsArray[0].split(/[ ]+/);
  OptionsArray = ["Signups: 1 \n", "Checkins: 0"];
  var arrayFile = fs.createWriteStream("options.txt");
  for (let i = 0; i < OptionsArray.length; i++) {
    arrayFile.write(OptionsArray[i]);
  }
  arrayFile.end();
}

function closeSignups() {
  var fs = require('fs');
  let OptionsArray = [];
  OptionsArray = fs.readFileSync('options.txt').toString().split("\n");
  let oArgs = OptionsArray[0].split(/[ ]+/);
  OptionsArray = ["Signups: 0 \n", "Checkins: 0"];
  var arrayFile = fs.createWriteStream("options.txt");
  for (let i = 0; i < OptionsArray.length; i++) {
    arrayFile.write(OptionsArray[i]);
  }
  arrayFile.end();
}

function openCheckins() {
  var fs = require('fs');
  let OptionsArray = [];
  OptionsArray = fs.readFileSync('options.txt').toString().split("\n");
  let oArgs = OptionsArray[0].split(/[ ]+/);
  OptionsArray = ["Signups: 0 \n", "Checkins: 1"];
  var arrayFile = fs.createWriteStream("options.txt");
  for (let i = 0; i < OptionsArray.length; i++) {
    arrayFile.write(OptionsArray[i]);
  }
  arrayFile.end();
}

function closeCheckins() {
  var fs = require('fs');
  let OptionsArray = [];
  OptionsArray = fs.readFileSync('options.txt').toString().split("\n");
  let oArgs = OptionsArray[0].split(/[ ]+/);
  OptionsArray = ["Signups: 0 \n", "Checkins: 0"];
  var arrayFile = fs.createWriteStream("options.txt");
  for (let i = 0; i < OptionsArray.length; i++) {
    arrayFile.write(OptionsArray[i]);
  }
  arrayFile.end();
}

function getSignupStat() {
  let OptionsArray = fs.readFileSync('options.txt').toString().split("\n");
  let oArgs = OptionsArray[0].split(/[ ]+/);
  if (oArgs[1] == '1') {
    return true;
  }
  else {
    return false;
  }
}

function getCheckinStat() {
  let OptionsArray = fs.readFileSync('options.txt').toString().split("\n");
  let oArgs = OptionsArray[1].split(/[ ]+/);
  if (oArgs[1] == '1') {
    return true;
  }
  else {
    return false;
  }
}
