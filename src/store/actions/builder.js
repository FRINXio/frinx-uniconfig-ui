export const STORE_WORKFLOWS = "STORE_WORKFLOWS";
export const UPDATE_BUILDER_QUERY = "UPDATE_BUILDER_QUERY";
export const UPDATE_WORKFLOWS = "UPDATE_WORKFLOWS";
export const UPDATE_FINAL_WORKFLOW = "UPDATE_FINAL_WORKFLOW";
export const LOCK_WORKFLOW_NAME = "LOCK_WORKFLOW_NAME";
export const SWITCH_SMART_ROUTING = "SWITCH_SMART_ROUTING";
export const RESET_TO_DEFAULT_WORKFLOW = "RESET_TO_DEFAULT_WORKFLOW";
export const STORE_WORKFLOW_ID = "STORE_WORKFLOW_ID";
export const SHOW_CUSTOM_ALERT = "SHOW_CUSTOM_ALERT";

export const storeWorkflows = originalWorkflows => {
  return {
    type: STORE_WORKFLOWS,
    originalWorkflows,
    workflows: originalWorkflows
  };
};

export const updateQuery = query => {
  return { type: UPDATE_BUILDER_QUERY, query };
};

export const showCustomAlert = (show, variant = "danger", msg) => {
  return { type: SHOW_CUSTOM_ALERT, show, variant, msg };
};

export const storeWorkflowId = id => {
  return { type: STORE_WORKFLOW_ID, executedWfId: id };
};

export const lockWorkflowName = () => {
  return { type: LOCK_WORKFLOW_NAME };
};

export const resetToDefaultWorkflow = () => {
  return { type: RESET_TO_DEFAULT_WORKFLOW };
};

export const switchSmartRouting = () => {
  return { type: SWITCH_SMART_ROUTING };
};

export const updateWorkflows = workflows => {
  return { type: UPDATE_WORKFLOWS, workflows };
};

export const updateFinalWorkflow = finalWorkflow => {
  return { type: UPDATE_FINAL_WORKFLOW, finalWorkflow };
};

export const requestUpdateByQuery = query => {
  return (dispatch, getState) => {
    dispatch(updateQuery(query));

    let { originalWorkflows } = getState().buildReducer;
    let toBeUpdated = [];
    query = query.toUpperCase();

    if (query !== "") {
      for (let i = 0; i < originalWorkflows.length; i++) {
        if (
          originalWorkflows[i]["name"] &&
          originalWorkflows[i]["name"]
            .toString()
            .toUpperCase()
            .indexOf(query) !== -1
        ) {
          toBeUpdated.push(originalWorkflows[i]);
        }
      }
      dispatch(updateWorkflows(toBeUpdated));
    } else {
      dispatch(updateWorkflows(originalWorkflows));
    }
  };
};
