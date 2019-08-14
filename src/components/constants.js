import {getWfInputs} from "./workflows/DiagramBuilder/builder-utils";

export const mountNetconfTemplate = JSON.stringify( {
    "node-id": ["xr6","Unique identifier of device across all systems"],
    "netconf-node-topology:host": ["192.168.1.213","IP or hostname of the management endpoint on a device"],
    "netconf-node-topology:port": [830,"TCP port of the management endpoint of a device"],
    "netconf-node-topology:username": ["cisco","Username credential"],
    "netconf-node-topology:password": ["cisco","Password credential"],
});

export const mountNetconfTemplateAdv = JSON.stringify({
    "netconf-node-topology:tcp-only": [false,""],
    "netconf-node-topology:keepalive-delay": [0,""],
    "node-extension:reconcile": [false,""]
});

export const mountNetconfTemplateDryRunOFF = JSON.stringify({
});

export const mountNetconfTemplateDryRunON = JSON.stringify({
    "netconf-node-topology:dry-run-journal-size": [180,""],
});

export const mountNetconfTemplateOverrideON = JSON.stringify({
    "netconf-node-topology:override": [true,"Select capabilities"]
});

export const mountNetconfTemplateOverrideOFF = JSON.stringify({
});

export const mountNetconfTemplateCapabilities = JSON.stringify({
    "netconf-node-topology:yang-module-capabilities": {
        "capability": []
    }
});

export const netconfXRwhitelist = JSON.stringify({
    "direct-unit-matcher": [
        {
            "name": "xr",
            "capability-regex-matcher": [".*Cisco.*", ".*cisco.*", ".*openconfig.*", ".*ietf.*"]
        }
    ]
});

export const netconfXRblacklist = JSON.stringify({
    "blacklisted-read": {
        "matcher-ref": "xr",
        "paths": {
            "path": [
                "interfaces", "vlans"
            ]
        }
    }
});

export const netconfJUNOSwhitelist = JSON.stringify({
    "direct-unit-matcher": [
        {
            "name": "junos",
            "capability-regex-matcher": [".*juniper.*", ".*ietf.*"]
        }
    ]
});

export const netconfJUNOSblacklist = JSON.stringify({
    "blacklisted-read": {
        "matcher-ref": "junos",
        "paths": {
            "path": [
                "interfaces", "vlans"
            ]
        }
    }
});

export const mountCliTemplate = JSON.stringify( {
    "network-topology:node-id": ["xr5","Unique identifier of device across all systems"],
    "cli-topology:host": ["192.168.1.215","IP or hostname of the management endpoint on a device"],
    "cli-topology:port": ["22","TCP port s the management endpoint of a device"],
    "cli-topology:transport-type": ["ssh","CLI management transport protocol e.g. tcp or ssh"],
    "cli-topology:device-type": ["ios xr","Type of device or device IOS e.g. ios, ios xr"],
    "cli-topology:device-version": ["*","Version of device or device OS e.g. 15.2"],
    "cli-topology:username": ["cisco","Username credential"],
    "cli-topology:password": ["cisco","Password credential"],
});

export const mountCliTemplateAdv = JSON.stringify({
    "node-extension:reconcile": [false,""],
    "cli-topology:journal-size": [150,""],
});

export const mountCliTemplateDryRunOFF = JSON.stringify({
});

export const mountCliTemplateDryRunON = JSON.stringify({
    "cli-topology:dry-run-journal-size": [150,""],
});

export const mountCliTemplateLazyOFF = JSON.stringify({
    "cli-topology:keepalive-delay" : [45,""],
    "cli-topology:keepalive-timeout" : [45,""]
});

export const mountCliTemplateLazyON = JSON.stringify({
    "cli-topology:command-timeout": [60,""],
    "cli-topology:connection-lazy-timeout": [60,""],
    "cli-topology:connection-establish-timeout": [60,""]
});

export const workflowDescriptions = {
    name: "name of the workflow",
    description: "description of the workflow (optional)",
    version: "numeric field used to identify the version of the schema (use incrementing numbers)",
    tasks: [],
    outputParameters: {
    },
    schemaVersion: "current Conductor Schema version, schemaVersion 1 is discontinued",
    restartable: "boolean flag to allow workflow restarts",
    workflowStatusListenerEnabled: "ff true, every workflow that gets terminated or completed will send a notification"
};

export const taskDescriptions = {
    name: "name of the task",
    taskReferenceName: "alias used to refer the task within the workflow (MUST be unique within workflow)",
    optional: "when set to true - workflow continues even if the task fails.",
    startDelay: "time period before task executes"
};
