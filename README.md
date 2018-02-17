# __*hazyair*__ - air quality monitoring tool. 

__*hazyair*__ is a handy tool that enables to retrieve measurments of the:
* dust conectration in the air (PM1.0, PM2.5, PM10),
* temperature,
* humidity,
* pressure,

from the sensors and optionally store them to the simple database. It can also visualize the measurement results on the
charts that can be accessed from the web browsers.

## Hardware - [Configuration](https://github.com/marcin-sielski/hazyair/wiki)

__*hazyair*__ was orginally developed on Raspberry Pi Zero W but it should work on any version of Raspberry Pi.
Following sensors are supported:
* dust sensors - [Plantower sesors](https://github.com/perfectworks/node-plantower#supported-device-models),
SDS011 (__not tested__), SDS018 (__not tested__), SDS021 (__not tested__),
* temperature sensors - DS18B20,
* temperature, pressure and optionally humidity combo sensors - BME280, BMP280.

## Installation

### Common Steps

Install `node`.

```bash
git clone --depth=1 \
https://github.com/tj/n.git;
cd n && sudo make install && \
cd ..
n lts
```

Create `node_modules` folder.

```bash
mkdir node_modules
```

Install `hazyair` module.

```bash
npm install hazyair
```

### Use as a service

Browse to `hazyair` folder.

```bash
cd node_modules/hazyair
```

Run desired sensor configuration script (examples below).

```bash
npm run plantower PMS7003 \
/dev/serial0

npm run nova SDS011 \
/dev/serial0

npm run maxim

npm run bosch BME280 1 119
```

Deploy `hazyair` service.

```bash
npm run deploy
```

Run web browser and open charts under following link ```http://<ip_address>:8081```.

### Use as a module - [API](https://github.com/marcin-sielski/hazyair/wiki/API)


```javascript
const Hazyair =
            require('hazyair');

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
   // New measurement result
   // available.
});

// Optionally send out incoming
// data to the ThingSpeak™
// service once available.
hazyair.thingspeak({ 
    api_key:
        'XXXXXXXXXXXXXXXX',
    parameters: {
        dust: {
    
    concentration_pm10_normal:
            'field1'
        
        }

    }
});

// Optionally send out incoming
// data to the dweet.io
// service once available.
hazyair.dweet({ 
    thing:
        'XXXXXXXXXXXXXXXX',
    parameters: {
        dust: {
    
    concentration_pm10_normal:
            'PM10'
        
        }

    }
});

// Start collecting
// measurements data.
hazyair.start();

// Optionally start http server
// and make data accessible to
// the web browsers.
hazyair.listen({
    port: 8081
}, () => {
    // Additional code goes
    // here.
});
```

## License

MIT License

Copyright (c) 2018 Marcin Sielski
