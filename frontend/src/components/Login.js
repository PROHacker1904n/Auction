import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import {
  FormContainer,
  FormToggle,
  ToggleButton,
  Form,
  Input,
  Button,
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

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await apiService.login(formData.email, formData.password);
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

    try {
      const response = await apiService.register(formData.name, formData.email, formData.password, formData.gender, formData.urn, formData.graduationYear);
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
    <FormContainer>
      <FormToggle>
        <ToggleButton
          className={isLogin ? 'active' : ''}
          onClick={() => setIsLogin(true)}
        >
          Login
        </ToggleButton>
        <ToggleButton
          className={!isLogin ? 'active' : ''}
          onClick={() => setIsLogin(false)}
        >
          Sign Up
        </ToggleButton>
      </FormToggle>

      {isLogin ? (
        <>
          <h2>Login</h2>
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
            <Button type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </Form>
        </>
      ) : (
        <>
          <h2>Sign Up</h2>
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
              placeholder="URN"
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
            <Button type="submit" disabled={loading}>
              {loading ? 'Signing up...' : 'Sign Up'}
            </Button>
          </Form>
        </>
      )}

      {message && (
        <Message style={{ 
          color: message.includes('successful') ? 'green' : 'red',
          backgroundColor: message.includes('successful') ? '#d4edda' : '#f8d7da'
        }}>
          {message}
        </Message>
      )}
    </FormContainer>
  );
};

export default Login;
