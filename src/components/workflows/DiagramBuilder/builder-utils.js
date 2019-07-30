import {CircleStartNodeModel} from "./NodeModels/StartNode/CircleStartNodeModel";
import {DefaultNodeModel} from "./NodeModels/DefaultNodeModel/DefaultNodeModel";
import {CircleEndNodeModel} from "./NodeModels/EndNode/CircleEndNodeModel";
import * as _ from "lodash";
import {ForkNodeModel} from "./NodeModels/ForkNode/ForkNodeModel";
import {JoinNode} from "./NodeModels/JoinNode/JoinNode";
import {JoinNodeModel} from "./NodeModels/JoinNode/JoinNodeModel";
import {ForkNode} from "./NodeModels/ForkNode/ForkNode";

export const getWfInputs = (wf) => {
    let taskArray = wf.tasks;
    let inputParams = [];
    let inputParameters = {};

    taskArray.forEach(task => {
        if (task !== undefined) {
            if (task.inputParameters) {
                inputParams.push(task.inputParameters)
            }
        }
    });

    for (let i = 0; i < inputParams.length; i++) {
        inputParameters = {...inputParameters, ...inputParams[i]}
    }

    return inputParameters;
};

export const createMountAndCheckExample = (app, props) => {
    let diagramEngine = app.getDiagramEngine();
    let activeModel = diagramEngine.getDiagramModel();

    diagramEngine.setDiagramModel(activeModel);
    _.values(activeModel.getNodes()).forEach(node => {
        activeModel.removeNode(node);
    });

    let wf1 = {}, wf2 = {};
    props.workflows.forEach(wf => {
        if (wf.name === "Mount_cli_device") {
            wf1 = {
                name: "",
                taskReferenceName: "",
                inputParameters: getWfInputs(wf),
                type: "SUB_WORKFLOW",
                subWorkflowParam: {
                    name: wf.name,
                    version: 1
                },
                optional: false
            };
        } else if (wf.name === "Check_connection_cli_device") {
            wf2 = {
                name: "",
                taskReferenceName: "",
                inputParameters: getWfInputs(wf),
                type: "SUB_WORKFLOW",
                subWorkflowParam: {
                    name: wf.name,
                    version: 1
                },
                optional: false
            };
        }
    });

    let start = new CircleStartNodeModel("Start");
    start.setPosition(700, 120);

    let node1 = new DefaultNodeModel("Mount_cli_device","rgb(169,74,255)", wf1 );
    let node1InPort = node1.addInPort("In");
    let node1OutPort = node1.addOutPort("Out");
    node1.setPosition(start.x + 200, 100);

    let node2 = new DefaultNodeModel("Check_connection_cli_device","rgb(169,74,255)", wf2 );
    let node2InPort = node2.addInPort("In");
    let node2OutPort = node2.addOutPort("Out");
    node2.setPosition(node1.x + 200, 100);

    let end = new CircleEndNodeModel("End");
    end.setPosition(node2.x + 250, 120);

    let link1 = node1InPort.link(start.getPort("right"));
    let link2 = node1OutPort.link(node2InPort);
    let link3 = node2OutPort.link(end.getPort("left"));

    activeModel.addAll(start, end, node1, node2, link1, link2, link3);
    setTimeout(() => diagramEngine.repaintCanvas(), 10);

    return app.getDiagramEngine().getDiagramModel().getNodes();
};

