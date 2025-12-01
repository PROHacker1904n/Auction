import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../services/api';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';

const DashboardContainer = styled.div`
  padding: 2rem;
`;

const SectionTitle = styled.h2`
  margin-bottom: 1rem;
`;

const ListingTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  th, td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
  }

  th {
    background-color: #f2f2f2;
  }
`;

const ActionButton = styled.button`
  margin-right: 0.5rem;
  padding: 0.25rem 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &.approve {
    background-color: #28a745;
    color: white;
  }

  &.reject {
    background-color: #dc3545;
    color: white;
  }

  &.edit {
    background-color: #007bff;
    color: white;
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

    if (!user || user.role !== 'admin') {
        return (
            <DashboardContainer>
                <SectionTitle>Not Authorized</SectionTitle>
                <p>You are not authorized to view this page.</p>
            </DashboardContainer>
        );
    }

    return (
        <DashboardContainer>
            <SectionTitle>Pending Listings</SectionTitle>
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
                            <td>{listing.title}</td>
                            <td>{listing.seller.name}</td>
                            <td>{listing.startPrice}</td>
                            <td>
                                <ActionButton className="approve" onClick={() => handleApprove(listing._id)}>Approve</ActionButton>
                                <ActionButton className="reject" onClick={() => handleReject(listing._id)}>Reject</ActionButton>
                                <Link to={`/edit-listing/${listing._id}`}><ActionButton className="edit">Edit</ActionButton></Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </ListingTable>

            <SectionTitle style={{ marginTop: '2rem' }}>All Listings</SectionTitle>
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
                            <td>{listing.title}</td>
                            <td>{listing.seller.name}</td>
                            <td>{listing.status}</td>
                            <td>{listing.currentBid}</td>
                        </tr>
                    ))}
                </tbody>
            </ListingTable>
        </DashboardContainer>
    );
};

export default AdminDashboard;
