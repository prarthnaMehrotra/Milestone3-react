import React, { useState } from 'react';
import { Form, Button, Row, Col, Alert } from 'react-bootstrap';
import axios from 'axios';
import logo from './images/Imagique.png';
import './css/BecomeOrganizer.css';

const BecomeOrganizer = () => {
    const [organizerData, setOrganizerData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        contactNumber: '',
        alternateNumber: '',
        dateOfBirth: '',
        password: '',
        confirmPassword: '',
    });

    const [errors, setErrors] = useState({
        firstName: '',
        lastName: '',
        email: '',
        contactNumber: '',
        alternateNumber: '',
        dateOfBirth: '',
        password: '',
        confirmPassword: '',
    });

    const [successMessage, setSuccessMessage] = useState('');

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
        if (email.length > 100) {
            return 'Email must not exceed 100 characters.';
        }
        return regex.test(email) ? '' : 'Email must be in the format name@example.com';
    };

    const validateDateOfBirth = (dob) => {
        const today = new Date();
        const dateOfBirth = new Date(dob);

        // Check if date of birth is in the future
        if (dateOfBirth >= today) {
            return 'Date of birth must be in the past.';
        }

        // Calculate age
        const age = today.getFullYear() - dateOfBirth.getFullYear();
        const monthDifference = today.getMonth() - dateOfBirth.getMonth();

        // Check if the user is at least 18 years old
        if (age < 18 || (age === 18 && monthDifference < 0)) {
            return 'You must be at least 18 years old.';
        }

        return '';
    };

    const validateContactNumber = (number) => {
        const regex = /^[6-9]\d{9}$/;
        return regex.test(number) ? '' : 'Contact number must start with 6-9 and be 10 digits long.';
    };

    const validatePassword = (password) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
        return regex.test(password) ? '' : 'Password must be 8-20 characters, with at least 1 capital letter, 1 lowercase letter, 1 number, and 1 special character.';
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setOrganizerData({ ...organizerData, [name]: value });

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
                error = value !== organizerData.password ? 'Passwords do not match.' : '';
                break;
            default:
                break;
        }
        setErrors({ ...errors, [name]: error });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (Object.values(errors).every(err => err === '') && Object.values(organizerData).every(val => val !== '')) {
            try {
                const response = await axios.post('http://localhost:8080/api/auth/become-organizer', {
                    ...organizerData,
                    role: 'Organizer',
                    isApproved: 'pending',
                });
                console.log('Organizer Response:', response.data);

                // Show success message and reset form fields
                setSuccessMessage('Request Submitted Successfully!');
                setOrganizerData({
                    firstName: '',
                    lastName: '',
                    email: '',
                    contactNumber: '',
                    alternateNumber: '',
                    dateOfBirth: '',
                    password: '',
                    confirmPassword: '',
                });

                // Clear success message after 3 seconds
                setTimeout(() => {
                    setSuccessMessage('');
                }, 3000);
            } catch (error) {
                console.error('Organizer Error:', error);
                // Handle error (e.g., show an error message)
            }
        }
    };

    return (
        <div className="bg-light my-5 p-3">
            {successMessage && (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 1000,
                }}>
                    <div className="alert alert-success" style={{ width: '270px' }}>
                        {successMessage}
                    </div>
                </div>
            )
            }
            <Row className="align-items-center">
                <Col md={5}>
                    <img src={logo} alt="Organizer" className="img-fluid" style={{ maxWidth: '90%' }} />
                </Col>
                <Col md={7}>
                    <h2>Become an Organizer</h2>
                    <Form onSubmit={handleSubmit}>
                        <div className="row mb-3">
                            <div className="col">
                                <Form.Group controlId="formFirstName">
                                    <Form.Label>First Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="firstName"
                                        value={organizerData.firstName}
                                        onChange={handleChange}
                                        required
                                    />
                                    {errors.firstName && <span style={{ color: 'red' }}>{errors.firstName}</span>}
                                </Form.Group>
                            </div>
                            <div className="col">
                                <Form.Group controlId="formLastName">
                                    <Form.Label>Last Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="lastName"
                                        value={organizerData.lastName}
                                        onChange={handleChange}
                                        required
                                    />
                                    {errors.lastName && <span style={{ color: 'red' }}>{errors.lastName}</span>}
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
                                        value={organizerData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                    {errors.email && <span style={{ color: 'red' }}>{errors.email}</span>}
                                </Form.Group>
                            </div>
                            <div className="col">
                                <Form.Group controlId="formDateOfBirth">
                                    <Form.Label>Date of Birth</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="dateOfBirth"
                                        value={organizerData.dateOfBirth}
                                        onChange={handleChange}
                                        style={{ height: '45px', width: '310px', marginTop: '4px' }}
                                        required
                                    />
                                    {errors.dateOfBirth && <span style={{ color: 'red' }}>{errors.dateOfBirth}</span>}
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
                                        value={organizerData.contactNumber}
                                        onChange={handleChange}
                                        required
                                    />
                                    {errors.contactNumber && <span style={{ color: 'red' }}>{errors.contactNumber}</span>}
                                </Form.Group>
                            </div>
                            <div className="col">
                                <Form.Group controlId="formAlternateNumber">
                                    <Form.Label>Alternate Number</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="alternateNumber"
                                        value={organizerData.alternateNumber}
                                        onChange={handleChange}
                                        required
                                    />
                                    {errors.alternateNumber && <span style={{ color: 'red' }}>{errors.alternateNumber}</span>}
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
                                        value={organizerData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                    {errors.password && <span style={{ color: 'red' }}>{errors.password}</span>}
                                </Form.Group>
                            </div>
                            <div className="col">
                                <Form.Group controlId="formConfirmPassword">
                                    <Form.Label>Confirm Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="confirmPassword"
                                        value={organizerData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                    />
                                    {errors.confirmPassword && <span style={{ color: 'red' }}>{errors.confirmPassword}</span>}
                                </Form.Group>
                            </div>
                        </div>
                        <Button
                            type="submit"
                            className={Object.values(organizerData).some(val => val === '') || Object.values(errors).some(err => err !== '') ? 'button-disabled' : ''}
                            disabled={
                                Object.values(organizerData).some(val => val === '') ||
                                Object.values(errors).some(err => err !== '')
                            }
                        >
                            Submit
                        </Button>
                    </Form>
                </Col>
            </Row>
        </div >
    );
};

export default BecomeOrganizer;
