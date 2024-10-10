import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Navbar, Nav, Modal, Button, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import logo from './images/Imagique.png';
import './css/OrganizerRevenue.css';

const ViewRevenue = () => {
    const [events, setEvents] = useState([]);
    const [revenueData, setRevenueData] = useState({ eventName: '', totalRevenue: 0, ticketsSold: 0 });
    const [showRevenueModal, setShowRevenueModal] = useState(false);

    const API_URL = 'http://localhost:8080/api/events';
    const REVENUE_URL = 'http://localhost:8080/api/bookings';

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const response = await axios.get(API_URL);
            setEvents(response.data);
        } catch (error) {
            console.error("There was an error fetching events!", error);
        }
    };

    const calculateRevenue = async (eventId, eventName) => {
        try {
            const response = await axios.get(`${REVENUE_URL}/revenue/${eventId}`);
            const totalRevenue = response.data.totalRevenue || 0;
            const ticketsSold = response.data.totalTicketsSold || 0;

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
                    <img src={logo} alt="Logo" style={{ width: '45px', marginRight: '5px', marginLeft: '15px', marginTop: '-10px' }} />
                    Imagique
                </Navbar.Brand>
                <Navbar.Toggle />
                <Navbar.Collapse className="justify-content-end">
                    <Nav className="navbar-links">
                        <Nav.Link as={Link} to="/admin-dashboard">Dashboard</Nav.Link>
                        <Nav.Link as={Link} to="/ManageCategories">Categories</Nav.Link>
                        <Nav.Link as={Link} to="/ManageOrganizers">Organizers</Nav.Link>
                        <Nav.Link as={Link} to="/ManageEvents">Events</Nav.Link>
                        <Nav.Link as={Link} to="/ViewRevenue">Revenue</Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>

            <div className="organizer-revenue-div">
                <div className="organizer-revenue-container">
                    <h2 className="mt-4 text-center">Revenue</h2>

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
                            <p>Commission Received: Rs. {(revenueData.totalRevenue * 0.10).toFixed(2)}</p>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => setShowRevenueModal(false)}>
                                Okay
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </div>
            </div>
        </>
    );
};

export default ViewRevenue;
