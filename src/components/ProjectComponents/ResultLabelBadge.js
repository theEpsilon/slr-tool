import React from 'react';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';

const ResultLabelBadge = (props) => {
    return (
        <Badge
            pill
            style={{
                backgroundColor: props.label.color,
                color: 'white',
                fontSize: '100%',
            }}
            className="resultbadge">
            {props.label.name}
            {props.mode === 'edit' ? (
                <Button
                    onClick={() =>
                        props.removeResultLabel(props.label, props.index)
                    }>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="feather feather-x">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </Button>
            ) : (
                ''
            )}
        </Badge>
    );
};

export default ResultLabelBadge;
