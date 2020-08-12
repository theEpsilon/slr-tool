import React, { Component } from "react";

class Options extends Component {
  state = {
    isOpen: false,
  };
  toggleOpen = () => this.setState({ isOpen: !this.state.isOpen });

  render() {
    const menuClass = `dropdown-menu${this.state.isOpen ? " show" : ""}`;
    return (
      <div className="dropdown" onClick={this.toggleOpen}>
        <button
          className="btn btn-secondary dropdown-toggle"
          type="button"
          id="dropdownMenuButton"
          data-toggle="dropdown"
          aria-haspopup="true"
        >
          Options
        </button>
        <div className={menuClass} aria-labelledby="dropdownMenuButton">
          <a
            className="dropdown-item"
            href="#"
            onClick={this.props.DeleteResult}
          >
            Delete Result
          </a>
          <a className="dropdown-item" href="#nogo">
            Add Label
          </a>
          <a className="dropdown-item" href="#nogo">
            Item 3
          </a>
        </div>
      </div>
    );
  }
}

export default Options;
