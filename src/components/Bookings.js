import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Navbar, Nav, Modal } from 'react-bootstrap';
import logo from './images/Imagique.png';
import './css/Bookings.css';

const Bookings = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { userDetailsId } = location.state || {};
    const [bookings, setBookings] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBookingId, setSelectedBookingId] = useState(null);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/api/bookings/user/${userDetailsId}`);
                setBookings(response.data);
            } catch (error) {
                console.error('Error fetching bookings:', error);
            }
        };

        if (userDetailsId) {
            fetchBookings();
        }
    }, [userDetailsId]);

    const handleCancel = (bookingId) => {
        setSelectedBookingId(bookingId);
        setIsModalOpen(true);
    };

    const confirmCancel = async () => {
        if (!selectedBookingId) return;

        try {
            await axios.put(`http://localhost:8080/api/bookings/cancel/${selectedBookingId}`);
            setBookings(prevBookings =>
                prevBookings.map(booking =>
                    booking.bookingId === selectedBookingId
                        ? { ...booking, bookingStatus: 'CANCELLED' }
                        : booking
                )
            );
            setAlertMessage('Booking Canceled Successfully!');
            setShowAlert(true);
            setIsModalOpen(false);
            setTimeout(() => setShowAlert(false), 3000); // Hide alert after 3 seconds
        } catch (error) {
            console.error('Error cancelling booking:', error);
            alert('Failed to cancel booking.');
        }
    };

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

    return (
        <div>
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

            {/* Bookings Section */}
            <div className="bookings-div">
                <div className="bookings-container">
                    <h2>Your Bookings</h2>
                    {bookings.length === 0 ? (
                        <p>No bookings found.</p>
                    ) : (
                        <div className="table-container">
                            <table className="bookings-table">
                                <thead style={{ position: 'sticky', top: '0', zIndex: '10' }}>
                                    <tr>
                                        <th>Booking ID</th>
                                        <th>Full Name</th>
                                        <th>Event Name</th>
                                        <th>Tickets</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.map(booking => (
                                        <tr key={booking.bookingId}>
                                            <td>{booking.bookingId}</td>
                                            <td>{booking.fullName}</td>
                                            <td>{booking.eventName}</td>
                                            <td>{booking.noOfTickets}</td>
                                            <td>Rs. {booking.totalPrice.toFixed(2)}</td>
                                            <td>{booking.bookingStatus}</td>
                                            <td>
                                                {booking.bookingStatus === 'CONFIRMED' ? (
                                                    <button onClick={() => handleCancel(booking.bookingId)}>Cancel</button>
                                                ) : booking.bookingStatus === 'CANCELLED' ? (
                                                    <span>No Action</span>
                                                ) : null}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Success Alert */}
            {showAlert && (
                <div className="success-alert">
                    {alertMessage}
                </div>
            )}

            {/* Confirmation Modal */}
            <Modal show={isModalOpen} onHide={() => setIsModalOpen(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Cancellation</Modal.Title>
                </Modal.Header>
                <Modal.Body>Are you sure you want to cancel this booking? <br />
                    Only 50% of the booking amount will be returned to your wallet.
                </Modal.Body>
                <Modal.Footer>
                    <button onClick={confirmCancel}>
                        Yes
                    </button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Bookings;
