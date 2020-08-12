// import React, { Component, useState, useEffect } from "react";
import React from "react";
import Button from "react-bootstrap/Button";

const MemberItem = (props) => {

	return (
		<div className="py-2 d-flex flex-row justify-content-between">
			<div>
				<p className="mb-0 font-weight-bold">{props.user.name}</p>
				<p className="mb-0">{props.user.username}</p>
			</div>
			<Button variant={props.button_variant} className="my-2" onClick={() => props.button_handler(props.user)}>
				{props.button_name}
			</Button>
		</div>
	);
}

export default MemberItem;
