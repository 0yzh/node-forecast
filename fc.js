// problem: look up forecast by zip / postal code in node app
// solution: query forecast.io and return weather

// dependencies
const https = require('https');


// helpers
function logWeather(summary, temp) {
  const msg = `---------------------
  The weather in the ${process.argv.slice(2)} area is ${summary} at ${temp} degrees.`;
  console.log(msg);
}

function getCoords(zip) {
  // need a second api to convert long / latitude: https://public.opendatasoft.com/api/records/1.0/search/?dataset=us-zip-code-latitude-and-longitude&q=${zip}&facet=state&facet=timezone&facet=dst
  https.get(`https://public.opendatasoft.com/api/records/1.0/search/?dataset=us-zip-code-latitude-and-longitude&q=${zip}&facet=state&facet=timezone&facet=dst`, (res) => {
    // read data
    console.log('statusCode: ', res.statusCode);
    let body = '';
    res.on('data', data => {
      body += data.toString();
    });

    // parse data
    res.on('end', () => {
      const result = JSON.parse(body);
      // grab the properties we need from data object
      const long = result.records[0].fields.geopoint[0];
      const lat = result.records[0].fields.geopoint[1];
      const city = result.records[0].fields.city;
      getWeather(Math.ceil(long), Math.ceil(lat));
    });
  });
}

function getWeather(long, lat) {
  // connect to api https://darksky.net/forecast/${long},${lat}/us12/en
  https.get(`https://darksky.net/forecast/${long},${lat}/us12/en.json`, res => {
    let geo = ''; 
    res.on('data', data => {
      geo += data.toString();
    })
    res.on('end', () => {
      const weather = JSON.parse(geo);
      const { summary, temperature } = weather.currently;
      logWeather(summary.toLowerCase(), temperature)
    })
  });
}



// print data
// slice needs to be 2!!!
const zipArg = process.argv.slice(2);

zipArg.forEach(arg => getCoords(arg));


