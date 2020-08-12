import React, { useState, useEffect } from 'react';
import ProjectDescription from '../ProjectComponents/ProjectDescription';
import ProjectTitle from '../ProjectComponents/ProjectTitle';
import ProjectMembers from '../ProjectComponents/ProjectMembers';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';
import Modal from 'react-bootstrap/Modal';
import Badge from 'react-bootstrap/Badge';
import Pagination from 'react-bootstrap/Pagination';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
// import Form from 'react-bootstrap/Form';
import axios from 'axios';
import '../ProjectComponents/style.css';
import { Auth } from 'aws-amplify';
import SingleProjectResult from '../ProjectComponents/SingleProjectResult';
import ProjectLabelModalContent from '../ProjectComponents/ProjectLabelModalContent';
import EditProjectMeta from '../ProjectComponents/EditProjectMeta';
import FilterBar from '../ProjectComponents/FilterBar';

const Project = (props) => {
    const [project, setProject] = useState({
        name: '',
        description: '',
        collabs: [],
        comments: [],
        labels: [],
        _id: { $oid: '' },
    });
    const [results, setResults] = useState([]);
    const [showMembers, setShowMembers] = useState(false);
    const [showLabels, setShowLabels] = useState({
        show: false,
        loadingRemove: false,
        loadingCreate: false,
    });
    const [user, setUser] = useState('');

    const [metaEditor, setMetaEditor] = useState({
        show: false,
        name: '',
        description: '',
    });

    const [deleteResultModal, setDeleteResultModal] = useState({
        show: false,
        result_id: '',
        result_index: 200,
    });

    const [pagination, setPagination] = useState({
        active: 0,
        size: 10,
    });

    const [loadingResults, setLoadingResults] = useState({
        loading: false,
        filter: '',
    });

    // set usersub on startup
    useEffect(() => {
        Auth.currentAuthenticatedUser()
            .then((user) => {
                console.log('Set Usersub' + user);
                setUser(user.attributes.sub);
            })
            .catch((ex) => {
                console.log(ex);
                console.log('Error setting Usersub');
            });

        setLoadingResults({
            ...loadingResults,
            loading: true,
        });
    }, []);

    // get projects and set project state
    useEffect(() => {
        if (user !== '' && typeof user !== 'undefined') {
            console.log('Start getting and setting Project State');
            let project_id = props.match.params.project_id;
            let headers = {
                'Content-Type': 'application/json',
                'x-api-key': process.env.REACT_APP_API_KEY,
            };

            axios
                .get(
                    process.env.REACT_APP_AWS_URL_DEV +
                        '/projects/' +
                        project_id +
                        '?user=' +
                        user,
                    { headers }
                )
                .then((res) => {
                    console.log('Project Request Success set Project State');
                    setProject(res.data.body);
                });
        }
    }, [user, props.match.params.project_id]);

    // get and set Project Results State
    useEffect(() => {
        if (
            user !== '' &&
            typeof user !== 'undefined' &&
            loadingResults.loading
        ) {
            console.log('Start getting and setting Project Results State');
            let project_id = props.match.params.project_id;
            let headers = {
                'Content-Type': 'application/json',
                'x-api-key': process.env.REACT_APP_API_KEY,
            };

            let query = 'user=' + user;

            if (loadingResults.filter) {
                query = query + '&filter=' + loadingResults.filter;
            }

            console.log(query);

            axios
                .get(
                    process.env.REACT_APP_AWS_URL_DEV +
                        '/projects/' +
                        project_id +
                        '/results?' +
                        query,
                    { headers }
                )
                .then((res) => {
                    setLoadingResults({
                        ...loadingResults,
                        loading: false,
                    });
                    console.log(res.data.body);
                    setResults(res.data.body);
                });
        }
    }, [user, props.match.params.project_id, loadingResults]);

    const handleApplyFilter = (filterItems) => {
        let filterQuery = filterItems.map((el) => el['_id']['$oid']).join('+');

        console.log(filterQuery);

        setLoadingResults({
            filter: filterQuery,
            loading: true,
        });
    };

    const handleShowMetaEditor = () => {
        if (project.name) {
            setMetaEditor({
                name: project.name,
                description: project.description,
                show: true,
            });
        }
    };

    const handleCancelMetaEditor = () => {
        if (metaEditor.show) {
            setMetaEditor({
                name: project.name,
                description: project.description,
                show: false,
            });
        }
    };

    const handleSaveMetaEditor = () => {
        let project_id = props.match.params.project_id;

        let headers = {
            'Content-Type': 'application/json',
            'x-api-key': process.env.REACT_APP_API_KEY,
        };

        let meta = {
            name: metaEditor.name,
            description: metaEditor.description,
        };

        axios
            .put(
                process.env.REACT_APP_AWS_URL_DEV +
                    '/projects/' +
                    project_id +
                    '/meta?user=' +
                    user,
                meta,
                { headers }
            )
            .then((res) => {
                console.log(res);
                if (res.data.statusCode === 200) {
                    setMetaEditor({
                        ...metaEditor,
                        show: false,
                    });

                    setProject({
                        ...project,
                        name: res.data.body.name,
                        description: res.data.body.description,
                    });
                }
            });
    };

    const handleCloseMembers = () => {
        setShowMembers(false);
    };

    const handleShowMembers = () => {
        setShowMembers(true);
    };

    const handleCloseLabels = () => {
        setShowLabels({
            show: false,
            loadingRemove: false,
            loadingCreate: false,
        });
    };

    const handleShowLabels = () => {
        setShowLabels({
            show: true,
            loadingRemove: false,
            loadingCreate: false,
        });
    };

    const handleMetaChange = (event) => {
        console.log(event.target);

        setMetaEditor({
            ...metaEditor,
            [event.target.name]: event.target.value,
        });
    };

    const handleAddLabel = (label, result_index) => {
        console.log(label, result_index);

        let project_id = props.match.params.project_id;
        let result_id = results[result_index]['result']['_id']['$oid'];
        let label_id = label['_id']['$oid'];

        let headers = {
            'Content-Type': 'application/json',
            'x-api-key': process.env.REACT_APP_API_KEY,
        };

        axios
            .post(
                process.env.REACT_APP_AWS_URL_DEV +
                    '/projects/' +
                    project_id +
                    '/results/' +
                    result_id +
                    '/labels?user=' +
                    user,
                { 'label-id': label_id },
                { headers }
            )
            .then((res) => {
                console.log(res);

                let newresults = [...results];
                newresults[result_index] = res.data.body;

                // console.log(newresults == results);
                console.log(newresults === results);

                console.log(newresults);

                setResults(newresults);
            });
    };

    const handleCreateLabel = (color, name) => {
        console.log(color, name);

        let project_id = props.match.params.project_id;

        let headers = {
            'Content-Type': 'application/json',
            'x-api-key': process.env.REACT_APP_API_KEY,
        };

        let label = {
            color,
            name,
        };

        axios
            .post(
                process.env.REACT_APP_AWS_URL_DEV +
                    '/projects/' +
                    project_id +
                    '/labels?user=' +
                    user,
                label,
                { headers }
            )
            .then((res) => {
                console.log(res);
                if (res.data.statusCode === 200) {
                    let newLabels = project.labels.concat([res.data.body]);
                    setProject({
                        ...project,
                        labels: newLabels,
                    });
                }
            });
    };

    const handleRemoveLabel = (label_id) => {
        let project_id = props.match.params.project_id;

        let headers = {
            'Content-Type': 'application/json',
            'x-api-key': process.env.REACT_APP_API_KEY,
        };

        let url =
            process.env.REACT_APP_AWS_URL_DEV +
            '/projects/' +
            project_id +
            '/labels?user=' +
            user +
            '&dellabel=' +
            label_id;

        axios({
            method: 'delete',
            url,
            headers,
        }).then((res) => {
            console.log(res);
            if (res.data.statusCode === 200) {
                //setShowLabels({ ...showLabels, edited: true });

                setProject({ ...project, labels: res.data.body });

                let newresults = [...results];

                newresults = newresults.map((e) => {
                    return {
                        ...e,
                        labels: e.labels.filter(
                            (label) => label['_id']['$oid'] !== label_id
                        ),
                    };
                });

                setResults(newresults);
            }
        });
    };

    const handleRemoveResultLabel = (label, result_index) => {
        console.log(label, result_index);

        let project_id = props.match.params.project_id;
        let result_id = results[result_index]['result']['_id']['$oid'];
        let label_id = label['_id']['$oid'];

        let headers = {
            'Content-Type': 'application/json',
            'x-api-key': process.env.REACT_APP_API_KEY,
        };

        axios
            .delete(
                process.env.REACT_APP_AWS_URL_DEV +
                    '/projects/' +
                    project_id +
                    '/results/' +
                    result_id +
                    '/labels?user=' +
                    user +
                    '&dellabel=' +
                    label_id,
                { headers }
            )
            .then((res) => {
                console.log(res);

                let newresults = [...results];
                newresults[result_index] = res.data.body;

                // console.log(newresults == results);
                console.log(newresults === results);

                console.log(newresults);

                setResults(newresults);
            });
    };

    const handleAddCollab = (newuser) => {
        let project_id = props.match.params.project_id;
        let user_id = { 'user-id': newuser['sub'] };

        let headers = {
            'Content-Type': 'application/json',
            'x-api-key': process.env.REACT_APP_API_KEY,
        };

        axios
            .post(
                process.env.REACT_APP_AWS_URL_DEV +
                    '/projects/' +
                    project_id +
                    '/collabs?user=' +
                    user,
                user_id,
                { headers }
            )
            .then((res) => {
                console.log(res);
                if (res.data.statusCode == 200) {
                    console.log('Here');
                    setProject({ ...project, collabs: res.data.body });
                }
            });
    };

    const handleRemoveCollab = (newuser) => {
        let project_id = props.match.params.project_id;
        let user_id = newuser['sub'];

        let headers = {
            'Content-Type': 'application/json',
            'x-api-key': process.env.REACT_APP_API_KEY,
        };

        axios
            .delete(
                process.env.REACT_APP_AWS_URL_DEV +
                    '/projects/' +
                    project_id +
                    '/collabs?user=' +
                    user +
                    '&deluser=' +
                    user_id,
                { headers }
            )
            .then((res) => {
                if (res.data.statusCode === 200) {
                    setProject({ ...project, collabs: res.data.body });
                }
            });
    };

    const handleShowDeleteResultModal = (result_id, result_index) => {
        if (!deleteResultModal.show) {
            setDeleteResultModal({ show: true, result_id, result_index });
        }
    };

    const handleCancelDeleteResultModal = () => {
        if (deleteResultModal.show) {
            setDeleteResultModal({
                show: false,
                result_id: '',
                result_index: '',
            });
        }
    };

    const handleRemoveResult = (result_id, result_index) => {
        console.log(result_id, result_index);

        let project_id = props.match.params.project_id;

        let headers = {
            'Content-Type': 'application/json',
            'x-api-key': process.env.REACT_APP_API_KEY,
        };

        axios
            .delete(
                process.env.REACT_APP_AWS_URL_DEV +
                    '/projects/' +
                    project_id +
                    '/results/' +
                    result_id +
                    '?user=' +
                    user,
                { headers }
            )
            .then((res) => {
                if (res.data.statusCode === 200) {
                    let newresults = [...results];
                    newresults.splice(result_index, 1);

                    setResults(newresults);
                    setDeleteResultModal({
                        show: false,
                        result_id: '',
                        result_index: '',
                    });
                }
            });
    };

    const handlePageChange = (nr) => {
        setPagination({
            ...pagination,
            active: nr,
        });
    };

    return (
        <Container fluid="xl">
            <Row className="py-4">
                <Col
                    xs={{ span: 11, offset: 0 }}
                    className="d-flex justify-content-center flex-column align-items-start">
                    <ProjectTitle ProjectTitle={project.name}></ProjectTitle>
                    <ProjectDescription ProjectSummary={project.description} />
                </Col>
                <Col xs={{ span: 1, offset: 0 }} className="pt-3">
                    <Dropdown className="menu-button float-right">
                        <Dropdown.Toggle
                            variant="outline-dark"
                            id="dropdown-basic">
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
                                className="feather feather-menu">
                                <line x1="3" y1="12" x2="21" y2="12"></line>
                                <line x1="3" y1="6" x2="21" y2="6"></line>
                                <line x1="3" y1="18" x2="21" y2="18"></line>
                            </svg>
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                            <Dropdown.Item onClick={handleShowMetaEditor}>
                                Change Name & Description
                            </Dropdown.Item>
                            <Dropdown.Item onClick={handleShowMembers}>
                                Manage Members
                            </Dropdown.Item>
                            <Dropdown.Item
                                onClick={() =>
                                    handleShowLabels('project', project.labels)
                                }>
                                Manage Labels
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </Col>
            </Row>
            <hr></hr>
            <Row className="mb-4">
                <FilterBar
                    applyFilter={handleApplyFilter}
                    filterItems={project.labels}></FilterBar>
            </Row>
            <Row>
                <Col xs="12">
                    <div
                        className={
                            'm-4 ' +
                            (loadingResults.loading
                                ? 'd-flex justify-content-center'
                                : 'd-none')
                        }>
                        <Spinner animation="border" role="status"></Spinner>
                    </div>
                    {loadingResults.loading ? (
                        ''
                    ) : results.length > 0 ? (
                        results
                            .slice(
                                pagination.active * pagination.size,
                                (pagination.active + 1) * pagination.size
                            )
                            .map((result, index) => (
                                <SingleProjectResult
                                    result={result.result}
                                    labels={result.labels}
                                    comments={result.comments}
                                    projectLabels={project.labels}
                                    index={
                                        index +
                                        pagination.size * pagination.active
                                    }
                                    labelHandler={handleShowLabels}
                                    handleAddLabel={handleAddLabel}
                                    handleRemoveResult={
                                        handleShowDeleteResultModal
                                    }
                                    handleRemoveResultLabel={
                                        handleRemoveResultLabel
                                    }
                                    key={index}
                                    resultID={result.result._id.$oid}
                                    sub={user}
                                    projectID={
                                        project._id.$oid
                                    }></SingleProjectResult>
                            ))
                    ) : (
                        <Alert variant="secondary">
                            No results added to this project yet.
                        </Alert>
                    )}
                </Col>
            </Row>
            <Row className="justify-content-center">
                {loadingResults.loading ? (
                    ''
                ) : (
                    <Pagination>
                        {[
                            ...Array(
                                Math.ceil(results.length / pagination.size)
                            ).keys(),
                        ].map((nr) => (
                            <Pagination.Item
                                key={nr}
                                onClick={() => handlePageChange(nr)}
                                active={pagination.active === nr}>
                                {nr + 1}
                            </Pagination.Item>
                        ))}
                    </Pagination>
                )}
            </Row>
            <Modal show={showMembers} onHide={handleCloseMembers}>
                <Modal.Header closeButton>
                    <Modal.Title>Manage Project Members</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <ProjectMembers
                        user={user}
                        ProjectMems={project.collabs}
                        handleRemove={handleRemoveCollab}
                        handleAdd={handleAddCollab}></ProjectMembers>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseMembers}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
            <Modal show={showLabels.show} onHide={handleCloseLabels}>
                <Modal.Header closeButton>
                    <Modal.Title>Manage Project Labels</Modal.Title>
                </Modal.Header>
                <Modal.Body className="px-4">
                    {showLabels.show ? (
                        <ProjectLabelModalContent
                            labels={project.labels}
                            forbiddenRemoval={loadingResults.filter}
                            handleRemove={handleRemoveLabel}
                            handleCreate={
                                handleCreateLabel
                            }></ProjectLabelModalContent>
                    ) : (
                        ''
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseLabels}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
            <Modal show={metaEditor.show} onHide={handleCancelMetaEditor}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Project Information</Modal.Title>
                </Modal.Header>
                <Modal.Body className="px-4">
                    <EditProjectMeta
                        nameValue={metaEditor.name}
                        descValue={metaEditor.description}
                        handleChange={handleMetaChange}></EditProjectMeta>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="success" onClick={handleSaveMetaEditor}>
                        Save
                    </Button>
                    <Button
                        variant="outline-secondary"
                        onClick={handleCancelMetaEditor}>
                        Cancel
                    </Button>
                </Modal.Footer>
            </Modal>
            <Modal
                show={deleteResultModal.show}
                onHide={handleCancelDeleteResultModal}
                size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Delete Result?</Modal.Title>
                </Modal.Header>
                <Modal.Body className="px-4">
                    {deleteResultModal.show &&
                    results.length > deleteResultModal.result_index ? (
                        <SingleProjectResult
                            result={
                                results[deleteResultModal.result_index].result
                            }
                            labels={
                                results[deleteResultModal.result_index].labels
                            }
                            readOnly={true}></SingleProjectResult>
                    ) : (
                        ''
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="danger"
                        onClick={() =>
                            handleRemoveResult(
                                deleteResultModal.result_id,
                                deleteResultModal.result_index
                            )
                        }>
                        Delete
                    </Button>
                    <Button
                        variant="outline-secondary"
                        onClick={handleCancelDeleteResultModal}>
                        Cancel
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Project;
