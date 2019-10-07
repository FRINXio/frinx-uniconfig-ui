import React, {Component} from "react";
import SideMenu from "./SideMenu";
import {DiagramWidget} from "storm-react-diagrams";
import ControlsHeader from "./ControlsHeader";
import {Application} from "./Application";
import {CircleStartNodeModel} from "./NodeModels/StartNode/CircleStartNodeModel";
import {CircleEndNodeModel} from "./NodeModels/EndNode/CircleEndNodeModel";
import {DefaultNodeModel} from "./NodeModels/DefaultNodeModel/DefaultNodeModel";
import SubwfModal from "./SubwfModal/SubwfModal";
import * as builderActions from "../../../store/actions/builder";
import {connect} from "react-redux";
import {
    getEndNode,
    getLinksArray, getNodeWidth,
    getStartNode,
    getWfInputs,
    handleDecideNode,
    handleForkNode, linkNodes,
    transform_workflow_to_diagram
} from "./builder-utils";
import {ForkNodeModel} from "./NodeModels/ForkNode/ForkNodeModel";
import {JoinNodeModel} from "./NodeModels/JoinNode/JoinNodeModel";
import {Toolkit} from "storm-react-diagrams";
import {DecisionNodeModel} from "./NodeModels/DecisionNode/DecisionNodeModel";
import CustomAlert from "./CustomAlert";
import WorkflowDefModal from "./WorkflowDefModal/WorkflowDefModal";
import GeneralInfoModal from "./GeneralInfoModal/GeneralInfoModal";
import DetailsModal from "../WorkflowList/WorkflowExec/DetailsModal/DetailsModal";
import InputModal from "../WorkflowList/WorkflowDefs/InputModal/InputModal";
import * as _ from "lodash";
import './DiagramBuilder.css'
import {Button, Modal} from "react-bootstrap";

const http = require('../../../server/HttpServerSide').HttpClient;