export const createSampleBatchInventoryRetrievalExample = (app, props) => {
    let diagramEngine = app.getDiagramEngine();
    let activeModel = diagramEngine.getDiagramModel();

    diagramEngine.setDiagramModel(activeModel);
    _.values(activeModel.getNodes()).forEach(node => {
        activeModel.removeNode(node);
    });

    _.values(activeModel.getLinks()).forEach(link => {
        activeModel.removeLink(link);
    });

    let wf1 = {}, wf2 = {}, wf3 = {};
    props.workflows.forEach(wf => {
        if (wf.name === "Mount_and_check") {
            wf1 = {
                name: "sub_mount",
                taskReferenceName: "",
                inputParameters: getWfInputs(wf),
                type: "SUB_WORKFLOW",
                subWorkflowParam: {
                    name: wf.name,
                    version: 1
                },
                optional: false
            };
        } if (wf.name === "Read_structured_device_data_in_unified") {
            wf2 = {
                name: "sub_read",
                taskReferenceName: "",
                inputParameters: getWfInputs(wf),
                type: "SUB_WORKFLOW",
                subWorkflowParam: {
                    name: wf.name,
                    version: 1
                },
                optional: false
            };
        } if (wf.name === "Unmount_cli_device") {
            wf3 = {
                name: "sub_unmount",
                taskReferenceName: "",
                inputParameters: getWfInputs(wf),
                type: "SUB_WORKFLOW",
                subWorkflowParam: {
                    name: wf.name,
                    version: 1
                },
                optional: false
            };
        }

    });

    let forkObject = {
        name: "forkTask",
        taskReferenceName: "forkTaskRef",
        type: "FORK_JOIN",
        forkTasks: [],
        optional: false,
        startDelay: 0
    };

    let joinObject = {
        name: "joinTask",
        taskReferenceName: "joinTaskRef",
        type: "JOIN",
        joinOn: [],
        optional: false,
        startDelay: 0
    };

    let start = new CircleStartNodeModel("Start");
    start.setPosition(700, 122);

    let fork1 = new ForkNodeModel("fork", null, forkObject);
    fork1.setPosition(start.x + 150, 135);
    let fork1Left = fork1.getPort("left");
    let fork1Right = fork1.getPort("right");

    let mount1 = new DefaultNodeModel("Mount_and_check","rgb(169,74,255)", wf1 );
    let mount1InPort = mount1.addInPort("In");
    let mount1OutPort = mount1.addOutPort("Out");
    mount1.setPosition(fork1.x + 200, 70);

    let mount2 = new DefaultNodeModel("Mount_and_check","rgb(169,74,255)", wf1 );
    let mount2InPort = mount2.addInPort("In");
    let mount2OutPort = mount2.addOutPort("Out");
    mount2.setPosition(fork1.x + 200, 135);

    let mount3 = new DefaultNodeModel("Mount_and_check","rgb(169,74,255)", wf1 );
    let mount3InPort = mount3.addInPort("In");
    let mount3OutPort = mount3.addOutPort("Out");
    mount3.setPosition(fork1.x + 200, 200);

    let join1 = new JoinNodeModel("join", null, joinObject);
    join1.setPosition(mount2.x + 200, 135);
    let join1Left = join1.getPort("left");
    let join1Right = join1.getPort("right");

    let fork2 = new ForkNodeModel("fork", null, forkObject);
    fork2.setPosition(join1.x + 120, 135);
    let fork2Left = fork2.getPort("left");
    let fork2Right = fork2.getPort("right");

    let read1 = new DefaultNodeModel("Read_structured_device_data_in_unified","rgb(169,74,255)", wf1 );
    let read1InPort = read1.addInPort("In");
    let read1OutPort = read1.addOutPort("Out");
    read1.setPosition(fork2.x + 200, 70);

    let read2 = new DefaultNodeModel("Read_structured_device_data_in_unified","rgb(169,74,255)", wf2 );
    let read2InPort = read2.addInPort("In");
    let read2OutPort = read2.addOutPort("Out");
    read2.setPosition(fork2.x + 200, 135);

    let read3 = new DefaultNodeModel("Read_structured_device_data_in_unified","rgb(169,74,255)", wf2 );
    let read3InPort = read3.addInPort("In");
    let read3OutPort = read3.addOutPort("Out");
    read3.setPosition(fork2.x + 200, 200);

    let join2 = new JoinNodeModel("join", null, joinObject);
    join2.setPosition(read2.x + 300, 135);
    let join2Left = join2.getPort("left");
    let join2Right = join2.getPort("right");

    let fork3 = new ForkNodeModel("join", null, forkObject);
    fork3.setPosition(join2.x + 120, 135);
    let fork3Left = fork3.getPort("left");
    let fork3Right = fork3.getPort("right");

    let unmount1 = new DefaultNodeModel("Unmount_cli_device","rgb(169,74,255)", wf3 );
    let unmount1InPort = unmount1.addInPort("In");
    let unmount1OutPort = unmount1.addOutPort("Out");
    unmount1.setPosition(fork3.x + 200, 70);

    let unmount2 = new DefaultNodeModel("Unmount_cli_device","rgb(169,74,255)", wf3 );
    let unmount2InPort = unmount2.addInPort("In");
    let unmount2OutPort = unmount2.addOutPort("Out");
    unmount2.setPosition(fork3.x + 200, 135);

    let unmount3 = new DefaultNodeModel("Unmount_cli_device","rgb(169,74,255)", wf3 );
    let unmount3InPort = unmount3.addInPort("In");
    let unmount3OutPort = unmount3.addOutPort("Out");
    unmount3.setPosition(fork3.x + 200, 200);

    let join3 = new JoinNodeModel("join", null, joinObject);
    join3.setPosition(unmount2.x + 200, 135);
    let join3Left = join3.getPort("left");
    let join3Right = join3.getPort("right");

    let end = new CircleEndNodeModel("End");
    end.setPosition(join3.x + 150, 122);


    let link1 = start.getPort("right").link(fork1Left);

    let link2 = fork1Right.link(mount1InPort);
    let link3 = fork1Right.link(mount2InPort);
    let link4 = fork1Right.link(mount3InPort);

    let link5 = mount1OutPort.link(join1Left);
    let link6 = mount2OutPort.link(join1Left);
    let link7 = mount3OutPort.link(join1Left);

    let link8 = join1Right.link(fork2Left);

    let link9 = fork2Right.link(read1InPort);
    let link10 = fork2Right.link(read2InPort);
    let link11 = fork2Right.link(read3InPort);

    let link12 = read1OutPort.link(join2Left);
    let link13 = read2OutPort.link(join2Left);
    let link14 = read3OutPort.link(join2Left);

    let link15 = join2Right.link(fork3Left);

    let link16 = fork3Right.link(unmount1InPort);
    let link17 = fork3Right.link(unmount2InPort);
    let link18 = fork3Right.link(unmount3InPort);

    let link19 = unmount1OutPort.link(join3Left);
    let link20 = unmount2OutPort.link(join3Left);
    let link21 = unmount3OutPort.link(join3Left);

    let link22 = join3Right.link(end.getPort("left"));

    activeModel.addAll(link1, link2, link3, link4, link5, link6, link7, link8, link9, link10, link11, link12, link13, link14, link15, link16, link17, link18, link19, link20, link21, link22);
    activeModel.addAll(start, mount1, mount2, mount3, fork1, join1, fork2, read1, read2, read3, join2, fork3, unmount1, unmount2, unmount3, join3, end);

    activeModel.setZoomLevel(95);
    activeModel.setOffsetX(-630);
    activeModel.setOffsetY(200);

    setTimeout(() => diagramEngine.repaintCanvas(), 10);

    return app.getDiagramEngine().getDiagramModel().getNodes();
};