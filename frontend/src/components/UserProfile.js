import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiService from '../services/api';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';

const ProfileContainer = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  padding: 2rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  background-color: #f5f5f5;
`;

const LeftColumn = styled.div``;

const RightColumn = styled.div``;

const Card = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
  margin-bottom: 2rem;
  padding: 1.5rem;
`;

const CardTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 500;
  margin-bottom: 1rem;
  color: #333;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  color: #5f6368;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #dadce0;
  border-radius: 4px;
  font-size: 1rem;
  &:focus {
    outline: none;
    border-color: #1a73e8;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #dadce0;
  border-radius: 4px;
  font-size: 1rem;
  background-color: white;
  &:focus {
    outline: none;
    border-color: #1a73e8;
  }
`;

const Button = styled.button`
  background-color: #1a73e8;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.3s;
  &:hover {
    background-color: #185abc;
  }
`;

const ProfileImageContainer = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #1a73e8;
  color: white;
  font-size: 3rem;
`;

const ProfileImage = styled.img`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 1rem;
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
        return <div>Loading...</div>;
    }

    if (!user) {
        return <div>User not found</div>;
    }

    return (
        <ProfileContainer>
            <LeftColumn>
                <Card>
                    <CardTitle>Profile</CardTitle>
                    {user.profileImage ? (
                        <ProfileImage src={user.profileImage} alt={user.name} />
                    ) : (
                        <ProfileImageContainer>{user.name.charAt(0).toUpperCase()}</ProfileImageContainer>
                    )}
                    <h2>{user.name}</h2>
                    <p>{user.email}</p>
                </Card>
                <Card>
                    <CardTitle>My Bidding History</CardTitle>
                    {bids.length === 0 ? (
                        <p>No bids yet.</p>
                    ) : (
                        <ul>
                            {bids.map(bid => (
                                <li key={bid._id}>{bid.listing.title} - ${bid.amount}</li>
                            ))}
                        </ul>
                    )}
                </Card>
                <Card>
                    <CardTitle>Auctions Won</CardTitle>
                    {wonListings.length === 0 ? (
                        <p>No auctions won yet.</p>
                    ) : (
                        <ul>
                            {wonListings.map(listing => (
                                <li key={listing._id}>{listing.title} - Winning Bid: ${listing.currentBid}</li>
                            ))}
                        </ul>
                    )}
                </Card>
            </LeftColumn>
            <RightColumn>
                {authUser && authUser._id === userId && (
                    <>
                        <Card>
                            <CardTitle>User Information</CardTitle>
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
                                <Button type="submit">Save Information</Button>
                            </form>
                        </Card>

                        <Card>
                            <CardTitle>Profile Picture</CardTitle>
                            <form onSubmit={handlePictureSubmit}>
                                <FormGroup>
                                    <Label>Upload new picture</Label>
                                    <Input type="file" accept="image/*" onChange={handlePictureChange} />
                                </FormGroup>
                                <Button type="submit">Save Picture</Button>
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
                                <Button type="submit">Change Password</Button>
                            </form>
                        </Card>
                    </>
                )}
            </RightColumn>
        </ProfileContainer>
    );
};

export default UserProfile;
