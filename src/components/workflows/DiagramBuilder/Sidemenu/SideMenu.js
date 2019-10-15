import React from "react";
import SideMenuItem from "./SideMenuItem";
import {getWfInputsRegex} from "../builder-utils";
import './Sidemenu.css'
import {Form, InputGroup, Spinner} from "react-bootstrap";
import SystemTask from "./SystemTask";

const SideMenu = (props) => {

    const functionalTaks = () => {
        let functionalTasks = [];

        props.functional.forEach((func, i) => {
            if (func === "fork") {
                let wfObject = {
                    name: "forkTask",
                    taskReferenceName: "forkTaskRef",
                    type: "FORK_JOIN",
                    forkTasks: [],
                    optional: false,
                    startDelay: 0
                };
                functionalTasks.push(<SystemTask id={`functionalNode${i}`} model={{type: func, wfObject}}
                                                   name={func.toUpperCase()}/>)
            } else if (func === "join") {
                let wfObject = {
                    name: "joinTask",
                    taskReferenceName: "joinTaskRef",
                    type: "JOIN",
                    joinOn: [],
                    optional: false,
                    startDelay: 0
                };
                functionalTasks.push(<SystemTask id={`functionalNode${i}`} model={{type: func, wfObject}}
                                                   name={func.toUpperCase()}/>)
            } else if (func === "decision") {
                let wfObject = {
                    name: "decisionTask",
                    taskReferenceName: "decisionTaskRef",
                    inputParameters: {
                        case_value_param: ""
                    },
                    type: "DECISION",
                    caseValueParam: "case_value_param",
                    decisionCases: {
                        false: [],
                        true: []
                    },
                    optional: false,
                    startDelay: 0
                };
                functionalTasks.push(<SystemTask id={`functionalNode${i}`} model={{type: func, wfObject}}
                                                   name={func.toUpperCase()}/>)
            } else {
                functionalTasks.push(<SystemTask id={`functionalNode${i}`} model={{type: func}}
                                                   name={func.toUpperCase()}/>)
            }
        });
        return functionalTasks;
    };

    const tasks = () => {
        let workflows = props.workflows || [];
        let tasks = [];

        workflows.map((wf, i) => {
            let wfObject = {
                name: wf.name,
                taskReferenceName: wf.name.toLowerCase().trim()
                    + "_ref_" + Math.random().toString(36).toUpperCase().substr(2, 4),
                inputParameters: getWfInputsRegex(wf),
                type: "SUB_WORKFLOW",
                subWorkflowParam: {
                    name: wf.name,
                    version: wf.version
                },
                optional: false,
                startDelay: 0
            };
            return tasks.push(
                <SideMenuItem key={`wf${i}`} model={{
                    type: "in/out",
                    wfObject,
                    name: wf.name,
                    description: wf.hasOwnProperty('description') ? wf.description : ''
                }} name={wf.name}/>
            )
        });
        return tasks.length > 0 ? tasks :
            <div style={{ marginTop: "50%", textAlign: "center"}}>
                Loading tasks<br/><br/>
                <Spinner animation="border" variant="primary"/>
            </div>
    };

    return (
        <div className="tray">
            <div className='tray-header'>
                <InputGroup>
                    <Form.Control value={props.query}
                                  onChange={(e) => props.updateQuery(e.target.value)}
                                  placeholder={`Search for tasks.`}/>
                    <InputGroup.Append>
                        <InputGroup.Text>
                            <i className="fas fa-search"/>
                        </InputGroup.Text>
                    </InputGroup.Append>
                </InputGroup>
                <div className='tray-header-info'>
                    <span style={{color: "grey"}}>
                        Drag & drop tasks to canvas
                    </span>
                    <span style={{color: "grey"}}>
                        showing {tasks().length} results
                    </span>
                </div>
            </div>

            <div className='tray-list'>
                <div className='tray-system'>
                    {functionalTaks()}
                </div>
                {tasks()}
            </div>
        </div>
    )
};

export default SideMenu;