class DiagramBuilder extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showSubWfModal: false,
            showDefinitionModal: false,
            showGeneralInfoModal: true,
            showInputModal: false,
            showDetailsModal: false,
            showExitModal: false,
            modalInputs: null,
            saveExecuteError: null,
            app: new Application()
        };

        this.parseDiagramToJSON = this.parseDiagramToJSON.bind(this);
        this.showDefinitionModal = this.showDefinitionModal.bind(this);
        this.showGeneralInfoModal = this.showGeneralInfoModal.bind(this);
        this.redirectOnExit = this.redirectOnExit.bind(this);
        this.showInputModal = this.showInputModal.bind(this);
        this.showDetailsModal = this.showDetailsModal.bind(this);
        this.showExitModal = this.showExitModal.bind(this);
        this.saveAndExecute = this.saveAndExecute.bind(this);
        this.expandNodeToWorkflow = this.expandNodeToWorkflow.bind(this);
        this.renderSelectedWorkflow = this.renderSelectedWorkflow.bind(this);
        this.clearCanvas = this.clearCanvas.bind(this)
    }

    componentDidMount() {
        document.addEventListener('dblclick', this.doubleClickListener.bind(this));
        document.addEventListener("keydown", this.keyBindings.bind(this), false);

        http.get('/api/conductor/metadata/workflow').then(res => {
            this.props.storeWorkflows(res.result || [])
        });

        if (!_.isEmpty(this.props.match.params)) {
            const {name, version} = this.props.match.params;
            http.get('/api/conductor/metadata/workflow/' + name + '/' + version).then(res => {
                this.renderSelectedWorkflow(res.result)
            }).catch(() => {
                return this.props.showCustomAlert(true, "danger", `Cannot find selected sub-workflow: ${name}.`);
            });
        } else {
            this.placeStartEndOnCanvas({x: 900, y: 300}, {x: 1200, y: 300});
            this.props.showCustomAlert(true, "primary", "Start to drag & drop tasks from left menu on canvas.")
        }
    }

    componentWillUnmount() {
        this.props.resetToDefaultWorkflow();
    }

    clearCanvas() {
        const diagramEngine = this.state.app.getDiagramEngine();
        const activeModel = diagramEngine.getDiagramModel();
        diagramEngine.setDiagramModel(activeModel);

        _.values(activeModel.getNodes()).forEach(node => {
            activeModel.removeNode(node);
        });

        _.values(activeModel.getLinks()).forEach(link => {
            activeModel.removeLink(link);
        });
    };

    renderSelectedWorkflow(definition) {
        this.setState({showGeneralInfoModal: false});

        this.clearCanvas();
        this.props.updateFinalWorkflow(definition);
        this.props.showCustomAlert(true, "info", `Editing workflow ${definition.name} / ${definition.version}.`);
        this.props.lockWorkflowName();

        const expandedNodes = transform_workflow_to_diagram(definition, {x: 900, y: 300}, this.state.app);

        const diagramEngine = this.state.app.getDiagramEngine();
        const diagramModel = diagramEngine.getDiagramModel();
        const firstNode = expandedNodes[0];
        const lastNode = expandedNodes[expandedNodes.length - 1];

        const {start, end} = this.placeStartEndOnCanvas({
            x: firstNode.x - 150,
            y: firstNode.y
        }, {
            x: lastNode.x + getNodeWidth(lastNode) + 110,
            y: lastNode.y
        });

        diagramModel.addAll(linkNodes(start, firstNode), linkNodes(lastNode, end));
        diagramEngine.zoomToFit();
        diagramEngine.zoomToFit();
        diagramEngine.setDiagramModel(diagramModel);
        diagramEngine.repaintCanvas();

    }

    keyBindings(e) {
        // CTRL + S
        if ((window.navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey) && e.keyCode === 83) {
            e.preventDefault();
            this.saveAndExecute()
        }
    }

    doubleClickListener(event) {
        let diagramEngine = this.state.app.getDiagramEngine();
        let diagramModel = diagramEngine.getDiagramModel();
        let element = Toolkit.closest(event.target, ".node[data-nodeid]");
        let node = null;

        if (element) {
            node = diagramModel.getNode(element.getAttribute("data-nodeid"));
            if (node && node.type !== "start" && node.type !== "end") {
                node.setSelected(false);
                this.setState({
                    showSubWfModal: true,
                    modalInputs: {inputs: node.extras.inputs, id: node.id}
                });
            }
        }
    }

    placeStartEndOnCanvas(startPos, endPos) {
        let diagramEngine = this.state.app.getDiagramEngine();
        let activeModel = diagramEngine.getDiagramModel();

        diagramEngine.setDiagramModel(activeModel);

        let start = new CircleStartNodeModel("Start");
        let end = new CircleEndNodeModel("End");

        start.setPosition(startPos.x, startPos.y);
        end.setPosition(endPos.x, endPos.y);
        activeModel.addAll(start, end);
        return {start, end}
    }

    onDropHandler(e) {
        let data = JSON.parse(e.dataTransfer.getData("storm-diagram-node"));
        let node = null;

        this.props.showCustomAlert(false);

        switch (data.type) {
            case "in/out":
                node = new DefaultNodeModel(data.name, "rgb(169,74,255)", data.wfObject);
                node.addInPort("In");
                node.addOutPort("Out");
                break;
            case "start":
                node = new CircleStartNodeModel(data.name);
                break;
            case "end":
                node = new CircleEndNodeModel(data.name);
                break;
            case "fork":
                node = new ForkNodeModel(data.wfObject.name, "rgb(108,49,160)", data.wfObject);
                break;
            case "join":
                node = new JoinNodeModel(data.wfObject.name, "rgb(108,49,160)", data.wfObject);
                break;
            case "decision":
                node = new DecisionNodeModel(data.wfObject.name, "rgb(108,49,160)", data.wfObject);
                break;
            default:
                break
        }

        let points = this.state.app.getDiagramEngine().getRelativeMousePoint(e);
        node.x = points.x;
        node.y = points.y;
        this.state.app
            .getDiagramEngine()
            .getDiagramModel()
            .addNode(node);

        this.forceUpdate();
    }

    parseDiagramToJSON() {
        try {
            let links = this.state.app.getDiagramEngine().getDiagramModel().getLinks();
            let parentNode = getStartNode(links);
            let endNode = getEndNode(links);
            let linksArray = _.values(links);
            let tasks = [];

            this.props.showCustomAlert(false);

            if (!parentNode) {
                return this.props.showCustomAlert(true, "danger", "Start node is not connected.");
            }
            if (!endNode) {
                return this.props.showCustomAlert(true, "danger", "End node is not connected.");
            }

            while (parentNode.type !== "end") {
                for (let i = 0; i < linksArray.length; i++) {
                    let link = linksArray[i];

                    if (link.sourcePort.parent === parentNode) {
                        switch (link.targetPort.type) {
                            case "fork":
                                let {forkNode, joinNode} = handleForkNode(link.targetPort.getNode());
                                tasks.push(forkNode.extras.inputs, joinNode.extras.inputs);
                                parentNode = joinNode;
                                break;
                            case "decision":
                                let {decideNode, firstNeutralNode} = handleDecideNode(link.targetPort.getNode());
                                tasks.push(decideNode.extras.inputs);
                                if (firstNeutralNode) {
                                    if (firstNeutralNode.extras.inputs) {
                                        tasks.push(firstNeutralNode.extras.inputs);
                                    }
                                    parentNode = firstNeutralNode;
                                } else {
                                    return this.props.showCustomAlert(true, "danger", "Default decision route is missing.");
                                }
                                break;
                            case "end":
                                parentNode = link.targetPort.parent;
                                break;
                            default:
                                parentNode = link.targetPort.parent;
                                tasks.push(parentNode.extras.inputs);
                                break;
                        }
                    }
                }
            }

            let finalWf = {...this.props.finalWorkflow};

            // handle input params
            if (Object.keys(getWfInputs(finalWf)).length < 1) {
                finalWf.inputParameters = [];
            }

            // handle tasks
            finalWf.tasks = tasks;

            this.props.updateFinalWorkflow(finalWf);

            return finalWf;
        } catch (e) {
            return this.props.showCustomAlert(true, "danger", "Could not parse JSON.");
        }
    }

    expandNodeToWorkflow() {
        const diagramModel = this.state.app.getDiagramEngine().getDiagramModel();
        let selectedNodes = diagramModel.getSelectedItems();

        this.props.showCustomAlert(false);

        selectedNodes = selectedNodes.filter(item => {
            return item.getType() === "default"
        });

        selectedNodes.forEach(selectedNode => {

            if (!selectedNode.extras.inputs.subWorkflowParam) {
                return this.props.showCustomAlert(true, "danger", "Simple task can't be expanded.");
            }

            const {name, version} = selectedNode.extras.inputs.subWorkflowParam;
            const {x, y} = selectedNode;
            const inputLink = getLinksArray("in", selectedNode)[0];
            const outputLink = getLinksArray("out", selectedNode)[0];

            if (!inputLink || !outputLink) {
                return this.props.showCustomAlert(true, "danger", "Selected node is not connected.");
            }

            const inputLinkParent = inputLink.sourcePort.getNode();
            const outputLinkParent = outputLink.targetPort.getNode();

            http.get('/api/conductor/metadata/workflow/' + name + '/' + version).then((res, err) => {
                const expandedNodes = transform_workflow_to_diagram(res.result, {x, y}, this.state.app);

                const diagramEngine = this.state.app.getDiagramEngine();
                const diagramModel = diagramEngine.getDiagramModel();
                const firstNode = expandedNodes[0];
                const lastNode = expandedNodes[expandedNodes.length - 1];

                selectedNode.remove();
                diagramModel.removeNode(selectedNode);
                diagramModel.removeLink(inputLink);
                diagramModel.removeLink(outputLink);

                diagramEngine.zoomToFit();
                diagramEngine.zoomToFit();
                diagramModel.addAll(linkNodes(inputLinkParent, firstNode), linkNodes(lastNode, outputLinkParent));
                diagramEngine.setDiagramModel(diagramModel);
                setTimeout(() => diagramEngine.repaintCanvas(), 10);
                this.forceUpdate()
            }).catch(() => {
                return this.props.showCustomAlert(true, "danger", `Cannot find selected sub-workflow: ${name}.`);
            })
        });
    }

    saveAndExecute() {
        let finalWf = this.parseDiagramToJSON();
        http.put('/api/conductor/metadata', [finalWf]).then(res => {
            this.showInputModal();
        }).catch(err => {
            let errObject = JSON.parse(err.response.text);
            if (errObject.validationErrors) {
                const {path, message} = errObject.validationErrors[0];
                this.props.showCustomAlert(true, "danger", path + ':\xa0\xa0\xa0' + message);
            }
            this.setState({saveExecuteError: true});
        })
    }

    /// * modal handlers * ///
    subwfModalHandler() {
        this.setState({
            showSubWfModal: !this.state.showSubWfModal
        })
    }

    showDefinitionModal() {
        this.parseDiagramToJSON();
        this.setState({
            showDefinitionModal: !this.state.showDefinitionModal
        })
    }

    showGeneralInfoModal() {
        if (this.props.isWfNameLocked && this.state.showGeneralInfoModal === false) {
            this.parseDiagramToJSON()
        }
        this.setState({
            showGeneralInfoModal: !this.state.showGeneralInfoModal
        })
    }

    showDetailsModal() {
        this.setState({
            showDetailsModal: !this.state.showDetailsModal
        })
    }

    showExitModal() {
        this.setState({
            showExitModal: !this.state.showExitModal
        })
    }

    showInputModal() {
        if (this.state.showInputModal) {
            this.showDetailsModal()
        }
        this.setState({
            showInputModal: !this.state.showInputModal
        });
    }

    saveNodeInputsHandler(savedInputs, id) {
        let nodes = this.state.app.getDiagramEngine().getDiagramModel().getNodes();

        _.values(nodes).forEach(node => {
            if (node.id === id) {
                node.extras.inputs = savedInputs;
            }
        });
    }

    redirectOnExit() {
        this.props.history.push('/workflows/defs');
    }

    render() {

        let subWfModal = this.state.showSubWfModal ?
            <SubwfModal modalHandler={this.subwfModalHandler.bind(this)} inputs={this.state.modalInputs}
                        saveInputs={this.saveNodeInputsHandler.bind(this)}/> : null;

        let definitionModal = this.state.showDefinitionModal ?
            <WorkflowDefModal definition={this.props.finalWorkflow}
                              modalHandler={this.showDefinitionModal}
                              show={this.state.showDefinitionModal}
                              renderSelectedWorkflow={this.renderSelectedWorkflow}/>: null;

        let generalInfoModal = this.state.showGeneralInfoModal ?
            <GeneralInfoModal definition={this.props.finalWorkflow}
                              workflows={this.props.workflows}
                              modalHandler={this.showGeneralInfoModal}
                              saveInputs={this.props.updateFinalWorkflow}
                              show={this.state.showGeneralInfoModal}
                              lockWorkflowName={this.props.lockWorkflowName}
                              isWfNameLocked={this.props.isWfNameLocked}
                              redirectOnExit={this.redirectOnExit}/> : null;

        let inputModal = this.state.showInputModal ?
            <InputModal wf={this.props.finalWorkflow.name + " / " + this.props.finalWorkflow.version}
                        modalHandler={this.showInputModal}
                        show={this.state.showInputModal} fromBuilder/> : null;

        let detailsModal = this.state.showDetailsModal ?
            <DetailsModal wfId={this.props.workflowId} modalHandler={this.showDetailsModal}
                          show={this.state.showDetailsModal} fromBuilder/> : null;

        let exitModal = this.state.showExitModal ?
            <Modal show={this.state.showExitModal}>
                <Modal.Header>
                    <Modal.Title>Do you want to exit builder?</Modal.Title>
                </Modal.Header>
                <Modal.Body>All changes will be lost.</Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-primary" onClick={this.showExitModal}>Cancel</Button>
                    <Button variant="danger" onClick={this.redirectOnExit}>Exit</Button>
                </Modal.Footer>
            </Modal> : null;

        return (
            <div className="body">
                {subWfModal}
                {definitionModal}
                {generalInfoModal}
                {inputModal}
                {detailsModal}
                {exitModal}
                {/*<div className="builder-header"/>*/}

                <ControlsHeader
                    parseWftoJSON={this.parseDiagramToJSON}
                    showDefinitionModal={this.showDefinitionModal}
                    showGeneralInfoModal={this.showGeneralInfoModal}
                    showExitModal={this.showExitModal}
                    saveAndExecute={this.saveAndExecute}
                    expandNodeToWorkflow={this.expandNodeToWorkflow}
                    query={this.props.query}
                    updateQuery={this.props.updateQuery}
                    updateCategory={this.props.updateCategory}
                    updateSidebar={this.props.updateSidebar}
                    sidebarShown={this.props.sidebarShown}
                    category={this.props.category}
                    app={this.state.app}/>


                <div className="content">
                    <SideMenu show={this.props.sidebarShown} category={this.props.category}
                              workflows={this.props.workflows} functional={this.props.functional}/>

                    <CustomAlert showCustomAlert={this.props.showCustomAlert} show={this.props.customAlert.show}
                                 msg={this.props.customAlert.msg} alertVariant={this.props.customAlert.variant}/>

                    <div
                        className="diagram-layer"
                        onDrop={(e) => this.onDropHandler(e)}
                        onDragOver={event => {
                            event.preventDefault();
                        }}>

                        <DiagramWidget className="srd-demo-canvas" smartRouting={this.props.smartRouting}
                                       diagramEngine={this.state.app.getDiagramEngine()}/>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        workflows: state.buildReducer.workflows,
        functional: state.buildReducer.functional,
        sidebarShown: state.buildReducer.sidebarShown,
        category: state.buildReducer.category,
        query: state.buildReducer.query,
        finalWorkflow: state.buildReducer.finalWorkflow,
        smartRouting: state.buildReducer.switchSmartRouting,
        customAlert: state.buildReducer.customAlert,
        isWfNameLocked: state.buildReducer.workflowNameLock,
        workflowId: state.buildReducer.executedWfId,
    }
};

const mapDispatchToProps = dispatch => {
    return {
        storeWorkflows: (wfList) => dispatch(builderActions.storeWorkflows(wfList)),
        updateFinalWorkflow: (finalWorkflow) => dispatch(builderActions.updateFinalWorkflow(finalWorkflow)),
        resetToDefaultWorkflow: () => dispatch(builderActions.resetToDefaultWorkflow()),
        updateSidebar: (isShown) => dispatch(builderActions.updateSidebar(isShown)),
        updateQuery: (query) => dispatch(builderActions.requestUpdateByQuery(query)),
        updateCategory: (category) => dispatch(builderActions.updateCategory(category)),
        showCustomAlert: (show, variant, msg) => dispatch(builderActions.showCustomAlert(show, variant, msg)),
        lockWorkflowName: () => dispatch(builderActions.lockWorkflowName())
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(DiagramBuilder);
