import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Container = styled.div`
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  margin-bottom: 1.5rem;
  text-align: center;
  color: #333;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Input = styled.input`
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const Button = styled.button`
  padding: 0.8rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #0056b3;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  text-align: center;
  margin-top: 0.5rem;
`;

const SuccessMessage = styled.div`
  color: #28a745;
  text-align: center;
  margin-top: 0.5rem;
`;

const StepIndicator = styled.div`
  text-align: center;
  margin-bottom: 1rem;
  color: #666;
  font-size: 0.9rem;
`;

function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.forgotPassword(email);
      setSuccess('OTP sent successfully to your email');
      setTimeout(() => {
        setStep(2);
        setSuccess('');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.verifyOtp(email, otp);
      setSuccess('OTP verified successfully');
      setTimeout(() => {
        setStep(3);
        setSuccess('');
      }, 1000);
    } catch (err) {
      setError(err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.resetPassword(email, otp, newPassword);
      setSuccess('Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Title>Reset Password</Title>
      
      {step === 1 && (
        <Form onSubmit={handleEmailSubmit}>
          <StepIndicator>Step 1 of 3: Enter your email</StepIndicator>
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button type="submit" disabled={loading}>
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </Button>
        </Form>
      )}

      {step === 2 && (
        <Form onSubmit={handleOtpSubmit}>
          <StepIndicator>Step 2 of 3: Verify OTP</StepIndicator>
          <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
            Sent to: <strong>{email}</strong>
          </div>
          <Input
            type="text"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            maxLength="6"
          />
          <Button type="submit" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify OTP'}
          </Button>
          <Button 
            type="button" 
            onClick={() => setStep(1)} 
            style={{ backgroundColor: '#6c757d', marginTop: '0.5rem' }}
          >
            Back to Email
          </Button>
        </Form>
      )}

      {step === 3 && (
        <Form onSubmit={handlePasswordReset}>
          <StepIndicator>Step 3 of 3: Set New Password</StepIndicator>
          <Input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength="6"
          />
          <Input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength="6"
          />
          <Button type="submit" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </Form>
      )}

      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}
    </Container>
  );
}

export default ForgotPassword;
