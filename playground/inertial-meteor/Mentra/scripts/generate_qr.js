const QRCode = require('qrcode');
const fs = require('fs');

const data = 'exp://192.168.1.147:8081';
const path = 'expo_qr_real.png';

QRCode.toFile(path, data, {
  color: {
    dark: '#000000',
    light: '#ffffff'
  },
  width: 400
}, function (err) {
  if (err) throw err;
  console.log('QR code saved to ' + path);
});
