import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import axios from 'axios';
import Results from './pages/Results';
import ReactPaginate from 'react-paginate';
import { Auth } from 'aws-amplify';
import Spinner from 'react-bootstrap/Spinner';
import Container from 'react-bootstrap/Container';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';

export class SearchComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            results: [],
            pages: 0,
            totalResults: 0,
            totalResultsSpringer: 0,
            totalResultsElsevier: 0,
            totalResultsIeee: 0,
            queryJson: {},
            loggedIn: 0,
            loading: true,
            loadingSearch: false,
        };
    }

    state = {
        query: '',
        results: [],
    };

    onSubmit = (e) => {
        e.preventDefault();
        this.setState({ loadingSearch: true });
        this.search(this.state.query);
        this.setState({ query: '' });
    };

    onChange = (e) => this.setState({ [e.target.name]: e.target.value });

    search = () => {
        const words = this.state.query.split(' ');
        const rules = words.map((word) => ({
            field: 'article_title',
            type: 'string',
            operator: 'contains',
            value: word,
        }));

        this.setState({
            queryJson: rules,
        });

        const params = {
            event: {
                query: {
                    condition: 'AND',
                    rules: rules,
                    valid: true,
                },
                page: 1,
                databases: [
                    {
                        name: 'springer',
                    },
                    {
                        name: 'elsevier',
                    },
                    {
                        name: 'ieee',
                    },
                ],
            },
        };

        console.log(params);

        const config = {
            'Content-Type': 'application/json',
            'x-api-key': process.env.REACT_APP_API_KEY,
        };

        axios
            .post(
                process.env.REACT_APP_AWS_URL_DUSTIN + '/temp_search',
                params,
                { headers: config }
            )
            .then((res) => {
                //console.log(res.data.body);
                console.log(res);
                var myresults = res.data.body.records;
                var highest = res.data.body.springer_total;
                if (highest < res.data.body.elsevier_total) {
                    highest = res.data.body.elsevier_total;
                }
                if (highest < res.data.body.ieee_total) {
                    highest = res.data.body.ieee_total;
                }
                console.log(res.data.body.records);

                if (highest % 20 !== 0) {
                    //setPages(Math.floor(highest/20) + 1);
                    this.setState({
                        pages: Math.floor(highest / 20) + 1,
                    });
                } else {
                    //setPages(Math.floor(highest/20));
                    this.setState({
                        pages: Math.floor(highest / 20),
                    });
                }
                this.setState({
                    totalResults: res.data.body.total,
                    totalResultsSpringer: res.data.body.springer_total,
                    totalResultsElsevier: res.data.body.elsevier_total,
                    totalResultsIeee: res.data.body.ieee_total,
                    results: myresults,
                    loadingSearch: false,
                });
            })
            .catch((err) => {
                console.log(err);
            });
    };

    getResults = (queryId) => {
        let params = {
            id: queryId,
        };

        const config = {
            'x-api-key': process.env.REACT_APP_API_KEY,
        };

        return axios
            .get(process.env.REACT_APP_AWS_URL_DEV + '/search', {
                params: params,
                headers: config,
            })
            .then((res) => {
                console.log(res.data);
                return res.data;
                //this.setState({ results: res.data.body.records })
            })
            .catch((error) => console.log(error));
    };

    pollResults = (cond, id, timeout) => {
        var checkCondition = async function (resolve, reject) {
            var responsedata = await cond(id);

            console.log(responsedata);

            if (responsedata.statusCode === 200) {
                resolve(responsedata);
            } else if (responsedata.statusCode === 204) {
                setTimeout(
                    checkCondition,
                    responsedata.body.timeUntilNextRequest,
                    resolve,
                    reject
                );
            } else {
                reject(new Error('Reponse data did not match expectation'));
            }
        };

        return new Promise(checkCondition);
    };

    handlePageClick = (data) => {
        const params = {
            event: {
                query: {
                    condition: 'AND',
                    rules: this.state.queryJson,
                    valid: true,
                },
                page: data.selected + 1,
                databases: [
                    {
                        name: 'springer',
                    },
                ],
            },
        };

        console.log(params);
        const config = {
            'Content-Type': 'application/json',
            'x-api-key': process.env.REACT_APP_API_KEY,
        };

        axios
            .post(
                process.env.REACT_APP_AWS_URL_DUSTIN + '/temp_search',
                params,
                { headers: config }
            )
            .then((res) => {
                var myresults = res.data.body.records;
                this.setState({
                    results: myresults,
                });
            })
            .catch((err) => {
                console.log(err);
            });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    checkUser = () => {
        Auth.currentAuthenticatedUser()
            .then((user) => console.log({ user }))
            .catch((err) => console.log(err));
    };

    render() {
        return (
            <React.Fragment>
                <Container>
                    <div className="text-center">
                        <h1 className="my-5">Quick Search</h1>
                        <form onSubmit={this.onSubmit} className="mt-4">
                            <div className="col-xs-5">
                                <InputGroup className="mb-3">
                                    <FormControl
                                        placeholder="Search Query..."
                                        aria-label="Search"
                                        aria-describedby="basic-addon2"
                                        type="text"
                                        name="query"
                                        value={this.state.query}
                                        onChange={this.onChange}
                                    />
                                    <InputGroup.Append>
                                        <Button
                                            variant="outline-dark"
                                            type="submit"
                                            disabled={this.state.loadingSearch}>
                                            Go
                                        </Button>
                                    </InputGroup.Append>
                                </InputGroup>
                                <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                    className={
                                        'justify-content-center ml-2' +
                                        (this.state.loadingSearch
                                            ? ' '
                                            : ' d-none')
                                    }
                                />
                                <div className="mt-2">
                                    <a href="/advanced">
                                        <Button variant="secondary">
                                            Advanced Search
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="24"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className="feather feather-arrow-right ml-2">
                                                <line
                                                    x1="5"
                                                    y1="12"
                                                    x2="19"
                                                    y2="12"></line>
                                                <polyline points="12 5 19 12 12 19"></polyline>
                                            </svg>
                                        </Button>
                                    </a>
                                </div>
                            </div>
                        </form>
                        {this.state.results && this.state.results.length > 0 ? (
                            <React.Fragment>
                                <hr />
                                <h3 className="col-12 text-right">
                                    Total Results: {this.state.totalResults}
                                </h3>
                                <h3 className="col-12 text-right">
                                    Total Results Springer:{' '}
                                    {this.state.totalResultsSpringer}
                                </h3>
                                <h3 className="col-12 text-right">
                                    Total Results Elsevier:{' '}
                                    {this.state.totalResultsElsevier}
                                </h3>
                                <h3 className="col-12 text-right">
                                    Total Results IEEE:{' '}
                                    {this.state.totalResultsIeee}
                                </h3>
                                <hr />
                                <Results results={this.state.results} />
                                <ReactPaginate
                                    previousLabel={'previous'}
                                    nextLabel={'next'}
                                    breakLabel={'...'}
                                    pageCount={this.state.pages}
                                    marginPagesDisplayed={0}
                                    pageRangeDisplayed={3}
                                    breakClassName={'page-item'}
                                    breakLinkClassName={'page-link'}
                                    containerClassName={'mt-3 ml-3 pagination'}
                                    pageClassName={'page-item'}
                                    pageLinkClassName={'page-link'}
                                    previousClassName={'page-item'}
                                    previousLinkClassName={'page-link'}
                                    nextClassName={'page-item'}
                                    nextLinkClassName={'page-link'}
                                    activeClassName={'active'}
                                    onPageChange={this.handlePageClick}
                                />
                            </React.Fragment>
                        ) : null}
                    </div>
                </Container>
            </React.Fragment>
        );
    }
}

export default SearchComponent;
