import * as React from "react";
import { PortWidget } from "storm-react-diagrams";

export class CircleNodeStart extends React.Component {

    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <div className={"circle-node"}>
                <svg width="100" height="100">
                    <g>
                        <circle cx="50" cy="50" r="30" stroke="black" strokeWidth="3" fill="white" />
                        <text x="33" y="56" >Start</text>
                    </g>
                </svg>
                <div style={{position: "absolute", zIndex: 10, left: 75, top: 45}}>
                    <PortWidget name="right" node={this.props.node} />
                </div>
            </div>
        );
    }
}