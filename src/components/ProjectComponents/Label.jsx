import React, { Component } from 'react';

class Label extends Component {
    render() {
        return (
            <div className="container-fuid p-1">
                <p className="h5">
                    <span
                        className="badge badge-secondary"
                        style={{
                            backgroundColor: this.props.Label.color,
                        }}>
                        {this.props.Label.name}
                        <button type="button" class="btn btn-danger ml-2">
                            X
                        </button>
                    </span>
                </p>
            </div>
        );
    }
}

export default Label;
