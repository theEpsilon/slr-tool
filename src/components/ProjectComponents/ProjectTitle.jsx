import React, { Component } from 'react';

class ProjectTitle extends Component {
    state = {
        ViewMode: 'Viewing',
    };

    render() {
        return <div>{this.modeOfViewing()}</div>;
    }

    changeView = () => {
        this.state.ViewMode === 'Viewing'
            ? this.setState({ ViewMode: 'Editing' })
            : this.setState({ ViewMode: 'Viewing' });
    };

    viewing() {
        return (
            <React.Fragment>
                <div className="mt-3 mb-3">
                    <h1>{this.props.ProjectTitle}</h1>
                </div>
            </React.Fragment>
        );
    }
    editing() {
        return (
            <div className="form-row">
                <div className="col">
                    <label
                        htmlFor="exampleInputEmail1"
                        style={{ fontSize: 35 }}>
                        Project Name:
                    </label>
                    <input
                        type="text"
                        className="form-control"
                        id="projectName"
                        aria-describedby="projectName"
                        style={{ fontSize: 55, width: 550 }}
                        value={this.state.editTitle}
                        onChange={this.handleSave}></input>
                    <small
                        id="projectNameHelp"
                        className="form-text text-muted">
                        Enter a Project Name
                    </small>
                </div>
                <div className="col" style={{}}>
                    <button
                        style={{
                            position: 'relative',
                            backgroundColor: 'green',
                            height: 50,
                            width: 150,
                            //right: -8,
                            bottom: -60,
                            right: -35,
                        }}
                        onClick={this.saveInEdit}
                        className="btn btn-secondary btn-sm">
                        Save
                    </button>
                    <button
                        style={{
                            position: 'relative',
                            backgroundColor: 'red',
                            height: 50,
                            width: 150,
                            left: -115,
                            bottom: -120,
                        }}
                        onClick={() => this.setState({ ViewMode: 'Viewing' })}
                        className="btn btn-secondary btn-sm">
                        Cancel
                    </button>
                </div>
            </div>
        );
    }
    modeOfViewing() {
        return this.state.ViewMode === 'Viewing'
            ? this.viewing()
            : this.editing();
    }
    handleSave = (event) => {
        const newTitle = event.target.value;
        this.setState({ editTitle: newTitle });
    };
    saveInEdit = () => {
        const newTitle = this.state.editTitle;
        if (newTitle.length > 2 && newTitle.length < 31) {
            this.setState({ ProjectTitle: newTitle });
            this.setState({ ViewMode: 'Viewing' });
        } else {
            console.log('Invalid Project Name');
            return <alert>Invalid project Name</alert>;
            //TODO
        }
        //TODO
        return;
    };
}

export default ProjectTitle;
