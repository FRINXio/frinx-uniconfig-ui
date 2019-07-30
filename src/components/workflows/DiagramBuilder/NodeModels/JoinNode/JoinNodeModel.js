import { NodeModel } from "storm-react-diagrams";
import { JoinNodePortModel } from "./JoinNodePortModel";
import * as _ from "lodash";
import {DefaultPortModel} from "storm-react-diagrams";
import {DiagramEngine} from "storm-react-diagrams";

export class JoinNodeModel extends NodeModel {

    name: string;
    color: string;
    ports: { [s: string]: DefaultPortModel };
    inputs: {};

    constructor(name: string = "Untitled", color: string = "rgb(0,192,255)", inputs: {}) {
        super("join");
        this.name = name;
        this.color = color;
        this.inputs = inputs;

        this.addPort(new JoinNodePortModel("left"));
        this.addPort(new JoinNodePortModel("right"));
    }

    deSerialize(object, engine: DiagramEngine) {
        super.deSerialize(object, engine);
        this.name = object.name;
        this.color = object.color;
    }

    serialize() {
        return _.merge(super.serialize(), {
            name: this.name,
            color: this.color
        });
    }

    getInputs() {
        return this.inputs;
    }
}
