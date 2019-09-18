import React, { Component } from 'react';
import { format, isAfter, subDays } from 'date-fns'
import axios                from 'axios';
import { Line }             from 'react-chartjs-2';
import DatePicker           from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

const COLORS = [
    'rgba(191, 213, 0, 0.5)',
    'rgba(95, 106, 87, 0.5)',
    'rgba(46, 139, 87, 0.5)',
    'rgba(255, 153, 0, 0.5)'
];

export default class Item extends Component {

    constructor(props) {
        super(props);

        this.ChangeScale = this.ChangeScale.bind(this);
        this.ChangeStartDate = this.ChangeStartDate.bind(this);
        this.ChangeEndDate = this.ChangeEndDate.bind(this);
        this.setDates = this.setDates.bind(this);
        this.setScale = this.setScale.bind(this);


        var today = new Date();

        this.state = {
            // Item description
            itemGID: '',
            lvl: '',
            label: '',
            type: '',
            category: '',

            // Charts
            chartData: {},
            isScaleOn: true,
            startDate: subDays(today, 30),
            endDate: today,
            activeButtonIndex: 2,
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
                    }, () => {
                        this.refreshChart();
                    });
                })
                .catch(function (error) {
                    console.log(error);
                });
    }

    refreshChart() {
        // Item prices for chart
        axios.get(process.env.API_URL + '/item/' + this.state.itemGID + '/prices', {params: {startTime: format(this.state.startDate, 'yyyy-LL-dd HH:mm:ss'), endTime: format(this.state.endDate, 'yyyy-LL-dd HH:mm:ss')}})
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

                    var cpt = 0;
                    response.data.forEach(function (price) {
                        var timestamp = new Date(price.timestamp);
                        dataForChart.labels.push(timestamp.getMonth() + "/" + timestamp.getDate() + "-" + timestamp.getHours() + "h" + timestamp.getMinutes());
                        dataForChart.datasets[0].data.push(price.price_1);
                        dataForChart.datasets[1].data.push(price.price_10);
                        dataForChart.datasets[2].data.push(price.price_100);
                        dataForChart.datasets[3].data.push(price.price_avg);
                        cpt++;
                    });
                    console.log(cpt);
                    this.setState({chartData: dataForChart}, () => {
                        this.setScale(this.state.isScaleOn);
                    });
                })
                .catch(function (error) {
                    console.log(error);
                });
    }

    ChangeStartDate(date) {
        this.setDates(null, date, null);
    }

    ChangeEndDate(date) {
        this.setDates(null, null, date);
    }

    setDates(buttonIndex, startDate, endDate) {
        buttonIndex = buttonIndex == null ? -1 : buttonIndex;
        startDate = startDate == null ? this.state.startDate : startDate;
        endDate = endDate == null ? this.state.endDate : endDate;

        this.setState({activeButtonIndex: buttonIndex});
        this.setState({startDate: startDate, endDate: endDate}, () => {
            this.refreshChart();
        });
    }

    ChangeScale() {
        this.setScale(!this.state.isScaleOn);
        this.setState({isScaleOn: !this.state.isScaleOn});
    }

    setScale(isPutToScale) {
        var updatedChartData = this.state.chartData;

        // loop througth price X10 and price X100
        for (var i = 1; i < 3; i++) {
            if (isPutToScale) // possible en ternaire mais illisible
                updatedChartData.datasets[i].data = updatedChartData.datasets[i].data.map(value => value /= Math.pow(10, i)); // /10 & /100
            else
                updatedChartData.datasets[i].data = updatedChartData.datasets[i].data.map(value => value *= Math.pow(10, i)); // *10 & *100
        }

        // update values
        this.setState({chartData: updatedChartData});
    }

    render() {
        return (
                <div className="row border border-light py-2">
                    <div className="col-12 col-lg-3">
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
                    <div className="col-12 col-lg-9">
                        <div className="container">
                            <div className="row">
                                <Line data={this.state.chartData} options={{elements: {line: {fill: false}}}}/>
                            </div>
                            <div className="row mb-2 mb-md-3">
                                <div className="container-fluid px-0 btn-group btn-group-toggle">
                                    <input className={this.state.activeButtonIndex !== 0 ? 'col-4 btn btn-primary' : 'col-4 btn btn-primary active'} type="button" onClick={() => this.setDates(0, subDays(new Date(), 1), null)} value="Last 24h"/>
                                    <input className={this.state.activeButtonIndex !== 1 ? 'col-4 border-left btn btn-primary' : 'col-4 border-left btn btn-primary active'} type="button" onClick={() => this.setDates(1, subDays(new Date(), 7), null)} value="Last 7 days"/>
                                    <input className={this.state.activeButtonIndex !== 2 ? 'col-4 border-left btn btn-primary' : 'col-4 border-left btn btn-primary active'} type="button" onClick={() => this.setDates(2, subDays(new Date(), 30), null)} value="Last 30 days"/>
                                </div>
                            </div>
                            <div className="row mb-2 datepickers-for-chart">
                                <span className="container-fluid border-top mb-lg-3 mb-sm-2"></span>
                                <div className="input-group px-0 mb-sm-1 mb-md-0 col-sm-12 col-md-6">
                                    <div className="input-group-prepend w-25">
                                        <span className="input-group-text w-100" id="startDateLabel">Start Date</span>
                                    </div>
                                    <DatePicker
                                        className="form-control"
                                        selected={this.state.startDate}
                                        selectsStart
                                        showTimeSelect
                                        startDate={this.state.startDate}
                                        endDate={this.state.endDate}
                                        onChange={this.ChangeStartDate}
                                        timeFormat="HH:mm"
                                        timeIntervals={15}
                                        timeCaption="time"
                                        selectsEnd
                                        dateFormat="dd/MM/yy HH:mm"
                                        todayButton="Today"
                                        />
                                </div>
                                <div className="input-group px-0 col-sm-12 col-md-6">
                                    <div className="input-group-prepend w-25">
                                        <span className="input-group-text w-100" id="endDateLabel">End Date &nbsp;</span>
                                    </div>
                                    <DatePicker
                                        className="form-control"
                                        selected={this.state.endDate}
                                        showTimeSelect
                                        onChange={this.ChangeEndDate}
                                        startDate={this.state.startDate}
                                        endDate={this.state.endDate}
                                        timeFormat="HH:mm"
                                        timeIntervals={15}
                                        timeCaption="time"
                                        dateFormat="dd/MM/yy HH:mm"
                                        todayButton="Today"
                                        />
                                </div>
                            </div>
                            <div className="row">
                                <div className="input-group px-0">
                                    <div className="input-group-text">
                                        <div className="input-group-prepend">
                                            <input type="checkbox" id="changeScale" onChange={this.ChangeScale} checked={this.state.isScaleOn} />
                                        </div>
                                    </div>
                                    <label className="form-control" htmlFor="changeScale">Put to scale</label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                );
    }
}