import React, { useEffect, useState } from 'react';
import { Card, Modal } from 'react-bootstrap';
import axios from 'axios';
import './css/EventCategories.css';
import allCategories from './images/events.jpg';

const EventCategories = ({ onSelectCategory }) => {
    const [categories, setCategories] = useState([]);
    const [showAllCategories, setShowAllCategories] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/categories');
                setCategories(response.data);

                // Automatically select the "Festivals" category if it exists
                const festivalCategory = response.data.find(cat => cat.categoryName === 'Festivals');
                if (festivalCategory) {
                    onSelectCategory(festivalCategory.categoryId, festivalCategory.categoryName);
                }
            } catch (error) {
                console.error("There was an error fetching categories!", error);
            }
        };

        fetchCategories();
    }, [onSelectCategory]);

    const handleShowAllCategories = () => {
        setShowAllCategories(true);
    };

    const handleCloseModal = () => {
        setShowAllCategories(false);
    };

    const handleCategoryClick = (categoryId, categoryName) => {
        onSelectCategory(categoryId, categoryName);
        console.log(categoryId, categoryName);
        handleCloseModal();
    };

    return (
        <>
            <div className="categories bg-light">
                <h2 style={{ fontFamily: 'Playwrite Deutschland Grundschrift', fontSize: '35px' }}>Explore Events by Categories</h2>
                <div className="event-categories">
                    {categories.slice(0, 5).map(category => (
                        <div key={category.categoryId} className="category-item" onClick={() => handleCategoryClick(category.categoryId, category.categoryName)}>
                            <Card className="category-card">
                                <Card.Img variant="top" src={category.imagePath} />
                            </Card>
                            <h5 style={{ fontFamily: 'Playwrite Deutschland Grundschrift' }}>{category.categoryName}</h5>
                        </div>
                    ))}
                    <div className="category-item" onClick={handleShowAllCategories}>
                        <Card className="category-card">
                            <Card.Img variant="top" src={allCategories} />
                        </Card>
                        <h5 style={{ fontFamily: 'Playwrite Deutschland Grundschrift' }}>All Categories</h5>
                    </div>
                </div>

                <Modal show={showAllCategories} onHide={handleCloseModal} size="lg" centered>
                    <Modal.Header closeButton>
                        <Modal.Title>All Categories</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="all-categories-modal">
                        <div className="all-categories">
                            {categories.map(category => (
                                <div key={category.categoryId} className="category-item" onClick={() => handleCategoryClick(category.categoryId, category.categoryName)}>
                                    <Card className="category-card">
                                        <Card.Img variant="top" src={category.imagePath} />
                                    </Card>
                                    <h5 style={{ fontFamily: 'Playwrite Deutschland Grundschrift' }}>{category.categoryName}</h5>
                                </div>
                            ))}
                        </div>
                    </Modal.Body>
                </Modal>
            </div>
        </>
    );
};

export default EventCategories;
