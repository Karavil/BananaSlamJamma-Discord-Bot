var request = require('request');

var options = {
  url: 'https://api.twitch.tv/helix/users?id=44322889',
  headers: {
    'Authorization': 'Bearer moukj9dyzhyfw2e0uc7jw5ak6hflt3'
  }
};

function callback(error, response, body) {
  if (!error && response.statusCode == 200) {
    var info = JSON.parse(body);
    console.log(info);
  }
}

request(options, callback);
