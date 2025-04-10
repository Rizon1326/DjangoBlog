import React, { useState } from 'react';
import { verifyOTP } from '../../services/authService'; 
const VerifyOTP = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    try {
      const data = { email, otp };
      const response = await verifyOTP(data);
      setSuccess(response.message);
      setError('');
      console.log(response);
    } catch (err) {
      setError(err.message);
      setSuccess('');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <form onSubmit={handleVerifyOTP} className="bg-white p-4 rounded-md shadow-md">
        <h1 className="text-2xl mb-4">Verify OTP</h1>
        {error && <div className="text-red-500">{error}</div>}
        {success && <div className="text-green-500">{success}</div>}
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded mb-4"
            required
          />
        </div>
        <div>
          <label>OTP</label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full p-2 border rounded mb-4"
            required
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Verify OTP
        </button>
      </form>
    </div>
  );
};

export default VerifyOTP;
