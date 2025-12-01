import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import Recommendations from './Recommendations';

const ListingsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
`;

const RecommendationsWrapper = styled.div`
  margin-bottom: 2rem;
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
  padding: 0 1rem 1rem;
`;

const EditButton = styled(Link)`
  flex: 1;
  text-align: center;
  padding: 0.5rem;
  border-radius: 5px;
  text-decoration: none;
  font-weight: 500;
  background-color: #f0c14b;
  border: 1px solid #a88734;
  color: #111;
`;

const DeleteButton = styled.button`
  flex: 1;
  text-align: center;
  padding: 0.5rem;
  border-radius: 5px;
  text-decoration: none;
  font-weight: 500;
  background-color: #e7e7e7;
  border: 1px solid #adadad;
  color: #111;
  cursor: pointer;
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
    return <div>Loading listings...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!listings.length) {
    return <div>No listings available.</div>;
  }

  return (
    <>
      <RecommendationsWrapper>
        <Recommendations layout='grid' />
      </RecommendationsWrapper>
      <h2>Current Listings</h2>
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
            <ProductCard key={listing._id} className={cardClass}>
              <StatusOverlay>
                <span>{statusText}</span>
              </StatusOverlay>
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
                      {listing.status === 'ended' ? 'Winning Bid:' : 'Current Bid:'}
                    </PriceLabel>
                    <br />
                    <PriceValue>₹{listing.currentBid.toLocaleString()}</PriceValue>
                  </ProductPrice>
                  <HighestBidder>
                    <BidderLabel>
                      {listing.status === 'ended' ? 'Winner:' : 'Highest Bid by:'}
                    </BidderLabel>
                    <br />
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
