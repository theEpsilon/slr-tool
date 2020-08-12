import React, { useState, useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import ListGroup from 'react-bootstrap/ListGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ResultLabelBadge from './ResultLabelBadge';

const FilterBar = (props) => {
    const [activeItems, setActiveItems] = useState([]);

    const handleAddFilterItem = (label) => {
        let label_id = label['_id']['$oid'];

        if (
            activeItems.filter((el) => el['_id']['$oid'] === label_id)
                .length === 0
        ) {
            setActiveItems([...activeItems, label]);
        } else {
            console.log('already in filter');
            //Display Toast
        }
    };

    const handleRemoveFilterItem = (label, index) => {
        let items = [...activeItems];
        items.splice(index, 1);

        setActiveItems(items);
    };

    return (
        <Col xs="12" className="d-flex">
            <h5 className="m-0 mr-4" style={{ lineHeight: '1.5' }}>
                Filter:
            </h5>
            <div
                className="mr-4 d-flex align-items-center px-2"
                style={{
                    flexGrow: 100,
                    border: 'solid 1px rgba(0,0,0,0.125)',
                    borderRadius: '0.25rem',
                }}>
                {activeItems.map((el, index) => (
                    <span>
                        <ResultLabelBadge
                            mode="edit"
                            label={el}
                            removeResultLabel={handleRemoveFilterItem}
                            index={index}></ResultLabelBadge>
                    </span>
                ))}
            </div>
            <Button
                variant="success"
                className="mr-2"
                onClick={() => props.applyFilter(activeItems)}>
                {activeItems.length == 0 ? 'Reset' : 'Apply'}
            </Button>
            <Dropdown className="menu-button float-right">
                <Dropdown.Toggle variant="outline-dark" id="dropdown-basic">
                    Add Filter
                </Dropdown.Toggle>

                <Dropdown.Menu>
                    {props.filterItems.map((el, index) => (
                        <Dropdown.Item onClick={() => handleAddFilterItem(el)}>
                            <ResultLabelBadge
                                mode="view"
                                label={el}
                                index={index}></ResultLabelBadge>
                        </Dropdown.Item>
                    ))}
                </Dropdown.Menu>
            </Dropdown>
        </Col>
    );
};

export default FilterBar;
