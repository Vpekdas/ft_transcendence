import { tr } from "../i18n";

export default async function Settings({}) {
    document.title = tr("Settings");

    const profilePictureLanguage = tr("Profile Picture");
    const uploadLanguage = tr("Upload");

    return /* HTML */ `<div class="container-fluid dashboard-container">
        <ProfileNavBar />
        <ul class="list-group settings">
            <ChangeProfilePictureForm />
            <ChangeNicknameForm />
            <ChangePasswordForm />
            <DeleteAccountForm />
        </ul>
    </div>`;
}
