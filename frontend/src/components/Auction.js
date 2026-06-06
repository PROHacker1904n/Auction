import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import styled from 'styled-components';
import { Form, Input, PrimaryButton, Message } from '../styles/GlobalStyles';
import Recommendations from './Recommendations';
import { motion } from 'framer-motion';

const AuctionContainer = styled.div`
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 3rem;
  max-width: 1200px;
  margin: 1rem auto 2rem;
  background: ${props => props.theme.backgroundCard};
  border: 1px solid ${props => props.theme.border};
  padding: 3rem;
  border-radius: 24px;
  box-shadow: ${props => props.theme.shadow};
  position: relative;
  transition: all 0.3s ease;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: 2.5rem;
    padding: 2rem;
  }
`;

const AuctionImageColumn = styled.div`
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid ${props => props.theme.border};
  height: max-content;

  img {
    width: 100%;
    display: block;
    object-fit: cover;
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
      transform: scale(1.02);
    }
  }
`;

const AuctionDetailsColumn = styled.div`
  display: flex;
  flex-direction: column;
`;

const AuctionTitle = styled.h2`
  font-size: 2.25rem;
  font-weight: 800;
  letter-spacing: -0.025em;
  margin-bottom: 1rem;
  color: ${props => props.theme.text};
  line-height: 1.15;
`;

const AuctionDescription = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  color: ${props => props.theme.textSecondary};
  margin-bottom: 2rem;
`;

const AuctionMeta = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
  font-size: 0.875rem;
  color: ${props => props.theme.textSecondary};
  padding: 1.25rem 0;
  border-top: 1px solid ${props => props.theme.border};
  border-bottom: 1px solid ${props => props.theme.border};
  margin-bottom: 2rem;

  span {
    display: flex;
    justify-content: space-between;
  }

  em {
    font-style: normal;
    font-weight: 600;
    color: ${props => props.theme.text};
  }
`;

const PriceBox = styled.div`
  background-color: ${props => props.theme.secondary};
  border: 1px solid ${props => props.theme.border};
  border-radius: 16px;
  padding: 1.5rem;
  text-align: center;
  margin-bottom: 2rem;
  transition: all 0.3s ease;

  .price-label {
    font-size: 0.825rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: ${props => props.theme.textSecondary};
    display: block;
    margin-bottom: 0.5rem;
  }

  .price-value {
    font-size: 2.75rem;
    font-weight: 800;
    color: ${props => props.theme.primary};
    display: block;
    letter-spacing: -0.03em;
  }

  .bidder-info {
    font-size: 0.875rem;
    color: ${props => props.theme.textSecondary};
    margin-top: 0.75rem;
    border-top: 1px solid ${props => props.theme.border}80;
    padding-top: 0.75rem;

    strong {
      color: ${props => props.theme.text};
      font-weight: 700;
    }
  }
`;

const BidForm = styled(Form)`
  h3 {
    font-size: 1.1rem;
    font-weight: 700;
    margin-bottom: 0.75rem;
    color: ${props => props.theme.text};
  }
`;

const BidInputGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;

  input {
    flex-grow: 1;
    font-size: 1rem;
    padding: 0.75rem 1.25rem;
  }

  button {
    font-size: 1rem;
    padding: 0.75rem 1.5rem;
    white-space: nowrap;
  }
`;

const OwnerNotice = styled.div`
  background-color: ${props => props.theme.secondary};
  border: 1px solid ${props => props.theme.border};
  border-radius: 12px;
  padding: 1.25rem;
  text-align: center;
  color: ${props => props.theme.textSecondary};
  font-weight: 500;
  
  h3 {
    color: ${props => props.theme.text};
    margin-bottom: 0.5rem;
    font-weight: 700;
  }

  strong {
    color: ${props => props.theme.text};
  }
`;

const BidLogContainer = styled.div`
  grid-column: 1 / -1;
  margin-top: 3rem;
  border-top: 1px solid ${props => props.theme.border};
  padding-top: 2rem;

  h3 {
    font-size: 1.35rem;
    font-weight: 800;
    letter-spacing: -0.015em;
    margin-bottom: 1.25rem;
    color: ${props => props.theme.text};
  }
`;

const BidLog = styled.ul`
  list-style: none;
  padding: 0;
  max-height: 250px;
  overflow-y: auto;
  border: 1px solid ${props => props.theme.border};
  border-radius: 12px;
  background-color: ${props => props.theme.backgroundCard};
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.border};
    border-radius: 999px;
  }
`;

const BidItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid ${props => props.theme.border};
  font-size: 0.95rem;
  transition: background-color 0.2s ease;

  span:first-child {
    font-weight: 600;
    color: ${props => props.theme.text};
  }

  span:last-child {
    font-weight: 800;
    color: ${props => props.theme.primary};
  }

  &:hover {
    background-color: ${props => props.theme.secondary}40;
  }

  &.highest-bid {
    background-color: ${props => props.theme.accent}12;
    border-left: 4px solid ${props => props.theme.accent};
    
    span:last-child {
      color: ${props => props.theme.accent};
    }
  }

  &:last-child {
    border-bottom: none;
  }
`;

const TimerOverlay = styled.div`
  position: absolute;
  top: 1.25rem;
  left: 1.25rem;
  background-color: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(8px);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  font-weight: 800;
  font-size: 0.9rem;
  font-variant-numeric: tabular-nums;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  display: flex;
  align-items: center;
  gap: 0.35rem;
  z-index: 10;
`;

