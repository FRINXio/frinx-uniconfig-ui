import React, {useContext, useEffect, useState} from 'react'
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import {GlobalContext} from "../../common/GlobalContext";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Paper from "@material-ui/core/Paper/Paper";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import {HttpClient as http} from "../../common/HttpClient";
import _ from "lodash";
import MenuItem from "@material-ui/core/MenuItem";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Accordion from "@material-ui/core/Accordion";
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Button from "@material-ui/core/Button";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from '@material-ui/lab/Alert';
import {useInterval} from "../../common/useInterval";

const useStyles = makeStyles((theme) => ({
    wrapper: {
        display: "flex",
        alignItems: "center"
    },
    icon: {
        height: "50px",
        width: "50px"
    },
    paper: {
        padding: "30px",
    },
    basicTab: {
        display: "flex",
        justifyContent: "space-between",
        margin: "20px",
        width: "500px"
    },
}));

const TabPanel = (props) => {
    const {children, value, index, ...other} = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            {...other}
        >
            {value === index && (
                <div style={{marginTop: "40px"}}>
                    {children}
                </div>
            )}
        </div>
    );
};

const GET_SUPPORTED_DEVICES_URL = "/rests/data/cli-translate-registry:available-cli-device-translations?content=nonconfig&depth=3";
const MOUNT_CLI_DEVICE_URL = (nodeId) => "/rests/data/network-topology:network-topology/topology=cli/node=" + nodeId;
const GET_CONN_STATUS_URL = (nodeId) => "/rests/data/network-topology:network-topology/topology=cli" + "/node=" + nodeId + "?content=nonconfig";

