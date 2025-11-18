//generate hash.js
const bcrypt = require('bcrypt');

const password = 'jay1234';

bcrypt.hash(password, 10).then(hash => {
    console.log('Generated hash:', hash);
});