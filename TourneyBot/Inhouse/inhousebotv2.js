'use strict';

const Discord = require('discord.js');
const request = require('superagent');
const fs = require('fs');
const Combinatorics = require('js-combinatorics');

const client = new Discord.Client({ fetchAllMembers: false, apiRequestMethod: 'sequential' });

var amountOfPlayers = 1;
client.login('MzQ1NDY2Mzk2Nzg1OTAxNTcy.DG7sLQ.tjHF-VxXEee-57Ih961JebqRr8k').then(atoken => console.log(`logged in with token ${atoken}`)).catch(console.error);

client.on('ready', () => {
  console.log('ready');
});

client.on('userUpdate', (o, n) => {
  console.log(o.username, n.username);
});

client.on('guildEmojiCreate', e => console.log('create!!', e.name));
client.on('guildEmojiDelete', e => console.log('delete!!', e.name));
client.on('guildEmojiUpdate', (o, n) => console.log('update!!', o.name, n.name));

client.on('guildMemberAdd', m => console.log(`${m.user.username} joined ${m.guild.name}`));

client.on('channelCreate', channel => {
  console.log(`made ${channel.name}`);
});

client.on('error', m => console.log('debug', m));
client.on('reconnecting', m => console.log('debug', m));


client.on('message', message => {
  if (message.content.startsWith('!openinhouse')) {
    openInhouse();
  } else if (message.content.startsWith('!join')) {
    addPlayer(noSpaceNameAndID, args[1], args[2], '0', temptwitch);
      if (checkFirstTimer() === true) {
        message.channel.sendMessage('**ERROR:** Welcome to the SD2L inhouse league. You will start with **10** SD2L Points. **DiscordUsername#DiscordIDNumber**');
      else if {

      }
    }
  } else if (message.content.startsWith('!kick')) {
    kickPlayer();
  } else if (message.content.startsWith('!leave')) {
    kickPlayer();
  } else if (message.content.startsWith('!balance')) {
    balancePlayers();
  } else if (message.content.startsWith('!reset')) {
    resetPlayers();
  }

  function loadPlayerList() {
    var fs = require('fs');
    PlayerListArray = [];
    PlayerListArray = fs.readFileSync('players.txt').toString().split("\n");
  }

  function checkFirstTimer() {
    var fs = require('fs');
    loadPlayerList();
    var updatedFile = fs.createWriteStream('players.txt');
    let firstTime = true;
    for (let i = 0; i < PlayerListArray.length - 1; i++) {
      let pArgs = PlayerListArray[i].split(/[ ]+/);
      if (pArgs[0] !== discordID) {
        updatedFile.write(PlayerListArray[i] + '\n');
      } else if (pArgs[0] == discordID) {
        firstTime = false;
      }
    }
    return firstTime;
    updatedFile.end();
    loadPlayerList();
}


function addWin(discordID) {
  var fs = require('fs');
  loadPlayerList();
  var updatedFile = fs.createWriteStream('players.txt');
  let removeCount = 0;
  for (let i = 0; i < PlayerListArray.length - 1; i++) {
    let pArgs = PlayerListArray[i].split(/[ ]+/);
    if (pArgs[0] !== discordID) {
      updatedFile.write(PlayerListArray[i] + '\n');
    } else if (pArgs[0] == discordID) {
      updatedFile.write(pArgs[0] + " " + pArgs[1] + " " + (pArgs[2] + 1) + '\n');
    }
  }

  function addLoss(discordID) {
    var fs = require('fs');
    loadPlayerList();
    var updatedFile = fs.createWriteStream('players.txt');
    let removeCount = 0;
    for (let i = 0; i < PlayerListArray.length - 1; i++) {
      let pArgs = PlayerListArray[i].split(/[ ]+/);
      if (pArgs[0] !== discordID) {
        updatedFile.write(PlayerListArray[i] + '\n');
      } else if (pArgs[0] == discordID) {
        updatedFile.write(pArgs[0] + " " + pArgs[1] + " " + (pArgs[2] - 1) + '\n');
      }
    }
    if (removeCount == 0) message.channel.sendMessage('**ERROR:** Player not found. Please format names like this: **DiscordUsername#DiscordIDNumber**');
    updatedFile.end();
    loadPlayerList();
  }

  let mmr1 = [2, 3, 1, 4];

  function balanceTeams(mmrArray) {


    for (let i = 0; i < 3; i++) {

    }

  }

  function subset(arra, arra_size) {
    var result_set = [],
      result;

    for (var x = 0; x < Math.pow(2, arra.length); x++) {
      result = [];
      i = arra.length - 1;
      do {
        if ((x & (1 << i)) !== 0) {
          result.push(arra[i]);
        }
      } while (i--);

      if (result.length >= arra_size) {
        result_set.push(result);
      }
    }
    return result_set;
  }
  console.log(subset([1, 2, 3], 2));
}});
