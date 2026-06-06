import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FormContainer,
  FormToggle,
  ToggleButton,
  Form,
  Input,
  PrimaryButton,
  Message,
  Select
} from '../styles/GlobalStyles';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    gender: '',
    urn: '',
    graduationYear: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase().trim());
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const cleanEmail = formData.email.trim();
    if (!validateEmail(cleanEmail)) {
      setMessage('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      const response = await apiService.login(cleanEmail, formData.password);
      login(response.user, response.token);
      navigate('/listings');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const cleanEmail = formData.email.trim();
    if (!validateEmail(cleanEmail)) {
      setMessage('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      const response = await apiService.register(formData.name, cleanEmail, formData.password, formData.gender, formData.urn, formData.graduationYear);
      setMessage('Signup successful! Please login.');
      setIsLogin(true);
      setFormData({ name: '', email: '', password: '', gender: '', urn: '', graduationYear: '' });
    } catch (error) {
      setMessage(error.message);
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
      <FormToggle>
        <ToggleButton
          className={isLogin ? 'active' : ''}
          onClick={() => {
            setIsLogin(true);
            setMessage('');
          }}
        >
          Login
        </ToggleButton>
        <ToggleButton
          className={!isLogin ? 'active' : ''}
          onClick={() => {
            setIsLogin(false);
            setMessage('');
          }}
        >
          Sign Up
        </ToggleButton>
      </FormToggle>

      <AnimatePresence mode="wait">
        {isLogin ? (
          <motion.div
            key="login"
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 15 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <h2 style={{ marginBottom: '1.5rem', fontWeight: 800, letterSpacing: '-0.025em' }}>Login</h2>
            <Form onSubmit={handleLogin}>
              <Input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
              <Input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
              <PrimaryButton type="submit" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </PrimaryButton>
              <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
                <Link to="/forgot-password" style={{ color: '#4f46e5', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}>
                  Forgot Password?
                </Link>
              </div>
            </Form>
          </motion.div>
        ) : (
          <motion.div
            key="signup"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <h2 style={{ marginBottom: '1.5rem', fontWeight: 800, letterSpacing: '-0.025em' }}>Sign Up</h2>
            <Form onSubmit={handleSignup}>
              <Input
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
              <Input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
              <Input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
              <Select name="gender" value={formData.gender} onChange={handleInputChange}>
                <option value="" disabled>Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </Select>
              <Input
                type="text"
                name="urn"
                placeholder="URN (University Registration Number)"
                value={formData.urn}
                onChange={handleInputChange}
              />
              <Input
                type="number"
                name="graduationYear"
                placeholder="Graduation Year"
                value={formData.graduationYear}
                onChange={handleInputChange}
              />
              <PrimaryButton type="submit" disabled={loading}>
                {loading ? 'Signing up...' : 'Sign Up'}
              </PrimaryButton>
            </Form>
          </motion.div>
        )}
      </AnimatePresence>

      {message && (
        <Message style={{ 
          color: message.includes('successful') ? '#065f46' : '#991b1b',
          backgroundColor: message.includes('successful') ? '#d1fae5' : '#fee2e2',
          border: `1px solid ${message.includes('successful') ? '#34d399' : '#f87171'}40`
        }}>
          {message}
        </Message>
      )}
    </FormContainer>
  );
};

export default Login;
