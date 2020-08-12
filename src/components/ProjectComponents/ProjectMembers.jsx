import React, { Component } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
// import Container from "react-bootstrap/Container";
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import Spinner from 'react-bootstrap/Spinner';
import MemberItem from '../ProjectComponents/member_item';
import axios from 'axios';

class ProjectMembers extends Component {
    state = {
        Number: 1,
        AddMember: '',
        foundUsers: [],
        loading: false,
    };

    render() {
        return (
            <React.Fragment>
                <Row>
                    <Col className="px-4">
                        <h5 className="mb-3">Add Members</h5>
                        <InputGroup className="mb-3">
                            <FormControl
                                placeholder="Search by Username"
                                aria-label="Recipient's username"
                                aria-describedby="basic-addon2"
                                onChange={this.handleSave}
                            />
                            <InputGroup.Append>
                                <Button
                                    variant="outline-secondary"
                                    onClick={this.findUsers}>
                                    Find User
                                </Button>
                            </InputGroup.Append>
                        </InputGroup>
                        <div
                            className={
                                'justify-content-center' +
                                (this.state.loading ? ' d-flex' : ' d-none')
                            }>
                            <Spinner animation="border" role="status">
                                <span className="sr-only">Loading...</span>
                            </Spinner>
                        </div>
                        <div>
                            {this.state.foundUsers.map((user) => (
                                <MemberItem
                                    user={user}
                                    button_name="Add"
                                    button_handler={this.props.handleAdd}
                                    button_variant="outline-success"></MemberItem>
                            ))}
                        </div>
                    </Col>
                </Row>
                <hr></hr>
                <Row>
                    <Col className="px-4">
                        <h5 className="mb-2">Members in Project</h5>
                        {this.props.ProjectMems.map(
                            (member, index) => (
                                <MemberItem
                                    user={member}
                                    button_name="Remove"
                                    button_handler={this.props.handleRemove}
                                    button_variant="outline-danger"></MemberItem>
                            ) //TODO Goes in an infinite loop?
                        )}
                    </Col>
                </Row>
            </React.Fragment>
        );
    }

    findUsers = (input) => {
        console.log(input);
        this.setState({ loading: true }, () => {
            let headers = {
                'Content-Type': 'application/json',
                'x-api-key': process.env.REACT_APP_API_KEY,
            };

            axios
                .get(
                    process.env.REACT_APP_AWS_URL_DEV +
                        '/find_user?user=' +
                        this.props.user +
                        '&username=' +
                        this.state.AddMember,
                    { headers }
                )
                .then((res) => {
                    console.log(res);
                    if (res.data.statusCode == 200) {
                        this.setState({
                            loading: false,
                            foundUsers: res.data.body,
                        });
                    } else {
                        this.setState({ ...this.state, loading: false });
                    }
                });
        });
    };

    handleSave = (event) => {
        const username = event.target.value;
        this.setState({ AddMember: username });
    };

    membersList(name, profile_link) {
        return (
            <tr>
                <td>
                    <a href={profile_link}>{name}</a>
                </td>
                <td>
                    <button
                        className="btn btn-danger"
                        onClick={() => this.removeMember(name)}>
                        Remove
                    </button>
                </td>
            </tr>
        );
    }
    removeMember = (name) => {
        this.setState({
            ProjectMems: this.state.ProjectMems.filter(function (i) {
                return i !== name;
            }),
        });
        //TODO
    };
    getNumber = () => {
        const numb = this.state.Number;
        this.setState({ Number: numb + 1 });
        return numb;
    };
}

export default ProjectMembers;
