<template>
    <div class="userUsage">
        <h2>{{ $t('users') }}</h2>
        <div v-if="window.activeUser.locale === 'de-de'">
            <h3>Allgemein</h3>
            Benutzer können als Administratoren oder nicht Administratoren erstellt werden.
            Bei der Erstellung Werden lediglich die E-Mailadresse als Anmeldename und das Feld "Aktiv",
            welches dafür sorgt, dass sich der Nutzer anmelden kann benötigt. <br />
            <br />
            Nach dem Abschicken des Formulars bekommen alle registrierten Benutzer eine E-Mail zugesendet,
            in der sich ein Link befindet, der zur Bestätigung der Adresse dient.
            Nach dem Klicken des Links gelangt der Nutzer außerdem auf eine Seite, auf der er sein Passwort festlegen kann.
            Der Administrator hat keine möglichkeit das Passwort zu ändern.<br />
            <br />
            Ist das Feld "Aktiv" nicht aktiviert, werden die entsprechenden Nutzer zwar angelegt, sind aber sofort gesperrt.
            Die Nutzer erhalten in dem Fall keine Bestätigungsemail.
            Der Nutzer ist dann ebenfalls nicht mehr in der Lage sein Passwort zurückzusetzen oder sich anzumelden.<br />
            <br />
            Das Feld "Bestätigt" kann genutzt werden, um Nutzer anzulegen und das Senden der Bestätigungsemail ebenfalls zu unterbinden.
            Der Nutzer ist dann jedoch in der Lage sein Passwort zurückzusetzen und bestätigt somit zugleich seine E-Mailadresse.
            Hat ein Nutzer seine E-Mailadresse bestätigt, erscheint er in der Auflistung klar und deutlich.
            Andernfalls wird er leicht gräulich dargestellt und es befindet sich ein Button zum erneuten Senden der
            Bestätigungsemail an diesem Nutzer <email-check-icon />.
            Nutzer die als Administrator registriert wurden erscheinen mit einem Kronensymbol <crown-icon /> zuerst in der Auflistung.
            Danach folgen alle Nutzer die ihre E-Mailadresse bereits bestätigt haben und zum Schluss werden alle noch nicht bestätigten Nutzer aufgelistet.

            <h3>Neuen Nutzer anlegen</h3>
            Um einen neuen Benutzer anzulegen, klicken Sie, während sie sich in der Kategorie "Benutzer" <account-icon /> (die aktuelle Kategorie)
            befinden, auf der Pluszeichen <plus-icon /> am oberen Rand der Auflistung oder am ende der Auflistung auf den Button "Artikel hinzufügen".<br />
            <br />
            Anschließend wird dieser Hilfetext mit einem Formular in Tabellenform ersetzt,
            in dem Sie mehrere Nutzer anlegen können, indem Sie mit der Maus in die erste Zeile klicken und Ihre Eingaben tätigen.
            Es wird dann automatisch eine neue Zeile erstellt, in der Sie einen weiteren Nutzer anlegen können.
            Zur besseren Handhabung nutzen Sie die Tab-Taste um in das nächste Feld zu wechseln.

            <h3>Nutzer bearbeiten</h3>
            Um einen Nutzer bearbeiten zu können, nutzen Sie die Suche am oberen Rand der Auflistung,
            suchen den gewünschen Nutzer anhand der E-Mailadresse und klicken anschließen auf das Bearbeitungssymbol <lead-pencil-icon />.
            Anschließend wird dieser Hilfetext mit einem Formular ersetzt in dem Sie die gewünschen Einstellungen an diesem Nutzer vornehmen können.
            Hier befinden sich auch die Berechtigungseinstellungen.

            <h3>Nutzer Sperren</h3>
            Nutzer können gesperrt werden, indem sie bearbeitet werden und das Feld "Aktiv" deaktiviert wird
            oder durch einen Klick auf das Sperrensymbol <lock-icon /> im Listeneintrag des entsprechenden Nutzers.

            <h3>Bestätigungsemail erneut senden</h3>
            Für den Fall, dass eine Bestätigungsemail nicht bei einem Nutzer angekommen ist oder Sie der Meinung sind,
            dass dieser Nutzer die E-Mail übersehen haben könnte, können Sie ihm die Bestätigungsemail
            durch einen Klick auf das Bestätigungsemailsymbol <email-check-icon /> erneut senden.

            <h3>Nutzer (zwangs-)abmelden</h3>
            Für den Fall, dass Sie einen Nutzer zwangsabmelden möchten, können Sie dies mit dem Abmeldesymbol <logout-icon />
            in der Auflistung des jeweiligen Nutzers veranlassen.
            Der Nutzer kann dann ohne eine weitere Anmeldung keine Daten lesen oder schreiben. Er wird darüber NICHT informiert.

            <h3>Nutzer löschen</h3>
            Nutzer können durch das Löschensymbol <delete-icon /> in der Auflistung des jeweiligen Nutzers gelöscht werden.
            Der Nutzer erhält darüber keine Benachrichtigung.
        </div>
        <div v-else>
            <h3>General</h3>
            Users can be created as administrators or non-administrators.
            During creation, only the email address as the login name and the field "Active",
            which ensures that the user can log in. <br />
            <br />
            After submitting the form, all registered users will receive an email,
            in which there is a link that serves to confirm the address.
            After clicking the link, the user also gets to a page where he can set his password.
            The administrator has no möglichkeit to change the password.<br />
            <br />
            If the field "Active" is not activated, the corresponding users are created, but are immediately blocked.
            The users receive in the case no confirmation email.
            The user is then also no longer able to reset his password or login.<br />
            <br />
            The "Confirmed" field can be used to create users and stop the confirmation email from being sent as well.
            However, the user is then able to reset his password and thus confirms his email address at the same time.
            If a user has confirmed his email address, he will appear clearly in the listing.
            Otherwise, it is displayed slightly grayish and there is a button to resend the
            confirmation email to this user <email-check-icon />.
            Users who have been registered as administrators appear with a crown icon <crown-icon /> first in the listing.
            This is followed by all users who have already confirmed their email address and finally all users who have not yet been confirmed are listed.

            <h3>Create a new user</h3>
            To create a new user, click while in the "Users" <account-icon /> category (the current category)
            are on the plus sign <plus-icon /> at the top of the listing or at the end of the listing on the "Add Item" button.<br />
            <br />
            Then this help text will be replaced with a form in table form,
            in which you can create multiple users by clicking with the mouse in the first line and make your entries.
            A new line is then automatically created in which you can create another user.
            For better handling, use the tab key to move to the next field.

            <h3>Edit user</h3>
            To edit a user, use the search at the top of the listing,
            search for the desired user by email address, and then click on the edit icon <lead-pencil-icon />.
            Then this help text will be replaced with a form where you can make the desired settings for this user.
            This is also where the permission settings are located.

            <h3>Lock users</h3>
            Users can be locked by editing them and unchecking the "Active" box
            or by clicking on the lock icon <lock-icon /> in the list entry of the corresponding user.

            <h3>Resend confirmation email</h3>
            In case a confirmation email has not reached a user or you think,
            that user may have missed the email, you can resend the confirmation email to them
            by clicking on the confirmation email icon <email-check-icon /> to resend it.

            <h3>(Force) logout user</h3>
            In case you want to force logout a user, you can do so by clicking the logout icon <logout-icon />
            in the listing of the respective user.
            The user will then not be able to read or write any data without logging in again. He will NOT be informed about this.

            <h3>Delete user</h3>
            Users can be deleted by the delete icon <delete-icon /> in the listing of the respective user.
            The user will not receive any notification about this.
        </div>
    </div>
</template>
