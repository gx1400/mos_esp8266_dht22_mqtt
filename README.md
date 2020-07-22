# mos_esp8266_dht22_mqtt
Transmitting dht22 temp/humidity data to local mosquitto mqtt server using esp8>

## Source
forked from [mongoose js demo](https://github.com/mongoose-os-apps/demo-js)

## Hardware
* [Wemos D1 Mini (esp8266) development board](https://docs.wemos.cc/en/latest/d>
I'd bought these several years back before the LOLIN branding

*

## To Do:
* make room description part of config file or mos.yml parameter
* make mqtt client id = device mac address
* try using different temp sensor (DHT22s are not super accurate).  See test setup

## Test setup
3 d1s + dht22 dev board plugged into same wall outlet.  Boards look similarly precise, but not very accurate

![Grafana pic.](https://i.imgur.com/LLcf246.png  "Grafana." )
![wall plugs pic](https://i.imgur.com/22Iwsbs.jpg "Test setup")
