import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Auth } from 'aws-amplify';
import { useState, useEffect } from 'react';
import SearchComponent from './SearchComponent';
import LoginPage from './pages/LoginPage';

function Search() {
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
      {loggedIn ? <SearchComponent /> : <LoginPage />}
    </div>
  );
}

export default Search;
