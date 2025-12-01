import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import {
  FormContainer,
  Form,
  Input,
  TextArea,
  Button,
  Message,
  Select
} from '../styles/GlobalStyles';

const EditListing = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startPrice: '',
    startTime: '',
    endTime: '',
    category: '',
    condition: ''
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
        condition: listing.condition || ''
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
    return <div>Loading listing...</div>;
  }

  return (
    <FormContainer>
      <h2>Edit Listing</h2>
      <Form onSubmit={handleSubmit}>
        <Input
          type="text"
          name="title"
          placeholder="Listing Title"
          value={formData.title}
          onChange={handleInputChange}
          required
        />
        <TextArea
          name="description"
          placeholder="Detailed Description"
          value={formData.description}
          onChange={handleInputChange}
          required
        />
        <label htmlFor="category">Category:</label>
        <Select
          name="category"
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
        <label htmlFor="condition">Condition:</label>
        <Select
          name="condition"
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
        <label htmlFor="targetGender">Target Gender:</label>
        <Select
          name="targetGender"
          value={formData.targetGender}
          onChange={handleInputChange}
        >
          <option value="all">All</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </Select>
        <Input
          type="number"
          name="startPrice"
          placeholder="Starting Price"
          value={formData.startPrice}
          onChange={handleInputChange}
          required
          min="0"
          step="0.01"
        />
        <label htmlFor="startTime">Auction Start Time:</label>
        <Input
          type="datetime-local"
          name="startTime"
          value={formData.startTime}
          onChange={handleInputChange}
          required
        />
        <label htmlFor="endTime">Auction End Time:</label>
        <Input
          type="datetime-local"
          name="endTime"
          value={formData.endTime}
          onChange={handleInputChange}
          required
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'Updating...' : 'Update Listing'}
        </Button>
      </Form>
      {message && (
        <Message style={{ 
          color: message.includes('successfully') ? 'green' : 'red',
          backgroundColor: message.includes('successfully') ? '#d4edda' : '#f8d7da'
        }}>
          {message}
        </Message>
      )}
    </FormContainer>
  );
};

export default EditListing;
