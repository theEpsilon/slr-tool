import React from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Auth } from 'aws-amplify';

function Navbar() {
    function refreshPage() {
        //window.location.reload(false);
        window.location.href = '/';
    }

    function handleLogout() {
        Auth.signOut();
        window.location.href = '/';
    }

    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(null);

    useEffect(() => {
        try {
            setLoading(true);
            Auth.currentAuthenticatedUser()
                .then(() => {
                    setPage(
                        <nav className="navbar navbar-expand navbar-dark bg-dark">
                            <Link
                                to="/"
                                className="navbar-brand"
                                onClick={refreshPage}>
                                DaWeSys SLR
                            </Link>
                            <div
                                className="collapse navbar-collapse"
                                id="navbarsExample02">
                                <ul className="navbar-nav ml-auto">
                                    <li className="nav-item">
                                        <Link to="/search" className="nav-link">
                                            Quick Search
                                        </Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link
                                            to="/advanced"
                                            className="nav-link">
                                            Advanced Search
                                        </Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link to="/about" className="nav-link">
                                            About
                                        </Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link to="/help" className="nav-link">
                                            Help
                                        </Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link
                                            to="/profile"
                                            className="nav-link">
                                            Profile
                                        </Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link
                                            to="#"
                                            className="nav-link"
                                            onClick={handleLogout}>
                                            Logout
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </nav>
                    );
                })
                .catch((err) => {
                    setPage(
                        <nav className="navbar navbar-expand navbar-dark bg-dark">
                            <Link
                                to="/"
                                className="navbar-brand"
                                onClick={refreshPage}>
                                DaWeSys
                            </Link>

                            <div
                                className="collapse navbar-collapse"
                                id="navbarsExample02">
                                <ul className="navbar-nav ml-auto">
                                    <li className="nav-item">
                                        <Link to="/about" className="nav-link">
                                            About
                                        </Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link to="/help" className="nav-link">
                                            Help
                                        </Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link to="/regist" className="nav-link">
                                            Sign Up
                                        </Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link to="/login" className="nav-link">
                                            Sign In
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </nav>
                    );
                });
        } catch (e) {
            console.log('error');
        } finally {
            setLoading(false);
        }
    }, []);
    return <div>{loading ? 'loading ...' : page}</div>;
}

export default Navbar;
