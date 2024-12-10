export function action(subId, actionName, actionType) {
    if (subId == null) {
        return { type: "input", action_name: actionName, action: actionType };
    } else {
        return { type: "input", playerSubId: subId, action_name: actionName, action: actionType };
    }
}
