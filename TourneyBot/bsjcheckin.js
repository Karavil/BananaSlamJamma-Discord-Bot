'use strict';

const Discord = require('discord.js');
const request = require('superagent');
const fs = require('fs');

const client = new Discord.Client({ fetchAllMembers: false, apiRequestMethod: 'sequential' });

let roleid1v1 = 0;
let channelid1v1 = 0;

var log4js = require('log4js');
log4js.configure({
  appenders: [
    { type: 'console' },
    { type: 'file', filename: 'checkin.txt', category: 'players' }
  ]
});

var logger = log4js.getLogger('players');

client.login('Mjg5NjY3ODg1NDMyMDQ1NTY4.C6PtwQ.0zt8KfglEf0ewwQt88oR_KYYTKE').then(atoken => console.log('logged in with token ' + atoken)).catch(console.error);

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
    if (message.content.startsWith('!checkin')) {
      try {
        var args = message.content.split(/[ ]+/);
      } catch (err) {
        message.channel.sendMessage('Error. Please make sure to enter your twitch name! `Example: !checkin BananaSlamJamma`')
      }

      let tRole = message.guild.roles.find("name", "Tourney");
      let cRole = message.guild.roles.find("name", "Checkin");

      if (message.member.roles.has(cRole.id)) {
        message.channel.sendMessage('Nope, can\'t do that! You are already checked in.');
      }
      else if (args.length > 2) {
        message.channel.sendMessage('**ERROR**: Please make sure to enter your twitch name correctly! `Example: !checkin BananaSlamJamma`')
      }
      else if (args.length <= 1) {
        message.channel.sendMessage('Please include your twitch username while checking in! `Example: !checkin BananaSlamJamma`')
      }
      else if (message.member.roles.has(tRole.id)) {
        message.member.addRole(cRole.id);
        message.channel.sendMessage('You have been checked in. The tournament will start soon!');

        let tChannel = message.guild.channels.find('name', 'checkin-list');

        const embed  = new Discord.RichEmbed()
      			.setColor(0x00AE86)
      	    .setAuthor(`${message.author.username}#${message.author.discriminator}`, message.author.avatarURL)
      			.setDescription(`**Twitch: **` + args[1] );

      	tChannel.sendEmbed(embed);

        var stream = fs.createWriteStream('checkin.txt', {'flags': 'a'});
        stream.write(args[1] + " ");
        stream.end("\n");

      }
      else {
        message.channel.sendMessage('Error, cant check you in. You have not signed up for the tournament.');
      }
      //message.author.addRole('roleid1v1');
    }
    if (message.content.startsWith('g238238238238238')) {
      message.guild.createRole({ name: 'Checkin' }).then(role => {
        message.channel.sendMessage(`Made role ${role.name}, role id is ${role.id}`);
        roleid1v1 = `${role.id}`;
      }).catch(console.error);
    }
    if (message.content.startsWith('a234354667854332')) {
      if (message.channel.guild) {
        message.channel.guild.createChannel('checkin-list', 'text')
          .then(channel => {
            console.log(`Created new channel. Channel id is ${channel.id}`);
            console.log(channel);
            channelid1v1 = `${channel.id}`;
            channel.setTopic('List of players who are currently checked in.');
          });
      }
    }
  }
});
