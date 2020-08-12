import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from './components/Navbar';
import About from './components/pages/About';
import Help from './components/pages/Help';
import LoginPage from './components/pages/LoginPage';
import SignUpPage from './components/pages/SignUpPage';
import AdvancedSearch from './components/pages/AdvancedSearch';
import Search from './components/Search';
import Amplify from 'aws-amplify';
import awsconfig from './aws-exports-env';
import Project from './components/pages/Project';
// import ProjectResult from './components/ProjectComponents/ProjectResult';

import Profile from './components/pages/Profile';
import Results from './components/pages/Results';

Amplify.configure(awsconfig);

class App extends Component {
    render() {
        return (
            <Router>
                <div className="App">
                    <Navbar />
                    <Route exact path="/" component={Search} />
                    <Route
                        path="/advanced"
                        exact
                        component={AdvancedSearch}></Route>
                    <Route
                        path="/advanced/:search"
                        name="search"
                        exact
                        component={AdvancedSearch}></Route>
                    <Route path="/login" component={LoginPage} />
                    <Route path="/search" exact component={Search} />
                    <Route path="/regist" component={SignUpPage} />
                    <Route path="/about" component={About} />
                    <Route path="/help" component={Help} />
                    <Route path="/profile" component={Profile} />
                    <Route path="/search/results" exact component={Results} />
                    <Route path="/search/:id" exact component={About} />
                    <Route
                        path="/projects/:project_id"
                        exact
                        component={Project}
                    />
                </div>
            </Router>
        );
    }
}

export default App;
