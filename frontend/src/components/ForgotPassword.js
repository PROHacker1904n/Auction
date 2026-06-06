import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FormContainer,
  Form,
  Input,
  PrimaryButton,
  SecondaryButton,
  Message
} from '../styles/GlobalStyles';

const StepIndicator = ({ step }) => (
  <div style={{ textAlign: 'center', marginBottom: '1.25rem', color: '#64748b', fontSize: '0.875rem', fontWeight: 600 }}>
    Step {step} of 3
  </div>
);

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

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase().trim());
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const cleanEmail = email.trim();
    if (!validateEmail(cleanEmail)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    setEmail(cleanEmail);

    try {
      await api.forgotPassword(cleanEmail);
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
    <FormContainer
      as={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <h2 style={{ marginBottom: '1.5rem', fontWeight: 800, letterSpacing: '-0.025em', textAlign: 'center' }}>Reset Password</h2>
      
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 15 }}
            transition={{ duration: 0.25 }}
          >
            <Form onSubmit={handleEmailSubmit}>
              <StepIndicator step={1} />
              <div style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.5rem', textAlign: 'center' }}>
                Enter your registered email address to receive a 6-digit OTP.
              </div>
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <PrimaryButton type="submit" disabled={loading}>
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </PrimaryButton>
            </Form>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.25 }}
          >
            <Form onSubmit={handleOtpSubmit}>
              <StepIndicator step={2} />
              <div style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '0.9rem', color: '#64748b' }}>
                Sent to: <strong style={{ color: 'var(--text)' }}>{email}</strong>
              </div>
              <Input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                maxLength="6"
              />
              <PrimaryButton type="submit" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify OTP'}
              </PrimaryButton>
              <SecondaryButton 
                type="button" 
                onClick={() => setStep(1)} 
                style={{ marginTop: '0.5rem' }}
              >
                Back to Email
              </SecondaryButton>
            </Form>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
          >
            <Form onSubmit={handlePasswordReset}>
              <StepIndicator step={3} />
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
              <PrimaryButton type="submit" disabled={loading}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </PrimaryButton>
            </Form>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <Message style={{ color: '#991b1b', backgroundColor: '#fee2e2', border: '1px solid #f8717140' }}>
          {error}
        </Message>
      )}
      {success && (
        <Message style={{ color: '#065f46', backgroundColor: '#d1fae5', border: '1px solid #34d39940' }}>
          {success}
        </Message>
      )}
    </FormContainer>
  );
}

export default ForgotPassword;
