const qrcode = require('qrcode');
const path = require('path');
const fs = require('fs');

async function run() {
  const expoUri = 'exp://172.18.106.34:8081';
  const webUri = 'http://172.18.106.34:3000';

  const outDir = path.join(__dirname, '../../frontend/public');

  await qrcode.toFile(path.join(outDir, 'expo_qr.png'), expoUri, {
    width: 400,
    margin: 2,
    color: { dark: '#000000', light: '#ffffff' }
  });

  await qrcode.toFile(path.join(outDir, 'web_qr.png'), webUri, {
    width: 400,
    margin: 2,
    color: { dark: '#000000', light: '#ffffff' }
  });

  console.log('QR codes generated successfully in frontend/public/');
}

run();
