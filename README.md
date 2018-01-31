# hazyair - Weather parameters monitoring tool. 

```hazyair``` is a handy tool that enables to store measurments of the:
* dust conectration in the air (PM1.0, PM2.5, PM10),
* temperature,
* humidity,
* pressure.

to the simple database. It also visualizes the measurement results on the charts that are accessible from the web browsers.

## Configuration

```hazyair``` was orginally developed on Raspberry Pi Zero W but it should work on any version of Raspberry Pi.
Following sensors are supported:
* dust sensors - list of Plantower sesors is available under following [link](https://github.com/perfectworks/node-plantower), SDS011, SDS018, SDS021 (__untested__)
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

Install ```hazyair``` module.

```npm install hazyair```

### Use as a service

Browse to ```hazyair``` folder.

```cd node_modules/hazyair```

Run desired sensor configuration script (examples below).

```npm run plantower PMS7003 /dev/serial0```

```npm run maxim```

```npm run bosh BME280 1 119```

Deploy ```hazyair``` service.

```npm run deploy```

Run web browser and open charts under following link ```http://<ip_address>:8081```.

### Use as a module

```javascript
const Hazyair = require('hazyair');

hazyair = new Hazyair([{    
    parameter: 'dust',
    model: 'PMS7003',
    options: {
        device:'/dev/serial0'
    }
}]);

hazyair.on('dust', (data) => {
   
   // New measurement result available.
    
});

hazyair.listen({
    port: '8081'
}, () => {
    
    // Additional code goes here.

});
```

## License

MIT License

Copyright (c) 2018 Marcin Sielski
