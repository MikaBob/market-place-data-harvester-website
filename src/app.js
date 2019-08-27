import React from 'react';
import { BrowserRouter as Router, Route} from "react-router-dom";

import Menubar from "./components/menubar.component"
import Search from "./components/search.component"


function App() {
    
    /*
     * Chaque balise est remplacer par le render() de son fichier
     * 
     * La balise "Router" (de react-router-dom) permet d'afficher un render() d'un autre component
     * en toute simplicité
     */
    
    return (
        <Router>
            <div className="container">
                <Menubar />
                <br/>
                <Route path="/search" exact component={Search} />
            </div>
        </Router>
    );
}

export default App;