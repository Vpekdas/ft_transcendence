import { tr } from "../i18n";
import { Component } from "../micro";

function poundMul(n) {
    return n * 1;
}

function poundCost(n) {
    return n * 200;
}

export default class Duck extends Component {
    constructor() {
        super();
    }

    async init() {
        const [count, setCount] = this.usePersistent("duckCount", 0);
        const [data, setData] = this.usePersistent("duckData", {});

        this.upgrades = [
            {
                name: "Pound",
                mul: poundMul,
                cost: poundCost,
            },
        ];

        function getUpgrade(name) {
            return upgrades.find((value) => value.name == name);
        }

        this.onready = () => {
            this.interval = setInterval(() => {
                let _data = data();
                for (let obj of this.upgrades) {
                    let value = _data[obj.name] != undefined ? _data[obj.name] : 0;
                    setCount(count() + obj.mul(value));
                }
            }, 1000);

            document.querySelector("#the-duck").addEventListener("click", (event) => {
                event.target.animate(
                    [
                        {
                            opacity: 0,
                            easing: "ease-out",
                        },
                        {
                            opacity: 1,
                            easing: "ease-in",
                        },
                    ],
                    2000
                );

                setCount(count() + 1);
            });

            document.querySelector(".duck-upgrade-btn").addEventListener("click", (event) => {
                /** @type {HTMLElement} */
                let target = event.target;
                const name = target.getAttribute("name");

                let _data = data();
                let upgrade = getUpgrade(name);
                let cost = upgrade.cost(_data[name] != undefined ? _data[name] : 0);

                if (count() >= cost) {
                    if (_data[name] == undefined) {
                        _data[name] = 0;
                    } else {
                        _data[name] += 1;
                    }

                    setCount(count() - cost);
                    setData(_data);
                }
            });
        };
    }

    clean() {
        clearInterval(this.interval);
    }

    render() {
        const [count, setCount] = this.usePersistent("duckCount", 0);
        const [data, setData] = this.usePersistent("duckData", {});

        for (let obj of this.upgrades) {
            let _data = data();
            let value = _data[obj.name];

            if (value == undefined) {
                value = 0;
            }

            this.upgradeHTML += `<li><button class="duck-upgrade-btn" name="${obj.name}">${obj.name} x${value}</button></li>`;
        }

        return /* HTML */ ` <div class="duck-container">
            <ul class="duck-list duck-card">
                <li><img src="/favicon.svg" width="100%" id="the-duck" /></li>
                <li><div class="duck-count">${count()} ${tr("ducks")}</div></li>
            </ul>
            <div class="duck-card">
                <ul class="duck-upgrade-list">
                    ${this.upgradeHTML}
                </ul>
            </div>
        </div>`;
    }
}
