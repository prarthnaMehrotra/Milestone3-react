import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Navbar, Nav, Modal, Button, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import logo from './images/Imagique.png';
import './css/ManageCategories.css';

const ManageCategories = () => {
    const [categories, setCategories] = useState([]);
    const [category, setCategory] = useState({
        categoryId: '',
        categoryName: '',
        imageFile: null,
    });
    const [showModal, setShowModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);

    const API_URL = 'http://localhost:8080/api/categories';

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axios.get(API_URL);
            setCategories(response.data);
        } catch (error) {
            console.error("There was an error fetching categories!", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('categoryName', category.categoryName);
        if (category.imageFile) {
            formData.append('image', category.imageFile);
        }

        try {
            if (category.categoryId) {
                await axios.put(`${API_URL}/${category.categoryId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await axios.post(API_URL, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            setShowModal(false);
            setCategory({ categoryId: '', categoryName: '', imageFile: null });
            fetchCategories();
        } catch (error) {
            console.error("There was an error creating/updating the category!", error);
        }
    };

    const handleFileChange = (e) => {
        setCategory({ ...category, imageFile: e.target.files[0] });
    };

    const handleEdit = (cat) => {
        setCategory(cat);
        setShowModal(true);
    };

    const handleDeleteShow = (categoryId) => {
        setCategoryToDelete(categoryId);
        setShowDeleteConfirm(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await axios.delete(`${API_URL}/${categoryToDelete}`);
            fetchCategories();
        } catch (error) {
            console.error("There was an error deleting the category!", error);
        } finally {
            setShowDeleteConfirm(false);
            setCategoryToDelete(null);
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

            <div className="category-manager-div">
                <div className="category-manager-container">
                    <div className="row">
                        <div className="col-md-6 text-start">
                            <h2 className="mt-4">Categories</h2>
                        </div>
                        <div className="text-end create-category-button">
                            <Button variant="primary" onClick={() => setShowModal(true)}>Create Category</Button>
                        </div>
                    </div>

                    <div className="category-table-container">
                        <table className="category-table">
                            <thead className="table-header">
                                <tr>
                                    <th style={{ width: '280px' }}>Category ID</th>
                                    <th style={{ width: '280px' }}>Category Name</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map((cat) => (
                                    <tr key={cat.categoryId}>
                                        <td>{cat.categoryId}</td>
                                        <td>{cat.categoryName}</td>
                                        <td>
                                            <Button size="sm" onClick={() => handleEdit(cat)}>
                                                Edit
                                            </Button>
                                            <Button size="sm" className="ml-2" onClick={() => handleDeleteShow(cat.categoryId)}>
                                                Delete
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Modal for Creating/Editing Category */}
                    <Modal show={showModal} onHide={() => setShowModal(false)}>
                        <Modal.Header closeButton>
                            <Modal.Title>{category.categoryId ? 'Edit Category' : 'Create Category'}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form onSubmit={handleSubmit}>
                                <Form.Group controlId="formCategoryName">
                                    <Form.Label>Category Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter category name"
                                        value={category.categoryName}
                                        onChange={(e) => setCategory({ ...category, categoryName: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group controlId="formImage">
                                    <Form.Label>Image</Form.Label>
                                    <Form.Control
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                </Form.Group>
                                <Button variant="primary" type="submit">
                                    Submit
                                </Button>
                            </Form>
                        </Modal.Body>
                    </Modal>

                    {/* Confirmation Modal for Deletion */}
                    <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)}>
                        <Modal.Header closeButton>
                            <Modal.Title>Confirm Deletion</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>Are you sure you want to delete this category?</Modal.Body>
                        <Modal.Footer>
                            <Button onClick={handleDeleteConfirm}>
                                Delete
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </div>
            </div>
        </>
    );
};

export default ManageCategories;
