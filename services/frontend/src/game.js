export function action(subId, actionName, actionType) {
    return { type: "input", playerSubId: subId, action_name: actionName, action: actionType };
}
