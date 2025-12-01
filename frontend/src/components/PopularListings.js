
import React, { useState, useEffect } from 'react';
import api from '../services/api';

const PopularListings = () => {
  const [listings, setListings] = useState([]);

  useEffect(() => {
    const fetchPopularListings = async () => {
      try {
        const response = await api.get('/listings/popular');
        setListings(response);
      } catch (error) {
        console.error('Error fetching popular listings:', error);
      }
    };

    fetchPopularListings();
  }, []);

  if (!listings.length) {
    return null;
  }

  return (
    <div className="popular-listings">
      <h2>Popular Listings</h2>
      <div className="listings-container">
        {listings.map((listing) => (
          <div key={listing._id} className="listing-card">
            <img src={listing.image} alt={listing.title} />
            <h3>{listing.title}</h3>
            <p>Start Price: ${listing.startPrice}</p>
            <a href={`/auction/${listing._id}`}>View Auction</a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PopularListings;
