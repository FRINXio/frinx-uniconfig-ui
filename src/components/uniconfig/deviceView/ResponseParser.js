export function parseResponse(type, body) {

    let bodyJSON = JSON.parse(body);
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
}
