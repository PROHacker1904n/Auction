import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiService from '../services/api';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { Input, Select, PrimaryButton } from '../styles/GlobalStyles';
import { motion } from 'framer-motion';

const ProfileContainer = styled.div`
  max-width: 1200px;
  margin: 1rem auto 3rem;
  display: grid;
  grid-template-columns: 0.9fr 1.1fr;
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const LeftColumn = styled.div``;

const RightColumn = styled.div``;

const Card = styled.div`
  background: ${props => props.theme.backgroundCard};
  border: 1px solid ${props => props.theme.border};
  border-radius: 16px;
  box-shadow: ${props => props.theme.shadow};
  margin-bottom: 2rem;
  padding: 2rem;
  transition: all 0.3s ease;
`;

const CardTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: -0.025em;
  margin-bottom: 1.25rem;
  color: ${props => props.theme.text};
`;

const FormGroup = styled.div`
  margin-bottom: 1.25rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.825rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${props => props.theme.textSecondary};
  margin-bottom: 0.5rem;
`;

const ProfileImageContainer = styled.div`
  width: 110px;
  height: 110px;
  border-radius: 50%;
  margin-bottom: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, ${props => props.theme.primary} 0%, ${props => props.theme.accent} 100%);
  color: white;
  font-size: 2.75rem;
  font-weight: 800;
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.25);
`;

const ProfileImage = styled.img`
  width: 110px;
  height: 110px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 1.25rem;
  border: 3px solid ${props => props.theme.primary};
  box-shadow: ${props => props.theme.shadow};
`;

const HistoryList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const HistoryItem = styled.li`
  padding: 0.875rem 1.25rem;
  background-color: ${props => props.theme.secondary}40;
  border: 1px solid ${props => props.theme.border};
  border-radius: 10px;
  font-size: 0.9rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: ${props => props.theme.textSecondary};
  font-weight: 500;

  strong {
    color: ${props => props.theme.text};
    font-weight: 700;
  }

  span:last-child {
    font-weight: 800;
    color: ${props => props.theme.primary};
  }
`;

