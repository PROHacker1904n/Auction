
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { 
  ProductCard, 
  StatusOverlay, 
  CardLink, 
  ProductImage, 
  ProductInfo, 
  ProductTitle, 
  ProductDescription, 
  ProductPrice, 
  PriceLabel, 
  PriceValue, 
  HighestBidder, 
  BidderLabel, 
  BidderName 
} from './shared/ProductCard';

const RecommendationsContainer = styled.div`
  margin-top: 2rem;
  h2 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }
`;

const ListingsContainer = styled.div`
  display: ${props => props.layout === 'grid' ? 'grid' : 'flex'};
  grid-template-columns: ${props => props.layout === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : 'none'};
  gap: 1.5rem;
  overflow-x: ${props => props.layout === 'grid' ? 'visible' : 'auto'};
  padding-bottom: 1rem;
  &::-webkit-scrollbar {
    height: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 4px;
  }
`;

const ListingCard = styled.div`
  flex: 0 0 200px;
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  img {
    width: 100%;
    height: 120px;
    object-fit: cover;
  }
  h3 {
    font-size: 1rem;
    font-weight: 600;
    padding: 0.5rem;
    margin: 0;
  }
  p {
    font-size: 0.9rem;
    padding: 0 0.5rem 0.5rem;
    margin: 0;
  }
  a {
    display: block;
    padding: 0.5rem;
    text-align: center;
    background: #f0c14b;
    color: #111;
    text-decoration: none;
    font-weight: 600;
  }
`;

const Recommendations = ({ layout = 'scroll' }) => {
  const [recommendations, setRecommendations] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (user) {
        try {
          const response = await api.get(`/recommendations/${user._id}`);
          setRecommendations(response);
        } catch (error) {
          console.error('Error fetching recommendations:', error);
        }
      }
    };

    fetchRecommendations();
  }, [user]);

  if (!recommendations.length) {
    return null;
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
                      <PriceLabel>Start Price:</PriceLabel>
                      <br />
                      <PriceValue>${listing.startPrice}</PriceValue>
                    </ProductPrice>
                  </ProductInfo>
                </CardLink>
              </ProductCard>
            )
          } else {
            return (
              <ListingCard key={listing._id}>
                <img src={listing.image} alt={listing.title} />
                <h3>{listing.title}</h3>
                <p>Start Price: ${listing.startPrice}</p>
                <a href={`/auction/${listing._id}`}>View Auction</a>
              </ListingCard>
            )
          }
        })}
      </ListingsContainer>
    </RecommendationsContainer>
  );
};

export default Recommendations;
