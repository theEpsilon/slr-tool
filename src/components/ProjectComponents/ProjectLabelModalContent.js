import React from 'react';
import CreateLabelForm from './CreateLabelForm';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';

const ProjectLabelModalContent = (props) => {
    /*
	Props:
		labels
		handleRemove
		handleCreate
	*/

    if (props.labels.length == 0) {
        return (
            <div>
                <div class="alert alert-secondary mb-0" role="alert">
                    No labels set in this project!
                </div>
                <hr></hr>
                <CreateLabelForm
                    submitHandler={props.handleCreate}></CreateLabelForm>
            </div>
        );
    } else {
        return (
            <div>
                <h5>Current Labels</h5>
                {props.labels.map((label) => (
                    <div className="d-flex justify-content-between align-items-center my-2">
                        <Badge
                            pill
                            style={{
                                backgroundColor: label.color,
                                color: 'white',
                                fontSize: '100%',
                            }}>
                            {label.name}
                        </Badge>
                        <Button
                            disabled={
                                props.forbiddenRemoval
                                    .split('+')
                                    .filter((x) => x === label['_id']['$oid'])
                                    .length > 0
                            }
                            variant="outline-danger"
                            className="float-right"
                            onClick={() =>
                                props.handleRemove(label['_id']['$oid'])
                            }>
                            Remove
                        </Button>
                    </div>
                ))}
                <hr></hr>
                <h5>Create new label</h5>
                <CreateLabelForm
                    submitHandler={props.handleCreate}></CreateLabelForm>
            </div>
        );
    }
};

export default ProjectLabelModalContent;
