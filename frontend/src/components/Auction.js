import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import styled from 'styled-components';
import { Form, Input, Button, Message } from '../styles/GlobalStyles';
import Recommendations from './Recommendations';

const AuctionContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  background: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const AuctionImageColumn = styled.div`
  img {
    width: 100%;
    border-radius: 8px;
    object-fit: cover;
  }
`;

const AuctionDetailsColumn = styled.div`
  display: flex;
  flex-direction: column;
`;

const AuctionTitle = styled.h2`
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 1rem;
`;

const AuctionDescription = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  color: #555;
  flex-grow: 1;
  margin-bottom: 1.5rem;
`;

const AuctionMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #777;
  padding: 1rem 0;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
  margin-bottom: 1.5rem;
`;

const PriceBox = styled.div`
  background-color: #f9f9f9;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  margin-bottom: 1.5rem;

  .price-label {
    font-size: 1rem;
    color: #555;
    display: block;
    margin-bottom: 0.5rem;
  }

  .price-value {
    font-size: 2.5rem;
    font-weight: 700;
    color: #B12704;
    display: block;
  }

  .bidder-info {
    font-size: 0.9rem;
    color: #555;
    margin-top: 0.5rem;
  }
`;

const BidForm = styled(Form)`
  h3 {
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }
`;

const BidInputGroup = styled.div`
  display: flex;
  gap: 0.5rem;

  input {
    flex-grow: 1;
    font-size: 1.1rem;
  }

  button {
    font-size: 1.1rem;
    background-color: #f0c14b;
    border: 1px solid #a88734;
    color: #111;

    &:hover {
      background-color: #eab530;
    }
  }
`;

const OwnerNotice = styled.div`
  background-color: #f9f9f9;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  color: #555;
`;

const BidLogContainer = styled.div`
  margin-top: 2rem;
  h3 {
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }
`;

const BidLog = styled.ul`
  list-style: none;
  padding: 0;
  max-height: 200px;
  overflow-y: auto;
`;

const BidItem = styled.li`
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
  border-bottom: 1px solid #eee;

  &.highest-bid {
    background-color: #fff3cd;
  }
`;

const Timer = styled.div`
  position: absolute;
  top: 1rem;
  left: 1rem;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 5px;
`;


const RecommendationsWrapper = styled.div`
  grid-column: 1 / -1;
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
    return <div>Loading auction...</div>;
  }

  if (!listing) {
    return <div>Listing not found.</div>;
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
                placeholder="Enter bid amount"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                min={listing.currentBid + 1}
                required
              />
              <Button type="submit" disabled={bidLoading}>
                {bidLoading ? 'Placing...' : 'Place Bid'}
              </Button>
            </BidInputGroup>
          </BidForm>
        );
      }
    }
  };

  return (
    <AuctionContainer>
      {timeLeft !== null && <Timer>{formatTime(timeLeft)}</Timer>}
      <AuctionImageColumn>
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
            color: 'red',
            backgroundColor: '#f8d7da'
          }}>
            {message}
          </Message>
        )}
      </AuctionDetailsColumn>
      <BidLogContainer>
        <h3>Bid History</h3>
        <BidLog>
          {bids.map((bid, index) => (
            <BidItem key={bid._id} className={index === 0 ? 'highest-bid' : ''}>
              <span>{bid.bidder.name}</span>
              <span>₹{bid.amount.toLocaleString()}</span>
            </BidItem>
          ))}
        </BidLog>
      </BidLogContainer>
      
      <RecommendationsWrapper>
        <Recommendations />
      </RecommendationsWrapper>
    </AuctionContainer>
  );
};

export default Auction;
