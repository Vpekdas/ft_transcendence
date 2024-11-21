import { Component, globalComponents, html } from "../micro";

export default class Chart extends Component {
    constructor() {
        super();
    }

    async render() {
        return html(
            this.parent,
            /*html*/ `
            <section class="py-3 py-md-5">
              <div class="container">
                <div class="row justify-content-center">
                  <div class="col-12 col-sm-10 col-md-7 col-lg-6 col-xl-5 col-xxl-4">
                    <div class="card widget-card border-light shadow-sm">
                      <div class="card-body p-4">
                        <h5 class="card-title widget-card-title mb-2">Sales</h5>
                        <div class="row gy-0">
                          <div class="col-12">
                            <h4>2,679</h4>
                          </div>
                          <div class="col-12">
                            <div class="d-flex align-items-center">
                              <span class="fs-6 bsb-w-25 bsb-h-25 bg-success-subtle text-success rounded-circle d-flex align-items-center justify-content-center me-2">
                                <i class="bi bi-arrow-right-short bsb-rotate-n45"></i>
                              </span>
                              <div>
                                <span class="fs-7">+39%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div id="bsb-chart-10" class="mt-2"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>`
        );
    }
}
globalComponents.set("Chart", Chart);
