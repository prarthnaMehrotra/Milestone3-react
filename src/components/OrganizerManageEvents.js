import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Navbar, Nav, NavDropdown, Modal, Button, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import logo from './images/Imagique.png';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/OrganizerManageEvents.css';

const OrganizerManageEvents = () => {
    const [events, setEvents] = useState([]);
    const [categories, setCategories] = useState([]);
    const [event, setEvent] = useState({
        eventId: '',
        eventName: '',
        description: '',
        date: '',
        time: '',
        categoryId: '',
        imageFile: null,
    });
    const [sponsors, setSponsors] = useState([{ sponsorName: '', contactNumber: '' }]);
    const [ticketPrices, setTicketPrices] = useState([{ priceCategory: '', price: '' }]);
    const [venue, setVenue] = useState({ venueLocation: '', mapsLink: '', capacity: '' });
    const [showModal, setShowModal] = useState(false);
    const [userDetailsId, setUserDetailsId] = useState('');
    const [currentStep, setCurrentStep] = useState(0);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [eventToDelete, setEventToDelete] = useState(null);

    const API_URL = 'http://localhost:8080/api/events';
    const CATEGORIES_URL = 'http://localhost:8080/api/categories';

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
            setUserDetailsId(storedUser.userDetailsId);
        }

        fetchEvents();
        fetchCategories();
    }, [userDetailsId]); // Fetch events when userDetailsId changes

    const fetchEvents = async () => {
        if (userDetailsId) {
            try {
                const response = await axios.get(`${API_URL}/organizer/${userDetailsId}`); // Updated API endpoint
                setEvents(response.data);
            } catch (error) {
                console.error("There was an error fetching events!", error);
            }
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axios.get(CATEGORIES_URL);
            setCategories(response.data);
        } catch (error) {
            console.error("There was an error fetching categories!", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        // Append event data
        formData.append('userDetailsId', userDetailsId);
        formData.append('eventName', event.eventName);
        formData.append('description', event.description);
        formData.append('date', event.date);
        formData.append('time', event.time);
        formData.append('categoryId', event.categoryId);
        if (event.imageFile) {
            formData.append('image', event.imageFile);
        }

        // Append sponsors
        sponsors.forEach((sponsor, index) => {
            formData.append(`sponsors[${index}].sponsorName`, sponsor.sponsorName);
            formData.append(`sponsors[${index}].contactNumber`, sponsor.contactNumber);
        });

        // Append ticket prices
        ticketPrices.forEach((ticketPrice, index) => {
            formData.append(`ticketPrices[${index}].priceCategory`, ticketPrice.priceCategory);
            formData.append(`ticketPrices[${index}].price`, ticketPrice.price);
        });

        // Append venue
        formData.append('venue.venueLocation', venue.venueLocation);
        formData.append('venue.mapsLink', venue.mapsLink);
        formData.append('venue.capacity', venue.capacity);

        console.log("Form Data being sent:", Array.from(formData.entries()));

        try {
            const eventResponse = event.eventId
                ? await axios.put(`${API_URL}/${event.eventId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
                : await axios.post(API_URL, formData, { headers: { 'Content-Type': 'multipart/form-data' } });

            const eventId = eventResponse.data.eventId;

            // Save sponsors and ticket prices in parallel
            const sponsorPromises = sponsors.map((sponsor) => {
                if (sponsor.sponsorName && sponsor.contactNumber) {
                    return axios.post(`${API_URL}/${eventId}/sponsors`, sponsor);
                }
                return null; // Return null for invalid sponsors
            }).filter(Boolean); // Filter out null values

            const ticketPricePromises = ticketPrices.map((ticketPrice) => {
                if (ticketPrice.priceCategory && ticketPrice.price) {
                    return axios.post(`${API_URL}/${eventId}/ticketPrices`, ticketPrice);
                }
                return null; // Return null for invalid ticket prices
            }).filter(Boolean); // Filter out null values

            // Save venue
            const venuePromise = axios.post(`${API_URL}/${eventId}/venue`, venue);

            // Wait for all promises to resolve
            await Promise.all([...sponsorPromises, ...ticketPricePromises, venuePromise]);

            console.log("Event created/updated successfully!");
            resetForm(); // Reset the form after successful submission
            setShowModal(false); // Close the modal if applicable

            console.log("Form Data:", Array.from(formData.entries()));
            console.log("Sponsors:", sponsors);
            console.log("Ticket Prices:", ticketPrices);
            console.log("Venue:", venue);

            console.log("Event payload:", {
                userDetailsId,
                ...event,
                sponsors,
                ticketPrices,
                venue,
            });
        } catch (error) {
            console.error("There was an error creating/updating the event!", error);
        }
    };

    const resetForm = () => {
        setEvent({ eventId: '', eventName: '', description: '', date: '', time: '', categoryId: '', imageFile: null });
        setSponsors([{ sponsorName: '', contactNumber: '' }]);
        setTicketPrices([{ priceCategory: '', price: '' }]);
        setVenue({ venueLocation: '', mapsLink: '', capacity: '' });
        setCurrentStep(0); // Reset the step
    };

    const handleFileChange = (e) => {
        setEvent({ ...event, imageFile: e.target.files[0] });
    };

    const handleEdit = (event) => {
        setEvent(event);
        setShowModal(true);
    };

    const handleNextStep = () => {
        setCurrentStep((prevStep) => prevStep + 1);
    };

    const handlePreviousStep = () => {
        setCurrentStep((prevStep) => prevStep - 1);
    };

    const addSponsor = () => {
        setSponsors(prevSponsors => [...prevSponsors, { sponsorName: '', contactNumber: '' }]);
    };

    const updateSponsor = (index, field, value) => {
        const updatedSponsors = [...sponsors];
        updatedSponsors[index][field] = value;
        setSponsors(updatedSponsors);
    };

    const addTicketPrice = () => {
        setTicketPrices(prevTicketPrices => [...prevTicketPrices, { priceCategory: '', price: '' }]);
    };

    const updateTicketPrice = (index, field, value) => {
        const updatedPrices = [...ticketPrices];
        updatedPrices[index][field] = value;
        setTicketPrices(updatedPrices);
    };

    const handleDelete = (eventId) => {
        const eventToDelete = events.find(e => e.eventId === eventId);
        setEventToDelete(eventToDelete);
        setShowDeleteModal(true);
    };

    const confirmDelete = async (id) => {
        try {
            await axios.delete(`${API_URL}/${id}`);
            fetchEvents();
        } catch (error) {
            console.error("There was an error deleting the event!", error);
        } finally {
            setShowDeleteModal(false);
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

            <div className="organizer-event-manager-div">
                <div className="organizer-event-manager-container">
                    <div className="row">
                        <div className="col-md-6 text-start">
                            <h2 className="mt-4">Manage Events</h2>
                        </div>
                        <div className="text-end organizer-create-event-button">
                            <Button variant="primary" onClick={() => setShowModal(true)}>
                                Add Event
                            </Button>
                        </div>
                    </div>

                    <div className="organizer-event-table-container">
                        <table className="organizer-event-table">
                            <thead className="organizer-table-header">
                                <tr>
                                    <th>Event Name</th>
                                    <th>Description</th>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Category</th>
                                </tr>
                            </thead>
                            <tbody>
                                {events.map((event) => (
                                    <tr key={event.eventId}>
                                        <td>{event.eventName}</td>
                                        <td>{event.description}</td>
                                        <td>{event.date}</td>
                                        <td>{event.time}</td>
                                        <td>{categories.find(cat => cat.categoryId === event.categoryId)?.categoryName || 'N/A'}</td>
                                        
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Delete Confirmation Modal */}
                    <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                        <Modal.Header closeButton>
                            <Modal.Title>Confirm Deletion</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            Are you sure you want to delete the event "{eventToDelete?.eventName}"?
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                                Cancel
                            </Button>
                            <Button variant="danger" onClick={() => confirmDelete(eventToDelete.eventId)}>
                                Delete
                            </Button>
                        </Modal.Footer>
                    </Modal>

                    {/* Modal to add an event */}
                    <Modal show={showModal} onHide={() => setShowModal(false)}>
                        <Modal.Header closeButton>
                            <Modal.Title>{event.eventId ? 'Edit Event' : 'Add Event'}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form onSubmit={handleSubmit}>
                                {currentStep === 0 && (
                                    <div style={{ marginTop: '-20px' }}>
                                        <h5>Event Details</h5>
                                        <div className="row">
                                            <div className="col-md-6">
                                                <Form.Group controlId="formEventName">
                                                    <Form.Label>Event Name</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Enter Event name"
                                                        value={event.eventName}
                                                        onChange={(e) => setEvent({ ...event, eventName: e.target.value })}
                                                        required
                                                    />
                                                </Form.Group>
                                            </div>
                                            <div className="col-md-6">
                                                <Form.Group controlId="formDescription">
                                                    <Form.Label>Description</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Enter the description"
                                                        value={event.description}
                                                        onChange={(e) => setEvent({ ...event, description: e.target.value })}
                                                        required
                                                    />
                                                </Form.Group>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-md-6">
                                                <Form.Group controlId="formDate">
                                                    <Form.Label>Date</Form.Label>
                                                    <Form.Control
                                                        type="date"
                                                        value={event.date}
                                                        onChange={(e) => setEvent({ ...event, date: e.target.value })}
                                                        required
                                                    />
                                                </Form.Group>
                                            </div>
                                            <div className="col-md-6">
                                                <Form.Group controlId="formTime">
                                                    <Form.Label>Time</Form.Label>
                                                    <Form.Control
                                                        type="time"
                                                        value={event.time}
                                                        onChange={(e) => setEvent({ ...event, time: e.target.value })}
                                                        required
                                                    />
                                                </Form.Group>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-md-6">
                                                <Form.Group controlId="formCategory">
                                                    <Form.Label>Category</Form.Label>
                                                    <Form.Control
                                                        as="select"
                                                        value={event.categoryId}
                                                        onChange={(e) => setEvent({ ...event, categoryId: e.target.value })}
                                                        required
                                                    >
                                                        <option value="">Select Category</option>
                                                        {categories.map(cat => (
                                                            <option key={cat.categoryId} value={cat.categoryId}>
                                                                {cat.categoryName}
                                                            </option>
                                                        ))}
                                                    </Form.Control>
                                                </Form.Group>
                                            </div>
                                            <div className="col-md-6">
                                                <Form.Group controlId="formImage">
                                                    <Form.Label>Image</Form.Label>
                                                    <Form.Control
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleFileChange}
                                                    />
                                                </Form.Group>
                                            </div>
                                        </div>
                                        <Button variant="primary" onClick={handleNextStep} style={{ marginTop: '15px' }}>
                                            Next
                                        </Button>
                                    </div>
                                )}

                                {currentStep === 1 && (
                                    <div style={{ marginTop: '-20px' }}>
                                        <h5>Sponsors</h5>
                                        {sponsors.map((sponsor, index) => (
                                            <div key={index}>
                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <Form.Group>
                                                            <Form.Label>Sponsor Name</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                value={sponsor.sponsorName}
                                                                onChange={(e) => updateSponsor(index, 'sponsorName', e.target.value)}
                                                                required
                                                            />
                                                        </Form.Group>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <Form.Group>
                                                            <Form.Label>Contact Number</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                value={sponsor.contactNumber}
                                                                onChange={(e) => updateSponsor(index, 'contactNumber', e.target.value)}
                                                                required
                                                            />
                                                        </Form.Group>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <Button variant="secondary" onClick={addSponsor} style={{ marginTop: '15px' }}>Add Sponsor</Button>
                                        <Button variant="primary" onClick={handleNextStep} style={{ marginTop: '15px' }}>Next</Button>
                                        <Button variant="secondary" onClick={handlePreviousStep} style={{ marginTop: '15px' }}>Back</Button>
                                    </div>
                                )}

                                {currentStep === 2 && (
                                    <div style={{ marginTop: '-20px' }}>
                                        <h5>Ticket Prices</h5>
                                        {ticketPrices.map((ticketPrice, index) => (
                                            <div key={index}>
                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <Form.Group>
                                                            <Form.Label>Price Category</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                value={ticketPrice.priceCategory}
                                                                onChange={(e) => updateTicketPrice(index, 'priceCategory', e.target.value)}
                                                                required
                                                            />
                                                        </Form.Group>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <Form.Group>
                                                            <Form.Label>Price</Form.Label>
                                                            <Form.Control
                                                                type="number"
                                                                value={ticketPrice.price}
                                                                onChange={(e) => updateTicketPrice(index, 'price', e.target.value)}
                                                                required
                                                            />
                                                        </Form.Group>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <Button variant="secondary" onClick={addTicketPrice} style={{ marginTop: '15px' }}>Add Ticket Price</Button>
                                        <Button variant="primary" onClick={handleNextStep} style={{ marginTop: '15px' }}>Next</Button>
                                        <Button variant="secondary" onClick={handlePreviousStep} style={{ marginTop: '15px' }}>Back</Button>
                                    </div>
                                )}

                                {currentStep === 3 && (
                                    <div style={{ marginTop: '-20px' }}>
                                        <h5>Venue Details</h5>
                                        <div className="row">
                                            <div className="col-md-6">
                                                <Form.Group controlId="formVenueLocation">
                                                    <Form.Label>Venue Location</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Enter venue location"
                                                        value={venue.venueLocation}
                                                        onChange={(e) => setVenue({ ...venue, venueLocation: e.target.value })}
                                                        required
                                                    />
                                                </Form.Group>
                                            </div>
                                            <div className="col-md-6">
                                                <Form.Group controlId="formCapacity">
                                                    <Form.Label>Capacity</Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        placeholder="Enter capacity"
                                                        value={venue.capacity}
                                                        onChange={(e) => setVenue({ ...venue, capacity: e.target.value })}
                                                        required
                                                    />
                                                </Form.Group>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div>
                                                <Form.Group controlId="formMapsLink">
                                                    <Form.Label>Maps Link</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Enter maps link"
                                                        value={venue.mapsLink}
                                                        onChange={(e) => setVenue({ ...venue, mapsLink: e.target.value })}
                                                        required
                                                    />
                                                </Form.Group>
                                            </div>
                                        </div>
                                        <Button variant="primary" type="submit" style={{ marginTop: '15px' }}>Submit</Button>
                                        <Button variant="secondary" onClick={handlePreviousStep} style={{ marginTop: '15px' }}>Back</Button>
                                    </div>
                                )}
                            </Form>
                        </Modal.Body>
                    </Modal>
                </div>
            </div >
        </>
    );
};

export default OrganizerManageEvents;
