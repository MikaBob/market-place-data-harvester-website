import React, { Component, Fragment }   from 'react';
import { BrowserRouter, Route, Switch}  from "react-router-dom";
import { connect }  from 'react-redux';
import PropTypes    from 'prop-types';

import { loadUser } from './redux/actions/authActions';   // redux workflow: Action => Reducer
import store        from './redux/store';

import Header   from "./components/header.component";
import Footer   from "./components/footer.component";
import Loading  from "./components/loading.component";
import Search   from "./containers/search.page";
import Item     from "./containers/item.page";
import Login    from "./containers/login.page";
import Nope     from "./containers/nope.page";
import Profile  from "./containers/profile.page";
import Purchase from "./containers/purchase.page";

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
        const { isAuthenticated, isLoading } = this.props.auth;
        return (
                <BrowserRouter>
                    <div className="body container-fluid">
                        {isAuthenticated ?(
                            <Fragment>
                                <Header />
                                <Switch>
                                    <Route path={["/search", "/"]} exact component={Search} />
                                    <Route path="/purchase" exact component={Purchase} />
                                    <Route path="/item/:itemGID" exact component={Item} />
                                    <Route path="/profile" exact component={Profile} />
                                    <Route component={Nope} />
                                </Switch>
                                <Footer />
                            </Fragment>
                            ) : 
                                isLoading ? (
                                    <Fragment>
                                        <Loading />
                                    </Fragment>
                                ) : (
                                    <Fragment>
                                        <Route component={Login} />
                                    </Fragment>
                                )
                        }
                    </div>
                </BrowserRouter>
            );
    }
}

const mapStateToProps = state => ({
    auth: state.auth
});

export default connect(mapStateToProps, null)(App);
