import React, { useEffect, useState } from 'react';
import { Navbar, Nav, Button, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import logo from './images/Imagique.png';
import axios from 'axios';
import './css/ManageOrganizers.css';

const ManageOrganizers = () => {
    const [organizers, setOrganizers] = useState([]);
    const [filter, setFilter] = useState('All');
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [currentAction, setCurrentAction] = useState(null);
    const [currentOrganizerId, setCurrentOrganizerId] = useState(null);
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');

    const fetchOrganizers = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/userdetails/organizers');
            setOrganizers(response.data);
        } catch (error) {
            console.error('Error fetching organizers:', error);
        }
    };

    useEffect(() => {
        fetchOrganizers();
    }, []);

    const showAlert = (message) => {
        setAlertMessage(message);
        setAlertVisible(true);

        // Set a timeout to hide the alert after 3 seconds
        const timer = setTimeout(() => {
            setAlertVisible(false);
        }, 3000);

        // Cleanup timer on unmount or before setting a new alert
        return () => clearTimeout(timer);
    };

    const handleApproval = async (userDetailsId) => {
        try {
            await axios.post(`http://localhost:8080/api/userdetails/organizers/${userDetailsId}/approve`);
            showAlert('Organizer approved successfully!');
            fetchOrganizers();
        } catch (error) {
            console.error('Error approving organizer:', error);
        }
    };

    const handleRejection = async (userDetailsId) => {
        try {
            await axios.post(`http://localhost:8080/api/userdetails/organizers/${userDetailsId}/reject`);
            showAlert('Organizer rejected successfully!');
            fetchOrganizers();
        } catch (error) {
            console.error('Error rejecting organizer:', error);
        }
    };

    const handleBlock = async (userDetailsId) => {
        try {
            await axios.post(`http://localhost:8080/api/userdetails/organizers/${userDetailsId}/block`);
            showAlert('Organizer blocked successfully!');
            fetchOrganizers();
        } catch (error) {
            console.error('Error blocking organizer:', error);
        }
    };

    const handleAction = () => {
        if (currentAction === 'approve') {
            handleApproval(currentOrganizerId);
        } else if (currentAction === 'reject') {
            handleRejection(currentOrganizerId);
        } else if (currentAction === 'block') {
            handleBlock(currentOrganizerId);
        }
        closeConfirmModal();
    };

    const openConfirmModal = (action, userDetailsId) => {
        setCurrentAction(action);
        setCurrentOrganizerId(userDetailsId);
        setIsConfirmModalOpen(true);
    };

    const closeConfirmModal = () => {
        setIsConfirmModalOpen(false);
        setCurrentAction(null);
        setCurrentOrganizerId(null);
    };

    const filteredOrganizers = organizers.filter((organizer) => {
        if (filter === 'All') return true;
        if (filter === 'Requested') return organizer.isApproved === null;
        if (filter === 'Approved') return organizer.isApproved === true;
        if (filter === 'Rejected') return organizer.isApproved === false;
        return true;
    });

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

            {alertVisible && (
                <div className="success-alert">
                    {alertMessage}
                </div>
            )}

            <div className="manage-organizer-div">
                <div className="manage-organizer-container">
                    <div className="row">
                        <div className="col-md-6 text-start">
                            <h2 className="mt-4">Organizers</h2>
                        </div>
                        <div className="col-md-6">
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="form-select mt-4"
                                style={{ width: '200px', position: 'relative', left: '360px' }}
                            >
                                <option value="All">All</option>
                                <option value="Requested">Requested</option>
                                <option value="Approved">Approved</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                        </div>
                    </div>

                    <div className="organizer-table-container">
                        <table className="organizer-table">
                            <thead className="table-header">
                                <tr>
                                    <th>Full Name</th>
                                    <th>Contact Number</th>
                                    <th>Alternate Number</th>
                                    <th>Date of Birth</th>
                                    <th>Email</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrganizers.map((organizer) => (
                                    <tr key={organizer.userDetailsId}>
                                        <td>{organizer.fullName}</td>
                                        <td>{organizer.contactNumber}</td>
                                        <td>{organizer.alternateNumber}</td>
                                        <td>{organizer.dateOfBirth}</td>
                                        <td>{organizer.email}</td>
                                        <td>
                                            {organizer.isApproved === null ? (
                                                "Requested"
                                            ) : organizer.isApproved ? (
                                                "Approved"
                                            ) : (
                                                "Rejected"
                                            )}
                                        </td>
                                        <td>
                                            {organizer.isApproved === null ? (
                                                <>
                                                    <Button onClick={() => openConfirmModal('approve', organizer.userDetailsId)}>Accept</Button>
                                                    <Button onClick={() => openConfirmModal('reject', organizer.userDetailsId)}>Reject</Button>
                                                </>
                                            ) : organizer.isApproved ? (
                                                <Button onClick={() => openConfirmModal('block', organizer.userDetailsId)}>Block</Button>
                                            ) : (
                                                <span>No action</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            <Modal
                show={isConfirmModalOpen}
                onHide={closeConfirmModal}
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Action!</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to {currentAction} this organizer?
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={handleAction}>
                        {currentAction === 'approve' ? 'Accept' : currentAction === 'reject' ? 'Reject' : 'Block'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default ManageOrganizers;
