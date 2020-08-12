import React from 'react';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';

const EditProjectMeta = (props) => {
    return (
        <Container>
            <Row>
                <h5>Project Name</h5>
                <Form.Control
                    type="text"
                    value={props.nameValue}
                    name="name"
                    onChange={props.handleChange}></Form.Control>
                <hr></hr>
            </Row>
            <Row>
                <h5>Project Description</h5>
                <Form.Control
                    as="textarea"
                    style={{ width: '100%' }}
                    cols="5"
                    value={props.descValue}
                    name="description"
                    onChange={props.handleChange}></Form.Control>
            </Row>
        </Container>
    );
};

export default EditProjectMeta;
