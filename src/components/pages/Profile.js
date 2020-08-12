import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { Auth } from 'aws-amplify';

function Profile() {
    const [projectData, setProjectData] = useState([]);
    const [searchData, setSearchData] = useState([]);
    const [subData, setSub] = useState([]);
    const [newProjectData, setNewProjectData] = useState({
        name: '',
        description: '',
        search: 'none',
    });

    useEffect(() => {
        if (subData.sub !== undefined) {
            const header = {
                'Content-Type': 'application/json',
                'x-api-key': process.env.REACT_APP_API_KEY,
            };
            axios
                .get(
                    process.env.REACT_APP_AWS_URL_DEV +
                        '/projects?user=' +
                        String(subData.sub),
                    { headers: header }
                )
                .then((response) => {
                    setProjectData(response.data.body);
                })
                .catch(function (error) {
                    console.log(error);
                });
        }
    }, [subData.sub]);

    useEffect(() => {
        if (subData.sub !== undefined) {
            const header = {
                'Content-Type': 'application/json',
                'x-api-key': process.env.REACT_APP_API_KEY,
            };
            axios
                .get(
                    process.env.REACT_APP_AWS_URL_DEV +
                        '/searches?user=' +
                        String(subData.sub),
                    { headers: header }
                )
                .then((response) => {
                    setSearchData(response.data.body);
                })
                .catch(function (error) {
                    console.log(error);
                });
        }
    }, [subData.sub]);

    useEffect(() => {
        Auth.currentAuthenticatedUser()
            .then((user) => {
                setSub(user.attributes);
            })
            .catch((ex) => {
                console.log(ex);
            });
    }, []);

    const postNewProject = (event) => {
        event.preventDefault();

        const header = {
            'Content-Type': 'application/json',
            'x-api-key': process.env.REACT_APP_API_KEY,
        };

        let data = { ...newProjectData };

        if (data.search === 'none' || data.search === '') {
            delete data['search'];
        }

        if (newProjectData.name && subData.sub) {
            axios
                .post(
                    process.env.REACT_APP_AWS_URL_DEV +
                        '/projects?user=' +
                        subData.sub,
                    data,
                    { headers: header }
                )
                .then((response) => {
                    setNewProjectData({
                        name: '',
                        description: '',
                        search: 'none',
                    });
                    setProjectData([...projectData, response.data.body]);
                })
                .catch(function (error) {
                    console.log(error);
                });
        }
    };

    const handleProjectFormChange = (event) => {
        const target = event.target;

        setNewProjectData({ ...newProjectData, [target.name]: target.value });
    };

    return (
        <div>
            <div className="container">
                <h1 className="mt-4">{subData['name']}</h1>
                <h5 className="mt-2">{subData['email']}</h5>
            </div>
            <div className="container">
                <div className="row">
                    <div className="list-group col-sm-6 mt-4 left">
                        <h4>Projectlist</h4>
                        <div className="pre-scrollable">
                            {projectData.map((i) => {
                                return (
                                    <Link
                                        to={{
                                            pathname:
                                                '/projects/' + i['_id']['$oid'],
                                        }}
                                        key={i['_id']['$oid']}>
                                        <button
                                            type="button"
                                            className="list-group-item list-group-item-action">
                                            <h5>{i['name']}</h5>
                                            <p>{i['description']}</p>
                                        </button>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                    <div className="list-group col-sm-6 mt-4 right">
                        <h4>Past Searches</h4>
                        <div className="pre-scrollable">
                            {searchData.map((i) => {
                                return (
                                    <Link
                                        to={{
                                            pathname:
                                                '/advanced/' + i['_id']['$oid'],
                                        }}
                                        key={i['_id']['$oid']}>
                                        <button
                                            type="button"
                                            className="list-group-item list-group-item-action">
                                            <h5>{i['name']}</h5>
                                            <p>{i['date']}</p>
                                        </button>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
            <div className="container">
                <hr className="my-5"></hr>
                <h4 className="mt-4">Create New Project</h4>
                <form>
                    <div className="form-group">
                        <label htmlFor="projectName">Name</label>
                        <input
                            type="text"
                            className="form-control"
                            id="projectName"
                            name="name"
                            placeholder="Enter name"
                            value={newProjectData.name}
                            onChange={handleProjectFormChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="projectName">Description</label>
                        <input
                            type="text"
                            className="form-control"
                            id="projectDesc"
                            placeholder="Enter description"
                            name="description"
                            value={newProjectData.description}
                            onChange={handleProjectFormChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="projectSearchID">Search</label>
                        <select
                            className="custom-select"
                            id="projectSearchID"
                            name="search"
                            value={newProjectData.search}
                            onChange={handleProjectFormChange}>
                            <option searchid="" value="none">
                                Create Project Without Search ID
                            </option>
                            {searchData.map((i) => {
                                return (
                                    <option
                                        key={i['_id']['$oid']}
                                        searchid={i['_id']['$oid']}
                                        value={i['_id']['$oid']}>
                                        {i['name']}
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="btn btn-outline-dark"
                        onClick={postNewProject}>
                        Create
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Profile;
