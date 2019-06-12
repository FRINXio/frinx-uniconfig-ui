import React, {Component} from 'react';
import {Button, Accordion, Card, Col, Container, Form, FormGroup, Row, Table} from 'react-bootstrap'
import {library} from '@fortawesome/fontawesome-svg-core'
import {faSync} from '@fortawesome/free-solid-svg-icons'
import './WorkflowList.css'
const http = require('../../../server/HttpServerSide').HttpClient;

class WorkflowList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            keywords: "",
            data: [],
            table: [],
            highlight: [],
            defaultPages: 20,
            pagesCount: 1,
            viewedPage: 1,
            activeRow: null
        };
        library.add(faSync);
        this.table = React.createRef();
        this.onEditSearch = this.onEditSearch.bind(this);
    }

    componentWillMount() {
        this.search();
    }

    componentDidMount() {
        http.get('/api/conductor/metadata/workflow').then(res => {
            console.log(res);
            this.setState({
                data: res.result
            })
        })
    }

    onEditSearch(event){
        this.setState({keywords: event.target.value}, () =>{
            this.search()
        })
    }

    search() {
        let toBeRendered = [];
        let toBeHighlited = [];
        let query = this.state.keywords.toUpperCase();
        if(query !== ""){
            const rows = this.state.data;
            for(let i = 0; i < rows.length; i++){
                for(let y = 1; y < Object.values(rows[i]).length; y++){
                    if(Object.values(rows[i])[y] && Object.values(rows[i])[y].toString().toUpperCase().indexOf(query) !== -1){
                        toBeRendered.push(rows[i]);
                        toBeHighlited.push(Object.keys(rows[i])[y]);
                        break
                    }
                }
            }
        } else {
            toBeRendered = this.state.data;
        }
        let pages = toBeRendered.length === 0 ? 0 : ~~(toBeRendered.length / this.state.defaultPages) + 1;

        this.setState({
            table: toBeRendered,
            highlight: toBeHighlited,
            pagesCount : pages
        })
    }

    calculateHighlight(i, y) {
        console.log(this.state.highlight);
        if(this.state.highlight[i] === y) {
            return 'hilit'
        } else {
            return ''
        }
    }

    changeActiveRow(i) {
        this.setState({
            activeRow: this.state.activeRow === i ? null : i
        });
    }

    repeat() {
        let output = [];
        let highlight;
        let dataset;
        let defaultPages = this.state.defaultPages;
        let viewedPage = this.state.viewedPage;
        if (this.state.keywords === "") {
            dataset = this.state.data;
            highlight = false
        } else {
            dataset = this.state.table;
            highlight = true
        }
        for (let i = 0; i < dataset.length; i++) {
            if (i >= (viewedPage - 1) * defaultPages && i < viewedPage * defaultPages) {
                output.push(
                    <div key={i}>
                        <Accordion.Toggle onClick={this.changeActiveRow.bind(this,i)} className="clickable" as={Card.Header} variant="link" eventKey={i}>
                            <p className={highlight ? this.calculateHighlight(i, "name")  : ''}>{dataset[i]["name"]}</p>
                        </Accordion.Toggle>
                        <Accordion.Collapse eventKey={i}>
                            <Card.Body style={{padding: "0px"}}>
                                <div style={{background: "linear-gradient(-120deg, rgb(0, 147, 255) 0%, rgb(0, 118, 203) 100%)", padding: "15px", marginBottom: "10px"}}>
                                    <Button variant="outline-light noshadow">Input</Button>
                                    <Button variant="outline-light noshadow">Definition</Button>
                                    <Button variant="outline-light noshadow">Diagram</Button>
                                </div>
                                <p className={highlight ? this.calculateHighlight(i, "tasks")  : ''}>
                                    <b>Tasks</b><br/>
                                    {JSON.stringify(dataset[i]["tasks"].map(task => {return task.name}))}
                                </p>
                                <p className={highlight ? this.calculateHighlight(i, "inputParameters")  : ''}>
                                    <b>{dataset[i]["inputParameters"] ? "Input Parameters" : null}</b><br/>
                                    {JSON.stringify(dataset[i]["inputParameters"])}
                                </p>
                            </Card.Body>
                        </Accordion.Collapse>
                    </div>
                )
            }
        }
        return output
    }

    setPages(){
        let output = [];
        let viewedPage = this.state.viewedPage;
        let pagesCount = this.state.pagesCount;
        output.push(
            <i key={`page-left`} className={viewedPage !== 1 && pagesCount !== 0 ? "pages fas fa-angle-left" : " fas fa-angle-left"}
               onClick={(e) => {
                   if(viewedPage !== 1 && pagesCount !== 0)
                       this.setState({
                           viewedPage : viewedPage - 1
                       })
               }}
            />
        );
        for(let i = 1; i <= pagesCount; i++){
            if( i >= viewedPage - 2 && i <= viewedPage + 2) {
                output.push(
                    <i key={`page-${i}`} className={viewedPage === i ? "" : "pages"}
                       onClick={(e) =>
                           this.setState({
                               viewedPage: i
                           })
                       }
                    > {i} </i>
                )
            }
        }
        output.push(
            <i key={`page-right`} className={viewedPage !== pagesCount && pagesCount !== 0 ? "pages fas fa-angle-right" : " fas fa-angle-right"}
               onClick={(e) => {
                   if(viewedPage !== pagesCount && pagesCount !== 0)
                       this.setState({
                           viewedPage : viewedPage + 1
                       })
               }}
            />
        );
        return output;
    }

    render(){
        return(
            <div className='listPage'>
                <Container>
                    <h1 style={{margin: "20px"}} className="leftAligned"><i style={{color: 'grey'}} className="fas fa-tasks"/>&nbsp;&nbsp;Workflows</h1>
                    <FormGroup className="searchGroup">
                        <Form.Control value={this.state.keywords} onChange={this.onEditSearch} placeholder="Search by keyword."/>
                    </FormGroup>
                    <div className="scrollWrapper">
                        <Table ref={this.table}>
                            <thead>
                                <tr><th>Name/Version</th></tr>
                            </thead>
                            <tbody>
                                <Accordion activeKey={this.state.activeRow}>
                                    {this.repeat()}
                                </Accordion>
                            </tbody>
                        </Table>
                    </div>
                </Container>
                <Container>
                    <Row>
                        <Col sm={2} style={{textAlign: "left"}}>
                            <i className={this.state.defaultPages === 20 ? "": "pages"}
                               onClick={(e) => {
                                   let data = this.state.keywords === "" ? this.state.data : this.state.table;
                                   this.setState({
                                       defaultPages : 20,
                                       pagesCount: data.length === 0 ? 0 : ~~(this.state.data.length / 20) + 1,
                                       viewedPage: 1

                                   })}}
                            >20 </i>
                            <i className={this.state.defaultPages === 50 ? "": "pages"}
                               onClick={(e) => {
                                   let data = this.state.keywords === "" ? this.state.data : this.state.table;
                                   this.setState({
                                       defaultPages : 50,
                                       pagesCount: data.length === 0 ? 0 : ~~(this.state.data.length / 50) + 1,
                                       viewedPage: 1
                                   })}}
                            >50 </i>
                            <i className={this.state.defaultPages === 100 ? "": "pages"}
                               onClick={(e) => {
                                   let data = this.state.keywords === "" ? this.state.data : this.state.table;
                                   this.setState({
                                       defaultPages : 100,
                                       pagesCount: data.length === 0 ? 0 : ~~(this.state.data.length / 100) + 1,
                                       viewedPage: 1 })}}
                            >100 </i>
                        </Col>
                        <Col sm={8}>
                        </Col>
                        <Col sm={2} style={{textAlign: "right"}}>
                            {this.setPages()}
                        </Col>
                    </Row>
                </Container>
            </div>
        )
    }
}

export default WorkflowList