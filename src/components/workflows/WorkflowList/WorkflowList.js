import React, {Component} from 'react';
import {Container, Tab, Tabs} from 'react-bootstrap'
import WorkflowDefs from "./WorkflowDefs/WorkflowDefs";
import WorkflowExec from "./WorkflowExec/WorkflowExec";
import {withRouter} from "react-router-dom";

class WorkflowList extends Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }

    changeUrl(e) {
        this.props.history.push('/workflows/' + e)
    }

    render() {
        let query = this.props.match.params.wfid ? this.props.match.params.wfid : null;

        return (
            <Container style={{textAlign: "left", marginTop: "20px"}}>
                <h1 style={{marginBottom: "20px"}}><i style={{color: 'grey'}} className="fas fa-cogs"/>&nbsp;&nbsp;Workflows
                </h1>
                <Tabs onSelect={(e) => this.changeUrl(e)} defaultActiveKey={this.props.match.params.type || "defs"} style={{marginBottom: "20px"}}>
                    <Tab eventKey="defs" title="Definitions">
                        <WorkflowDefs/>
                    </Tab>
                    <Tab mountOnEnter eventKey="exec" title="Executed">
                        <WorkflowExec query={query}/>
                    </Tab>
                    <Tab eventKey="contact" title="Scheduled" disabled>
                    </Tab>
                </Tabs>
            </Container>
        )
    }
}

export default withRouter(WorkflowList)