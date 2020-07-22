load('api_config.js');
load('api_dash.js');
load('api_events.js');
load('api_gpio.js');
load('api_mqtt.js');
load('api_shadow.js');
load('api_timer.js');
load('api_sys.js');
load('api_dht.js');

let led = Cfg.get('board.led1.pin');              // Built-in LED GPIO number
let onhi = Cfg.get('board.led1.active_high');     // LED on when high?
let state = {on: false, uptime: 0};               // Device state
let online = false;                               // Connected to the cloud?
let roomname = 'basement3';

// GPIO pin which has a DHT sensor data wire connected
let pin = 2;

// Initialize DHT library
let dht = DHT.create(pin, DHT.DHT22);

let setLED = function(on) {
  let level = onhi ? on : !on;
  GPIO.write(led, level);
  print('LED on ->', on);
};

GPIO.set_mode(led, GPIO.MODE_OUTPUT);
setLED(state.on);

let reportState = function() {
  Shadow.update(0, state);
};

// Update state every second, and report to cloud if online
Timer.set(60000, Timer.REPEAT, function() {
  state.uptime = Sys.uptime();
  state.ram_free = Sys.free_ram();
  let message = JSON.stringify(state);

  print('online:', online, message);
    if (online) reportState();

  let t = dht.getTemp();
  let h = dht.getHumidity();

  if (MQTT.isConnected()) {
    let topic = 'testing/helloworld';
    print('== Publishing to ' + topic + ':', message);
    MQTT.pub(topic, message, 0 /* QoS */);

    if (isNaN(h) || isNaN(t)) {
      print('Failed to read data from sensor');
    } else {
      let f = (t * 1.8) + 32;
      let dataset = {
        tempC:t,
        tempf:f,
        hum:h,
        room:roomname
      };
      let msg = JSON.stringify(dataset);
      print(msg);
      MQTT.pub('home/basement3/data',msg,0);
    }
  } else {
    print('== mqtt Not connected!');
  }

}, null);

// Set up Shadow handler to synchronise device state with the shadow state
Shadow.addHandler(function(event, obj) {
  if (event === 'UPDATE_DELTA') {
    print('GOT DELTA:', JSON.stringify(obj));
    for (let key in obj) {  // Iterate over all keys in delta
      if (key === 'on') {   // We know about the 'on' key. Handle it!
        state.on = obj.on;  // Synchronise the state
        setLED(state.on);   // according to the delta
      } else if (key === 'reboot') {
        state.reboot = obj.reboot;      // Reboot button clicked: that
        Timer.set(750, 0, function() {  // incremented 'reboot' counter
          Sys.reboot(500);                 // Sync and schedule a reboot
        }, null);
      }
    }
    reportState();  // Report our new state, hopefully clearing delta
  }
});

Event.on(Event.CLOUD_CONNECTED, function() {
  online = true;
  Shadow.update(0, {ram_total: Sys.total_ram()});
}, null);

Event.on(Event.CLOUD_DISCONNECTED, function() {
  online = false;
}, null);
