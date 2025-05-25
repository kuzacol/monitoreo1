import bcrypt from 'bcryptjs';

const password = 'Admin123!';
const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync(password, salt);

console.log('Admin Password:', password);
console.log('Generated Hash:', hash);

// Verificar que el hash funciona
const isValid = bcrypt.compareSync(password, hash);
console.log('Hash validation:', isValid); 