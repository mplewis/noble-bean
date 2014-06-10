# LightBlue Bean via Node.js

Connect to your Bean via BLE with Node.js and [noble](https://github.com/sandeepmistry/noble). Interact with the Bean via its virtual serial port.

This isn't very functional yet, but feel free to hack on it and see what you can get working. I'm happy to accept pull requests.

# Usage

Install all required npm modules:

```
npm install
```

Change the UUID in `main.js` on line 8, replacing it with your Bean's UUID:

```
var MY_BEAN_UUID = '03953a79bcd444f1baedba9e201f42f4';
```

Start the app by running:

```
node main.js
```

Example output:

```
Scanning for BLE devices...
Bean discovered (Lewey's Bean @ 03953a79bcd444f1baedba9e201f42f4)
Connecting to Lewey's Bean...
Connected!
  a495ff10c5b14b44b5121370f02d74de
    a495ff11c5b14b44b5121370f02d74de (Bean Serial)
Subscribing to Bean serial characteristic...
Successfully subscribed to Bean serial notifications.
Data from serial: 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
Data from serial: 192,3,0,0,0,8,214,126
Data from serial: 192,3,0,0,0,8,214,126
Data from serial: 224,3,0,0,0,8,214,126
Data from serial: 224,3,0,0,0,8,214,126
Data from serial: 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
Data from serial: 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
Data from serial: 160,3,0,0,0,8,214,126
Data from serial: 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
^CDisconnecting from Bean...
Disconnected.
```

The above Bean has a sketch running that outputs data every two seconds. The Node.js script attempts to poll the Bean's serial characteristic once every second. Most of the time, it's getting back junk data (20 x `0` bytes). The shorter packets (length of 8 bytes) have good data.

# Todo

 * The Bean has Notify available on the Serial characteristic, so the Node script should be getting callbacks when the Bean has data available. I don't kow how to get notify working with noble.
 * Sometimes garbage data comes in, sometimes good data comes in. I haven't seen a pattern so far.
 * I haven't tried writing to the Bean serial characteristic yet.