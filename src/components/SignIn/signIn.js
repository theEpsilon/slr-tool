import React, {useState} from "react";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import {Auth} from "aws-amplify";

const SignUp = (props) => {
	const [userData, setUserData] = useState({
		email: "",
		password: ""
	});

	const userDataChange = (event) => {
		const target = event.target;
		const name = target.name;
		let value = target.value;

		setUserData({...userData, [name]: value});
	}

	const signInUser = (event) => {
		event.preventDefault();
		signIn();
	}

	const signIn = async () => {
		try {
			const user = await Auth.signIn(userData.email, userData.password)
			console.log({ user });
			window.location.href = '/';
		} catch (error) {
			console.log('error signing in:', error);
		}
	}

	return (
		<Container className="mt-5">
			<Row>
				<Col md="12">
					<Card>
						<Card.Body>
							<Card.Title>Login</Card.Title>
							<Form>
								<Form.Group>
									<Form.Label>E-Mail</Form.Label>
									<Form.Control name="email" value={userData.email} onChange={userDataChange} type="email" placeholder="Enter E-Mail"></Form.Control>
								</Form.Group>
								<Form.Group>
									<Form.Label>Password</Form.Label>
									<Form.Control name="password" value={userData.password} onChange={userDataChange}  type="password" placeholder="Enter Password"></Form.Control>
								</Form.Group>
								<Col xs="12" className="text-right">
									<a className="mr-3" href="/regist">
											No Account? Click here
									</a>
									<button className="btn btn-outline-dark" type="submit" onClick={signInUser}>
										Login
									</button>
								</Col>
							</Form>
						</Card.Body>
					</Card>
				</Col>
			</Row>
		</Container>
	 );
}

export default SignUp;
