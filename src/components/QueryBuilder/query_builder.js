import { useEffect } from 'react';
import { useState } from 'react';
import React from 'react';
import $ from 'jquery';
import './index.css';
import 'jQuery-QueryBuilder';
import Button from 'react-bootstrap/Button';
import axios from 'axios';
import Results from '../pages/Results';
import ReactPaginate from 'react-paginate';
import { Auth } from 'aws-amplify';
import Spinner from 'react-bootstrap/Spinner';

const QueryBuilder = (props) => {
    /**
     * Advanced search contents with querybuilder, results and function to search
     * and save the search to the db
     * @return {html} - Content of the advanced search page
     */
    const [results, setResults] = useState([]);
    const [pages, setPages] = useState([]);
    const [totalResults, setTotalResults] = useState(0);
    const [totalResultsSpringer, setTotalResultsSpringer] = useState(0);
    const [totalResultsElsevier, setTotalResultsElsevier] = useState(0);
    const [totalResultsIeee, setTotalResultsIeee] = useState(0);
    const [checkedSpringer, setCheckedSpringer] = useState(true);
    const [checkedElsevier, setCheckedElsevier] = useState(true);
    const [checkedIeee, setCheckedIeee] = useState(true);
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState('');
    const [sub, setSub] = useState('');
    const [searchname, setSearchname] = useState({ value: '' });
    const [searchnameProject, setSearchnameProject] = useState({ value: '' });
    const [showMode, setShowMode] = useState(false);
    const [loadingSearch, setLoadingSearch] = useState(false);
    const [
        loadingSaveSearchToProject,
        setLoadingSaveSearchToProject,
    ] = useState(false);
    const [loadingSaveSearch, setLoadingSaveSearch] = useState(false);
    const [noResults, setNoResults] = useState(false);
    const [SelectedProjectID, setSelectedProjectID] = useState('-1');
    const [loadingSaveAllSearch, setloadingSaveAllSearch] = useState(false);

    useEffect(() => {
        $('#builder').queryBuilder({
            filters: [
                {
                    id: 'article_title',
                    field: 'article_title',
                    label: {
                        en: 'Article title',
                    },
                    operators: ['contains'],
                    type: 'string',
                    size: 30,
                    validation: {
                        allow_empty_value: false,
                    },
                    unique: false,
                },
                {
                    id: 'publication_title',
                    field: 'publication_title',
                    label: {
                        en: 'Publication title',
                    },
                    operators: ['contains'],
                    type: 'string',
                    size: 30,
                    validation: {
                        allow_empty_value: false,
                    },
                    unique: false,
                },
                {
                    id: 'author',
                    field: 'author',
                    label: {
                        en: 'Author',
                    },
                    operators: ['contains'],
                    type: 'string',
                    size: 30,
                    validation: {
                        allow_empty_value: false,
                    },
                    unique: false,
                },
                {
                    id: 'publication_year',
                    field: 'publication_year',
                    label: {
                        en: 'Publication year',
                    },
                    operators: ['equal'],
                    type: 'integer',
                    size: 30,
                    validation: {
                        allow_empty_value: false,
                    },
                    unique: false,
                },
                {
                    id: 'keyword',
                    field: 'keyword',
                    label: {
                        en: 'Keyword',
                    },
                    operators: ['equal'],
                    type: 'string',
                    size: 30,
                    validation: {
                        allow_empty_value: false,
                    },
                    unique: false,
                },
                {
                    id: 'openaccess',
                    field: 'openaccess',
                    label: {
                        en: 'Open access',
                    },
                    operators: ['equal'],
                    type: 'integer',
                    input: 'select',
                    values: {
                        0: 'False',
                        1: 'True',
                    },
                    size: 1,
                    validation: {
                        allow_empty_value: false,
                    },
                    unique: false,
                },
                {
                    id: 'doi',
                    field: 'doi',
                    label: {
                        en: 'DOI',
                    },
                    operators: ['equal'],
                    type: 'string',
                    size: 30,
                    validation: {
                        allow_empty_value: false,
                    },
                    unique: false,
                },
                {
                    id: 'isbn',
                    field: 'isbn',
                    label: {
                        en: 'ISBN',
                    },
                    operators: ['equal'],
                    type: 'string',
                    size: 30,
                    validation: {
                        allow_empty_value: false,
                    },
                    unique: false,
                },
                {
                    id: 'issn',
                    field: 'issn',
                    label: {
                        en: 'ISSN',
                    },
                    operators: ['equal'],
                    type: 'string',
                    size: 30,
                    validation: {
                        allow_empty_value: false,
                    },
                    unique: false,
                },
            ],
        });
    }, []);

    // Show search mode: set the querybuilder's rules and results
    useEffect(() => {
        if (props.searchData.search) {
            //search param
            console.log(props.searchData.search);
            setShowMode(true);

            //Get search
            axios
                .get(
                    process.env.REACT_APP_AWS_URL_DEV +
                        '/searches/' +
                        props.searchData.search,
                    {
                        headers: {
                            'x-api-key': process.env.REACT_APP_API_KEY,
                        },
                    }
                )
                .then((res) => {
                    console.log(res);
                    $('#builder').queryBuilder(
                        'setRules',
                        res.data.body.query.rules
                    );
                    var myresults = res.data.body.results;
                    var highest = res.data.body.springer_total;
                    if (highest < res.data.body.elsevier_total) {
                        highest = res.data.body.elsevier_total;
                    }
                    if (highest < res.data.body.ieee_total) {
                        highest = res.data.body.ieee_total;
                    }
                    console.log(res.data.body.results);
                    setTotalResults(res.data.body.total);
                    setTotalResultsSpringer(res.data.body.springer_total);
                    setTotalResultsElsevier(res.data.body.elsevier_total);
                    setTotalResultsIeee(res.data.body.ieee_total);
                    if (highest % 20 !== 0) {
                        setPages(Math.floor(highest / 20) + 1);
                    } else {
                        setPages(Math.floor(highest / 20));
                    }
                    setResults(myresults);
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    }, [props.searchData.search]);

    // Get the user's data
    useEffect(() => {
        if (sub === '') {
            console.log('Getting the user');
            Auth.currentAuthenticatedUser()
                .then((user) => {
                    setSub(user.username);
                })
                .catch((ex) => {
                    console.log(ex);
                });
        }
    }, [sub]);

    // Get the user's projects
    useEffect(() => {
        if (sub !== '') {
            console.log("Getting the user's projects");
            console.log(sub);
            let params = {
                user: sub,
            };

            const config = {
                'x-api-key': process.env.REACT_APP_API_KEY,
            };

            axios
                .get(process.env.REACT_APP_AWS_URL_DEV + '/projects', {
                    params: params,
                    headers: config,
                })
                .then((res) => {
                    console.log(res.data.body);
                    setProjects(res.data.body);
                })
                .catch((error) => console.log(error));
        }
    }, [sub]);

    /**
     * Handles Click on Search Button
     * @param {event} e - The event belonging to the click
     */
    var handleSend = (e) => {
        e.preventDefault();
        setLoadingSearch(true);
        // console.log($('#builder').queryBuilder('getRules'));
        test_search();
    };

    /**
     * Reads Query, send search Request to backend and set the returned results to
     * show them on the ui
     */
    function test_search() {
        setNoResults(false);
        const config = {
            'Content-Type': 'application/json',
            'x-api-key': process.env.REACT_APP_API_KEY,
        };

        let databases = [];
        checkedSpringer
            ? databases.push({
                  name: 'springer',
              })
            : console.log('Springer not checked');

        checkedElsevier
            ? databases.push({
                  name: 'elsevier',
              })
            : console.log('Elsevier not checked');

        checkedIeee
            ? databases.push({
                  name: 'ieee',
              })
            : console.log('IEEE not checked');

        const params = {
            event: {
                query: $('#builder').queryBuilder('getRules'),
                page: 1,
                databases: databases,
            },
        };

        axios
            .post(
                process.env.REACT_APP_AWS_URL_DUSTIN + '/temp_search',
                params,
                { headers: config }
            )
            .then((res) => {
                //console.log(res.data.body);
                var myresults = res.data.body.records;
                var highest = res.data.body.springer_total;
                if (highest < res.data.body.elsevier_total) {
                    highest = res.data.body.elsevier_total;
                }
                if (highest < res.data.body.ieee_total) {
                    highest = res.data.body.ieee_total;
                }
                setTotalResults(res.data.body.total);
                setTotalResultsSpringer(res.data.body.springer_total);
                setTotalResultsElsevier(res.data.body.elsevier_total);
                setTotalResultsIeee(res.data.body.ieee_total);
                if (highest % 20 !== 0) {
                    setPages(Math.floor(highest / 20) + 1);
                } else {
                    setPages(Math.floor(highest / 20));
                }
                setResults(myresults);
                if (myresults.length === 0) {
                    console.log('keine ergebnisse');
                    setNoResults(true);
                }
                setLoadingSearch(false);
            })
            .catch((err) => {
                console.log(err);
            });
    }

    /**
     * Helper function to get the searchname out of the input
     * @param {event} event - The event which trigers this function
     */
    function searchnameChanged(event) {
        setSearchname({ value: event.target.value });
    }

    function searchnameProjectChanged(event) {
        setSearchnameProject({ value: event.target.value });
    }

    function onChangeProjectSelect(event) {
        let found = false;
        setSelectedProjectID(event.target.value);
        for (var i = 0; i < projects.length; i++) {
            if (projects[i]._id.$oid === event.target.value) {
                setSelectedProject(projects[i].name);
                found = true;
            } else {
                console.log(projects[i]._id.$oide);
            }
        }
        if (!found) {
            setSelectedProject('[Choose a Project from Dropdown]');
        }
    }

    /**
     * Handles clicks in the pagination, so get the results for the page and set them
     * to display on the ui
     * @param {json} data - The data containing infos what was clicked in pagination
     */
    var handlePageClick = (data) => {
        let databases = [];
        checkedSpringer
            ? databases.push({
                  name: 'springer',
              })
            : console.log('Springer not checked');

        checkedElsevier
            ? databases.push({
                  name: 'elsevier',
              })
            : console.log('Elsevier not checked');

        checkedIeee
            ? databases.push({
                  name: 'ieee',
              })
            : console.log('IEEE not checked');

        const params = {
            event: {
                query: $('#builder').queryBuilder('getRules'),
                page: data.selected + 1,
                databases: databases,
            },
        };
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
                setResults(myresults);
            })
            .catch((err) => {
                console.log(err);
            });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    /**
     * Function called by click on save search button.
     * Sends the infos to the search and the query to backend to save it.
     */
    function save_search() {
        setLoadingSaveSearch(true);
        let databases = [];
        checkedSpringer
            ? databases.push({
                  name: 'springer',
              })
            : console.log('Springer not checked');

        checkedElsevier
            ? databases.push({
                  name: 'elsevier',
              })
            : console.log('Elsevier not checked');

        checkedIeee
            ? databases.push({
                  name: 'ieee',
              })
            : console.log('IEEE not checked');

        const config = {
            'Content-Type': 'application/json',
            'x-api-key': process.env.REACT_APP_API_KEY,
        };

        console.log(sub);

        const params = {
            event: {
                sub: sub,
                query: $('#builder').queryBuilder('getRules'),
                page: 0,
                databases: databases,
                name: searchname.value,
            },
        };

        if (totalResults <= 200) {
            console.log('fetch it');
            axios
                .post(
                    process.env.REACT_APP_AWS_URL_DUSTIN + '/temp_search',
                    params,
                    { headers: config }
                )
                .then((res) => {
                    console.log(res);
                    setLoadingSaveSearch(false);
                })
                .catch(function (error) {
                    console.log(error);
                });
        } else {
            console.log('Suche zu groß!!!');
            setLoadingSaveSearch(false);
        }
    }

    function save_search_to_project() {
        setLoadingSaveSearchToProject(true);

        var e = document.getElementById('project');
        var project_id = e.options[e.selectedIndex].value;

        console.log(project_id);

        let databases = [];
        checkedSpringer
            ? databases.push({
                  name: 'springer',
              })
            : console.log('Springer not checked');
        checkedElsevier
            ? databases.push({
                  name: 'elsevier',
              })
            : console.log('Elsevier not checked');
        checkedIeee
            ? databases.push({
                  name: 'ieee',
              })
            : console.log('IEEE not checked');

        const config = {
            'Content-Type': 'application/json',
            'x-api-key': process.env.REACT_APP_API_KEY,
        };

        const params = {
            event: {
                sub: sub,
                query: $('#builder').queryBuilder('getRules'),
                page: 0,
                databases: databases,
                review_id: project_id,
                name: searchnameProject.value,
            },
        };

        console.log(params);
        if (totalResults <= 200) {
            console.log('fetch it');
            axios
                .post(
                    process.env.REACT_APP_AWS_URL_DUSTIN + '/temp_search',
                    params,
                    { headers: config }
                )
                .then((res) => {
                    console.log(res);
                    setLoadingSaveSearchToProject(false);
                });
        } else {
            console.log('Suche zu groß!!!');
            setLoadingSaveSearchToProject(false);
        }
    }

    function onClickAllSearchResToProject() {
        setloadingSaveAllSearch(true);
        const config = {
            'Content-Type': 'application/json',
            'x-api-key': process.env.REACT_APP_API_KEY,
        };

        const params = {
            'search-id': props.searchData.search,
            'add-results': true,
        };
        console.log(props.searchData.search);

        axios
            .post(
                process.env.REACT_APP_AWS_URL_DEV +
                    '/projects/' +
                    SelectedProjectID +
                    '/searches&user=' +
                    sub,
                params,
                { headers: config }
            )
            .then((res) => {
                console.log(res);
                setloadingSaveAllSearch(false);
            });
    }

    return (
        <React.Fragment>
            <h1 className="col-12 mt-4">Advanced Search</h1>
            <form onSubmit={handleSend} className="col-12 mt-4">
                <div id="builder"></div>
                <div className="form-group row ml-3">
                    <div className="form-check form-check-inline">
                        <input
                            type="checkbox"
                            className="form-check-input"
                            id="springerCheck"
                            checked={checkedSpringer}
                            onChange={() =>
                                setCheckedSpringer(!checkedSpringer)
                            }
                        />
                        <label className="form-check-label">Springer</label>
                    </div>
                    <div className="form-check form-check-inline">
                        <input
                            type="checkbox"
                            className="form-check-input"
                            id="elsevierCheck"
                            checked={checkedElsevier}
                            onChange={() =>
                                setCheckedElsevier(!checkedElsevier)
                            }
                        />
                        <label className="form-check-label">
                            Elsevier (Scopus)
                        </label>
                    </div>
                    <div className="form-check form-check-inline">
                        <input
                            type="checkbox"
                            className="form-check-input"
                            id="ieee"
                            checked={checkedIeee}
                            onChange={() => setCheckedIeee(!checkedIeee)}
                        />
                        <label className="form-check-label">IEEE</label>
                    </div>
                </div>
                {!showMode ? (
                    <div className="form-group row ml-3">
                        <button
                            className="btn btn-outline-dark"
                            disabled={loadingSearch}
                            type="submit"
                            value="submit">
                            Search
                            <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                                className={
                                    'justify-content-center ml-2' +
                                    (loadingSearch ? ' ' : ' d-none')
                                }
                            />
                        </button>
                    </div>
                ) : null}
            </form>
            {noResults ? (
                <div className="alert alert-warning">
                    <strong>No Results!</strong> Check your spelling, if no
                    typos there are no Results for your search
                </div>
            ) : null}
            {results && results.length > 0 ? (
                <React.Fragment>
                    <hr />
                    <h3 className="col-12 text-right">
                        Total Results: {totalResults}
                    </h3>
                    <h3 className="col-12 text-right">
                        Total Results Springer: {totalResultsSpringer}
                    </h3>
                    <h3 className="col-12 text-right">
                        Total Results Elsevier: {totalResultsElsevier}
                    </h3>
                    <h3 className="col-12 text-right">
                        Total Results IEEE: {totalResultsIeee}
                    </h3>
                    {!showMode ? (
                        <div className="container mb-3">
                            <h3>Save Search</h3>
                            <div className="input-group mt-3 mb-3">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search-Name"
                                    aria-label="Searchname"
                                    value={searchname.value}
                                    onChange={searchnameChanged}
                                />
                                <div className="input-group-append">
                                    <button
                                        className="btn btn-outline-dark"
                                        disabled={loadingSaveSearch}
                                        onClick={save_search}>
                                        Save Search
                                        <Spinner
                                            as="span"
                                            animation="border"
                                            size="sm"
                                            role="status"
                                            aria-hidden="true"
                                            className={
                                                'justify-content-center ml-2' +
                                                (loadingSaveSearch
                                                    ? ' '
                                                    : ' d-none')
                                            }
                                        />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : null}
                    <div className="container mb-3">
                        {!showMode ? (
                            <h3>Save Search To Project</h3>
                        ) : (
                            <h3>Save Result To Project Results</h3>
                        )}
                        <div className="input-group-prepend mt-3 mb-3">
                            <select
                                className="selectpicker form-control"
                                id="project"
                                onChange={onChangeProjectSelect}>
                                <option
                                    name="-1"
                                    id="project-select"
                                    value="-1">
                                    Choose Project...
                                </option>
                                {projects.map((project) => (
                                    <option
                                        name={project.name}
                                        key={project._id.$oid}
                                        id={project.name}
                                        value={project._id.$oid}>
                                        {project.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {!showMode || SelectedProjectID === '-1' ? null : (
                            <button
                                className="form-control btn-outline-dark"
                                onClick={onClickAllSearchResToProject}>
                                Save all Search Results to Prjoct
                                {loadingSaveAllSearch ? (
                                    <Spinner
                                        as="span"
                                        animation="border"
                                        size="sm"
                                        role="status"
                                        className="ml-2"
                                    />
                                ) : null}
                            </button>
                        )}
                        {!showMode ? (
                            <div className="input-group mt-3 mb-3">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search-Name"
                                    aria-label="SearchnameProject"
                                    value={searchnameProject.value}
                                    onChange={searchnameProjectChanged}
                                />
                                <div className="input-group-append">
                                    <button
                                        className="btn btn-outline-dark"
                                        disabled={loadingSaveSearchToProject}
                                        onClick={save_search_to_project}>
                                        Save To Project
                                        <Spinner
                                            as="span"
                                            animation="border"
                                            size="sm"
                                            role="status"
                                            aria-hidden="true"
                                            className={
                                                'justify-content-center ml-2' +
                                                (loadingSaveSearchToProject
                                                    ? ' '
                                                    : ' d-none')
                                            }
                                        />
                                    </button>
                                </div>
                            </div>
                        ) : null}
                    </div>
                    <Results
                        results={results}
                        showMode={showMode}
                        sub={sub}
                        selectedProject={selectedProject}
                        selectedProjectID={SelectedProjectID}
                    />
                    <ReactPaginate
                        previousLabel={'previous'}
                        nextLabel={'next'}
                        breakLabel={'...'}
                        pageCount={pages}
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
                        onPageChange={handlePageClick}
                    />
                </React.Fragment>
            ) : null}
        </React.Fragment>
    );
};

export default QueryBuilder;
