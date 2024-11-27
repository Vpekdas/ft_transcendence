export function action(id, player, actionName, actionType) {
    return { type: "input", id: id, player: player, action_name: actionName, action: actionType };
}
