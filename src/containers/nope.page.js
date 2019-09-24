import React, { Component } from 'react';
import { Link }             from 'react-router-dom';

export default class Nope extends Component {

    render() {
        return (
                <div className="row my-3">
                    <div className="container-fluid">
                        <div className="text-center">
                            <u>This is the Nope page</u><br /><br />
                            Nope, you can not access that
                        </div>
                    </div>
                </div>
                );
    }
}