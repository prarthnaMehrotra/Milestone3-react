import React from 'react';
import { Navbar, Nav, NavDropdown, Card, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle, faPlusCircle, faCalendar, faUsers, faDollarSign } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import logo from './images/Imagique.png';
import './css/OrganizerDashboard.css';

const OrganizerDashboard = () => {
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
            <div className="organizer-dashboard-content">
                <Row className="g-4 justify-content-center">
                    <Col md={6}>
                        <Card className="organizer-dashboard-card">
                            <Card.Header>
                                <FontAwesomeIcon icon={faPlusCircle} className="card-icon" />
                            </Card.Header>
                            <Card.Body>
                                <Card.Title>Manage Events</Card.Title>
                                <Card.Text>
                                    Schedule and manage your events efficiently.
                                </Card.Text>
                            </Card.Body>
                            <Card.Footer>
                                <div className="organizer-button-container">
                                    <Link to="/OrganizerManageEvents" className="btn">Manage Event</Link>
                                </div>
                            </Card.Footer>
                        </Card>
                    </Col>
                    <Col md={6}>
                        <Card className="organizer-dashboard-card">
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
                                <div className="organizer-button-container">
                                    <Link to="/OrganizerRevenue" className="btn">View Revenue</Link>
                                </div>
                            </Card.Footer>
                        </Card>
                    </Col>
                </Row>
            </div>
        </>
    );
};

export default OrganizerDashboard;
