<template>
    <div class="toolUsage">
        <div v-if="window.activeUser.locale === 'de-de'">
            <h3>3 Klickbare Bereiche definieren</h3>
            Klicken Sie zum definieren eines klickbaren Bereichs am oberen rechten
            Rand des Bearbeitungsprogramms auf das Symbol "Klickbarer Bereich" <vector-polygon-icon />.
            Anschließen klicken Sie mit der linken Maustaste auf dem Hintergrundbild um den Bereich herum,
            den sie als klickbaren Bereich definieren möchten. Sie sehen den klickbaren Bereich nun mit einer roten Umrandung.
            Um den Bereich endgültig fertigzustellen klicken Sie mit der rechten Maustaste oder drücken Sie die Escape-Taste.

            <h3>4 Szenenobjekte / externe objekte als Einrichtungsgegenstände nutzen</h3>
            Um zusätzliche Objekte hinzuzufügen müssen Sie zunächst ein Szenenobjekt anlegen.
            Nachdem Sie das getan haben, wechseln Sie in die Kategorie "Szenenobjekte" <ufo-icon />.
            Suchen Sie anschließend mit der Suchfunktion am oberen Rand der Auflistung Ihr Szenenobjekt.
            Ziehen Sie dann Ihr Szenenobjekt mit der Maus in Ihre noch geöffnete Ansicht.
            Ihr Szenenobjekt wurde nun in der Mitte der Ansicht eingefügt.

            <h3>5 Objekte und klickbare Bereiche verschieben, verändern und löschen</h3>
            Um Objekte manipulieren oder entfernen zu können, klicken Sie zunächst
            am oberen rechten Rand des Bearbeitungsprogramms auf das
            Manipulationswerkzeug <cursor-default-click-icon />.
            Anschließen wählen Sie durch einen Linksklick ihr Szenenobjekt oder
            ihren gewünschten klickbaren Bereich aus. Nun haben sie mehrere Möglichkeiten: <br />
            <br />

            <h4>5.1 Szenenobjekte oder klickbare Beieiche verschieben</h4>
            Nachdem Sie nun ihr gewünschtes Objekt ausgewählt haben, können sie durch einfaches
            Ziehen dieses Objekt innerhalb der Ansicht verschieben.

            <h4>5.2 Szenenobjekte vergrößern / verkleinern oder rotieren</h4>
            Zum Ändern der Größe eines Szenenobjektes klicken Sie mit dem
            Manipulationswerkzeug auf die markierten Ecken <square-outline-icon /> des Objektes und
            ziehen das Objekt dann größer oder kleiner indem Sie die Ecke vom Zentrum weg oder zum Zentrum hin bewegen.
            Die Proportionen bleiben dabei erhalten. Zum rotieren des Objektes klicken Sie auf den
            Rotationspunkt <square-outline-icon />, der mit kleinem Abstand am oberen
            Endes des Objektes fixiert ist und bewegen die Maus dabei um das Zentrum des Objektes herum.

            <h4>5.3 Die Form klickbarer Bereiche ändern</h4>
            Nachdem Sie einen klickbaren Bereich ausgewählt haben, werden alle
            Ecken dieses Bereiches mit einem Marker <square-outline-icon /> gekennzeichnet.
            Sie können diese Ecken mit dem Manipulationswerkzeug verschieben
            indem Sie diese mit der Maus ziehen.

            <h4>5.4 Abbiegung zum klickbaren Bereich hinzufügen oder entfernen</h4>
            Um die Form eines klickbaren Bereiches zu erweitern klicken Sie
            einfach mit der linken Maustaste auf die Stelle des Randes, an der
            Sie einen weiteren Punkt zum anpassen hinzufügen möchten. Wenn Sie einen solchen Punkt zum anpassen entfernen möchten,
            halten Sie die Shift-Taste gedrückt und klicken dann mit der linken Maustaste auf den Anpassungspunkt,
            den Sie entfernen möchten.

            <h4>5.5 Objekte und klickbare Bereiche entfernen</h4>
            Um Objekte oder klickbare Beieiche aus einer Ansicht zu entfernen, drücken Sie,
            nachdem Sie Ihr zu entfernendes Objekt ausgewählt haben, auf die Entfernen-Taste.

            <h3>6 Reichenfolge der Ebenen / Überlappung ändern</h3>
            Um die Reihenfolge der Objekte, die übereinender liegen, zu ändern wählen Sie zunächst das das Werkzeug
            "Elemente in den Vordergrund bringen" <arrange-bring-forward-icon /> am oberen rechten Rand des Bearbeitungsprogramms aus.
            Wählen Sie anschließen das Objekt aus, welches Sie in den Vordergrund bringen möchten.
            Danach wählen Sie das Objekt aus, über das Sie das zuerst ausgewählte Objekt legen möchten.
            Das zuerst ausgewählte Objekt befindet sich nun über dem zuletzt ausgewählten Objekt.

            <h3>7 Ansicht verschieben</h3>
            Um die Ansicht verschieben zu können wählen Sie zunächst das Handsymbol <hand-left-icon />
            am oberen rechten Rand des Bearbeitungsprogramms aus. Klicken Sie dann
            irgendwo innerhalb der Ansicht und ziehen Sie die Ansicht in die gewünschte Richtung.

            <h3>8 Ansicht vergrößern / verkleinern</h3>
            Um die Ansich größer oder kleiner darzustellen, nutzen Sie ihr
            Mausrad in dem Sie wie auf einer Webseite scrollen oder im Fall eines Touch-/Trackpads die Scrollgesten.
        </div>
        <div v-else>
            <h3>3 Define clickable areas</h3>
            To define a clickable area klick on the upper right area of the
            editing program on the "Clickable area" <vector-polygon-icon /> symbol.
            Then click with the left mouse button on the background image around
            the area you want to define as a clickable area. Now you see the clickable
            area surrounded with a red border. To finalize the area klick with the right
            mouse button or press the escape key.

            <h3>Use 4 scene objects / external objects as furnishings </h3>
            To add additional objects, you must first create a scene object.
            After you've done that, go to the "Scene Objects" category <ufo-icon />.
            Then use the search function at the top of the listing to find your scene object.
            Then drag your scene object with the mouse into your still open view.
            Your scene object has now been inserted in the middle of the view.

            <h3>5 Moving, changing and deleting objects and clickable areas </h3>
            To manipulate or remove objects, first click at the top right of the editing program
            on the manipulation tool <cursor-default-click-icon />.
            Then select your scene object with a left click or your desired clickable area.
            Now you have several options: <br />
            <br />

            <h4>5.1 Move scene objects or clickable areas </h4>
            Now that you have selected your desired object, you can simply click
            Drag this object to move within the view.

            <h4>5.2 Enlarge / reduce or rotate scene objects </h4>
            To change the size of a scene object, click with the
            manipulation tool on the marked corners <square-outline-icon /> of the object and
            then drag the object larger or smaller by moving the corner away from the center or towards the center.
            The proportions are retained. To rotate the object click on the
            Rotation point <square-outline-icon />, the one that is fixed with a small distance at the top
            end of the object and move the mouse around the center of the object.

            <h4>5.3 Changing the shape of clickable areas </h4>
            After you've selected a clickable area, all corners of the object will
            be marked with a marker <square-outline-icon />.
            You can move these corners with the manipulation tool
            by dragging them with the mouse.

            <h4>5.4 Add or remove a turn to the clickable area </h4>
            To expand the shape of a clickable area, simply left click on the edge where
            you want to add another point to customize. If you want to remove such a point to adjust,
            hold down the Shift key and then click with the left mouse button on the adjustment point,
            you want to remove.

            <h4>5.5 Remove objects and clickable areas </h4>
            To remove objects or clickable areas from a view press the delete button
            after you have selected your object to be removed.

            <h3>6 Change the order of the layers / overlap </h3>
            To change the order of the objects that are on top of each other, first select the tool
            "Bring elements to the foreground" <arrange-bring-forward-icon /> on the upper right edge of the processing program.
            Then select the object that you want to bring to the foreground.
            Then select the object over which you want to place the first selected object.
            The first selected object is now on top of the last selected object.

            <h3>7 Move view </h3>
            To be able to move the view, first select the hand symbol <hand-left-icon />
            at the top right of the machining program. Then click
            anywhere within the view and drag the view in the direction you want.

            <h3>8 Zoom in / out </h3>
            To make the view larger or smaller use the mouse wheel in which you
            scroll like on a website or, in the case of a touch / trackpad,
            the scrolling gestures.
        </div>
    </div>
</template>
