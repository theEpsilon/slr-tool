import React from "react"
import Container from "react-bootstrap/Container"
import QueryBuilder from "../QueryBuilder"

const QueryBuilderPage = (props) => {
	return (
		<Container fluid="md">
			<QueryBuilder searchData={props.searchData}></QueryBuilder>
		</Container>
	);
}

export default QueryBuilderPage;
