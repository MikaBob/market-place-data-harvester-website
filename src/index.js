import React    from 'react';
import ReactDOM from 'react-dom';
import App      from './app';

import { Provider } from 'react-redux';
import store        from './redux/store';

// Stillshit
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "./css/color.css";
import "./css/stillshit.css";

// Javascript
import "../node_modules/jquery/dist/jquery.min.js";
import "../node_modules/bootstrap/dist/js/bootstrap.bundle.min.js";

ReactDOM.render(<Provider store={store}><App /></Provider>, document.getElementById('MPDH'));