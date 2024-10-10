import React from 'react';
import { Navbar, Nav, NavDropdown, Card, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle, faPlusCircle, faCalendar, faUsers, faDollarSign } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import logo from './images/Imagique.png';
import './css/AdminDashboard.css';

const AdminDashboard = () => {
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
            <div className="dashboard-content">
                <Row className="g-4 justify-content-center">
                    <Col md={6}>
                        <Card className="dashboard-card">
                            <Card.Header>
                                <FontAwesomeIcon icon={faPlusCircle} className="card-icon" />
                            </Card.Header>
                            <Card.Body>
                                <Card.Title>Add Event Category</Card.Title>
                                <Card.Text>
                                    Create new categories for your events to better organize them.
                                </Card.Text>
                            </Card.Body>
                            <Card.Footer>
                                <div className="admin-button-container">
                                    <Link to="/ManageCategories" className="btn">Add Category</Link>
                                </div>
                            </Card.Footer>
                        </Card>
                    </Col>
                    <Col md={6}>
                        <Card className="dashboard-card">
                            <Card.Header>
                                <FontAwesomeIcon icon={faCalendar} className="card-icon" />
                            </Card.Header>
                            <Card.Body>
                                <Card.Title>Add Event</Card.Title>
                                <Card.Text>
                                    Schedule, view and manage all your events effectively.
                                </Card.Text>
                            </Card.Body>
                            <Card.Footer>
                                <div className="admin-button-container">
                                    <Link to="/ManageEvents" className="btn">Add Event</Link>
                                </div>
                            </Card.Footer>
                        </Card>
                    </Col>
                </Row>
                <br />
                <Row className="g-4 justify-content-center">
                    <Col md={6}>
                        <Card className="dashboard-card">
                            <Card.Header>
                                <FontAwesomeIcon icon={faUsers} className="card-icon" />
                            </Card.Header>
                            <Card.Body>
                                <Card.Title>Manage Organizers</Card.Title>
                                <Card.Text>
                                    Oversee event organizers and manage their permissions.
                                </Card.Text>
                            </Card.Body>
                            <Card.Footer>
                                <div className="admin-button-container">
                                    <Link to="/ManageOrganizers" className="btn">Manage Organizers</Link>
                                </div>
                            </Card.Footer>
                        </Card>
                    </Col>
                    <Col md={6}>
                        <Card className="dashboard-card">
                            <Card.Header>
                                <FontAwesomeIcon icon={faDollarSign} className="card-icon" />
                            </Card.Header>
                            <Card.Body>
                                <Card.Title>Total Revenue</Card.Title>
                                <Card.Text>
                                    View and analyze the total revenue generated from events.
                                </Card.Text>
                            </Card.Body>
                            <Card.Footer>
                                <div className="admin-button-container">
                                    <Link to="/ViewRevenue" className="btn">View Revenue</Link>
                                </div>
                            </Card.Footer>
                        </Card>
                    </Col>
                </Row>
            </div>
        </>
    );
};

export default AdminDashboard;
