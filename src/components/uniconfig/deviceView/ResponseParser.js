export function parseResponse(type, body) {

    let bodyJSON = JSON.parse(body);

    switch (type) {
        case "dryrun": return parseDryRun(type, bodyJSON);
        case "sync": return parseSync(type, bodyJSON);
        case "commit": return parseCommit(type, bodyJSON);
        case "replacesnap": return parseResponses(type, bodyJSON);
        case "replaceconf": return parseReplaceConf(type, bodyJSON);
        default: break;
    }
}

function parseDryRun(type, bodyJSON) {
    let {overallStatus, configuration, nodeStatus, errorMessage, errorType} = "";
    overallStatus = bodyJSON["output"]["overall-configuration-status"];

    if (bodyJSON["output"]["node-config-results"]) {
        nodeStatus = bodyJSON["output"]["node-config-results"]["node-config-result"]["0"]["configuration-status"];
        errorMessage = bodyJSON["output"]["node-config-results"]["node-config-result"]["0"]["error-message"];
        errorType = bodyJSON["output"]["node-config-results"]["node-config-result"]["0"]["error-type"];
        configuration = bodyJSON["output"]["node-config-results"]["node-config-result"]["0"]["cli-configuration"]
            ? bodyJSON["output"]["node-config-results"]["node-config-result"]["0"]["cli-configuration"]
            : bodyJSON["output"]["node-config-results"]["node-config-result"]["0"]["configuration"];

    }
    return {type, overallStatus, nodeStatus, errorMessage, errorType, configuration}
}

function parseSync(type, bodyJSON) {
    let {nodeId, status, errorMessage} = "";

    try {
        if (bodyJSON["output"]["node-sync-results"]["node-sync-result"]) {
            nodeId = bodyJSON["output"]["node-sync-results"]["node-sync-result"][0]["node-id"];
            status = "completed";
            errorMessage = bodyJSON["output"]["node-sync-results"]["node-sync-result"][0]["error-message"];
        } else {
            status = "error"
        }
    } catch(e) {
        status = "error";
        console.log(e);
    }
    return {type, nodeId, status, errorMessage}
}

function parseCommit(type, bodyJSON) {
    let {overallStatus, configuration, nodeStatus, errorMessage, errorType} = "";
    overallStatus = bodyJSON["output"]["overall-configuration-status"];

    if (bodyJSON["output"]["node-config-results"]) {
        nodeStatus = bodyJSON["output"]["node-config-results"]["node-config-result"]["0"]["configuration-status"];
        errorMessage = bodyJSON["output"]["node-config-results"]["node-config-result"]["0"]["error-message"];
        errorType = bodyJSON["output"]["node-config-results"]["node-config-result"]["0"]["error-type"];
        configuration = bodyJSON["output"]["node-config-results"]["node-config-result"]["0"]["configuration"];

    }
    return {type, overallStatus, nodeStatus, errorMessage, errorType, configuration}
}

const parseResponses = (type, bodyJSON) => {
    let {overallStatus, configuration, nodeStatus, errorMessage, errorType} = "";
    overallStatus = bodyJSON["output"]["overall-status"];

    if (bodyJSON["output"]["node-results"]) {
        nodeStatus = bodyJSON["output"]["node-results"]["node-result"]["0"]["configuration-status"]
            ? bodyJSON["output"]["node-results"]["node-result"]["0"]["configuration-status"]
            : bodyJSON["output"]["node-results"]["node-result"]["0"]["status"];
        errorMessage = bodyJSON["output"]["node-results"]["node-result"]["0"]["error-message"];
        errorType = bodyJSON["output"]["node-results"]["node-result"]["0"]["error-type"];
        configuration = bodyJSON["output"]["node-results"]["node-result"]["0"]["configuration"];
    } else {
        errorMessage = bodyJSON["output"]["error-message"];
    }
    return {type, overallStatus, nodeStatus, errorMessage, errorType, configuration}
};

function parseReplaceConf(type, bodyJSON) {
    let nodeStatus = "";
    if (bodyJSON["output"]) {
        nodeStatus = bodyJSON["output"]["result"];
    }
    return {type, nodeStatus}
}