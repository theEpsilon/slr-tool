import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import axios from 'axios';
import Spinner from 'react-bootstrap/Spinner';
import SingleResult from './resultcomponents/SingleResult';

const Results = (props) => {
    const [results, setResults] = useState(props.results);
    // const [showMode, setShowMode] = useState(props.showMode);
    // const [sub, setSub] = useState(props.sub);
    const [
        loadingSaveResultToProject,
        setLoadingSaveResultToProject,
    ] = useState(false);

    useEffect(() => {
        // console.log(showMode);
        if (props.results !== results) {
            setResults(props.results);
        }
    }, [props.results, results]);

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

    function save_result_to_project(result_id) {
        setLoadingSaveResultToProject(true);
        var e = document.getElementById('project');
        var project_id = e.options[e.selectedIndex].value;

        console.log(project_id);
        console.log(result_id);

        const params = {
            'result-id': result_id,
        };

        const config = {
            'Content-Type': 'application/json',
            'x-api-key': process.env.REACT_APP_API_KEY,
        };

        axios
            .post(
                process.env.REACT_APP_AWS_URL_DEV +
                    '/projects/' +
                    project_id +
                    '/results?user=' +
                    props.sub +
                    '&project_id=' +
                    project_id,
                params,
                { headers: config }
            )
            .then((res) => {
                console.log(res);
                setLoadingSaveResultToProject(false);
            });
    }

    return (
        <div className="container">
            <ul className="list-group">
                {results.map((element) =>
                    props.showMode ? (
                        <SingleResult
                            key={element.doi}
                            link={element.link}
                            title={element.title}
                            secondaryTitle={getSecondaryTitleText(element)}
                            abstract={element.abstract}
                            source={element.source}
                            showMode={props.showMode}
                            selectedProject={props.selectedProject}
                            resID={element._id.$oid}
                            selectedProjectID={props.selectedProjectID}
                            sub={props.sub}
                        />
                    ) : (
                        <SingleResult
                            key={element.doi}
                            link={element.link}
                            title={element.title}
                            secondaryTitle={getSecondaryTitleText(element)}
                            abstract={element.abstract}
                            source={element.source}
                            showMode={props.showMode}
                            selectedProject={props.selectedProject}
                            selectedProjectID={props.selectedProjectID}
                            sub={props.sub}
                        />
                    )
                )}
            </ul>
        </div>
    );
};

export default Results;