const Cli = ({supportedDevices}) => {
    const global = useContext(GlobalContext);
    const [cliMountForm, setCliMountForm] = useState({
        "network-topology:node-id": "xr5",
        "cli-topology:host": "192.168.1.215",
        "cli-topology:port": "22",
        "cli-topology:device-type": "ios xr",
        "cli-topology:device-version": "*",
        "cli-topology:transport-type": "ssh",
        "cli-topology:username": "cisco",
        "cli-topology:password": "cisco"
    });
    const [cliMountAdvForm, setCliMountAdvForm] = useState({
        dryRun: false,
        lazyConnection: false,
        "node-extension:reconcile": true,
        "cli-topology:journal-size": 150,
        "cli-topology:dry-run-journal-size": 150,
        "cli-topology:command-timeout": 60,
        "cli-topology:connection-lazy-timeout": 60,
        "cli-topology:connection-establish-timeout": 60,
        "cli-topology:keepalive-delay": 45,
        "cli-topology:keepalive-timeout": 45
    });
    const [outputConsole, setOutputConsole] = useState({nodeId: "", output: [], isRunning: false});
    const [alert, setAlert] = useState({
        open: false,
        severity: "success",
        message: ""
    });

    useInterval(() => {
        // Your custom logic here
        checkConnectionStatus(outputConsole.nodeId)
    }, outputConsole.isRunning ? 1000 : null);

    const handleAlertClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setAlert({...alert, open: false});
    };

    const handleAlertOpen = (statusCode, statusText) => {
        statusCode = statusCode.toString();
        if (statusCode.startsWith('2')) {
            setAlert({...alert, open: true, severity: "success", message: `${statusCode} ${statusText}`});
        } else if (statusCode.startsWith('4')) {
            setAlert({...alert, open: true, severity: "warning", message: `${statusCode} ${statusText}`});
        } else if (statusCode.startsWith('5')) {
            setAlert({...alert, open: true, severity: "error", message: `${statusCode} ${statusText}`});
        } else {
            setAlert({...alert, open: true, severity: "info", message: `${statusCode} ${statusText}`});
        }
    };

    const getDeviceTypeVersions = (deviceType) => {
        if (!cliMountForm["cli-topology:device-type"]) {
            return [];
        }
        return supportedDevices[deviceType]?.map(d => d["device-version"]);
    };

    const mountCliDevice = async () => {

        const dryRunOn = {
            "cli-topology:dry-run-journal-size": parseInt(cliMountAdvForm["cli-topology:dry-run-journal-size"])
        };

        const lazyConnectionOn = {
            "cli-topology:command-timeout": parseInt(cliMountAdvForm["cli-topology:command-timeout"]),
            "cli-topology:connection-lazy-timeout": parseInt(cliMountAdvForm["cli-topology:connection-lazy-timeout"]),
            "cli-topology:connection-establish-timeout": parseInt(cliMountAdvForm["cli-topology:connection-establish-timeout"])
        };

        const lazyConnectionOff = {
            "cli-topology:keepalive-delay": parseInt(cliMountAdvForm["cli-topology:keepalive-delay"]),
            "cli-topology:keepalive-timeout": parseInt(cliMountAdvForm["cli-topology:keepalive-timeout"])
        };

        const payload = {
            "network-topology:node": {
                ...cliMountForm,
                "node-extension:reconcile": cliMountAdvForm["node-extension:reconcile"],
                "cli-topology:journal-size": cliMountAdvForm["cli-topology:journal-size"],
                "cli-topology:dry-run-journal-size": parseInt(cliMountAdvForm["cli-topology:dry-run-journal-size"]),
                ...(cliMountAdvForm.dryRun ? dryRunOn : null),
                ...(cliMountAdvForm.lazyConnection ? lazyConnectionOn : lazyConnectionOff)
            }
        };

        const nodeId = cliMountForm["network-topology:node-id"];

        const result = await http.put(global.backendApiUrlPrefix + MOUNT_CLI_DEVICE_URL(nodeId), payload, global.authToken);
        const {statusCode, statusText} = result;

        setOutputConsole({...outputConsole, nodeId, isRunning: true});

        handleAlertOpen(statusCode, statusText);
    };

    const checkConnectionStatus = async (nodeId) => {
        const result = await http.get(global.backendApiUrlPrefix + GET_CONN_STATUS_URL(nodeId), global.authToken);
        console.log(result)
        const connectionStatus = result?.node[0]?.["cli-topology:connection-status"];
        setOutputConsole({...outputConsole, output: [...outputConsole.output, connectionStatus]});
        return result
    };

    const mountCliBasicTemplate = [
        {
            displayValue: "Node ID",
            description: "Unique identifier of device across all systems",
            size: 6,
            key: "network-topology:node-id"
        },
        {
            displayValue: "Device type",
            description: "Type of device or OS",
            size: 2,
            select: true,
            options: Object.keys(supportedDevices),
            key: "cli-topology:device-type"
        },
        {
            displayValue: "Device version",
            description: "Version of device or OS",
            size: 2,
            select: true,
            options: getDeviceTypeVersions(cliMountForm["cli-topology:device-type"]),
            key: "cli-topology:device-version"
        },
        {
            displayValue: "Transport type",
            description: "CLI transport protocol",
            size: 2,
            select: true,
            options: ["ssh", "telnet"],
            key: "cli-topology:transport-type"
        },
        {
            displayValue: "Host",
            description: "IP or hostname of the management endpoint on a device",
            size: 4,
            key: "cli-topology:host"
        },
        {
            displayValue: "Port",
            description: "TCP port",
            size: 2,
            key: "cli-topology:port"
        },
        {
            displayValue: "Username",
            description: "Username credential",
            size: 3,
            key: "cli-topology:username"
        },
        {
            displayValue: "Password",
            description: "Password credential",
            size: 3,
            key: "cli-topology:password"
        },
    ];

    const mountCliAdvTemplate = [
        {
            displayValue: "Reconcile",
            toggle: true,
            key: "node-extension:reconcile",
            size: 4
        },
        {
            displayValue: "Dry run",
            toggle: true,
            key: "dryRun",
            size: 4,
            on: [
                {
                    displayValue: "Dry run journal size",
                    key: "cli-topology:dry-run-journal-size"
                }
            ],
            off: []
        },
        {
            displayValue: "Lazy connection",
            toggle: true,
            key: "lazyConnection",
            size: 4,
            on: [
                {
                    displayValue: "Command timeout",
                    key: "cli-topology:command-timeout",
                },
                {
                    displayValue: "Connection lazy timeout",
                    key: "cli-topology:connection-lazy-timeout",
                },
                {
                    displayValue: "Connection establish timeout",
                    key: "cli-topology:connection-establish-timeout",
                },
            ],
            off: [
                {
                    displayValue: "Keepalive delay",
                    key: "cli-topology:keepalive-delay",
                },
                {
                    displayValue: "Keepalive timeout",
                    key: "cli-topology:keepalive-timeout",
                },
            ]
        },
        {
            displayValue: "Journal size",
            key: "cli-topology:journal-size",
            size: 4
        }
    ];

    const handleToggle = (key, e) => {
        setCliMountAdvForm({
            ...cliMountAdvForm,
            [key]: e.target.checked
        })
    };

    const renderBasicOptions = () => {
        return mountCliBasicTemplate.map(({displayValue, description, size, select, options, key}) => {
            return <Grid item xs={size}>
                <TextField
                    id={`inputField-${displayValue}`}
                    select={select}
                    label={displayValue}
                    value={cliMountForm[key]}
                    helperText={description}
                    onChange={(e) => setCliMountForm({...cliMountForm, [key]: e.target.value})}
                    variant="outlined"
                    fullWidth
                >
                    {select && options?.map((option, i) => (
                        <MenuItem key={`option-${i}-${displayValue}`} value={option}>
                            {option}
                        </MenuItem>
                    ))}
                </TextField>
            </Grid>
        })
    };

    const renderToggles = () => {
        return mountCliAdvTemplate.map(({displayValue, toggle, key, size}) => {
            if (toggle) {
                return (
                    <Grid item xs={size}>
                        <FormControlLabel key={key}
                                          control={<Switch checked={cliMountAdvForm[key]}
                                                           onChange={(e) => handleToggle(key, e)}/>}
                                          label={displayValue}/>
                    </Grid>
                )
            }
        })
    };

    const renderAdvOptions = () => {
        // if field is type toggle, render its on/off subfields
        return mountCliAdvTemplate.map(({displayValue, description, size, key, toggle, on, off}) => {
            if (toggle) {
                return (
                    (cliMountAdvForm[key] ? on : off)?.map(({displayValue, key}) =>
                        <Grid item xs={size}>
                            <TextField
                                id={`inputField-${key}`}
                                label={displayValue}
                                value={cliMountAdvForm[key]}
                                helperText={description}
                                onChange={(e) => setCliMountAdvForm({
                                    ...cliMountAdvForm,
                                    [key]: e.target.value
                                })}
                                variant="outlined"
                                fullWidth
                            />
                        </Grid>
                    )
                )
            }
            return (
                <Grid item xs={size}>
                    <TextField
                        id={`inputField-${key}`}
                        label={displayValue}
                        value={cliMountAdvForm[key]}
                        helperText={description}
                        onChange={(e) => setCliMountAdvForm({
                            ...cliMountAdvForm,
                            [key]: e.target.value
                        })}
                        variant="outlined"
                        fullWidth
                    />
                </Grid>
            )
        });

    };

    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Grid container spacing={3}>
                    {renderBasicOptions()}
                </Grid>
            </Grid>
            <Grid item xs={12}>
                <Accordion style={{boxShadow: 'none'}}>
                    <AccordionSummary style={{padding: 0}} expandIcon={<ExpandMoreIcon/>}>
                        <Typography color="textSecondary" variant="button">Advanced settings</Typography>
                    </AccordionSummary>
                    <AccordionDetails style={{padding: 0}}>
                        <Grid container spacing={3}>
                            {renderToggles()}
                            {renderAdvOptions()}
                        </Grid>
                    </AccordionDetails>
                </Accordion>
            </Grid>
            <Grid item xs={12}>
                <Accordion style={{boxShadow: 'none'}}>
                    <AccordionSummary style={{padding: 0}} expandIcon={<ExpandMoreIcon/>}>
                        <Typography color="textSecondary" variant="button">Console</Typography>
                    </AccordionSummary>
                    <AccordionDetails style={{padding: 0}}>
                        <div style={{backgroundColor: "black", width: "100%", height: "200px", maxHeight: "200px", overflowY: "scroll", color: "white", padding: "20px"}}>
                            {outputConsole.output.map(s => <p>{s}</p>)}
                        </div>
                    </AccordionDetails>
                </Accordion>
            </Grid>
            <Grid item xs={12}>
                <Button style={{float: "right"}} size="large" variant="contained" color="primary"
                        onClick={() => mountCliDevice()}>
                    Mount
                </Button>
                <Snackbar open={alert.open} autoHideDuration={6000} onClose={handleAlertClose}>
                    <MuiAlert onClose={handleAlertClose} severity={alert.severity} elevation={6} variant="filled">
                        {alert.message}
                    </MuiAlert>
                </Snackbar>
            </Grid>
        </Grid>
    )
};

