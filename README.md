# hazyair - air quality monitoring tool. 

__hazyair__ is a handy tool that enables to store measurments of the:
* dust conectration in the air (PM1.0, PM2.5, PM10),
* temperature,
* humidity,
* pressure,

to the simple database. It also visualizes the measurement results on the charts that can be accessed from the web
browsers.

## Hardware - [Configuration](https://github.com/marcin-sielski/hazyair/wiki)

__hazyair__ was orginally developed on Raspberry Pi Zero W but it should work on any version of Raspberry Pi.
Following sensors are supported:
* dust sensors - [Plantower sesors](https://github.com/perfectworks/node-plantower#supported-device-models),
SDS011, SDS018, SDS021 (__not tested__),
* temperature sensors - DS18B20,
* temperature, pressure and optionally humidity combo sensors - BME280, BMP280.

## Installation

### Common Steps

Install ```node```.

```
git clone --depth=1 https://github.com/tj/n.git
cd n && sudo make install && cd ..
n lts
```

Create ```node_modules``` folder.

```mkdir node_modules```

Install __hazyair__ module.

```npm install hazyair```

### Use as a service

Browse to __hazyair__ folder.

```cd node_modules/hazyair```

Run desired sensor configuration script (examples below).

```npm run plantower PMS7003 /dev/serial0```

```npm run nova SDS011 /dev/serial0```

```npm run maxim```

```npm run bosch BME280 1 119```

Deploy __hazyair__ service.

```npm run deploy```

Run web browser and open charts under following link ```http://<ip_address>:8081```.

### Use as a module - [API](https://github.com/marcin-sielski/hazyair/wiki/API)


```javascript
const Hazyair = require('hazyair');

// Initialize hazyair.
hazyair = new Hazyair([{    
    parameter: 'dust',
    model: 'PMS7003',
    persistent: true;
    options: {
        device: '/dev/serial0'
    }
}]);

// Optionally handle incoming
// measurements.
hazyair.on('dust', (data) => {
   // New measurement result available.
});

// Optionally send out incoming data
// to the ThingSpeak™ service.
hazyair.thingspeak({ 
    api_key: 'XXXXXXXXXXXXXXXX',
    dust: {
        concentration_pm10_normal : 'field1'
    }
});

// Start collecting measurements data.
hazyair.start();

// Optionally start http server and
// make data accessible to the web
// browsers.
hazyair.listen({
    port: 8081
}, () => {
    // Additional code goes here.
});
```

## License

MIT License

Copyright (c) 2018 Marcin Sielski
