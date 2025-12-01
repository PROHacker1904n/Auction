import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const AddListing = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startPrice: '',
    startTime: '',
    endTime: '',
    category: '',
    condition: '',
    image: null
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      image: e.target.files[0]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Basic frontend validation before file processing
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
    if (!formData.image) {
      setMessage('Please select an image');
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

    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.readAsDataURL(formData.image);
      reader.onloadend = async () => {
        const imageBase64 = reader.result;
        
        const listingData = {
          title: formData.title,
          description: formData.description,
          startPrice: parseFloat(formData.startPrice),
          startTime: new Date(formData.startTime).toISOString(),
          endTime: new Date(formData.endTime).toISOString(),
          image: imageBase64,
          category: formData.category,
          condition: formData.condition,
          targetGender: formData.targetGender
        };

        await apiService.createListing(listingData);
        setMessage('Listing created successfully! It is now pending admin approval.');
        setTimeout(() => {
          navigate('/listings');
        }, 1500);
      };
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <FormContainer>
      <h2>Create a New Listing</h2>
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
        <Input
          type="file"
          name="image"
          accept="image/*"
          onChange={handleFileChange}
          required
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Listing'}
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
const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Basic frontend validation before file processing
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
    if (!formData.image) {
      setMessage('Please select an image');
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

    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.readAsDataURL(formData.image);
      reader.onloadend = async () => {
        try {
          const imageBase64 = reader.result;
          
          const listingData = {
            title: formData.title,
            description: formData.description,
            startPrice: parseFloat(formData.startPrice),
            startTime: new Date(formData.startTime).toISOString(),
            endTime: new Date(formData.endTime).toISOString(),
            image: imageBase64,
            category: formData.category,
            condition: formData.condition
          };

          await apiService.createListing(listingData);
          setMessage('Listing created successfully!');
          setTimeout(() => {
            navigate('/listings');
          }, 1500);
        } catch (error) {
          setMessage(`Error: ${error.message || 'Failed to create listing. Please check if the backend server is running.'}`);
          setLoading(false);
        }
      };
      reader.onerror = () => {
        setMessage('Error reading image file');
        setLoading(false);
      };
    } catch (error) {
      setMessage(`Error: ${error.message || 'Failed to create listing. Please check if the backend server is running.'}`);
      setLoading(false);
    }
  };

export default AddListing;
