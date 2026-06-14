// pbkdf2-test.js
const crypto = require('crypto');
const password = '12345';
const salt = crypto.randomBytes(16).toString('hex');
const iterations = 250000; // try the secure number you want
const keylen = 64;
const digest = 'sha512';

console.log('PBKDF2 test start:', { iterations });
const t0 = Date.now();
crypto.pbkdf2(password, salt, iterations, keylen, digest, (err) => {
  if (err) return console.error('async error', err);
  console.log('async pbkdf2 done, ms =', Date.now() - t0);
});