const UserProfile = () => {
    const { userId } = useParams();
    const { user: authUser, updateUser } = useAuth();
    const [user, setUser] = useState(null);
    const [bids, setBids] = useState([]);
    const [wonListings, setWonListings] = useState([]);
    const [loading, setLoading] = useState(true);

    // Forms state
    const [infoForm, setInfoForm] = useState({ gender: '', graduationYear: '' });
    const [pictureForm, setPictureForm] = useState({ profileImage: null });
    const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '' });

    useEffect(() => {
        if (userId && userId !== 'undefined') {
            setLoading(true);
            Promise.all([
                apiService.getUser(userId),
                apiService.getUserBids(userId),
                apiService.getWonListings(userId),
            ]).then(([userData, userBids, wonListingsData]) => {
                setUser(userData);
                setInfoForm({ gender: userData.gender || '', graduationYear: userData.graduationYear || '' });
                setBids(userBids);
                setWonListings(wonListingsData);
            }).catch(err => {
                console.error("Error fetching user profile data:", err);
            }).finally(() => {
                setLoading(false);
            });
        }
    }, [userId]);

    const handleInfoChange = (e) => {
        setInfoForm({ ...infoForm, [e.target.name]: e.target.value });
    };

    const handlePictureChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPictureForm({ profileImage: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePasswordChange = (e) => {
        setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
    };

    const handleInfoSubmit = async (e) => {
        e.preventDefault();
        try {
            const updatedUser = await apiService.updateUser(userId, infoForm);
            setUser(updatedUser);
            updateUser(updatedUser);
            alert('Information updated successfully!');
        } catch (error) {
            alert('Error updating information');
        }
    };

    const handlePictureSubmit = async (e) => {
        e.preventDefault();
        try {
            const updatedUser = await apiService.updateProfilePicture(userId, pictureForm.profileImage);
            setUser(updatedUser);
            updateUser(updatedUser);
            alert('Profile picture updated successfully!');
        } catch (error) {
            alert('Error updating profile picture');
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        try {
            await apiService.updatePassword(userId, passwordForm.oldPassword, passwordForm.newPassword);
            alert('Password updated successfully!');
            setPasswordForm({ oldPassword: '', newPassword: '' });
        } catch (error) {
            alert('Error updating password');
        }
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--textSecondary)' }}>Loading...</div>;
    }

    if (!user) {
        return <div style={{ textAlign: 'center', padding: '5rem', color: '#ef4444' }}>User not found</div>;
    }

    return (
        <ProfileContainer
          as={motion.div}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
            <LeftColumn>
                <Card>
                    <CardTitle>Profile Details</CardTitle>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1rem' }}>
                        {user.profileImage ? (
                            <ProfileImage src={user.profileImage} alt={user.name} />
                        ) : (
                            <ProfileImageContainer>{user.name.charAt(0).toUpperCase()}</ProfileImageContainer>
                        )}
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)' }}>{user.name}</h2>
                        <p style={{ color: 'var(--textSecondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>{user.email}</p>
                    </div>
                </Card>
                <Card>
                    <CardTitle>My Bidding History</CardTitle>
                    {bids.length === 0 ? (
                        <p style={{ color: 'var(--textSecondary)', fontStyle: 'italic', fontSize: '0.9rem' }}>No bids yet.</p>
                    ) : (
                        <HistoryList>
                            {bids.map(bid => (
                                <HistoryItem key={bid._id}>
                                    <strong>{bid.listing.title}</strong>
                                    <span>₹{bid.amount.toLocaleString()}</span>
                                </HistoryItem>
                            ))}
                        </HistoryList>
                    )}
                </Card>
                <Card>
                    <CardTitle>Auctions Won</CardTitle>
                    {wonListings.length === 0 ? (
                        <p style={{ color: 'var(--textSecondary)', fontStyle: 'italic', fontSize: '0.9rem' }}>No auctions won yet.</p>
                    ) : (
                        <HistoryList>
                            {wonListings.map(listing => (
                                <HistoryItem key={listing._id}>
                                    <strong>{listing.title}</strong>
                                    <span>Winning Bid: ₹{listing.currentBid.toLocaleString()}</span>
                                </HistoryItem>
                            ))}
                        </HistoryList>
                    )}
                </Card>
            </LeftColumn>
            <RightColumn>
                {authUser && authUser._id === userId && (
                    <>
                        <Card>
                            <CardTitle>Update Information</CardTitle>
                            <form onSubmit={handleInfoSubmit}>
                                <FormGroup>
                                    <Label>Gender</Label>
                                    <Select name="gender" value={infoForm.gender} onChange={handleInfoChange}>
                                        <option value="">Select Gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </Select>
                                </FormGroup>
                                <FormGroup>
                                    <Label>Graduation Year</Label>
                                    <Input type="number" name="graduationYear" value={infoForm.graduationYear} onChange={handleInfoChange} />
                                </FormGroup>
                                <PrimaryButton type="submit" style={{ width: '100%' }}>Save Information</PrimaryButton>
                            </form>
                        </Card>

                        <Card>
                            <CardTitle>Profile Picture</CardTitle>
                            <form onSubmit={handlePictureSubmit}>
                                <FormGroup>
                                    <Label>Upload new picture</Label>
                                    <Input type="file" accept="image/*" onChange={handlePictureChange} style={{ border: 'none', padding: '0.25rem 0', background: 'none' }} />
                                </FormGroup>
                                <PrimaryButton type="submit" style={{ width: '100%' }}>Save Picture</PrimaryButton>
                            </form>
                        </Card>

                        <Card>
                            <CardTitle>Change Password</CardTitle>
                            <form onSubmit={handlePasswordSubmit}>
                                <FormGroup>
                                    <Label>Old Password</Label>
                                    <Input type="password" name="oldPassword" value={passwordForm.oldPassword} onChange={handlePasswordChange} />
                                </FormGroup>
                                <FormGroup>
                                    <Label>New Password</Label>
                                    <Input type="password" name="newPassword" value={passwordForm.newPassword} onChange={handlePasswordChange} />
                                </FormGroup>
                                <PrimaryButton type="submit" style={{ width: '100%' }}>Change Password</PrimaryButton>
                            </form>
                        </Card>
                    </>
                )}
            </RightColumn>
        </ProfileContainer>
    );
};

export default UserProfile;
