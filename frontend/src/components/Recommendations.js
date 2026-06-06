import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { 
  ProductCard, 
  CardLink, 
  ProductImage, 
  ProductInfo, 
  ProductTitle, 
  ProductDescription, 
  ProductPrice, 
  PriceLabel, 
  PriceValue 
} from './shared/ProductCard';

const RecommendationsContainer = styled.div`
  margin-top: 2rem;
  h2 {
    font-size: 1.5rem;
    font-weight: 800;
    margin-bottom: 1.25rem;
    letter-spacing: -0.02em;
    color: ${props => props.theme.text};
  }
  p {
    color: ${props => props.theme.textSecondary};
    font-size: 0.95rem;
  }
`;

const ListingsContainer = styled.div`
  display: ${props => props.layout === 'grid' ? 'grid' : 'flex'};
  grid-template-columns: ${props => props.layout === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : 'none'};
  gap: 1.75rem;
  overflow-x: ${props => props.layout === 'grid' ? 'visible' : 'auto'};
  padding-bottom: 1rem;
  
  &::-webkit-scrollbar {
    height: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.border};
    border-radius: 999px;
  }
`;

const ListingCard = styled.div`
  flex: 0 0 240px;
  background: ${props => props.theme.backgroundCard};
  border: 1px solid ${props => props.theme.border};
  border-radius: 12px;
  overflow: hidden;
  box-shadow: ${props => props.theme.shadow};
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    border-color: ${props => props.theme.primary}20;
  }

  img {
    width: 100%;
    height: 140px;
    object-fit: cover;
    border-bottom: 1px solid ${props => props.theme.border};
  }

  .info {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    gap: 0.25rem;
  }

  h3 {
    font-size: 0.95rem;
    font-weight: 700;
    margin: 0;
    color: ${props => props.theme.text};
    letter-spacing: -0.01em;
  }

  p {
    font-size: 0.825rem;
    color: ${props => props.theme.textSecondary};
    margin: 0;
    font-weight: 500;
  }

  .price {
    font-size: 1.05rem;
    font-weight: 800;
    color: ${props => props.theme.primary};
    margin-top: 0.25rem;
  }

  a {
    display: block;
    padding: 0.625rem;
    text-align: center;
    background: ${props => props.theme.primary};
    color: white;
    text-decoration: none;
    font-weight: 700;
    font-size: 0.825rem;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: ${props => props.theme.primaryHover};
    }
  }
`;

const Recommendations = ({ layout = 'scroll', categoryId, currentListingId }) => {
  const [recommendations, setRecommendations] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const userId = user ? user._id : 'guest';
        let url = `/recommendations/${userId}`;
        
        const params = new URLSearchParams();
        if (categoryId) params.append('category', categoryId);
        if (currentListingId) params.append('listingId', currentListingId);
        
        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        const response = await api.get(url);
        setRecommendations(response);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      }
    };

    fetchRecommendations();
  }, [user, categoryId, currentListingId]);

  if (!recommendations.length) {
    return (
      <RecommendationsContainer>
        <h2>Recommended for you</h2>
        <p>No recommendations available at the moment. Explore other listings!</p>
      </RecommendationsContainer>
    );
  }

  return (
    <RecommendationsContainer>
      <h2>Recommended for you</h2>
      <ListingsContainer layout={layout}>
        {recommendations.map((listing) => {
          if (layout === 'grid') {
            return (
              <ProductCard key={listing._id}>
                <CardLink to={`/auction/${listing._id}`}>
                  <ProductImage>
                    <img src={listing.image} alt={listing.title} />
                  </ProductImage>
                  <ProductInfo>
                    <ProductTitle>{listing.title}</ProductTitle>
                    <ProductDescription>
                      {listing.description.substring(0, 100)}...
                    </ProductDescription>
                    <ProductPrice>
                      <PriceLabel>Start Price</PriceLabel>
                      <PriceValue>₹{listing.startPrice.toLocaleString()}</PriceValue>
                    </ProductPrice>
                  </ProductInfo>
                </CardLink>
              </ProductCard>
            );
          } else {
            return (
              <ListingCard key={listing._id}>
                <img src={listing.image} alt={listing.title} />
                <div className="info">
                  <h3>{listing.title}</h3>
                  <p>Start Price</p>
                  <div className="price">₹{listing.startPrice.toLocaleString()}</div>
                </div>
                <Link to={`/auction/${listing._id}`}>View Auction</Link>
              </ListingCard>
            );
          }
        })}
      </ListingsContainer>
    </RecommendationsContainer>
  );
};

export default Recommendations;
