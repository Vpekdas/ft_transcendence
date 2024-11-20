import AbstractView from "./AbstractView";

export default class extends AbstractView {
    constructor() {
        super();
    }

    async getHtml() {
        return `
<div class="center-form">
    <form class="row g-3">
        <div class="col-md-4">
            <label for="validationServer01" class="form-label">Username</label>
            <input type="text" class="form-control is-valid" id="validationServer01" value="Mark" required />
            <div class="valid-feedback">Looks good!</div>
        </div>
        <div class="col-12">
            <div class="col-md-4">
                <label for="inputPassword5" class="form-label">Password</label>
                <input type="password" id="inputPassword5" class="form-control" aria-describedby="passwordHelpBlock" />
                <div id="passwordHelpBlock" class="form-text">
                    Your password must be 8-20 characters long, contain letters and numbers, and must not contain spaces,
                    special characters, or emoji.
                </div>
            </div>
            <div class="form-check">
                <input
                    class="form-check-input is-invalid"
                    type="checkbox"
                    value=""
                    id="invalidCheck3"
                    aria-describedby="invalidCheck3Feedback"
                    required
                />
                <label class="form-check-label" for="invalidCheck3"> Agree to terms and conditions </label>
                <div id="invalidCheck3Feedback" class="invalid-feedback">You must agree before submitting.</div>
            </div>
        </div>
        <div class="col-12">
            <button class="btn btn-primary" type="submit">Submit form</button>
        </div>
    </form>
</div>
        `;
    }
}
