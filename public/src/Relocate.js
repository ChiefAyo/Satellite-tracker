class Relocate extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            location: '',
            appVersion: '',
            label: 'Locate'
        }
    }

    render() {
        return(
            <input type = "button" value = {this.state.label}/>
        )
    }

}