import bcrypt from 'bcryptjs';

const password = 'Gestor123!';
const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync(password, salt);

console.log('Password:', password);
console.log('Generated Hash:', hash);

// Verificar que el hash funciona
const isValid = bcrypt.compareSync(password, hash);
console.log('Hash validation:', isValid);

// Verificar con el hash actual
const currentHash = '$2a$10$XnxmKkVuAf/OK9eUFgYXu.K2.sal9KyHEZMX5qHQoL1Lz8.9ndtDu';
const isValidCurrent = bcrypt.compareSync(password, currentHash);
console.log('Current hash validation:', isValidCurrent); 