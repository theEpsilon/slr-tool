import React, { useState } from 'react';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { Auth } from 'aws-amplify';

const SignUp = (props) => {
    const [userData, setUserData] = useState({
        name: '',
        email: '',
        password: '',
    });

    const userDataChange = (event) => {
        const target = event.target;
        const name = target.name;
        let value = target.value;
        setUserData({ ...userData, [name]: value });
    };

    const signUpUser = (event) => {
        event.preventDefault();

        signUp();
    };

    const signUp = async () => {
        try {
            const user = await Auth.signUp({
                username: userData.email,
                password: userData.password,
                attributes: {
                    email: userData.email,
                    name: userData.name,
                },
            });
            console.log({ user });
            window.location.href = '/';
        } catch (error) {
            console.log('error signing up:', error);
        }
    };

    return (
        <Container className="mt-5">
            <Row>
                <Col xs="12">
                    <Card>
                        <Card.Body>
                            <Card.Title>Sign Up</Card.Title>
                            <Form>
                                <Form.Group>
                                    <Form.Label>Name</Form.Label>
                                    <Form.Control
                                        name="name"
                                        value={userData.name}
                                        onChange={userDataChange}
                                        type="text"
                                        placeholder="Enter Name"></Form.Control>
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>E-Mail</Form.Label>
                                    <Form.Control
                                        name="email"
                                        value={userData.email}
                                        onChange={userDataChange}
                                        type="email"
                                        placeholder="Enter E-Mail"></Form.Control>
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control
                                        name="password"
                                        value={userData.password}
                                        onChange={userDataChange}
                                        type="password"
                                        placeholder="Enter Password"></Form.Control>
                                </Form.Group>
                                <Col xs="12" className="text-right">
                                    <button
                                        className="btn btn-outline-dark"
                                        type="submit"
                                        onClick={signUpUser}>
                                        Sign Up
                                    </button>
                                </Col>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default SignUp;
