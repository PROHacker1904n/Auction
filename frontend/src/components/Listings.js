import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import Recommendations from './Recommendations';
import { motion } from 'framer-motion';

const ListingsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.75rem;
`;

const RecommendationsWrapper = styled.div`
  margin-bottom: 2.5rem;
`;

const Title = styled.h2`
  font-size: 1.75rem;
  font-weight: 800;
  letter-spacing: -0.025em;
  margin-bottom: 1.5rem;
  color: ${props => props.theme.text};
`;

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

const OwnerActions = styled.div`
  display: flex;
  gap: 0.5rem;
  padding: 0 1.25rem 1.25rem;
  border-top: 1px solid ${props => props.theme.border};
  padding-top: 0.875rem;
  margin-top: auto;
`;

const EditButton = styled(Link)`
  flex: 1;
  text-align: center;
  padding: 0.5rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.825rem;
  background-color: ${props => props.theme.primary};
  border: 1px solid transparent;
  color: white;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${props => props.theme.primaryHover};
    transform: translateY(-1px);
  }
`;

const DeleteButton = styled.button`
  flex: 1;
  text-align: center;
  padding: 0.5rem;
  border-radius: 8px;
  border: 1px solid ${props => props.theme.border};
  font-weight: 600;
  font-size: 0.825rem;
  background-color: ${props => props.theme.secondary};
  color: ${props => props.theme.text};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${props => props.theme.secondaryHover};
    transform: translateY(-1px);
  }
`;

const Listings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    try {
      const data = await apiService.getListings();
      setListings(data);
    } catch (error) {
      setError('Error loading listings. Please try again later.');
      console.error('Failed to load listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        await apiService.deleteListing(id);
        loadListings();
      } catch (error) {
        alert(`Error: ${error.message}`);
      }
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--textSecondary)' }}>Loading listings...</div>;
  }

  if (error) {
    return <div style={{ color: '#ef4444', textAlign: 'center', padding: '3rem' }}>{error}</div>;
  }

  if (!listings.length) {
    return <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--textSecondary)' }}>No listings available.</div>;
  }

  return (
    <>
      <RecommendationsWrapper>
        <Recommendations layout='grid' />
      </RecommendationsWrapper>
      <Title>Current Listings</Title>
      <ListingsContainer>
        {listings.map((listing) => {
          const isOwner = listing.seller && listing.seller._id === user?.id;
          const highestBidderName = listing.highestBidder ? listing.highestBidder.name : 'No bids yet';
          const winnerName = listing.winner ? listing.winner.name : 'N/A';
          
          let cardClass = 'product-card';
          let statusText = '';
          if (listing.status === 'ended') {
            cardClass += ' ended';
            statusText = 'Auction Ended';
          } else if (listing.status === 'pending') {
            cardClass += ' pending';
            statusText = 'Starts Soon';
          }

          return (
            <ProductCard 
              as={motion.div}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              key={listing._id} 
              className={cardClass}
            >
              {statusText && (
                <StatusOverlay>
                  <span>{statusText}</span>
                </StatusOverlay>
              )}
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
                    <PriceLabel>
                      {listing.status === 'ended' ? 'Winning Bid' : 'Current Bid'}
                    </PriceLabel>
                    <PriceValue>₹{listing.currentBid.toLocaleString()}</PriceValue>
                  </ProductPrice>
                  <HighestBidder>
                    <BidderLabel>
                      {listing.status === 'ended' ? 'Winner:' : 'Highest Bid by:'}
                    </BidderLabel>
                    <BidderName>
                      {listing.status === 'ended' ? winnerName : highestBidderName}
                    </BidderName>
                  </HighestBidder>
                </ProductInfo>
              </CardLink>
              {isOwner && (
                <OwnerActions>
                  <EditButton to={`/edit-listing/${listing._id}`}>Edit</EditButton>
                  <DeleteButton onClick={() => handleDelete(listing._id)}>
                    Delete
                  </DeleteButton>
                </OwnerActions>
              )}
            </ProductCard>
          );
        })}
      </ListingsContainer>
    </>
  );
};

export default Listings;
