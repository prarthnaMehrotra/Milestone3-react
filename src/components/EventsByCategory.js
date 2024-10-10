import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './css/EventsByCategory.css';
import Modal from 'react-modal';
import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { jsPDF } from "jspdf";

const EventByCategory = ({ selectedCategory, isLoggedIn, userDetailsId, userRole }) => {
    const [events, setEvents] = useState([]);
    const [ticketPrices, setTicketPrices] = useState([]);
    const [eventDetails, setEventDetails] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showMore, setShowMore] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [selectedTicketCategory, setSelectedTicketCategory] = useState('');
    const [numberOfTickets, setNumberOfTickets] = useState(1);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const navigate = useNavigate();
    const API_URL = 'http://localhost:8080/api/events';
    const API_URL2 = 'http://localhost:8080/api/events/getallevents';

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await axios.get(API_URL2);
                setEvents(response.data);
            } catch (error) {
                console.error('Error fetching events:', error);
            }
        };

        fetchEvents();
    }, []);

    useEffect(() => {
        if (events.length > 0) {
            const filtered = events.filter(event => event.categoryId === selectedCategory);
            setFilteredEvents(filtered);
        }
    }, [events, selectedCategory]);

    const fetchTicketPrices = async (eventId) => {
        try {
            const response = await axios.get(`${API_URL}/${eventId}/ticketPrices`);
            setTicketPrices(response.data);
            setSelectedTicketCategory('');
        } catch (error) {
            console.error('Error fetching ticket prices:', error);
        }
    };

    const fetchEventDetails = async (eventId) => {
        try {
            const response = await axios.get(`${API_URL}/${eventId}/details`);
            setEventDetails(response.data);
        } catch (error) {
            console.error('Error fetching event details:', error);
        }
    };

    const openModal = (event) => {
        if (!isLoggedIn) {
            setShowLoginPrompt(true);
            return;
        }

        console.log(userRole);
        if (userRole === 'organizer' || userRole === 'admin') {
            return;
        }

        setSelectedEvent(event);
        fetchTicketPrices(event.eventId);
        fetchEventDetails(event.eventId);
        setIsModalOpen(true);
    };

    const openInfoModal = (event) => {
        setSelectedEvent(event);
        fetchEventDetails(event.eventId);
        fetchTicketPrices(event.eventId);
        setIsInfoModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedTicketCategory('');
        setNumberOfTickets(1);
    };

    const closeInfoModal = () => {
        setIsInfoModalOpen(false);
    };

    const handleCategoryChange = (event) => {
        setSelectedTicketCategory(event.target.value);
    };

    const handleBooking = async () => {
        if (!selectedTicketCategory || numberOfTickets < 1) {
            alert("Please select a ticket category and number of tickets.");
            return;
        }

        try {
            const response = await axios.post('http://localhost:8080/api/bookings/book', null, {
                params: {
                    userId: userDetailsId,
                    eventId: selectedEvent.eventId,
                    ticketPriceId: ticketPrices.find(ticket => ticket.priceCategory === selectedTicketCategory).ticketPriceId,
                    numberOfTickets: numberOfTickets,
                }
            });

            const bookingData = response.data;

            // Create PDF confirmation
            const doc = new jsPDF();
            doc.setFontSize(22);
            doc.text(`Booking Confirmation`, doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
            doc.setFontSize(12);
            const headers = ["Detail", "Information"];
            const data = [
                ["Booking ID", String(bookingData.bookingId)],
                ["Booking under Name", bookingData.fullName],
                ["Event Name", selectedEvent.eventName],
                ["Date of the Event", selectedEvent.date],
                ["Time of the Event", selectedEvent.time],
                ["Number of Tickets", String(bookingData.noOfTickets)],
                ["Total Price", `Rs. ${bookingData.totalPrice}`]
            ];

            let startY = 30;
            const headerX1 = 10;
            const headerX2 = 100;

            doc.setFont("helvetica", "bold");
            doc.text(headers[0], headerX1, startY);
            doc.text(headers[1], headerX2, startY);
            startY += 10;

            doc.setFont("helvetica", "normal");
            data.forEach(([label, value]) => {
                doc.text(label, headerX1, startY);
                doc.text(value, headerX2, startY);
                startY += 10;
            });

            doc.save('booking-confirmation.pdf');
            closeModal();
        } catch (error) {
            console.error('Error during booking:', error);
            alert('There was an issue with your booking. Please try again.');
        }
    };

    const renderEventCards = () => {
        return filteredEvents.map(event => (
            <div key={event.eventId} className="event-cards">
                <img src={event.imagePath} alt={event.eventName} />
                <h3 style={{ fontFamily: 'Playwrite Deutschland Grundschrift', fontSize: '30px' }}>{event.eventName}</h3>
                <div className="button-container">
                    <button onClick={() => openInfoModal(event)}>View</button>
                    <button
                        onClick={() => openModal(event)}
                        className={userRole === 'organizer' || userRole === 'admin' ? 'button-disabled' : ''}
                        disabled={userRole === 'organizer' || userRole === 'admin'}>
                        Book
                    </button>
                </div>
            </div>
        ));
    };

    const handleViewMore = () => {
        setShowMore(!showMore);
    };

    return (
        <div className="event-by-category">
            <h2 style={{ fontFamily: 'Playwrite Deutschland Grundschrift', fontSize: '35px' }}>Events</h2>
            <div className="event-row">
                {renderEventCards()}
            </div>
            {filteredEvents.length > 6 && (
                <button onClick={handleViewMore} className="view-more-button">
                    {showMore ? 'Show Less' : 'View More'}
                </button>
            )}

            {/* Login Prompt Modal */}
            <Modal
                isOpen={showLoginPrompt}
                onRequestClose={() => setShowLoginPrompt(false)}
                style={{
                    overlay: { zIndex: 1000 },
                    content: {
                        maxWidth: '350px',
                        borderRadius: '10px',
                        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
                        height: '200px',
                    }
                }}
            >
                <h3 style={{ marginBottom: '20px' }}>Sign in to Book!</h3>
                <p style={{ marginBottom: '40px' }}>Please login and then proceed to booking.</p>
                <Button onClick={() => setShowLoginPrompt(false)}>Okay</Button>
            </Modal>

            {/* Modal for booking */}
            <Modal
                isOpen={isModalOpen}
                onRequestClose={closeModal}
                contentLabel="Book Ticket"
                style={{
                    overlay: { zIndex: 1000 },
                    content: {
                        maxWidth: '420px',
                        margin: 'auto',
                        padding: '20px',
                        borderRadius: '10px',
                        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
                        height: '400px',
                    }
                }}
            >
                <div className="modal-header-container">
                    <h2 className="modal-header">Book Ticket for {selectedEvent?.eventName}</h2>
                    <button className="modal-close-button" onClick={closeModal} style={{ fontSize: '30px', marginBottom: '5px' }}>&times;</button>
                </div>
                {ticketPrices.length > 0 && (
                    <div>
                        <label className="modal-label" htmlFor="ticketCategory" style={{ marginTop: '-2px' }}><strong>Ticket Category</strong></label>
                        <select
                            id="ticketCategory"
                            className="modal-select"
                            onChange={handleCategoryChange}
                            value={selectedTicketCategory}
                            style={{ marginBottom: '-2px', width: '342px' }}
                        >
                            <option value="" disabled>Select a category</option>
                            {ticketPrices.map((ticket) => (
                                <option key={ticket.ticketPriceId} value={ticket.priceCategory}>
                                    {ticket.priceCategory}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
                <div>
                    <label className="modal-label" htmlFor="ticketPrice"><strong>Price</strong></label>
                    <input
                        type="text"
                        id="ticketPrice"
                        className="modal-input"
                        value={selectedTicketCategory ? ticketPrices.find(ticket => ticket.priceCategory === selectedTicketCategory)?.price || '' : ''}
                        style={{ marginBottom: '-2px' }}
                        readOnly
                    />
                </div>
                <div>
                    <label className="modal-label" htmlFor="numberOfTickets"><strong>Number of Tickets</strong></label>
                    <input
                        type="number"
                        id="numberOfTickets"
                        className="modal-input"
                        min="1"
                        value={numberOfTickets}
                        style={{ marginBottom: '4px' }}
                        onChange={(e) => setNumberOfTickets(Number(e.target.value))}
                    />
                </div>
                {eventDetails && (
                    <div>
                        <p><strong>Available Tickets :</strong> {eventDetails.totalCapacity}</p>
                    </div>
                )}
                <button onClick={handleBooking} disabled={!selectedTicketCategory || numberOfTickets < 1} className={!selectedTicketCategory || numberOfTickets < 1 ? 'button-disabled' : ''}>
                    Pay
                </button>
            </Modal>

            {/* Modal for event details */}
            <Modal
                isOpen={isInfoModalOpen}
                onRequestClose={closeInfoModal}
                contentLabel="Event Details"
                style={{
                    overlay: { zIndex: 1000 },
                    content: {
                        maxWidth: '420px',
                        margin: 'auto',
                        padding: '20px',
                        borderRadius: '10px',
                        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
                        height: '400px',
                    }
                }}
            >
                <div className="modal-header-container">
                    <h2 className="modal-header">Event Details</h2>
                    <button className="modal-close-button" style={{ fontSize: '30px', marginBottom: '10px' }} onClick={closeInfoModal}>&times;</button>
                </div>
                {eventDetails && (
                    <div>
                        <h5>{eventDetails.eventName}</h5>
                        <p>Date: {eventDetails.date}</p>
                        <p>Time: {eventDetails.time}</p>
                        <p>Available Tickets: {eventDetails.totalCapacity}</p>
                        <h5>Ticket Prices</h5>
                        {ticketPrices.map(ticket => (
                            <div key={ticket.ticketPriceId}>
                                <p>Category: {ticket.priceCategory}</p>
                                <p>Price: Rs. {ticket.price}</p>
                            </div>
                        ))}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default EventByCategory;
