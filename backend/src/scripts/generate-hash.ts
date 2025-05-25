import bcrypt from 'bcryptjs';

const password = 'Admin123!';
const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync(password, salt);

console.log('Password:', password);
console.log('Generated Hash:', hash);

// Verify the hash works
const isValid = bcrypt.compareSync(password, hash);
console.log('Hash verification:', isValid); 