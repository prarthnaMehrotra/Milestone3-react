import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Navbar, Nav, NavDropdown, Modal, Button, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import logo from './images/Imagique.png';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/OrganizerRevenue.css';

const OrganizerTotalRevenue = () => {
    const [events, setEvents] = useState([]);
    const [revenueData, setRevenueData] = useState({ eventName: '', totalRevenue: 0, ticketsSold: 0 });
    const [showRevenueModal, setShowRevenueModal] = useState(false);
    const [userDetailsId, setUserDetailsId] = useState('');

    const API_URL = 'http://localhost:8080/api/events';
    const REVENUE_URL = 'http://localhost:8080/api/bookings'; 

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
            setUserDetailsId(storedUser.userDetailsId);
        }
        fetchEvents();
    }, [userDetailsId]);

    const fetchEvents = async () => {
        if (userDetailsId) {
            try {
                const response = await axios.get(`${API_URL}/organizer/${userDetailsId}`);
                setEvents(response.data);
            } catch (error) {
                console.error("There was an error fetching events!", error);
            }
        }
    };

    const calculateRevenue = async (eventId, eventName) => {
        try {
            const response = await axios.get(`${REVENUE_URL}/revenue/${eventId}`);
            console.log(response.data); // Check the response structure

            const totalRevenue = response.data.totalRevenue; // Should be a number
            const ticketsSold = response.data.totalTicketsSold || 0; // Fallback to 0 if undefined

            setRevenueData({ eventName, totalRevenue, ticketsSold });
            setShowRevenueModal(true);
        } catch (error) {
            console.error("There was an error fetching revenue data!", error);
        }
    };

    return (
        <>
            <Navbar bg="light" expand="lg" sticky="top">
                <Navbar.Brand as={Link} to="/" style={{ fontFamily: 'Dancing Script', fontSize: '30px' }}>
                    <img src={logo} alt="Logo" style={{ width: '40px', marginRight: '5px', marginLeft: '15px', marginTop: '-10px' }} />
                    Imagique
                </Navbar.Brand>
                <Navbar.Toggle />
                <Navbar.Collapse className="justify-content-end">
                    <Nav className="navbar-links">
                        <Nav.Link as={Link} to="/organizer-dashboard">Dashboard</Nav.Link>
                        <Nav.Link as={Link} to="/OrganizerManageEvents">Events</Nav.Link>
                        <Nav.Link as={Link} to="/OrganizerRevenue">Revenue</Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>

            <div className="organizer-revenue-div">
                <div className="organizer-revenue-container">
                    <div className="row">
                        <div className="col-md-6 text-start">
                            <h2 className="mt-4">Total Revenue</h2>
                        </div>
                    </div>

                    <div className="organizer-revenue-table-container">
                        <table className="organizer-revenue-table">
                            <thead className="organizer-revenue-table-header">
                                <tr>
                                    <th>Event Name</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {events.map((event) => (
                                    <tr key={event.eventId}>
                                        <td>{event.eventName}</td>
                                        <td>
                                            <Button onClick={() => calculateRevenue(event.eventId, event.eventName)}>
                                                Generate Revenue
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <Modal show={showRevenueModal} onHide={() => setShowRevenueModal(false)}>
                        <Modal.Header closeButton>
                            <Modal.Title>Total Revenue for {revenueData.eventName}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <p>Tickets Sold: {revenueData.ticketsSold}</p>
                            <p>Total Revenue: Rs. {revenueData.totalRevenue.toFixed(2)}</p>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => setShowRevenueModal(false)}>
                                Close
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </div>
            </div>
        </>
    );
};

export default OrganizerTotalRevenue;
