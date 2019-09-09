import React from 'react';
import { BrowserRouter as Router, Route} from "react-router-dom";

import Header from "./components/header.component"
import Search from "./components/search.component"
import Item from "./components/item.component"
import Footer from "./components/footer.component"

function App() {

    /*
     * Chaque balise est remplacer par le render() de son fichier
     *
     * La balise "Router" (de react-router-dom) permet d'afficher un render() d'un autre component
     * en toute simplicité
     */

    return (
            <Router>
                    <div className="body">
                    <Header />
                    <Route path="/search" exact component={Search} />
                    <Route path="/item/:itemGID" exact component={Item} />
                    <Footer />
                </div>
            </Router>
            );
}

export default App;