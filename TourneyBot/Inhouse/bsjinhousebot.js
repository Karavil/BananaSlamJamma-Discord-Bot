'use strict';

const Discord = require('discord.js');
const request = require('superagent');
const fs = require('fs');
const Combinatorics = require('js-combinatorics');

const client = new Discord.Client({ fetchAllMembers: false, apiRequestMethod: 'sequential' });

var cmb, a;

var inhouseplayers = [
  ['DEFAULT10', 3000],
  ['DEFAULT9', 3000],
  ['DEFAULT8', 3000],
  ['DEFAULT7', 3000],
  ['DEFAULT6', 3000],
  ['DEFAULT5', 3000],
  ['DEFAULT4', 3000],
  ['DEFAULT3', 3000],
  ['DEFAULT2', 3000],
  ['DEFAULT1', 3000]
];

let aAvrg = 0;
let bAvrg = 0;
var teamA = [
  ['DEFAULT1', 3000],
  ['DEFAULT2', 3000],
  ['DEFAULT3', 3000],
  ['DEFAULT4', 3000],
  ['DEFAULT5', 3000]
];
var teamB = [
  ['DEFAULT6', 3000],
  ['DEFAULT7', 3000],
  ['DEFAULT8', 3000],
  ['DEFAULT9', 3000],
  ['DEFAULT10', 3000]
];

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
  if (true) {
    if (message.content.startsWith('!inhouse')) {
      console.log('Command used');
      try {
        var args = message.content.split(/[ ]+/);
      } catch (err) {
        message.channel.sendMessage('Error. Please make sure to enter your username and mmr! `Example: !joininhouse Conkle 2075`');
      }
      if (amountOfPlayers > 10) {
        message.channel.sendMessage('Maximum amount of players reached. Please use the !startinhouse command.');
      }
      else if (args.length > 3) {
        message.channel.sendMessage('**ERROR**: Please make sure to enter your username and mmr! `Example: !joininhouse Conkle 2075`');
      } else if (args.length <= 2) {
        message.channel.sendMessage('Please include your username and mmr! `Example: !joininhouse Conkle 2075`');
      } else {
        if (checkDuplicate(args[1]) === true) {
          message.channel.sendMessage('You are already signed up!');
        }
        else {
          message.channel.sendMessage('Sign-up successful! There are currently **' + amountOfPlayers +'/10** players signed up.');

          inhouseplayers[amountOfPlayers-1][0] = args[1];
          inhouseplayers[amountOfPlayers-1][1] = args[2];
          console.log(amountOfPlayers);
          amountOfPlayers = amountOfPlayers+1;
        }
      }
      // message.author.addRole('roleid1v1');
    }

    else if (message.content.startsWith('!reset')) {
      resetPlayers();
      message.channel.sendMessage('Player list reset.');

    }

    else if (message.content.startsWith('!test')) {
      amountOfPlayers = 11;
      inhouseplayers = [
        ['t1', '7000'],
        ['t2', '2001'],
        ['t3', '2500'],
        ['t4', '3700'],
        ['t5', '3200'],
        ['t6', '3100'],
        ['t7', '2300'],
        ['t5', '4500'],
        ['t6', '4300'],
        ['t7', '4101']
      ];
      message.channel.sendMessage('Test teams on.');

    }

    else if (message.content.startsWith('!balance')) {
      if (amountOfPlayers < 10) {
        message.channel.sendMessage('You need 10 players to balance teams!');
      } else  {
        setupInhouse();
        message.channel.sendMessage('**RADIANT:** ' + teamA[0][0] + ', ' + teamA[1][0] + ', ' + teamA[2][0] + ', ' + teamA[3][0] + ', ' + teamA[4][0]);
        message.channel.sendMessage('**DIRE:** ' + teamB[0][0] + ', ' + teamB[1][0] + ', ' + teamB[2][0] + ', ' + teamB[3][0] + ', ' + teamB[4][0]);
      }



    }


  function setupInhouse() {
    sortLowToHigh();
    BalanceTeams();
    console.log('Team A Average: ' + aAvrg);
    console.log('Team B Average: ' + bAvrg);
    console.log('Team A');
    console.log(teamA);
    console.log('Team B');
    console.log(teamB);
  }

  // Give highest mmr to 1 team, give second highest to other. Give
  function BalanceTeams() { // 10c5 / 2 = Number of balanced teams = 126
    let playerNumber = 0;
    let aTotal = 0;
    let bTotal = 0;
    aAvrg = 0;
    bAvrg = 0;
    for (let i = 0; i < 10; i++) {
      if (aAvrg >= bAvrg) {
        teamA[playerNumber][0] = inhouseplayers[i][0];
        teamA[playerNumber][1] = inhouseplayers[i][1];
        aTotal = parseInt(inhouseplayers[i][1], 10) + parseInt(aTotal, 10);
        console.log("A: " + aTotal);
        aAvrg = aTotal / (playerNumber + 1);
        i++;
        teamB[playerNumber][0] = inhouseplayers[i][0];
        teamB[playerNumber][1] = inhouseplayers[i][1];
        bTotal = parseInt(inhouseplayers[i][1],10) + parseInt(bTotal,10);
        bAvrg = (bTotal / (playerNumber + 1));
        playerNumber++;
      }
      else if (bAvrg > aAvrg) {
        teamB[playerNumber][0] = inhouseplayers[i][0];
        teamB[playerNumber][1] = inhouseplayers[i][1];
        bTotal = parseInt(inhouseplayers[i][1],10) + parseInt(bTotal,10);
        console.log("B: " + bTotal);
        bAvrg = (bTotal / (playerNumber + 1));
        i++;
        teamA[playerNumber][0] = inhouseplayers[i][0];
        teamA[playerNumber][1] = inhouseplayers[i][1];
        aTotal = parseInt(inhouseplayers[i][1], 10) + parseInt(aTotal, 10);
        aAvrg = (aTotal / (playerNumber + 1));
        playerNumber++;
      }
    }
    aAvrg = aTotal / 5;
    bAvrg = bTotal / 5;
    console.log(aAvrg);
    console.log(bAvrg);
  }



  function swapBalance() {

  }
  function getOppositeTeamlist() {

    for (let z = 0; z < 5; z) {
      for (let i = 0; i < 10; i++) {
        if (inhouseplayers[i][0] !== teamA[z][0]) {
          teamB[z][0] = inhouseplayers[i][0];
          teamB[z][1] = inhouseplayers[i][1];
          z++
        }
      }
    }
    console.log('OPPOSITE TEAM CALCULATION: ');
    console.log(teamB);
  }

  function combTeams() {
    let totalMMR = 0;
    for (let i = 0; i < 10; i++) {
      totalMMR = inhouseplayers[i][1] + totalMMR;
    }
    console.log(totalMMR);

    let differenceTemp = 100000000000000;
    let ct = 0;
    cmb = Combinatorics.combination(['0','1','2','3','4','5','6','7','8','9'], 5);
    while(a = cmb.next()) {
      ct++;
      console.log(a);
      let hTempMMR = 0;
      console.log(hTempMMR);
      for (let aOrder = 0; aOrder < 5; aOrder++) {
        hTempMMR = inhouseplayers[a[aOrder]][1] + hTempMMR;
        console.log(a[aOrder]);
        console.log(inhouseplayers[a[aOrder]][1]);
      }
      console.log(hTempMMR);

      let difFromEqual = Math.abs((totalMMR/2) - hTempMMR);
      if (difFromEqual < differenceTemp) {
        differenceTemp = differenceTemp;
        console.log(differenceTemp);
        let x = 0;
        while (x < 5) {
          let playerNum = a[x];
          teamA[x][1] = inhouseplayers[playerNum][1];
          console.log(playerNum);
          teamA[x][0] = inhouseplayers[playerNum][0];
          x++;
        }
        tempB = getOppositeTeamlist(teamA);
        console.log(teamA);
        console.log(tempB);
      }

      else {
        console.log('mmr difference is higher, try ' + ct);
        console.log('mmr difference is: ' + differenceTemp);
      }

    }
    console.log(ct);

    console.log(teamA);

    console.log(teamB);
    console.log('MMR difference in absolute: ' + differenceTemp);
  }

  function getAvrgMMR() {
    let totalMMR = 0;
    for (let i = 0; i < 10; i++) {
      totalMMR = inhouseplayers[i][1] + totalMMR;
    }
    let avrgMMR = totalMMR / 10;
    return avrgMMR;
  }

  function resetPlayers() {
    amountOfPlayers = 1;
    aAvrg = 0;
    bAvrg = 0;
    for (let i = 0; i < 10; i++) {
      for (let z = 0; z < 2; z++) {
        inhouseplayers[i][z] = null;
      }
    }
  }

  function sortLowToHigh() {
    var len = 10;
    for (let i = len - 1; i >= 0; i--) {
      for (let j = 1; j <= i; j++) {
        if (inhouseplayers[j - 1][1] > inhouseplayers[j][1]) {
          let temp = inhouseplayers[j - 1][1];
          let temp2 = inhouseplayers[j - 1][0];
          inhouseplayers[j - 1][1] = inhouseplayers[j][1];
          inhouseplayers[j-1][0] = inhouseplayers[j][0];
          inhouseplayers[j][1] = temp;
          inhouseplayers[j][0] = temp2;
        }
      }
    }
    console.log(inhouseplayers);
  }

  function checkDuplicate(username) {
    for (let i = 0; i < 10; i++) {
      if (inhouseplayers[i][0] == username) {
        return true;
      }
      else return false;
    }
  }
}});
