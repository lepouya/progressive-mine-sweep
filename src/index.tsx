import React from 'react';
import ReactDOM from 'react-dom';
import 'uikit';

import Loader from './components/Loader';

window.onload = () => {
  ReactDOM.render(
    <Loader />,
    document.getElementById('main'));
  }