import React, { useEffect, useState } from 'react';
import { Trash2 } from 'react-feather';
import Spinner from 'react-bootstrap/Spinner';

const Comment = (props) => {
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => {}, [props]);

    function setLoadingFalse() {
        setDeleteLoading(false);
    }

    const onClickDeleteComment = () => {
        setDeleteLoading(true);
        console.log('delete');
        props.passedFunction(props.commentID, setLoadingFalse);
    };

    return (
        <div className="card mt-3">
            <div className="card-header p-2">
                <p className="text-right m-0">
                    By: {props.username} on {props.date}
                </p>
            </div>
            <div className="card-body p-1">
                <div className="col-12 d-flex flex-direction-row">
                    <p
                        className="d-block m-0"
                        style={{ flexGrow: '100', lineHeight: '2.25rem' }}>
                        {props.comment}
                    </p>
                    {props.sub === props.userAddedID ? (
                        <button
                            style={{ flexGrow: '0', border: 'none' }}
                            type="button"
                            className="btn btn-outline-danger btn-xs"
                            title="Edit"
                            onClick={onClickDeleteComment}>
                            <Trash2 size={24} />
                            {deleteLoading ? (
                                <Spinner size="sm" animation="border" />
                            ) : null}
                        </button>
                    ) : (
                        ''
                    )}
                </div>
            </div>
        </div>
    );
};

export default Comment;
