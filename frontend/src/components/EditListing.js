import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
  FormContainer,
  Form,
  Input,
  TextArea,
  PrimaryButton,
  Message,
  Select,
  FormGroup,
  StyledLabel
} from '../styles/GlobalStyles';

const StyledFormContainer = styled(FormContainer)`
  max-width: 600px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
  width: 100%;

  @media (min-width: 640px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const FullWidthGroup = styled(FormGroup)`
  @media (min-width: 640px) {
    grid-column: span 2;
  }
`;

const EditListing = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startPrice: '',
    startTime: '',
    endTime: '',
    category: '',
    condition: '',
    targetGender: 'all'
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (id) {
      loadListing();
    }
  }, [id]);

  const loadListing = async () => {
    try {
      const listing = await apiService.getListing(id);
      setFormData({
        title: listing.title,
        description: listing.description,
        startPrice: listing.startPrice.toString(),
        startTime: new Date(listing.startTime).toISOString().slice(0, 16),
        endTime: new Date(listing.endTime).toISOString().slice(0, 16),
        category: listing.category || '',
        condition: listing.condition || '',
        targetGender: listing.targetGender || 'all'
      });
    } catch (error) {
      setMessage(`Error loading listing: ${error.message}`);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Basic validation
      if (!formData.category) {
        setMessage('Please select a category');
        setLoading(false);
        return;
      }
      if (!formData.condition) {
        setMessage('Please select a condition');
        setLoading(false);
        return;
      }
      if (formData.startTime && formData.endTime) {
        const start = new Date(formData.startTime).getTime();
        const end = new Date(formData.endTime).getTime();
        if (isFinite(start) && isFinite(end) && end <= start) {
          setMessage('End time must be after start time');
          setLoading(false);
          return;
        }
      }

      const listingData = {
        title: formData.title,
        description: formData.description,
        startPrice: parseFloat(formData.startPrice),
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
        category: formData.category,
        condition: formData.condition,
        targetGender: formData.targetGender
      };

      await apiService.updateListing(id, listingData);
      setMessage('Listing updated successfully!');
      setTimeout(() => {
        navigate('/listings');
      }, 1500);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (initialLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh', fontWeight: 600 }}>
        Loading listing...
      </div>
    );
  }

  return (
    <StyledFormContainer
      as={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <h2 style={{ marginBottom: '2rem', fontWeight: 800, letterSpacing: '-0.025em', textAlign: 'center' }}>
        Edit Listing
      </h2>
      <Form onSubmit={handleSubmit}>
        <FormGrid>
          <FullWidthGroup>
            <StyledLabel htmlFor="title">Listing Title</StyledLabel>
            <Input
              type="text"
              name="title"
              id="title"
              placeholder="e.g. Vintage Leather Jacket"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </FullWidthGroup>

          <FullWidthGroup>
            <StyledLabel htmlFor="description">Detailed Description</StyledLabel>
            <TextArea
              name="description"
              id="description"
              placeholder="Describe the condition, size, history, and any other relevant details..."
              value={formData.description}
              onChange={handleInputChange}
              required
            />
          </FullWidthGroup>

          <FormGroup>
            <StyledLabel htmlFor="category">Category</StyledLabel>
            <Select
              name="category"
              id="category"
              value={formData.category}
              onChange={handleInputChange}
              required
            >
              <option value="" disabled>Select a category</option>
              <option value="electronics">Electronics</option>
              <option value="fashion">Fashion</option>
              <option value="collectibles">Collectibles</option>
              <option value="home">Home & Garden</option>
              <option value="toys">Toys & Hobbies</option>
              <option value="sports">Sports</option>
              <option value="vehicles">Vehicles</option>
              <option value="stationary">Stationary</option>
              <option value="other">Other</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <StyledLabel htmlFor="condition">Condition</StyledLabel>
            <Select
              name="condition"
              id="condition"
              value={formData.condition}
              onChange={handleInputChange}
              required
            >
              <option value="" disabled>Select condition</option>
              <option value="new">New</option>
              <option value="like-new">Like New</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <StyledLabel htmlFor="targetGender">Target Gender</StyledLabel>
            <Select
              name="targetGender"
              id="targetGender"
              value={formData.targetGender}
              onChange={handleInputChange}
            >
              <option value="all">All</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <StyledLabel htmlFor="startPrice">Starting Price ($)</StyledLabel>
            <Input
              type="number"
              name="startPrice"
              id="startPrice"
              placeholder="0.00"
              value={formData.startPrice}
              onChange={handleInputChange}
              required
              min="0"
              step="0.01"
            />
          </FormGroup>

          <FormGroup>
            <StyledLabel htmlFor="startTime">Auction Start Time</StyledLabel>
            <Input
              type="datetime-local"
              name="startTime"
              id="startTime"
              value={formData.startTime}
              onChange={handleInputChange}
              required
            />
          </FormGroup>

          <FormGroup>
            <StyledLabel htmlFor="endTime">Auction End Time</StyledLabel>
            <Input
              type="datetime-local"
              name="endTime"
              id="endTime"
              value={formData.endTime}
              onChange={handleInputChange}
              required
            />
          </FormGroup>
        </FormGrid>

        <PrimaryButton type="submit" disabled={loading} style={{ marginTop: '1rem', width: '100%' }}>
          {loading ? 'Updating Listing...' : 'Update Listing'}
        </PrimaryButton>
      </Form>
      {message && (
        <Message style={{ 
          color: message.includes('successfully') ? '#065f46' : '#991b1b',
          backgroundColor: message.includes('successfully') ? '#d1fae5' : '#fee2e2',
          border: `1px solid ${message.includes('successfully') ? '#34d399' : '#f87171'}40`
        }}>
          {message}
        </Message>
      )}
    </StyledFormContainer>
  );
};

export default EditListing;
