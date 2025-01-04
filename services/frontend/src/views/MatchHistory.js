import { tr } from "../i18n";

/** @type {import("../micro").Component} */
export default async function MatchHistory({}) {
    document.title = tr("Match History");

    return /* HTML */ `<NavBar />
        <div class="container-fluid dashboard-container">
            <ProfileNavBar />
            <ul class="list-group match-history">
                <li class="list-group-item">Game 1</li>
                <li class="list-group-item">Game 2</li>
                <li class="list-group-item">Game 3</li>
                <li class="list-group-item">Game 4</li>
                <li class="list-group-item">Game 5</li>
                <li class="list-group-item">Game 6</li>
            </ul>
        </div>`;
}
