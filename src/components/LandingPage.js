import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/LandingPage.css';
import { useNavigate } from 'react-router-dom';
import logo from './images/Imagique.png';
import UpcomingEvents from './UpcomingEvents';
import BecomeOrganizer from './BecomeOrganizer';
import EventCategories from './EventCategories';
import Footer from './Footer';
import EventsByCategory from './EventsByCategory';

const LandingPage = () => {
    const navigate = useNavigate();
    const [showSignIn, setShowSignIn] = useState(false);
    const [showSignUp, setShowSignUp] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [userDetailsId, setUserDetailsId] = useState(null);
    const [signInData, setSignInData] = useState({ email: '', password: '' });
    const [signUpData, setSignUpData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        contactNumber: '',
        alternateNumber: '',
        dateOfBirth: '',
        password: '',
        confirmPassword: '',
    });
    const [selectedCategory, setSelectedCategory] = useState('');

    // Validation states
    const [signInError, setSignInError] = useState('');
    const [signUpErrors, setSignUpErrors] = useState({
        firstName: '',
        lastName: '',
        email: '',
        contactNumber: '',
        alternateNumber: '',
        dateOfBirth: '',
        password: '',
        confirmPassword: '',
    });

    useEffect(() => {
        const loggedInUser = JSON.parse(localStorage.getItem('user'));
        if (loggedInUser) {
            setIsLoggedIn(true);
            setUserRole(loggedInUser.role);
            setUserDetailsId(loggedInUser.userDetailsId);
        }
    }, []);

    const validateFirstName = (firstName) => {
        const regex = /^[A-Za-z]{3,20}$/;
        return regex.test(firstName) ? '' : 'First name must be 3-20 characters and contain only letters.';
    };

    const validateLastName = (lastName) => {
        const regex = /^[A-Za-z]{1,20}$/;
        return regex.test(lastName) ? '' : 'Last name must be 1-20 characters and contain only letters.';
    };

    const validateEmail = (email) => {
        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|net|co|in)$/;
        return regex.test(email) ? '' : 'Email must be in the format name@example.com';
    };

    const validateDateOfBirth = (dob) => {
        const today = new Date();
        const birthDate = new Date(dob);
        const age = today.getFullYear() - birthDate.getFullYear();

        if (birthDate > today) {
            return 'Date of Birth cannot be in the future.';
        }

        return age < 18 ? 'You must be at least 18 years old.' : '';
    };

    const validateContactNumber = (number) => {
        const regex = /^[6-9]\d{9}$/;
        return regex.test(number) ? '' : 'Contact number must start with 6-9 and be 10 digits long.';
    };

    const validatePassword = (password) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
        return regex.test(password) ? '' : 'Password must be 8-20 characters, with at least 1 capital letter, 1 lowercase letter, 1 number, and 1 special character.';
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSignUpData((prev) => ({ ...prev, [name]: value }));

        // Validation based on the field
        let error = '';
        switch (name) {
            case 'firstName':
                error = validateFirstName(value);
                break;
            case 'lastName':
                error = validateLastName(value);
                break;
            case 'email':
                error = validateEmail(value);
                break;
            case 'dateOfBirth':
                error = validateDateOfBirth(value);
                break;
            case 'contactNumber':
                error = validateContactNumber(value);
                break;
            case 'alternateNumber':
                error = validateContactNumber(value);
                break;
            case 'password':
                error = validatePassword(value);
                break;
            case 'confirmPassword':
                error = value !== signUpData.password ? 'Passwords do not match.' : '';
                break;
            default:
                break;
        }
        setSignUpErrors({ ...signUpErrors, [name]: error });
    };

    const handleSignIn = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8080/api/auth/signin', signInData);
            setIsLoggedIn(true);
            const { email, role, userDetailsId } = response.data;
            localStorage.setItem('user', JSON.stringify({ email, role, userDetailsId }));
            setUserRole(role);
            setUserDetailsId(userDetailsId);
            setShowSignIn(false);
            setSignInError('');
        } catch (error) {
            setSignInError('Invalid Credentials!');
        }
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        const hasErrors = Object.values(signUpErrors).some((error) => error);
        if (hasErrors) return;
        try {
            const response = await axios.post('http://localhost:8080/api/auth/signup', signUpData);
            setIsLoggedIn(true);
            setUserRole('customer');
            localStorage.setItem('user', JSON.stringify({ role: 'customer' }));
            setShowSignUp(false);
        } catch (error) {
            console.error('Sign Up Error:', error);
        }
    };

    const handleSignOut = () => {
        setIsLoggedIn(false);
        setUserRole(null);
        setUserDetailsId(null);
        localStorage.removeItem('user');
    };

    const handleNavigateToDashboard = () => {
        navigate('/admin-dashboard');
    };

    const handleNavigateToOrganizerDashboard = () => {
        navigate('/organizer-dashboard');
    }

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
            <Navbar className="bg-light" variant="light" expand="lg" sticky="top">
                <Navbar.Brand href="/" style={{ fontFamily: 'Dancing Script', fontSize: '30px' }}>
                    <img src={logo} alt="Logo" style={{ width: '45px', marginRight: '5px', marginLeft: '15px', marginTop: '-10px' }} />
                    Imagique
                </Navbar.Brand>
                <Navbar.Toggle />
                <Navbar.Collapse className="justify-content-end">
                    <Nav className="navbar-links">
                        {!isLoggedIn ? (
                            <div>
                                <button className="navbar-button" onClick={() => setShowSignIn(true)}>Sign In</button>
                                <button className="navbar-button" onClick={() => setShowSignUp(true)}>Sign Up</button>
                            </div>
                        ) : (
                            <>
                                {userRole === 'admin' && (
                                    <>
                                        <Nav.Link onClick={handleNavigateToDashboard}>Dashboard</Nav.Link>
                                        <Nav.Link onClick={handleSignOut}>Sign Out</Nav.Link>
                                    </>
                                )}
                                {userRole === 'organizer' && (
                                    <>
                                        <Nav.Link onClick={handleNavigateToOrganizerDashboard}>Dashboard</Nav.Link>
                                        <Nav.Link onClick={handleSignOut}>Sign Out</Nav.Link>
                                    </>
                                )}
                                {userRole === 'customer' && (
                                    <>
                                        <Nav.Link onClick={handleNavigateToProfile}>Profile</Nav.Link>
                                        <Nav.Link onClick={handleNavigateToBookings}>Bookings</Nav.Link>
                                        <Nav.Link onClick={handleSignOut}>Sign Out</Nav.Link>
                                    </>
                                )}
                            </>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Navbar>

            <div className="hero-section">
                <div className="hero-content">
                    <h2>Imagique: Where Every Event Comes to Life!</h2>
                    <p>Welcome to your premier destination for unforgettable events! At Imagique, we believe that every gathering is an opportunity to create lasting memories...</p>
                </div>
            </div>

            <UpcomingEvents isLoggedIn={isLoggedIn} userDetailsId={userDetailsId} userRole={userRole}/>
            <EventCategories onSelectCategory={setSelectedCategory} />
            <EventsByCategory isLoggedIn={isLoggedIn} userDetailsId={userDetailsId} selectedCategory={selectedCategory} userRole={userRole} />
            <BecomeOrganizer />
            <Footer />

            {/* Sign In Modal */}
            <Modal show={showSignIn} onHide={() => setShowSignIn(false)}>
                <Modal.Header closeButton style={{ marginBottom: '10px' }}>
                    <Modal.Title>Sign In</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSignIn}>
                        {signInError && <p style={{ color: 'red' }}>{signInError}</p>}
                        <Form.Group controlId="formEmail">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="Enter email"
                                value={signInData.email}
                                onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                                style={{ marginBottom: '20px' }}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="formPassword">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Password"
                                value={signInData.password}
                                onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                                style={{ marginBottom: '15px' }}
                                required
                            />
                        </Form.Group>
                        <Button type="submit">Sign In</Button>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Sign Up Modal */}
            <Modal show={showSignUp} onHide={() => setShowSignUp(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Sign Up</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSignUp}>
                        <div className="row mb-3">
                            <div className="col">
                                <Form.Group controlId="formFirstName">
                                    <Form.Label>First Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="firstName"
                                        placeholder="Enter first name"
                                        value={signUpData.firstName}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    {signUpErrors.firstName && <p style={{ color: 'red' }}>{signUpErrors.firstName}</p>}
                                </Form.Group>
                            </div>
                            <div className="col">
                                <Form.Group controlId="formLastName">
                                    <Form.Label>Last Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="lastName"
                                        placeholder="Enter last name"
                                        value={signUpData.lastName}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    {signUpErrors.lastName && <p style={{ color: 'red' }}>{signUpErrors.lastName}</p>}
                                </Form.Group>
                            </div>
                        </div>
                        <div className="row mb-3">
                            <div className="col">
                                <Form.Group controlId="formEmail">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        placeholder="Enter email"
                                        value={signUpData.email}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    {signUpErrors.email && <p style={{ color: 'red' }}>{signUpErrors.email}</p>}
                                </Form.Group>
                            </div>
                            <div className="col">
                                <Form.Group controlId="formDateOfBirth">
                                    <Form.Label>Date of Birth</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="dateOfBirth"
                                        value={signUpData.dateOfBirth}
                                        onChange={handleInputChange}
                                        style={{ height: '45px', width: '205px', marginTop: '4px' }}
                                        required
                                    />
                                    {signUpErrors.dateOfBirth && <p style={{ color: 'red' }}>{signUpErrors.dateOfBirth}</p>}
                                </Form.Group>
                            </div>
                        </div>
                        <div className="row mb-3">
                            <div className="col">
                                <Form.Group controlId="formContactNumber">
                                    <Form.Label>Contact Number</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="contactNumber"
                                        placeholder="Enter contact number"
                                        value={signUpData.contactNumber}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    {signUpErrors.contactNumber && <p style={{ color: 'red' }}>{signUpErrors.contactNumber}</p>}
                                </Form.Group>
                            </div>
                            <div className="col">
                                <Form.Group controlId="formAlternateNumber">
                                    <Form.Label>Alternate Number</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="alternateNumber"
                                        placeholder="Enter alternate number"
                                        value={signUpData.alternateNumber}
                                        onChange={handleInputChange}
                                    />
                                    {signUpErrors.alternateNumber && <p style={{ color: 'red' }}>{signUpErrors.alternateNumber}</p>}
                                </Form.Group>
                            </div>
                        </div>
                        <div className="row mb-3">
                            <div className="col">
                                <Form.Group controlId="formPassword">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="password"
                                        placeholder="Password"
                                        value={signUpData.password}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    {signUpErrors.password && <p style={{ color: 'red' }}>{signUpErrors.password}</p>}
                                </Form.Group>
                            </div>
                            <div className="col">
                                <Form.Group controlId="formConfirmPassword">
                                    <Form.Label>Confirm Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="confirmPassword"
                                        placeholder="Confirm Password"
                                        value={signUpData.confirmPassword}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    {signUpErrors.confirmPassword && <p style={{ color: 'red' }}>{signUpErrors.confirmPassword}</p>}
                                </Form.Group>
                            </div>
                        </div>
                        <Button type="submit">Sign Up</Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default LandingPage;
