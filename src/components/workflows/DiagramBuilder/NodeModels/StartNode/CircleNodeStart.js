import * as React from "react";
import { PortWidget } from "storm-react-diagrams";

export class CircleNodeStart extends React.Component {

    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <div className={"srd-circle-node"}>
                <svg width="60" height="60">
                    <g>
                        <circle cx="30" cy="30" r="30" fill="white"/>
                        <text x="13" y="35" >Start</text>
                    </g>
                </svg>
                <div style={{position: "absolute", zIndex: 10, left: 60, top: 25}}>
                    <PortWidget name="right" node={this.props.node} />
                </div>
            </div>
        );
    }
}
