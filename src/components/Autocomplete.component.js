import React, { Component } from "react";
import PropTypes            from "prop-types";

export class Autocomplete extends Component {
    
    static propTypes = {
        suggestions: PropTypes.instanceOf(Array),
        onChangeCallback: PropTypes.func
    };
    
    static defaultProperty = {
        placeholder: '',
        suggestions: [],
        onChangeCallback: null
    };
    
    constructor(props) {
        super(props);
        this.state = {
            highlightSuggestion: 0,
            filteredSuggestions: [],
            showSuggestions: false,
            inputValue: ""
        };
    }

    onChange = e => {
        if(this.props.onChangeCallback !== null)
            this.props.onChangeCallback(e);
        const {suggestions} = this.props;
        const inputValue = e.currentTarget.value;

        const filteredSuggestions = suggestions.filter(
                suggestion =>
            suggestion.value.toLowerCase().indexOf(inputValue.toLowerCase()) > -1
        );

        this.setState({
            highlightSuggestion: 0,
            filteredSuggestions,
            showSuggestions: true,
            inputValue: e.currentTarget.value,
            selectedKey: null
        });
    };
    onClick = e => {
        this.setState({
            highlightSuggestion: 0,
            filteredSuggestions: [],
            showSuggestions: false,
            inputValue: e.currentTarget.innerText,
            selectedKey: e.target.getAttribute('data-suggestion-key')
        });
    };
    onKeyDown = e => {
        const {highlightSuggestion, filteredSuggestions} = this.state;
        // ESC
        if (e.keyCode === 27) {
            this.setState({
                highlightSuggestion: 0,
                showSuggestions: false
            });
        }
        // ENTER
        else if (e.keyCode === 13) {
            e.preventDefault();
            this.setState({
                showSuggestions: false,
                inputValue: filteredSuggestions[highlightSuggestion].value,
                selectedKey: filteredSuggestions[highlightSuggestion].key
            });
        // UP
        } else if (e.keyCode === 38) {
            if (highlightSuggestion === 0) {
                return;
            }
            this.setState({highlightSuggestion: highlightSuggestion - 1});
        // DOWN
        } else if (e.keyCode === 40) {
            if (highlightSuggestion - 1 === filteredSuggestions.length) {
                return;
            }

            this.setState({highlightSuggestion: highlightSuggestion + 1});
        }
    };
            
    render() {
        const {
            onChange,
            onClick,
            onKeyDown,
            state: {
                highlightSuggestion,
                filteredSuggestions,
                showSuggestions,
                inputValue,
                selectedKey
            }
        } = this;
        let suggestionsListComponent;
        if (showSuggestions && inputValue) {
            if (filteredSuggestions.length) {
                suggestionsListComponent = (
                    <div className="suggestions rounded-bottom">
                        {filteredSuggestions.map((suggestion, index) => {
                            let className;
                            if (index === highlightSuggestion) {
                                className = "suggestion-active";
                            }
                            return (
                                <div className={className} key={suggestion.key} data-suggestion-key={suggestion.key} onClick={onClick}>
                                    {suggestion.value}
                                </div>
                            );
                        })}
                    </div>
                );
            }
        }

        return (
            <React.Fragment>
                <div className="autocomplete-container w-100">
                    <input
                        id={this.props.id}
                        className="form-control w-100"
                        type="text"
                        placeholder={this.props.placeholder}
                        onChange={onChange}
                        onKeyDown={onKeyDown}
                        onBlur={() => {this.setState({highlightSuggestion: 0, showSuggestions: false});}}
                        value={inputValue}
                        data-selected-key={selectedKey}
                    />
                    <div className="autocomplete-suggestions">
                        {suggestionsListComponent}
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

export default Autocomplete;