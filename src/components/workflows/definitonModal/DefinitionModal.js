import React, { Component } from 'react';
import { Modal, Button } from "react-bootstrap";
const http = require('../../../server/HttpServerSide').HttpClient;


class DefinitionModal extends Component {
    constructor(props, context) {
        super(props, context);

        this.handleClose = this.handleClose.bind(this);

        this.state = {
            isNotParsable: false,
            editingJSON: false,
            show: true,
            def: "",
            reloading: false,
            modified: false,
        };
    }

    componentDidMount() {
        let name = this.props.wf.split(" / ")[0];
        let version = this.props.wf.split(" / ")[1];
        http.get('/api/conductor/metadata/workflow/' + name + '/' + version).then(res => {
            this.setState({
                def: JSON.stringify(res.result, null, 2)
            })
        })
    }

    handleClose() {
        this.setState({ show: false });
        this.props.modalHandler()
    }

    editJSONswitch(e, which) {
        let parseErr = null;
        this.setState({
            isNotParsable: false
        });
        if(which === 1) {
            if(this.state.editingJSON) {
                try {
                    console.log(this.state.def)
                } catch (e) {
                    parseErr = e;
                }
                if (parseErr == null) {
                    this.setState({wfs: this.editor.innerText});
                    let toBeSent = JSON.parse("[" + this.editor.innerText + "]");
                    this.setState({
                        reloading: true
                    });
                    http.put('/api/conductor/metadata/', toBeSent).then(() =>
                        window.location.reload()
                    )
                } else {
                    this.setState({isNotParsable: true});
                }
            }
        } else {
            this.editor.innerHTML = this.state.def;
        }
        if(parseErr == null) {
            this.setState({
                editingJSON: !this.state.editingJSON
            });
        }
        this.forceUpdate();
    }

    onKeyPress(e) {
        this.checkIfModified();
    }

    checkIfModified() {
        var current = this.editor.innerHTML.replace(/"/g, "'");
        var original = this.state.def.replace(/"/g, "'");

        if (current === original) {
            this.setState({modified: false})
        } else {
            this.setState({modified: true})
        }
    }
    render() {
        return (
            <Modal size="xl" show={this.state.show} onHide={this.handleClose}>
                <Modal.Header>
                    <Modal.Title>{this.props.wf}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <span id="json-modified-info" style={{ display: this.state.modified ? 'inline-block' : 'none' }}>
                    * Modified
                    </span>
                    <div style={{marginTop: '10px', display: this.state.isNotParsable ? "block" : "none"}} className="alert alert-warning" role="alert">{this.state.isNotParsable ? "Could not parse JSON. Is the syntax correct?" : ""}</div>
                    <code style={{fontSize: "17px"}}>
                            <pre ref={elem => this.editor = elem}
                                contentEditable={this.state.editingJSON}
                                 className={this.state.editingJSON ? 'editingPre' : 'nonEditingPre'}
                                 style={{maxHeight: "600px"}}
                                dangerouslySetInnerHTML= {{ __html: this.state.def }}
                                onKeyUp={this.onKeyPress.bind(this)}>
                            </pre>
                    </code>
                </Modal.Body>
                <Modal.Footer>
                    <Button className="secondary" onClick={(e) => this.editJSONswitch(e, 2)}
                            style={{display: this.state.editingJSON ? 'inline-block' : 'none'}} >
                        Cancel
                    </Button>
                    <Button className="btn primary" onClick={(e) => this.editJSONswitch(e, 1)}
                            disabled={this.state.reloading || (this.state.editingJSON && !this.state.modified)}>
                        {this.state.editingJSON ? 'Save' : 'Edit'}
                    </Button>
                    <Button variant="secondary" onClick={this.handleClose}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }
}

export default DefinitionModal;