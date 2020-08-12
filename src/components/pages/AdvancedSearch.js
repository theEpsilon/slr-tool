import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Auth } from 'aws-amplify';
import { useState, useEffect } from 'react';
import QueryBuilderPage from './QueryBuilder';
import LoginPage from './LoginPage';

function AdvancedSearch(props) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      setLoading(true);

      Auth.currentAuthenticatedUser()
            .then(() => {
              setLoggedIn(true)
            })
            .catch(err => {
              setLoggedIn(false)
            })
    }
    catch (e) {
      console.log('error');;
    }
    finally {
      setLoading(false);
    }
  },[]);

  return (
    <div>
      {loading ? 'loading ...' : null}
      {loggedIn ? <QueryBuilderPage searchData={props.match.params}/> : <LoginPage />}
    </div>
  );
}

export default AdvancedSearch;
