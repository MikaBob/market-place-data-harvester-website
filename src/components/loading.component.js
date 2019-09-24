import React, { Component } from 'react';

export default class Loading extends Component {

    render() {
        const min = 0, max = 22;
        const loadingID = Math.ceil(min + Math.random() * (max - min));
        return (
                <div className="w-100 h-100 position-absolute" 
                    style={{
                        top: '0',
                        left: '0', 
                        zIndex: '100',
                        backgroundColor: 'rgba(0, 0, 0, 0.75)',
                    }}
                >
                    <div style={{
                            top: '50%',
                            left: '50%',
                            transform: 'translateY(-50%) translateX(-50%)',
                            height: '150px',
                            width: '150px',
                        }} className="position-absolute"> 
                        <img src={`/public/images/loading/${loadingID}.png`} className="loading-spin text-center position-absolute" 
                            style={{
                                maxWidth: '150px',
                            }}
                            alt={`loading-${loadingID}.png`}></img>
                    </div>
                </div>
                );
    }
}