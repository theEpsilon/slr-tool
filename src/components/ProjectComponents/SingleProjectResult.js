import React, { useState, useEffect } from 'react';

import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Dropdown from 'react-bootstrap/Dropdown';
import Comment from './Comment';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Edit2 } from 'react-feather';
import axios from 'axios';
import Spinner from 'react-bootstrap/Spinner';
import ResultLabelContent from './ResultLabelContent';

const SingleProjectResult = (props) => {
    const [collapsed, setCollapsed] = useState(false);
    const [addComment, setAddComment] = useState(false);
    const [comments, setComments] = useState([]);
    const [refresh, setRefresh] = useState(true);
    const [editLabels, setEditLabels] = useState(false);
    const [commentText, setCommentText] = useState('');

    useEffect(() => {
        setComments(props.comments);
        setRefresh(false);
        console.log('Set SingleProjectResultComments: ');
    }, [props.comments]);

    const getTitleText = (titleObject) => {
        return titleObject.Emphasis.value;
    };

    const getSecondaryTitleText = (element) => {
        let text = '';
        let authors = [];

        element.authors
            ? element.authors.forEach((author) =>
                  authors.push(author.names[0] + ' ' + author.lastname)
              )
            : authors.push('Unknown author');

        text += authors.join(', ');

        element.publicationName && element.date
            ? (text += ' - ' + element.publicationName + ', ' + element.date)
            : (text += '');

        return text;
    };

    const getTitleStyle = (titleObject) => {
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
    };

    const handleEditLabels = () => {
        setEditLabels(true);
    };

    const handleStopEditing = () => {
        setEditLabels(false);
    };

    const collapseClicked = () => {
        console.log(collapsed);
        setCollapsed(!collapsed);
    };

    const onClickDeleteCommentpassed = (commentID, setDeleteLoading) => {
        let headers = {
            'Content-Type': 'application/json',
            'x-api-key': process.env.REACT_APP_API_KEY,
        };
        axios
            .delete(
                process.env.REACT_APP_AWS_URL_DEV +
                    '/projects/' +
                    props.projectID +
                    '/results/' +
                    props.resultID +
                    '/comments?user=' +
                    props.sub +
                    '&comment=' +
                    commentID,
                { headers }
            )
            .then((res) => {
                console.log(res.data.body);
                setComments(res.data.body);
                setDeleteLoading();
            });
    };

    const onClickAddComment = () => {
        console.log(addComment);
        setAddComment(!addComment);
    };

    const onChangeCommentText = (e) => {
        setCommentText(e.target.value);
    };

    const onClickSendComment = () => {
        setRefresh(true);
        console.log('Comment Text: ' + commentText);

        let headers = {
            'Content-Type': 'application/json',
            'x-api-key': process.env.REACT_APP_API_KEY,
        };
        let params = {
            text: commentText,
        };
        axios
            .post(
                process.env.REACT_APP_AWS_URL_DEV +
                    '/projects/' +
                    props.projectID +
                    '/results/' +
                    props.resultID +
                    '/comments?user=' +
                    props.sub,
                params,
                { headers }
            )
            .then((res) => {
                console.log('added');
                console.log(res.data.body);
                axios
                    .get(
                        process.env.REACT_APP_AWS_URL_DEV +
                            '/projects/' +
                            props.projectID +
                            '/results/' +
                            props.resultID +
                            '/comments?user=' +
                            props.sub,
                        { headers }
                    )
                    .then((res) => {
                        console.log(res.data.body);
                        setComments(res.data.body);
                        setRefresh(false);
                    });
            });
    };

    return (
        <Card className="mb-4">
            <Card.Header>
                <ResultLabelContent
                    labels={props.labels}
                    edit={editLabels}
                    projectLabels={props.projectLabels}
                    handleAddLabel={(label) =>
                        props.handleAddLabel(label, props.index)
                    }
                    removeResultLabel={(label) =>
                        props.handleRemoveResultLabel(label, props.index)
                    }
                    handleCloseLabelEditor={
                        handleStopEditing
                    }></ResultLabelContent>
            </Card.Header>
            <Card.Body>
                <Row>
                    <Col xs={props.readOnly ? '12' : '11'}>
                        <h5>
                            <a
                                target="_blank"
                                rel="noopener noreferrer"
                                href={props.result.link}
                                style={getTitleStyle(props.result.title)}>
                                {props.result.title.Emphasis
                                    ? getTitleText(props.result.title)
                                    : props.result.title}
                            </a>
                        </h5>
                        <h6 className="text-secondary">
                            {getSecondaryTitleText(props.result)}
                        </h6>
                    </Col>
                    {!props.readOnly ? (
                        <Col xs="1">
                            <Dropdown
                                className="menu-button float-right"
                                id="result_menu">
                                <Dropdown.Toggle
                                    variant="outline-dark"
                                    id="dropdown-basic">
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
                                        className="feather feather-more-vertical">
                                        <circle cx="12" cy="12" r="1"></circle>
                                        <circle cx="12" cy="5" r="1"></circle>
                                        <circle cx="12" cy="19" r="1"></circle>
                                    </svg>
                                </Dropdown.Toggle>

                                <Dropdown.Menu>
                                    <Dropdown.Item
                                        disabled={editLabels}
                                        onClick={handleEditLabels}>
                                        Add/Remove Labels
                                    </Dropdown.Item>
                                    <Dropdown.Item
                                        onClick={() =>
                                            props.handleRemoveResult(
                                                props.resultID,
                                                props.index
                                            )
                                        }>
                                        Remove Result
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </Col>
                    ) : (
                        ''
                    )}
                </Row>
                <Row>
                    <Col>
                        {props.result.abstract ? (
                            <p>{props.result.abstract}</p>
                        ) : null}
                        <h6 className="text-secondary text-right">
                            {props.result.source}
                        </h6>
                    </Col>
                </Row>
                {!props.readOnly ? (
                    <div className="container">
                        <div className="row justify-content-start">
                            {collapsed ? (
                                <button
                                    onClick={collapseClicked}
                                    className="btn btn-outline-dark">
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
                                        className="feather feather-chevron-up">
                                        <polyline points="18 15 12 9 6 15"></polyline>
                                    </svg>
                                    Hide Comments
                                </button>
                            ) : (
                                <button
                                    className="btn btn-outline-dark"
                                    onClick={collapseClicked}>
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
                                        className="feather feather-chevron-down">
                                        <polyline points="6 9 12 15 18 9"></polyline>
                                    </svg>
                                    Show Comments ({comments.length})
                                </button>
                            )}
                        </div>
                        {collapsed ? (
                            <React.Fragment>
                                {comments.map((comment, index) => (
                                    <Comment
                                        passedFunction={
                                            onClickDeleteCommentpassed
                                        }
                                        commentID={comment._id.$oid}
                                        key={index}
                                        sub={props.sub}
                                        comment={comment.text}
                                        userAddedID={comment.user.sub}
                                        username={comment.user.name}
                                        date={comment.date}
                                    />
                                ))}
                            </React.Fragment>
                        ) : null}
                        {collapsed ? (
                            <React.Fragment>
                                <hr></hr>
                                <div className="text-right">
                                    <button
                                        type="button"
                                        className="btn btn-outline-dark btn-xs"
                                        onClick={onClickAddComment}
                                        title="Edit">
                                        <Edit2 size={16} /> Add Comment
                                    </button>
                                </div>
                            </React.Fragment>
                        ) : (
                            ''
                        )}
                        {addComment ? (
                            <React.Fragment>
                                <h5 className="mt-3">Comment:</h5>
                                <textarea
                                    className="form-control mt-2"
                                    id="commentTextField"
                                    rows="5"
                                    placeholder="Comment Text"
                                    onChange={onChangeCommentText}></textarea>
                                <div className="text-right mt-2">
                                    <button
                                        className="btn btn-outline-success"
                                        onClick={onClickSendComment}>
                                        Send{' '}
                                        {refresh ? (
                                            <Spinner
                                                size="sm"
                                                animation="border"
                                            />
                                        ) : null}
                                    </button>
                                </div>
                            </React.Fragment>
                        ) : null}
                    </div>
                ) : (
                    ''
                )}
            </Card.Body>
        </Card>
    );
};

export default SingleProjectResult;
