# hazy - Dust concentration monitoring tool. 

```hazy``` is a handy tool that enables to store measurments of the dust conectration (PM1.0, PM2.5, PM10) in the air to the simple database. It also visualizes the results on the charts accessible from the browsers.

## Configuration

```hazy``` was orginally developed on Raspberry Pi Zero W but it should work on any version of Raspberry Pi. Following [dust sensors](https://github.com/perfectworks/node-plantower) are currently supported.

## Installation

Make sure recent version of ```node``` is installed on the board. Raspberry Pi Zero W requires ARMv6 version of the binaries which must be downloaded from [nodejs.org](https://nodejs.org/en/download/) and installed in ```/usr/local/bin``` folder.

Install ```hazy``` module.

```npm install hazy```

Run board configuration script.

```npm run configure```

Deploy ```hazy``` service.

```npm run deploy```

Run browser and open ```http://<ip_address>:8081```.
