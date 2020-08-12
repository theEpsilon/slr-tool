import React from 'react';
import ResultLabel from './ResultLabelBadge';
import Col from 'react-bootstrap/Col';
import Dropdown from 'react-bootstrap/Dropdown';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';

/*
Props
	bool edit
	arr labels
	arr projectLabels
*/

const ResultLabelContent = (props) => {
    if (props.edit) {
        return (
            <Row>
                <Col xs="9">
                    {props.labels.map((label, index) => (
                        <ResultLabel
                            label={label}
                            mode="edit"
                            removeResultLabel={props.removeResultLabel}
                            index={index}></ResultLabel>
                    ))}
                </Col>
                <Col
                    xs="3"
                    className="d-flex justify-content-end align-items-end">
                    <Dropdown className="menu-button add-result-label">
                        <Dropdown.Toggle
                            variant="outline-secondary"
                            id="dropdown-basic">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                className="feather feather-plus">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                            {props.projectLabels.map((label) => (
                                <Dropdown.Item
                                    onClick={() => props.handleAddLabel(label)}>
                                    <Badge
                                        pill
                                        style={{
                                            backgroundColor: label.color,
                                            color: 'white',
                                            fontSize: '100%',
                                        }}>
                                        {label.name}
                                    </Badge>
                                </Dropdown.Item>
                            ))}
                        </Dropdown.Menu>
                    </Dropdown>
                    <Button
                        variant="secondary"
                        className="exit-edit-mode"
                        onClick={props.handleCloseLabelEditor}>
                        Exit
                    </Button>
                </Col>
            </Row>
        );
    } else {
        return (
            <div>
                {props.labels.map((label, index) => (
                    <ResultLabel
                        label={label}
                        mode="show"
                        index={index}></ResultLabel>
                ))}
            </div>
        );
    }
};

export default ResultLabelContent;
