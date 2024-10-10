import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './css/Upcomingevent.css'
import Modal from 'react-modal';

const FestivalEvents = () => {
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [ticketPrices, setTicketPrices] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const API_URL = 'http://localhost:8080/api/events';

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await axios.get(API_URL);
                console.log('API Response:', response.data); // Log the response data

                // Filter for festival events based on the expected structure
                const festivalEvents = response.data.filter(event => event.categoryName === 'Festival');
                console.log('Filtered Festival Events:', festivalEvents); // Log filtered events

                setEvents(festivalEvents);
            } catch (error) {
                console.error('Error fetching events:', error);
            }
        };

        fetchEvents();
    }, []);

    const fetchTicketPrices = async (eventId) => {
        try {
            const response = await axios.get(`http://localhost:8080/api/events/${eventId}/ticketPrices`);
            setTicketPrices(response.data);
        } catch (error) {
            console.error('Error fetching ticket prices:', error);
        }
    };

    const openModal = (event) => {
        setSelectedEvent(event);
        fetchTicketPrices(event.eventId);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const renderEventCards = () => {
        return events.map(event => (
            <div key={event.eventId} className="event-card">
                <img src={event.imagePath} alt={event.eventName} />
                <h3>{event.eventName}</h3>
                <button onClick={() => openModal(event)}>Book Now</button>
            </div>
        ));
    };

    return (
        <div className="festival-events">
            <h2>Festival Events</h2>
            <div className="event-cards-container">
                {events.length > 0 ? renderEventCards() : <p>No festival events available.</p>}
            </div>

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
                        height: '320px',
                    }
                }}
            >
                <div className="modal-header-container">
                    <h2>Book Ticket for {selectedEvent?.eventName}</h2>
                    <button onClick={closeModal}>&times;</button>
                </div>
                {ticketPrices.length > 0 && (
                    <div>
                        <label htmlFor="ticketCategory">Ticket Category:</label>
                        <select id="ticketCategory">
                            {ticketPrices.map(ticket => (
                                <option key={ticket.priceCategory} value={ticket.priceCategory}>
                                    {ticket.priceCategory}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
                <div>
                    <label htmlFor="ticketPrice">Price:</label>
                    <input
                        type="text"
                        id="ticketPrice"
                        value={ticketPrices.find(ticket => ticket.priceCategory)?.price || ''}
                        readOnly
                    />
                </div>
                <button onClick={() => alert('Payment Successful!')}>Pay</button>
            </Modal>
        </div>
    );
};

export default FestivalEvents;
