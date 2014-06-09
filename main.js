var util = require('util');

var noble = require('noble');
var _ = require('lodash');

var BEAN_SERIAL_SERVICE_UUID = 'a495ff10c5b14b44b5121370f02d74de';
var BEAN_SERIAL_CHAR_UUID = 'a495ff11c5b14b44b5121370f02d74de';
var MY_BEAN_NAME = 'Lewey\'s Bean';

var connectedBean = null;

noble.on('stateChange', function(state) {
  if (state === 'poweredOn') {
    noble.startScanning();
    console.log('Scanning for BLE devices...');
  } else {
    noble.stopScanning();
    console.log('State changed to ' + '. Scanning stopped.');
  }
});

noble.on('discover', function(peripheral) {
  if (_.contains(peripheral.advertisement.serviceUuids, BEAN_SERIAL_SERVICE_UUID)) {
    var name = peripheral.advertisement.localName;
    var uuid = peripheral.uuid;
    console.log(util.format('Bean discovered (%s @ %s)', name, uuid));
    if (name === MY_BEAN_NAME) {
      noble.stopScanning();
      console.log('Connecting to ' + MY_BEAN_NAME + '...');
      peripheral.connect(function(err) {
        if (err) throw err;
        console.log('Connected!');
        connectedBean = peripheral;
        peripheral.discoverServices([BEAN_SERIAL_SERVICE_UUID], function(err, services) {
          if (err) throw err;
          services.forEach(function(service) {
            service.discoverCharacteristics([BEAN_SERIAL_CHAR_UUID], function(err, characteristics) {
            console.log('  ' + service.uuid);
              if (err) throw err;
              characteristics.forEach(function(characteristic) {
                console.log('    ' + characteristic.uuid + ' (Bean Serial)');
                console.log('Subscribing to Bean serial characteristic...');
                characteristic.notify(true, function(err) {
                  if (err) throw err;
                  console.log('Successfully subscribed to Bean serial notifications.');
                });
              });
            });
          });
        });
      });
    }
  }
});

process.stdin.resume();//so the program will not close instantly

var triedToExit = false;

function exitHandler(options, err) {
  if (connectedBean && !triedToExit) {
    triedToExit = true;
    console.log('Disconnecting from Bean...');
    connectedBean.disconnect(function(err) {
      console.log('Disconnected.');
      process.exit();
    });
  } else {
    process.exit();
  }
}

// catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));
