export function action(id, subId, actionName, actionType) {
    return { type: "input", playerId: id, playerSubId: subId, action_name: actionName, action: actionType };
}
