var util = require('util');

var noble = require('noble');
var _ = require('lodash');

var BEAN_SERIAL_SERVICE_UUID = 'a495ff10c5b14b44b5121370f02d74de';
var BEAN_SERIAL_CHAR_UUID = 'a495ff11c5b14b44b5121370f02d74de';
var MY_BEAN_UUID = '03953a79bcd444f1baedba9e201f42f4';

Buffer.prototype.toByteArray = function() { return Array.prototype.slice.call(this, 0); };

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
    if (uuid === MY_BEAN_UUID) {
      noble.stopScanning();
      console.log('Connecting to ' + name + '...');
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
                setInterval(function() {
                  characteristic.read(function(err, data) {
                    if (err) throw err;
                    console.log('Data from serial: ' + data.toByteArray());
                  });
                }, 1000);
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