const MountDevice = (props) => {
    const global = useContext(GlobalContext);
    const classes = useStyles();
    const [tab, setTab] = useState(0);
    const [supportedDevices, setSupportedDevices] = useState([]);


    useEffect(() => {
        // from url

        getSupportedDevices()
        // from props

    }, []);

    const getSupportedDevices = () => {
        http.get(global.backendApiUrlPrefix + GET_SUPPORTED_DEVICES_URL, global.authToken).then((res) => {
            try {
                let supportedDevices = res["available-cli-device-translations"]["available-cli-device-translation"];
                let grouped = _.groupBy(supportedDevices, function (device) {
                    return device["device-type"];
                });
                setSupportedDevices(grouped);
            } catch (e) {
                console.log(e);
            }
        });
    };

    return (
        <Container>
            <div className={classes.wrapper}>
                <Typography variant="h2" gutterBottom>
                    <IconButton onClick={() => props.history.push(global.frontendUrlPrefix + '/devices1')}>
                        <NavigateBeforeIcon className={classes.icon}/>
                    </IconButton>
                    Mount Device
                </Typography>
            </div>
            <Paper elevation={2} className={classes.paper}>
                <Tabs
                    value={tab}
                    indicatorColor="primary"
                    textColor="primary"
                    onChange={(e, newValue) => setTab(newValue)}
                >
                    <Tab label="CLI" id={`full-width-tab-${0}`}/>
                    <Tab label="Netconf" id={`full-width-tab-${1}`}/>
                </Tabs>
                <TabPanel value={tab} index={0}>
                    <Cli supportedDevices={supportedDevices}/>
                </TabPanel>
                <TabPanel value={tab} index={1}>
                    Netconf
                </TabPanel>
            </Paper>
        </Container>
    )
};

export default MountDevice;