const RecommendationsWrapper = styled.div`
  grid-column: 1 / -1;
  margin-top: 3rem;
  border-top: 1px solid ${props => props.theme.border};
  padding-top: 2rem;
`;

const Auction = () => {
  const [listing, setListing] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [bidLoading, setBidLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState(null);
  
  const { user, isAuthenticated } = useAuth();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      loadAuction();
      loadBids();
    }
  }, [id]);

  useEffect(() => {
    if (listing && listing.status === 'active') {
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const endTime = new Date(listing.endTime).getTime();
        const distance = endTime - now;
        setTimeLeft(distance);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [listing]);

  const loadAuction = async () => {
    try {
      const data = await apiService.getListing(id);
      setListing(data);
    } catch (error) {
      setMessage('Error loading auction details.');
      console.error('Failed to load auction:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBids = async () => {
    try {
      const data = await apiService.getBidsForListing(id);
      setBids(data);
    } catch (error) {
      console.error('Failed to load bids:', error);
    }
  };

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      alert('Please login to place a bid.');
      return;
    }

    setBidLoading(true);
    setMessage('');

    try {
      await apiService.placeBid(id, parseFloat(bidAmount));
      setBidAmount('');
      loadAuction(); // Refresh auction details
      loadBids();
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setBidLoading(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--textSecondary)' }}>Loading auction...</div>;
  }

  if (!listing) {
    return <div style={{ textAlign: 'center', padding: '5rem', color: '#ef4444' }}>Listing not found.</div>;
  }

  const isOwner = listing.seller && listing.seller._id === user?.id;
  const highestBidderName = listing.highestBidder ? listing.highestBidder.name : 'No bids yet';
  const winnerName = listing.winner ? listing.winner.name : 'N/A';

  const formatTime = (ms) => {
    if (ms < 0) return '00:00:00';
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    }
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const renderBidSection = () => {
    if (listing.status === 'ended') {
      return (
        <OwnerNotice>
          <h3>Auction Ended</h3>
          <p>Winner: <strong>{winnerName}</strong></p>
          <p>Winning Bid: <strong>₹{listing.currentBid.toLocaleString()}</strong></p>
        </OwnerNotice>
      );
    } else if (listing.status === 'pending') {
      return (
        <OwnerNotice>
          <h3>Auction Starts Soon</h3>
          <p>Bidding will open at {new Date(listing.startTime).toLocaleString()}.</p>
        </OwnerNotice>
      );
    } else if (listing.status === 'active') {
      if (isOwner) {
        return (
          <OwnerNotice>
            <p>You cannot bid on your own listing.</p>
          </OwnerNotice>
        );
      } else {
        return (
          <BidForm onSubmit={handleBidSubmit}>
            <h3>Place Your Bid</h3>
            <BidInputGroup>
              <Input
                type="number"
                placeholder={`Min Bid: ₹${(listing.currentBid + 1).toLocaleString()}`}
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                min={listing.currentBid + 1}
                required
              />
              <PrimaryButton type="submit" disabled={bidLoading}>
                {bidLoading ? 'Placing...' : 'Place Bid'}
              </PrimaryButton>
            </BidInputGroup>
          </BidForm>
        );
      }
    }
  };

  return (
    <AuctionContainer
      as={motion.div}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <AuctionImageColumn>
        {timeLeft !== null && (
          <TimerOverlay>
            ⏱️ {formatTime(timeLeft)}
          </TimerOverlay>
        )}
        <img src={listing.image} alt={listing.title} />
      </AuctionImageColumn>
      <AuctionDetailsColumn>
        <AuctionTitle>{listing.title}</AuctionTitle>
        <AuctionDescription>{listing.description}</AuctionDescription>
        <AuctionMeta>
          <span>Seller: <em>{listing.seller ? listing.seller.name : 'Unknown'}</em></span>
          <span>Starts: <em>{new Date(listing.startTime).toLocaleString()}</em></span>
          <span>Ends: <em>{new Date(listing.endTime).toLocaleString()}</em></span>
        </AuctionMeta>
        <PriceBox>
          <span className="price-label">
            {listing.status === 'ended' ? 'Winning Bid' : 'Current Bid'}
          </span>
          <span className="price-value">₹{listing.currentBid.toLocaleString()}</span>
          <div className="bidder-info">
            {listing.status === 'ended' ? 'Winner:' : 'Highest bid by:'} <strong>
              {listing.status === 'ended' ? winnerName : highestBidderName}
            </strong>
          </div>
        </PriceBox>
        {renderBidSection()}
        {message && (
          <Message style={{ 
            color: '#991b1b',
            backgroundColor: '#fee2e2',
            border: '1px solid #f8717140'
          }}>
            {message}
          </Message>
        )}
      </AuctionDetailsColumn>
      <BidLogContainer>
        <h3>Bid History</h3>
        {bids.length === 0 ? (
          <p style={{ color: 'var(--textSecondary)', fontStyle: 'italic' }}>No bids placed yet.</p>
        ) : (
          <BidLog>
            {bids.map((bid, index) => (
              <BidItem key={bid._id} className={index === 0 ? 'highest-bid' : ''}>
                <span>{bid.bidder.name}</span>
                <span>₹{bid.amount.toLocaleString()}</span>
              </BidItem>
            ))}
          </BidLog>
        )}
      </BidLogContainer>
      
      <RecommendationsWrapper>
        <Recommendations 
            categoryId={listing.category} 
            currentListingId={id} 
        />
      </RecommendationsWrapper>
    </AuctionContainer>
  );
};

export default Auction;
