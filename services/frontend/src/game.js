export function action(player, actionName, actionType) {
    return { type: "input", player: player, action_name: actionName, action: actionType };
}
