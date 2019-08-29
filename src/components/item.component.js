import React, { Component } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';

const COLORS = [
    'rgba(191, 213, 0, 0.5)',
    'rgba(95, 106, 87, 0.5)',
    'rgba(46, 139, 87, 0.5)',
    'rgba(255, 153, 0, 0.5)',
];

export default class Item extends Component {

    constructor(props) {
        super(props);
        this.ChangeScale = this.ChangeScale.bind(this);
        this.state = {
            chartData: {},
            itemGID: '',
            lvl: '',
            label: '',
            type: '',
            category: '',
            isScaleOn: true
        };
    }

    componentDidMount() {

        // Item description
        axios.get(process.env.API_URL + '/item/' + this.props.match.params.itemGID)
                .then(response => {
                    this.setState({
                        itemGID: response.data.itemGID,
                        lvl: response.data.lvl,
                        label: response.data.label,
                        type: response.data.type,
                        category: response.data.category,
                    });
                })
                .catch(function (error) {
                    console.log(error);
                });
        // Item prices for chart
        axios.get(process.env.API_URL + '/item/' + this.props.match.params.itemGID + '/prices', {params: {startTime: (new Date((new Date).setMonth((new Date).getMonth() - 1))).toISOString(), endTime: (new Date).toISOString()}})
                .then(response => {
                    var dataForChart = {labels: [], datasets: [
                            {
                                label: 'Price X1',
                                data: [],
                                borderColor: COLORS[0]
                            },
                            {
                                label: 'Price X10',
                                data: [],
                                borderColor: COLORS[1]
                            },
                            {
                                label: 'Price X100',
                                data: [],
                                borderColor: COLORS[2]
                            },
                            {
                                label: 'Price average',
                                data: [],
                                borderColor: COLORS[3]
                            }
                        ]};
                    response.data.forEach(function (price) {
                        var timestamp = new Date(price.timestamp);
                        dataForChart.labels.push(timestamp.getMonth() + "/" + timestamp.getDate() + "-" + timestamp.getHours() + "h" + timestamp.getMinutes());
                        dataForChart.datasets[0].data.push(price.price_1);
                        dataForChart.datasets[1].data.push(price.price_10);
                        dataForChart.datasets[2].data.push(price.price_100);
                        dataForChart.datasets[3].data.push(price.price_avg);
                    });
                    this.setState({chartData: dataForChart}, () => {
                        if (this.state.isScaleOn)
                            this.ChangeScale();
                    });
                })
                .catch(function (error) {
                    console.log(error);
                });
    }

    ChangeScale() {
        var shouldDivide = this.state.isScaleOn;
        this.setState({isScaleOn: !this.state.isScaleOn});
        var updatedChartData = this.state.chartData;
        
        // loop througth price X10 and price X100
        for (var i = 1; i < 3; i++) {
            if (shouldDivide) // possible en ternaire mais illisible
                updatedChartData.datasets[i].data = updatedChartData.datasets[i].data.map(value => value /= Math.pow(10, i)); // /10 & /100
            else
                updatedChartData.datasets[i].data = updatedChartData.datasets[i].data.map(value => value *= Math.pow(10, i)); // *10 & *100
        }

        // update values
        this.setState({chartData: updatedChartData});
    }

    render() {
        return (
                <div>
                    <div className="row">
                        <div className="col-3">
                            <table className="table table-bordered">
                                <tbody>
                                    <tr><td colSpan="2"><img src={`/public/images/items/${this.state.itemGID}.png`} className="img-fluid center center-block text-center" alt={this.state.itemGID + ".png"}></img></td></tr>
                                    <tr><td>Label</td><td>{this.state.label}</td></tr>
                                    <tr><td>Level</td><td>{this.state.lvl}</td></tr>
                                    <tr><td>Type</td><td>{this.state.type}</td></tr>
                                    <tr><td>Category</td><td>{this.state.category}</td></tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="col-9">
                            <div className="container">
                                <div className="row">
                                    <Line data={this.state.chartData} options={{elements: {line: {fill: false}}}}/>
                                </div>
                                <div className="row">
                                    <div className="custom-control custom-checkbox">
                                        <input type="checkbox" className="custom-control-input" id="changeScale" onChange={this.ChangeScale} checked={this.state.isScaleOn} />
                                        <label className="custom-control-label" htmlFor="changeScale">Do not divide</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                );
    }
}