import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Slider from 'react-slick';
import './css/Upcomingevent.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Modal from 'react-modal';
import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { jsPDF } from "jspdf";

const UpcomingEvents = ({ isLoggedIn, userDetailsId, userRole }) => {
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [ticketPrices, setTicketPrices] = useState([]);
    const [eventDetails, setEventDetails] = useState(null);
    const [userDetails, setUserDetails] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedTicketPriceId, setSelectedTicketPriceId] = useState('');
    const [numberOfTickets, setNumberOfTickets] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const navigate = useNavigate();
    const API_URL = 'http://localhost:8080/api/events';

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await axios.get(API_URL);
                setEvents(response.data);
            } catch (error) {
                console.error('Error fetching events:', error);
            }
        };

        fetchEvents();
    }, []);

    useEffect(() => {
        const fetchUserDetails = async () => {
            if (userDetailsId) {
                try {
                    const response = await axios.get(`http://localhost:8080/api/userdetails/${userDetailsId}`);
                    setUserDetails(response.data);
                    console.log('User Details:', response.data);
                } catch (error) {
                    console.error('Error fetching user details:', error);
                }
            }
        };

        fetchUserDetails();
    }, [userDetailsId]);

    const fetchTicketPrices = async (eventId) => {
        try {
            const response = await axios.get(`${API_URL}/${eventId}/ticketPrices`);
            setTicketPrices(response.data);
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
        setSelectedCategory('');
        setSelectedTicketPriceId('');
        setNumberOfTickets(1);
    };

    const closeInfoModal = () => {
        setIsInfoModalOpen(false);
    };

    const handleCategoryChange = (e) => {
        const selectedPrice = ticketPrices.find(ticket => ticket.priceCategory === e.target.value);
        setSelectedCategory(selectedPrice ? selectedPrice.priceCategory : '');
        setSelectedTicketPriceId(selectedPrice ? selectedPrice.ticketPriceId : '');
    };

    const handleBooking = async () => {
        if (!selectedTicketPriceId || numberOfTickets < 1) {
            alert("Please select a ticket category and number of tickets.");
            return;
        }

        try {
            const response = await axios.post('http://localhost:8080/api/bookings/book', null, {
                params: {
                    userId: userDetails.userDetailsId,
                    eventId: selectedEvent.eventId,
                    ticketPriceId: selectedTicketPriceId,
                    numberOfTickets: numberOfTickets,
                }
            });

            const bookingData = response.data;

            const doc = new jsPDF();

            // Set font size for the heading
            doc.setFontSize(22);
            doc.text(`Booking Confirmation`, doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });

            // Set font size for the details
            doc.setFontSize(12);

            // Define table headers and data
            const headers = ["Detail", "Information"];
            const data = [
                ["Booking ID", String(bookingData.bookingId)],
                ["Booking under Name", bookingData.fullName],
                ["Event Name", selectedEvent.eventName],
                ["Location of the Event", bookingData.location],
                ["Date of the Event", formatDateTime(selectedEvent.date, selectedEvent.time).date],
                ["Time of the Event", formatDateTime(selectedEvent.date, selectedEvent.time).time],
                ["Number of Tickets", String(bookingData.noOfTickets)],
                ["Total Price", `Rs. ${bookingData.totalPrice}`]
            ];

            // Calculate starting position for the table
            let startY = 30;

            // Draw the headers
            const headerX1 = 10; // X position for "Detail"
            const headerX2 = 100; // X position for "Information"

            doc.setFont("helvetica", "bold");
            doc.text(headers[0], headerX1, startY);
            doc.text(headers[1], headerX2, startY);
            startY += 10; // Move down for the next row

            // Draw the data
            doc.setFont("helvetica", "normal");
            data.forEach(([label, value]) => {
                doc.text(label, headerX1, startY);
                doc.text(value, headerX2, startY);
                startY += 10; // Move down for the next row
            });

            // Save the document
            doc.save('booking-confirmation.pdf');

            // Close the modal after booking
            closeModal();
        } catch (error) {
            console.error('Error during booking:', error);
            alert('There was an issue with your booking. Please try again.');
        }
    };

    const settings = {
        dots: false,
        infinite: true,
        speed: 900,
        slidesToShow: 3,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 2000,
        responsive: [
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                },
            },
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2,
                },
            },
        ],
    };

    const formatDateTime = (dateString, timeString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const formattedDate = `${day}-${month}-${year}`;
        const time = new Date(`1970-01-01T${timeString}`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
        return { date: formattedDate, time };
    };

    return (
        <div className="upcoming-events">
            <h2 style={{ fontFamily: 'Playwrite Deutschland Grundschrift', fontSize: '35px' }}>Upcoming Events</h2>
            <Slider {...settings}>
                {events.map((event) => {
                    return (
                        <div key={event.eventId} className="event-card">
                            <img src={event.imagePath} alt={event.eventName} />
                            <h3 style={{ fontFamily: 'Playwrite Deutschland Grundschrift' }}>{event.eventName}</h3>
                            <button onClick={() => openInfoModal(event)}>View</button>
                            <button
                                onClick={() => openModal(event)}
                                className={userRole === 'organizer' || userRole === 'admin' ? 'button-disabled' : ''}
                                disabled={userRole === 'organizer' || userRole === 'admin'}>
                                Book
                            </button>
                        </div>
                    );
                })}
            </Slider>

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
                            value={selectedCategory}
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
                        value={ticketPrices.find(ticket => ticket.priceCategory === selectedCategory)?.price || ''}
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
                <button onClick={handleBooking} disabled={!selectedCategory || numberOfTickets < 1} className={!selectedCategory || numberOfTickets < 1 ? 'button-disabled' : ''}>
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
                    <button className="modal-close-button" onClick={() => setIsInfoModalOpen(false)} style={{ fontSize: '30px', marginBottom: '10px' }} >&times;</button>
                </div>
                {eventDetails && (
                    <div>
                        <h5>{eventDetails.eventName}</h5>
                        <p>Date: {formatDateTime(eventDetails.date, eventDetails.time).date}</p>
                        <p>Time: {formatDateTime(eventDetails.date, eventDetails.time).time}</p>
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

export default UpcomingEvents;
