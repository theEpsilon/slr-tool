import React, { Component } from 'react';
import axios from 'axios';
import Spinner from 'react-bootstrap/Spinner';

class SingleResult extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loadingSaveResultToProject: false,
        };

        this.save_result_to_project = this.save_result_to_project.bind(this);
    }

    save_result_to_project(result_id) {
        this.setState({ loadingSaveResultToProject: true });
        const params = {
            'result-id': result_id,
        };

        const config = {
            'Content-Type': 'application/json',
            'x-api-key': process.env.REACT_APP_API_KEY,
        };

        axios
            .post(
                process.env.REACT_APP_AWS_URL_DEV +
                    '/projects/' +
                    this.props.selectedProjectID +
                    '/results?user=' +
                    this.props.sub +
                    '&project_id=' +
                    this.props.selectedProjectID,
                params,
                { headers: config }
            )
            .then((res) => {
                console.log(res);
                this.setState({ loadingSaveResultToProject: false });
            });
    }

    getTitleStyle(titleObject) {
        let styleObject = { fontStyle: '' };
        if (titleObject.Emphasis) {
            let decoration = titleObject.Emphasis.Type;

            switch (decoration) {
                case 'Italic':
                    styleObject.fontStyle = 'italic';
                    break;
                case 'Bold':
                    styleObject.fontStyle = 'bold';
                    break;
                default:
                    styleObject.fontStyle = '';
                    break;
            }
        }
        return styleObject;
    }

    getTitleText(titleObject) {
        return titleObject.Emphasis.value;
    }

    render() {
        return (
            <li key={this.props.doi} className="list-group-item text-left">
                <h5>
                    <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href={this.props.link}
                        style={this.getTitleStyle(this.props.title)}>
                        {this.props.title.Emphasis
                            ? this.getTitleText(this.props.title)
                            : this.props.title}
                    </a>
                </h5>
                <h6 className="text-secondary">{this.secondaryTitle}</h6>
                {(this.props.abstract && this.props.source) !==
                'Elsevier (Scopus)' ? (
                    <p>{this.props.abstract}</p>
                ) : null}
                <h6 className="text-secondary text-right mb-3">
                    {this.props.source}
                </h6>
                {this.props.showMode ? (
                    <button
                        className="form-control btn-outline-dark"
                        disabled={
                            this.props.selectedProject === '' ||
                            this.props.selectedProjectID === '-1'
                        }
                        onClick={() =>
                            this.save_result_to_project(this.props.resID)
                        }>
                        {this.props.selectedProject === ''
                            ? 'Select Project first'
                            : 'Save result to ' +
                              this.props.selectedProject +
                              ' project'}
                        {this.state.loadingSaveResultToProject ? (
                            <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                className="ml-2"
                            />
                        ) : null}
                    </button>
                ) : null}
            </li>
        );
    }
}

export default SingleResult;
