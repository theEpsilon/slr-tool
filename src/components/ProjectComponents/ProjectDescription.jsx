import React, { Component } from 'react';

class ProjectDescription extends Component {
    state = {
        ViewMode: 'View',
    };
    render() {
        return (
            <div>
                {this.state.ViewMode === 'View'
                    ? this.viewMode()
                    : this.editMode()}
            </div>
        );
    }

    // <div>
    //   <p style={{ fontStyle: "italic", width: 600 }}>
    //     {this.state.ProjectSummary === ""
    //       ? "Add a description..."
    //       : this.state.ProjectSummary}
    //   </p>
    //   <button
    //     style={{
    //       position: "relative",
    //       backgroundColor: "blue",
    //       right: -5,
    //       bottom: -10,
    //     }}
    //     onClick={this.changeViewToEdit}
    //     className="btn btn-secondary btn-sm"
    //   >
    //     Edit
    //   </button>
    //   <button
    //     style={{
    //       position: "relative",
    //       backgroundColor: "red",
    //       right: -8,
    //       bottom: -10,
    //     }}
    //     onClick={this.deleteSumm}
    //     className="btn btn-secondary btn-sm"
    //   >
    //     Delete
    //   </button>
    // </div>

    viewMode() {
        return (
            <React.Fragment>
                <div>
                    <h5 style={{ fontWeight: 400 }}>
                        {this.props.ProjectSummary === ''
                            ? 'Add a description...'
                            : this.props.ProjectSummary}
                    </h5>
                </div>
            </React.Fragment>
        );
    }
    editMode() {
        return (
            <div class="container">
                <div className="form-group">
                    <label className="h3" htmlFor="projectSumm">
                        Project Summary:
                    </label>
                    <textarea
                        type="text"
                        className="form-control"
                        rows="7"
                        id="projectSumm"
                        aria-describedby="projectSumm"
                        value={this.state.editedSumm}
                        onChange={this.handleSave}></textarea>
                    <small id="projectSumHelp" className="form-text text-muted">
                        Edit Summary
                    </small>
                </div>
                <div className="row pb-5 ml-1">
                    <button
                        onClick={this.saveInEdit}
                        className="btn btn-success mr-2">
                        Save
                    </button>
                    <button
                        onClick={() =>
                            this.setState({
                                ViewMode: 'View',
                                editedSumm: this.state.ProjectSummary,
                            })
                        }
                        className="btn btn-danger">
                        Cancel
                    </button>
                </div>
            </div>
        );
    }
    changeViewToEdit = () => {
        this.setState({ ViewMode: 'Edit' });
    };
    deleteSumm = () => {
        this.setState({ ProjectSummary: '', editedSumm: '' });
        //TODO
    };
    handleSave = (event) => {
        const newSumm = event.target.value;
        this.setState({ editedSumm: newSumm });
    };
    saveInEdit = () => {
        const newSumm = this.state.editedSumm;
        this.setState({ ProjectSummary: newSumm });
        this.setState({ ViewMode: 'View' });
        //TODO
        return;
    };
}

export default ProjectDescription;
