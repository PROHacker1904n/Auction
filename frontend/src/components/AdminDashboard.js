import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../services/api';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

const DashboardContainer = styled.div`
  max-width: 1200px;
  margin: 1rem auto 3rem;
  background: ${props => props.theme.backgroundCard};
  border: 1px solid ${props => props.theme.border};
  border-radius: 20px;
  box-shadow: ${props => props.theme.shadow};
  padding: 2.5rem;
  transition: all 0.3s ease;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.025em;
  margin-bottom: 1.5rem;
  color: ${props => props.theme.text};
`;

const ListingTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 2.5rem;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid ${props => props.theme.border};

  th, td {
    padding: 1rem 1.25rem;
    text-align: left;
    font-size: 0.9rem;
  }

  th {
    background-color: ${props => props.theme.secondary};
    color: ${props => props.theme.text};
    font-weight: 700;
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 0.05em;
    border-bottom: 2px solid ${props => props.theme.border};
  }

  td {
    color: ${props => props.theme.textSecondary};
    border-bottom: 1px solid ${props => props.theme.border};
    background-color: ${props => props.theme.backgroundCard};
  }

  tr:last-child td {
    border-bottom: none;
  }
`;

const ActionButton = styled.button`
  margin-right: 0.5rem;
  padding: 0.4rem 0.875rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 700;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &.approve {
    background-color: ${props => props.theme.accent}20;
    color: ${props => props.theme.accent};
    border: 1px solid ${props => props.theme.accent}40;

    &:hover {
      background-color: ${props => props.theme.accent};
      color: white;
      box-shadow: 0 4px 12px ${props => props.theme.accent}30;
      transform: translateY(-1px);
    }
  }

  &.reject {
    background-color: #ef444420;
    color: #ef4444;
    border: 1px solid #ef444440;

    &:hover {
      background-color: #ef4444;
      color: white;
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
      transform: translateY(-1px);
    }
  }

  &.edit {
    background-color: ${props => props.theme.primary}20;
    color: ${props => props.theme.primary};
    border: 1px solid ${props => props.theme.primary}40;

    &:hover {
      background-color: ${props => props.theme.primary};
      color: white;
      box-shadow: 0 4px 12px ${props => props.theme.primary}30;
      transform: translateY(-1px);
    }
  }
`;

const AdminDashboard = () => {
    const { user } = useAuth();
    const [pendingListings, setPendingListings] = useState([]);
    const [allListings, setAllListings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPendingListings();
        fetchAllListings();
    }, []);

    const fetchPendingListings = async () => {
        try {
            const data = await apiService.getPendingListings();
            setPendingListings(data);
        } catch (error) {
            console.error('Error fetching pending listings:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAllListings = async () => {
        try {
            const data = await apiService.getListings();
            setAllListings(data);
        } catch (error) {
            console.error('Error fetching all listings:', error);
        }
    };

    const handleApprove = async (id) => {
        try {
            await apiService.approveListing(id);
            fetchPendingListings();
            fetchAllListings();
        } catch (error) {
            console.error('Error approving listing:', error);
        }
    };

    const handleReject = async (id) => {
        const reason = prompt('Enter reason for rejection:');
        if (reason) {
            try {
                await apiService.rejectListing(id, reason);
                fetchPendingListings();
                fetchAllListings();
            } catch (error) {
                console.error('Error rejecting listing:', error);
            }
        }
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--textSecondary)' }}>Loading dashboard...</div>;
    }

    if (!user || user.role !== 'admin') {
        return (
            <DashboardContainer style={{ textAlign: 'center' }}>
                <SectionTitle>Not Authorized</SectionTitle>
                <p style={{ color: 'var(--textSecondary)' }}>You are not authorized to view this page.</p>
            </DashboardContainer>
        );
    }

    return (
        <DashboardContainer
          as={motion.div}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
            <SectionTitle>Pending Listings</SectionTitle>
            {pendingListings.length === 0 ? (
              <p style={{ color: 'var(--textSecondary)', fontStyle: 'italic', marginBottom: '2.5rem' }}>No pending listings to review.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <ListingTable>
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Seller</th>
                            <th>Start Price</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pendingListings.map((listing) => (
                            <tr key={listing._id}>
                                <td style={{ fontWeight: 600, color: 'var(--text)' }}>{listing.title}</td>
                                <td>{listing.seller ? listing.seller.name : 'Unknown'}</td>
                                <td style={{ fontWeight: 700 }}>₹{listing.startPrice.toLocaleString()}</td>
                                <td>
                                    <ActionButton className="approve" onClick={() => handleApprove(listing._id)}>Approve</ActionButton>
                                    <ActionButton className="reject" onClick={() => handleReject(listing._id)}>Reject</ActionButton>
                                    <Link to={`/edit-listing/${listing._id}`}><ActionButton className="edit">Edit</ActionButton></Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </ListingTable>
              </div>
            )}

            <SectionTitle>All Listings</SectionTitle>
            {allListings.length === 0 ? (
              <p style={{ color: 'var(--textSecondary)', fontStyle: 'italic' }}>No listings created yet.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <ListingTable>
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Seller</th>
                            <th>Status</th>
                            <th>Current Bid</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allListings.map((listing) => (
                            <tr key={listing._id}>
                                <td style={{ fontWeight: 600, color: 'var(--text)' }}>{listing.title}</td>
                                <td>{listing.seller ? listing.seller.name : 'Unknown'}</td>
                                <td>
                                  <span style={{ 
                                    textTransform: 'uppercase', 
                                    fontSize: '0.725rem', 
                                    fontWeight: 800,
                                    padding: '4px 8px',
                                    borderRadius: '12px',
                                    backgroundColor: listing.status === 'active' ? 'var(--accent)20' : listing.status === 'ended' ? '#64748b20' : '#e11d4820',
                                    color: listing.status === 'active' ? 'var(--accent)' : listing.status === 'ended' ? '#64748b' : '#e11d48'
                                  }}>
                                    {listing.status}
                                  </span>
                                </td>
                                <td style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{listing.currentBid.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </ListingTable>
              </div>
            )}
        </DashboardContainer>
    );
};

export default AdminDashboard;
