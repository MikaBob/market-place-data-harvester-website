import React, { Component, Fragment }   from 'react';
import { BrowserRouter, Route, Switch}  from "react-router-dom";
import { connect }  from 'react-redux';
import PropTypes    from 'prop-types';

import { loadUser } from './redux/actions/authActions';   // redux workflow: Action => Reducer
import store        from './redux/store';

import Header   from "./components/header.component";
import Search   from "./components/search.component";
import Item     from "./components/item.component";
import Footer   from "./components/footer.component";
import Login    from "./components/login.component";
import Nope     from "./components/nope.component";

class App extends Component {
        
    static propTypes = {
        auth: PropTypes.object.isRequired
    };
  

    componentDidMount() {
        store.dispatch(loadUser());
    }
    /*
     * Chaque balise est remplacer par le render() de son fichier
     *
     * La balise "Router" (de react-router-dom) permet d'afficher un render() d'un autre component
     * en toute simplicité
     */

    render() {
        const { isAuthenticated, user } = this.props.auth;
        return (
                <BrowserRouter>
                    <div className="body">
                        {isAuthenticated ?(
                            <Fragment>
                                <Header />
                                <Switch>
                                    <Route path={["/search", "/"]} exact component={Search} />
                                    <Route path="/item/:itemGID" exact component={Item} />
                                    <Route component={Nope} />
                                </Switch>
                                <Footer />
                            </Fragment>
                        ) :(
                            <Fragment>
                                <Route component={Login} />
                            </Fragment>
                        )}
                    </div>
                </BrowserRouter>
            );
    }
}

const mapStateToProps = state => ({
  auth: state.auth
});

export default connect(mapStateToProps, null)(App);
