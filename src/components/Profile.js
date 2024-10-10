import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import { Navbar, Nav } from 'react-bootstrap';
import logo from './images/Imagique.png';
import { useLocation, useNavigate } from 'react-router-dom';
import './css/Profile.css';

const Profile = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const userDetailsId = location.state?.userDetailsId;
    const [userDetails, setUserDetails] = useState(null);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
    const [isAddMoneyModalOpen, setIsAddMoneyModalOpen] = useState(false);
    const [formData, setFormData] = useState({});
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [walletAmount, setWalletAmount] = useState(0);
    const [addAmount, setAddAmount] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [cvv, setCvv] = useState('');

    const [alertVisible, setAlertVisible] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');

    const [errors, setErrors] = useState({
        email: '',
        contactNumber: '',
        alternateNumber: '',
        newPassword: '',
        confirmPassword: '',
        cardNumber: '',
        cvv: '',
        amount: ''
    });

    const API_URL = `http://localhost:8080/api/userdetails/${userDetailsId}`;
    const UPDATE_API_URL = `http://localhost:8080/api/userdetails/update`;

    const showAlert = (message) => {
        setAlertMessage(message);
        setAlertVisible(true);
        setTimeout(() => {
            setAlertVisible(false);
        }, 3000); // Hide alert after 3 seconds
    };

    useEffect(() => {
        if (!userDetailsId) {
            console.error("User ID is not defined. Please log in again.");
            return;
        }

        const fetchUserDetails = async () => {
            try {
                const response = await axios.get(API_URL);
                setUserDetails(response.data);
                setFormData({
                    fullName: response.data.fullName,
                    contactNumber: response.data.contactNumber,
                    alternateNumber: response.data.alternateNumber,
                    email: response.data.email,
                });
                setWalletAmount(response.data.walletAmount || 0);
            } catch (error) {
                console.error('Error fetching user details:', error);
            }
        };

        fetchUserDetails();
    }, [userDetailsId]);

    const validateEmail = (email) => {
        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|co|net|in)$/;
        return regex.test(email) && email.length <= 70;
    };

    const validateContactNumber = (number) => {
        const regex = /^[6-9]\d{9}$/;
        return regex.test(number);
    };

    const validateNewPassword = (password) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/;
        return regex.test(password);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        switch (name) {
            case 'email':
                if (!validateEmail(value)) {
                    setErrors((prev) => ({ ...prev, email: 'Invalid email format!' }));
                } else {
                    setErrors((prev) => ({ ...prev, email: '' }));
                }
                break;
            case 'contactNumber':
                if (!validateContactNumber(value)) {
                    setErrors((prev) => ({ ...prev, contactNumber: 'Contact number must be of length 10.' }));
                } else {
                    setErrors((prev) => ({ ...prev, contactNumber: '' }));
                }
                break;
            case 'alternateNumber':
                if (value && !validateContactNumber(value)) {
                    setErrors((prev) => ({ ...prev, alternateNumber: 'Alternate number must be of length 10.' }));
                } else {
                    setErrors((prev) => ({ ...prev, alternateNumber: '' }));
                }
                break;
            default:
                break;
        }
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData({ ...passwordData, [name]: value });

        if (name === 'newPassword') {
            if (!validateNewPassword(value)) {
                setErrors((prev) => ({ ...prev, newPassword: 'Password must be 8-20 characters long, contain 1 uppercase letter, 1 lowercase letter, 1 special character, and 1 number.' }));
            } else {
                setErrors((prev) => ({ ...prev, newPassword: '' }));
            }
        }

        if (name === 'confirmPassword') {
            if (value !== passwordData.newPassword) {
                setErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match' }));
            } else {
                setErrors((prev) => ({ ...prev, confirmPassword: '' }));
            }
        }
    };

    const handleCardNumberChange = (e) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 16); // Allow only numbers and limit length
        setCardNumber(value);
        setErrors((prev) => ({ ...prev, cardNumber: value.length === 16 ? '' : 'Card number must be 16 digits.' }));
    };

    const handleCvvChange = (e) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 3); // Allow only numbers and limit length
        setCvv(value);
        setErrors((prev) => ({ ...prev, cvv: value.length === 3 ? '' : 'CVV must be 3 digits.' }));
    };

    const handleAddAmountChange = (e) => {
        const value = e.target.value;
        setAddAmount(value);
        if (value < 500 || value > 10000) {
            setErrors((prev) => ({ ...prev, amount: 'Amount must be between 500 and 10000.' }));
        } else {
            setErrors((prev) => ({ ...prev, amount: '' }));
        }
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        // Validate all fields before submission
        if (Object.values(errors).some((error) => error)) {
            showAlert("Please fix the errors before submitting.");
            return;
        }

        const updatedData = {
            userDetailsId: userDetailsId,
            fullName: formData.fullName,
            contactNumber: formData.contactNumber,
            alternateNumber: formData.alternateNumber,
            email: formData.email,
        };

        try {
            const response = await axios.put(`${UPDATE_API_URL}`, updatedData);
            console.log("Update successful:", response.data);
            showAlert('Details updated successfully!');
            closeUpdateModal();
        } catch (error) {
            console.error("Error updating user details:", error);
        }
    };

    const handleChangePasswordSubmit = async (e) => {
        e.preventDefault();
        if (errors.newPassword || errors.confirmPassword) {
            alert("Please fix the password errors before submitting.");
            return;
        }

        try {
            await axios.put(`${API_URL}/change-password`, null, {
                params: {
                    userDetailsId: userDetailsId,
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                }
            });
            showAlert('Password changed successfully!');
            closeChangePasswordModal();
        } catch (error) {
            console.error('Error changing password:', error.response?.data || error);
            alert('Failed to change password: ' + (error.response?.data || 'unknown error'));
        }
    };

    const handleAddAmount = async (e) => {
        e.preventDefault();
        if (errors.cardNumber || errors.cvv || errors.amount) {
            alert("Please fix the errors before submitting.");
            return;
        }
        try {
            await axios.put(`${API_URL}/wallet/add`, { amount: parseFloat(addAmount) });
            setWalletAmount(walletAmount + parseFloat(addAmount));
            setAddAmount('');
            setCardNumber('');
            setCvv('');
            showAlert('Money added successfully!');
            closeAddMoneyModal();
        } catch (error) {
            console.error('Error adding amount to wallet:', error);
        }
    };

    const openUpdateModal = () => setIsUpdateModalOpen(true);
    const closeUpdateModal = () => setIsUpdateModalOpen(false);
    const openChangePasswordModal = () => setIsChangePasswordModalOpen(true);
    const closeChangePasswordModal = () => setIsChangePasswordModalOpen(false);
    const openAddMoneyModal = () => setIsAddMoneyModalOpen(true);
    const closeAddMoneyModal = () => setIsAddMoneyModalOpen(false);

    const handleNavigateToProfile = () => {
        const loggedInUser = JSON.parse(localStorage.getItem('user'));
        const userDetailsId = loggedInUser ? loggedInUser.userDetailsId : null;
        navigate('/user-profile', { state: { userDetailsId } });
    };

    const handleNavigateToBookings = () => {
        const loggedInUser = JSON.parse(localStorage.getItem('user'));
        const userDetailsId = loggedInUser ? loggedInUser.userDetailsId : null;
        navigate('/user-bookings', { state: { userDetailsId } });
    };

    if (!userDetails) return <div>Loading user details...</div>;

    return (
        <div>

            {alertVisible && (
                <div className="success-alert">
                    {alertMessage}
                </div>
            )}

            {/* Navbar */}
            <Navbar bg="light" expand="lg" sticky="top">
                <Navbar.Brand href="/" style={{ fontFamily: 'Dancing Script', fontSize: '30px' }}>
                    <img src={logo} alt="Logo" style={{ width: '45px', marginRight: '5px', marginLeft: '15px', marginTop: '-10px' }} />
                    Imagique
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="navbar-links">
                        <Nav.Link onClick={handleNavigateToProfile}>Profile</Nav.Link>
                        <Nav.Link onClick={handleNavigateToBookings}>Bookings</Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>

            <div className="profile-div">
                <div className="profile-container">
                    <div className="row">
                        <div className="col-md-3 text-start">
                            <h2 className="mt-4">Profile</h2>
                        </div>
                        <div className="col-md-4 text-end">
                            <div className="update-button">
                                <button onClick={openUpdateModal}>
                                    Update Info
                                </button>
                            </div>
                        </div>
                        <div className="col-md-5 text-end">
                            <div className="update-button">
                                <button onClick={openChangePasswordModal}>
                                    Change Password
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="profile-table-container">
                        <table className="profile-table">
                            <tbody>
                                <tr>
                                    <td><strong>Full Name</strong></td>
                                    <td>{userDetails.fullName}</td>
                                </tr>
                                <tr>
                                    <td><strong>Email</strong></td>
                                    <td>{userDetails.email}</td>
                                </tr>
                                <tr>
                                    <td><strong>Contact Number</strong></td>
                                    <td>{userDetails.contactNumber}</td>
                                </tr>
                                <tr>
                                    <td><strong>Alternate Number</strong></td>
                                    <td>{userDetails.alternateNumber}</td>
                                </tr>
                                <tr>
                                    <td><strong>Amount</strong></td>
                                    <td>Rs. {walletAmount.toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td><strong>Add Money</strong></td>
                                    <td><button onClick={openAddMoneyModal}> Add Money</button></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Update Info Modal */}
            <Modal
                className="profile-modal"
                isOpen={isUpdateModalOpen}
                onRequestClose={closeUpdateModal}
                contentLabel="Update User Info"
                style={{
                    overlay: { zIndex: 1000 },
                    content: {
                        maxWidth: '550px',
                        margin: 'auto',
                        padding: '20px',
                        borderRadius: '10px',
                        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
                    }
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h4>Update Your Information</h4>
                    <button onClick={closeUpdateModal} style={{ border: 'none', background: 'none', fontSize: '28px', cursor: 'pointer', color: 'black', position: 'relative', bottom: '5px' }}>&times;</button>
                </div>
                <form onSubmit={handleUpdateSubmit}>
                    <div className="row" style={{ marginBottom: '10px' }}>
                        <div className="col-md-6">
                            <label htmlFor="fullName">Full Name</label>
                            <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} required />
                        </div>
                        <div className="col-md-6">
                            <label htmlFor="email">Email</label>
                            <input type="email" name="email" value={formData.email} onChange={handleInputChange} required readOnly style={{ backgroundColor: '#f0f0f0' }} />
                            {errors.email && <div style={{ color: 'red' }}>{errors.email}</div>}
                        </div>
                    </div>
                    <div className="row" style={{ marginBottom: '20px' }}>
                        <div className="col-md-6">
                            <label htmlFor="contactNumber">Contact Number</label>
                            <input type="text" name="contactNumber" value={formData.contactNumber} onChange={handleInputChange} required />
                            {errors.contactNumber && <div style={{ color: 'red' }}>{errors.contactNumber}</div>}
                        </div>
                        <div className="col-md-6">
                            <label htmlFor="alternateNumber">Alternate Number</label>
                            <input type="text" name="alternateNumber" value={formData.alternateNumber} onChange={handleInputChange} />
                            {errors.alternateNumber && <div style={{ color: 'red' }}>{errors.alternateNumber}</div>}
                        </div>
                    </div>
                    <button type="submit" disabled={Object.values(errors).some((error) => error)}>Update</button>
                </form>
            </Modal>

            {/* Change Password Modal */}
            <Modal
                className="password-modal"
                isOpen={isChangePasswordModalOpen}
                onRequestClose={closeChangePasswordModal}
                contentLabel="Change Password"
                style={{
                    overlay: { zIndex: 1000 },
                    content: {
                        maxWidth: '420px',
                        margin: 'auto',
                        padding: '20px',
                        borderRadius: '10px',
                        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
                    }
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h4>Change Your Password</h4>
                    <button onClick={closeChangePasswordModal} style={{ border: 'none', background: 'none', fontSize: '28px', cursor: 'pointer', color: 'black', position: 'relative', bottom: '5px' }}>&times;</button>
                </div>
                <form onSubmit={handleChangePasswordSubmit}>
                    <label htmlFor="currentPassword">Current Password</label>
                    <input type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} placeholder="Current Password" style={{ marginBottom: '10px' }} required />
                    <label htmlFor="newPassword">New Password</label>
                    <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} placeholder="New Password" style={{ marginBottom: '10px' }} required />
                    {errors.newPassword && <div style={{ color: 'red' }}>{errors.newPassword}</div>}
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} placeholder="Confirm New Password" style={{ marginBottom: '20px' }} required />
                    {errors.confirmPassword && <div style={{ color: 'red' }}>{errors.confirmPassword}</div>}
                    <button type="submit" disabled={errors.newPassword || errors.confirmPassword}>Change Password</button>
                </form>
            </Modal>

            {/* Add Money Modal */}
            <Modal
                className="add-money-modals"
                isOpen={isAddMoneyModalOpen}
                onRequestClose={closeAddMoneyModal}
                contentLabel="Add Money to Wallet"
                style={{
                    overlay: { zIndex: 1000 },
                    content: {
                        maxWidth: '420px',
                        margin: 'auto',
                        padding: '20px',
                        borderRadius: '10px',
                        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
                    }
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h4>Add Money to Your Wallet</h4>
                    <button onClick={closeAddMoneyModal} style={{ border: 'none', background: 'none', fontSize: '28px', cursor: 'pointer', color: 'black', position: 'relative', bottom: '5px' }}>&times;</button>
                </div>
                <form onSubmit={handleAddAmount}>
                    <label>Card Number</label>
                    <input
                        type="text"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        placeholder="Card Number"
                        maxLength={16}
                        style={{ marginBottom: '10px' }}
                        required
                    />
                    {errors.cardNumber && <div style={{ color: 'red' }}>{errors.cardNumber}</div>}
                    <label>CVV</label>
                    <input
                        type="password"
                        value={cvv}
                        onChange={handleCvvChange}
                        placeholder="CVV"
                        maxLength={3}
                        style={{ marginBottom: '10px' }}
                        required
                    />
                    {errors.cvv && <div style={{ color: 'red' }}>{errors.cvv}</div>}
                    <label>Amount</label>
                    <input
                        type="number"
                        value={addAmount}
                        onChange={handleAddAmountChange}
                        placeholder="Amount"
                        style={{ marginBottom: '10px' }}
                        required
                    />
                    {errors.amount && <div style={{ color: 'red' }}>{errors.amount}</div>}
                    <button type="submit" disabled={errors.cardNumber || errors.cvv || errors.amount}>Add Money</button>
                </form>
            </Modal>
        </div>
    );
};

export default Profile;
