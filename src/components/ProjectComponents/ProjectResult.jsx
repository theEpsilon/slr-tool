import React, { Component } from 'react';
import Results from '../pages/Results';
class ProjectResult extends Component {
    render() {
        return <div>{this.projectResultElement()}</div>;
    }
    projectResultElement() {
        return (
            <React.Fragment>
                <Results results={this.props.results}></Results>
            </React.Fragment>
        );
    }
}

export default ProjectResult;
