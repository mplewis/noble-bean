var util = require('util');

var noble = require('noble');
var _ = require('lodash');

var BEAN_SERIAL_SERVICE_UUID = 'a495ff10c5b14b44b5121370f02d74de';

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
    console.log(util.format('Bean discovered (%s @ %s)', peripheral.advertisement.localName, peripheral.uuid));
  }
});
