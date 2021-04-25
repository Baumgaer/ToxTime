<template>
    <div class="labelUsage">
        <h2>{{ $t('labels') }}</h2>
        <div v-if="window.activeUser.locale === 'de-de'">
            <h3>1 Allgemein</h3>
            Label werden genutzt um Verallgemeinerungen von Objekten, die im
            Grunde den selben Inhalt mit kleinen Abwandlungen beinhalten, zu verwirklichen.
            Beispiel: <br />
            <br />
            es wurden 4 Bilddateien hochgeladen, die alle einen Hammer darstellen.
            Dieser Hammer sieht jedoch auf allen 4 Bildern unterschiedlich aus.
            Die Farbe oder die Form ist immer etwas anders. Wenn nun alle 4
            Bilddateien das Label "Hammer" zugewiesen bekommen,
            ist es bei Rezepten möglich dieses Label so zu nutzen, dass ein
            Rezept mit Beispielsweise einem Nagel, einer Hand und diesem Label
            immer zum selben definierten Ergebnis führt, egal welcher Hammer
            in einer Szene oder einem Szenenobjekt abgebildet ist. Es ist dann
            auch egal, welcher Hammer sich im Inventar oder in der Hand des
            Spieler befindet. Das rezept funktioniert dann mit jedem Hammer.

            <h3>2 Neues Label hinzufügen</h3>
            Um ein neues Label hinzuzufügen, klicken Sie, während Sie sich in
            der Kategorie "Label" <label-multiple-icon /> (die aktuelle Kategorie),
            auf das Plussymbol <plus-icon /> am oberen Rand der Auflistung oder
            auf den Button "Artikel hinzufügen" am unteren Ende der Auflistung.<br /><br />
            Anschließend wird ein neues Label mit dem Namen "Neues Label"
            und dem aktuellen Datum erzeugt. Dieses Label können Sie dann umbenennen.
            Label müssen jedoch einen eindeutigen Namen tragen, da man sie
            sonst nicht voneinander unterscheiden kann.

            <h3>3 Label zuweisen</h3>
            Um einem Objekt ein Label zuzuweisen, fahren Sie mit der Maus
            über das Objekt in der Auflistung. Nun öffnet sich auf der rechten
            Seite der Auflistung ein Popup. In diesem Popup befindet sich ein
            eingekreistes Plussymbol <plus-icon />. Klicken Sie auf dieses Symbol,
            öffnet sich ein Auswahlfeld mit einer Suche. Suchen Sie Ihr
            gewünschtes Label und klicken Sie dieses Label anschließend an.
            Das Auswahlfeld schließt sich automatisch und das Label wird im Popup angezeigt.

            <h3>4 Vererbung von Label</h3>
            Label werden automatisch von geerbt. Wenn beispielsweise ein
            Szenenobjekt eine Bilddatei nutzt, die das Label "Hammer" trägt,
            dann trägt dieses Szenenobjekt dieses Label ebenfalls. Das gilt
            auch dann, wenn das Label erst nach dem Szenenobjekt erstellt und
            der Datei zugewiesen wurde. Label, die geerbt wurden, können nicht
            auf dem Objekt entfernt werden und werden leicht gräulich dargestellt.
            Es können nur Label von Dateien geerbt werden.
        </div>
        <div v-else>
            <h3>1 General</h3>
            Labels are used to generalize objects that basically contain the
            same content with minor modifications. Example:<br />
            <br />
            4 image files were uploaded, all of them showing a hammer. However,
            this hammer looks different on all 4 pictures. The color or the
            shape is always a little different. If all 4 image files are
            assigned the label "Hammer", it is possible to use this label for
            recipes in such a way that a recipe with, for example, a nail, a
            hand and this label always leads to the same defined result,
            regardless of which hammer in a scene or a scene object is depicted.
            It doesn't matter which hammer is in the inventory or in the player's hand.
            The recipe then works with any hammer.

            <h3>2 Add new label </h3>
            To add a new label, click on the plus symbol <plus-icon />, while
            you are in the "Label" category <label-multiple-icon /> (the current category),
            at the top of the list or on the button "Add Article" at the bottom of the list.<br />
            <br />
            Then a new label is created with the name "New Label" and the current date.
            You can then rename this label. However, labels must have a unique name,
            otherwise they cannot be distinguished from one another.

            <h3>3 Assign 3 labels</h3>
            To assign a label to an object, move the mouse over the object in
            the list. A popup will now open on the right-hand side of the listing.
            In this popup there is a circled plus symbol <plus-icon />.
            If you click on this symbol, a selection field opens with a search.
            Find your desired label and then click on this label.
            The selection field closes automatically and the label is
            displayed in the popup.

            <h3>4 Label inheritance</h3>
            Labels are automatically inherited from. For example, if a scene
            object uses an image file that carries the label "hammer", then
            that scene object also carries that label. This is true even if the
            label was created and assigned to the file after the scene object.
            Labels that have been inherited cannot be removed on the object and
            are displayed in a slightly grayish color. Only labels of files can
            be inherited.
        </div>
    </div>
</template>
