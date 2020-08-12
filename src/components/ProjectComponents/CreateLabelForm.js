// import React, { Component, useState, useEffect } from 'react';
import React, { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import { SliderPicker } from 'react-color';

const CreateLabelForm = (props) => {
    const [color, setColor] = useState('#3c862d');
    const [name, setName] = useState('');

    const handleColorChange = (color) => {
        setColor(color.hex);
    };

    const handleNameChange = (event) => {
        setName(event.target.value);
    };

    const handleSubmitClick = (event) => {
        event.preventDefault();

        props.submitHandler(color, name);
    };

    return (
        <Form>
            <Form.Row className="px-1">
                <Form.Group style={{ width: '100%' }}>
                    <Form.Label>Color</Form.Label>
                    <SliderPicker
                        color={color}
                        onChange={handleColorChange}></SliderPicker>
                </Form.Group>
            </Form.Row>
            <Form.Row>
                <Form.Group as={Col} xs="9">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Label name"
                        maxLength="100"
                        value={name}
                        onChange={handleNameChange}
                        required></Form.Control>
                </Form.Group>
                <Form.Group as={Col} xs="3" className="d-flex align-items-end">
                    <Button
                        type="submit"
                        style={{
                            width: '100%',
                            backgroundColor: color,
                            borderColor: color,
                        }}
                        onClick={handleSubmitClick}>
                        Save
                    </Button>
                </Form.Group>
            </Form.Row>
        </Form>
    );
};

export default CreateLabelForm;
