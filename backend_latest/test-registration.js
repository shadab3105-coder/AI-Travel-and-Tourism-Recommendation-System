import axios from 'axios';

async function testRegistration() {
  try {
    console.log('Testing registration with mock OTP...');
    const uniqueEmail = `test-${Date.now()}@example.com`;
    const response = await axios.post('http://localhost:3001/api/auth/register-mobile', {
      email: uniqueEmail,
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      mobileNumber: '+919876543210'
    });

    console.log('✅ Registration response:', response.data);
    return response.data;
  } catch (error) {
    console.log('❌ Registration failed:', error.response?.data || error.message);
    return null;
  }
}

testRegistration();
