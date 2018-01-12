#!/bin/sh

CONFIG=/boot/config.txt

ASK_TO_REBOOT=0

get_onewire() {
  if grep -q -E "^dtoverlay=w1-gpio" $CONFIG; then
    echo 0
  else
    echo 1
  fi
}

if ! grep -q -E "^dtoverlay=w1-gpio" $CONFIG; then
  printf "dtoverlay=w1-gpio\n" >> $CONFIG
  ASK_TO_REBOOT=1
fi

if [ ! -d "db/temperature" ]; then
  mkdir -p db/temperature
fi

if ! grep -q -E DS18B20 config.json; then
  echo \{ \"parameter\": \"temperature\", \"options\": \{ \"model\": \"DS18B20\" \} \} | node config.js
fi

if [ $ASK_TO_REBOOT -eq 1 ]; then
  whiptail --yesno "Would you like to reboot now?" 20 60 2
  if [ $? -eq 0 ]; then # yes
    sync
    reboot
  fi
fi

exit 0
