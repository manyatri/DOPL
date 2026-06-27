// Yeh function login/signup ke baad ek "token" banata hai
// Token ek tarah ka digital pass hai jo prove karta hai user logged in hai

import jwt from 'jsonwebtoken';

function generateToken(userId) {
  return jwt.sign(
    { userId },              // token ke andar yeh data store hoga
    process.env.JWT_SECRET,  // secret key (.env file se aati hai)
    { expiresIn: '7d' }      // token 7 din tak valid rahega
  );
}

export default generateToken;
