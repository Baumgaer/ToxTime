<template>
    <div class="sceneUsage">
        <h2>{{ $t('scenes') }}</h2>
        <div v-if="window.activeUser.locale === 'de-de'">
            <h3>1 Allgemein</h3>
            Szenen stellen einen festen Abschnitt einer Umgebung in der sich ein Nutzer befinden kann dar.
            Sie passen sich automatisch der Bildschirmgröße an und können nicht bewegt werden.
            In einer Szene können sich weitere Objekte befinden, mit denen interagiert werden kann.
            Diese können entweder durch das definieren eines Klickbaren Bereiches oder durch das
            hineinziehen eines Szenenobjektes mit der Maus erstellt werden.

            <h3>2 Neue Szene erstellen</h3>
            Um eine neue Szene zu erstellen, klicken Sie, während Sie sich in der Kategorie
            "Szenen" <theater-icon /> (die aktuelle Kategorie) befinden, zunächst auf das
            Plussymbol <plus-icon /> am oberen Rand der Auflistung oder auf den
            Button "Artikel hinzufügen" am unteren Ende der Auflistung.<br />
            <br />
            Anschließend wird dieser Hilfetext durch ein grafisches Bearbeitungsprogramm ersetzt.
            Wechseln Sie dann in die Kategorie "Dateien". Das Bearbeitungsprogramm bleibt dabei erhalten.
            Dateien dienen bei Szenen als Hintergrundbild und sollten die Umgebung darstellen.
            Auf diesen Hintergrundbild können sich bereits Einrichtungsgegenstände befinden.
            Diese können Sie später als einen Klickbaren Bereich markieren.<br />
            <br />
            Mit dem Hinzufügen haben Sie bereits eine vollständige Szene erstellt und
            Sie können diese Speichern und das Bearbeitungsprogramm beenden.

            <h3>3 Klickbare Bereiche definieren</h3>
            Klicken Sie zum definieren eines Klickbaren bereichs am oberen rechten
            Rand des Bearbeitungsprogramms auf das Symbol "Klickbarer Bereich" <vector-polygon-icon />.
            Anschließen klicken Sie mit der linken Maustaste auf dem Hintergrundbild um den Bereich herum,
            den sie als Klickbaren bereich definieren möchten. Sie sehen den Klickbaren Bereich nun mit einer roten Umrandung.
            Um den Bereich endgültig fertigzustellen klicken Sie mit der rechten Maustaste oder drücken Sie die Escape-Taste.

            <h3>4 Szenenobjekte / externe objekte als Einrichtungsgegenstände nutzen</h3>
            Um zusätzliche Objekte der Szene hinzuzufügen müssen Sie zunächst ein Szenenobjekt anlegen.
            Nachdem Sie das getan haben, wechseln Sie in die Kategorie "Szenenobjekte" <ufo-icon />.
            Suchen Sie anschließend mit der Suchfunktion am oberen Rand der Auflistung ihr Szenenobjekt.
            Ziehen Sie dann Ihr Szenenobjekt dann mit der Maus in Ihre noch geöffnete Szene.
            Ihr Szenenobjekt wurde nun in der Mitte der Szene eingefügt.

            <h3>5 Objekte und klickbare Bereiche verschieben, verändern und löschen</h3>
            Um Objekte manipulieren oder entfernen zu können, klicken Sie zunächst
            am oberen rechten Rand des Bearbeitungsprogramms auf das
            Manipulationswerkzeug <cursor-default-click-icon />.
            Anschließen wählen Sie durch einen Linksklick ihr Szenenobjekt oder
            ihren gewünschten klickbaren Bereich aus. Nun haben sie mehrere Möglichkeiten: <br />
            <br />

            <h4>5.1 Szenenobjekte oder klickbare beieiche verschieben</h4>
            Nachdem Sie nun ihr gewünschtes Objekt ausgewählt haben, können sie durch einfaches
            Ziehen dieses Objekt innerhalb der Szene verschieben.

            <h4>5.2 Szenenobjekte vergrößern / verkleinern und rotieren</h4>
            Zum Ändern der Größe eines Szenenobjektes klicken Sie mit dem
            Manipulationswerkzeug auf die markierten Ecken <square-outline-icon /> des Objektes und
            ziehen das Objekt dann größer oder kleiner. Die Proportionen bleiben dabei erhalten.
            Zum rotieren des Objektes klicken Sie auf den Rotationspunkt <square-outline-icon />,
            der mit kleinem Abstand am oberen Endes des Objektes fixiert ist und
            bewegen die Maus dabei um das Zentrum des Objektes herum.

            <h4>5.3 Die Form klickbarer Bereiche ändern</h4>
            Nachdem Sie einen klickbaren Bereich ausgewählt haben, werden alle
            Ecken dieses Bereiches mit einem Marker <square-outline-icon /> gekennzeichnet.
            Sie können diese Ecken mit dem Manipulationswerkzeug verschieben
            indem Sie diese mit der Maus ziehen.

            <h4>5.4 Objekte und klickbare Bereiche entfernen</h4>
            Um Objekte oder klickbare Beieiche aus einer Szene zu entfernen, drücken Sie,
            nachdem sie Ihr zu entfernendes Objekt ausgewählt haben, auf die Entfernen-Taste.

            <h3>6 Reichenfolge der Ebenen / Überlappung ändern</h3>
            Um die Reichenfolge in der Objekte übereinender liegen zu ändern wählen Sie zunächst das das Werkzeug
            "Elemente in den Vordergrund bringen" <arrange-bring-forward-icon /> aus.
            Wählen Sie anschließen das Objekt aus, welches Sie in den Vordergrund bringen möchten.
            Danach wählen Sie das Objekt aus, über das Sie das zuerst ausgewählte Objekt legen möchten.
            Das zuerst ausgewählte Objekt befindet sich nun über dem zuletzt ausgewählten Objekt.

            <h3>7 Ansicht verschieben</h3>
            Um die Ansicht verschieben zu können wählen Sie zunächst das Handsymbol <hand-left-icon />
            am oberen rechten Rand des Bearbeitungsprogramms aus. Klicken Sie dann
            irgendwo innerhalb der Szene und ziehen Sie die Szene in die gewünschte Richtung.

            <h3>8 Ansicht vergrößern / verkleinern</h3>
            Um die Ansich größer oder kleiner darzustellen, nutzen Sie ihr
            Mausrad in dem Sie wie auf einer Webseite scrollen oder im Fall eines Touch-/Trackpads die Scrollgesten.
        </div>
        <div v-else>
            <h3>1 General</h3>
            Scenes represent a fixed section of an environment a user can be in.
            They automatically adjust to the screen size and cannot be moved.
            There may be other objects in a scene that can be interacted with.
            These can either be defined by a clickable area or by dragging a scene object with the
            dragging in a scene object with the mouse.

            <h3>2 Create new scene</h3>
            To create a new scene, while in the category.
            "Scenes" <theater-icon /> (the current category), first click on the
            Plus icon <plus-icon /> at the top of the listing or on the
            "Add Item" button at the bottom of the listing.<br />
            <br />
            Subsequently, this help text will be replaced by a graphical editing program.
            Then switch to the "Files" category. The editing program is retained.
            Files serve as background images for scenes and should represent the environment.
            There may already be furnishings on these background images.
            You can mark these later as a clickable area.<br />
            <br />
            With the addition you have already created a complete scene and
            You can save this and exit the editing program.

            <h3>3 Define clickable areas</h3>
            To define a clickable area, click in the upper right corner of the
            edge of the editing program on the "Clickable area" icon <vector-polygon-icon />.
            Next, left-click on the background image around the area,
            that you want to define as a clickable area. You will now see the clickable area with a red border.
            To finalize the area click with the right mouse button or press the escape key.

            <h3>4 Use scene objects / external objects as furnishings</h3>
            To add additional objects to the scene you must first create a scene object.
            After you have done that, switch to the "Scene objects" <ufo-icon /> category.
            Then use the search function at the top of the listing to find your scene object.
            Then drag and drop your scene object into your still open scene.
            Your scene object has now been inserted in the middle of the scene.

            <h3>5 Moving, modifying and deleting objects and clickable areas</h3>
            To be able to manipulate or remove objects, first click
            at the upper right edge of the editing program on the
            Manipulation tool <cursor-default-click-icon />.
            Then, by left-clicking, select your scene object or your desired
            your desired clickable area. Now you have several options: <br />
            <br />

            <h4>5.1 Move scene objects or clickable areas</h4>
            Now that you have selected your desired object, you can by simply
            Dragging move this object within the scene.

            <h4>5.2 Enlarge / reduce and rotate scene objects</h4>
            To change the size of a scene object, click with the
            manipulation tool on the selected corners <square-outline-icon /> of the object, and then
            then drag the object larger or smaller. The proportions are preserved.
            To rotate the object, click on the rotation point <square-outline-icon />,
            which is fixed with a small distance at the upper end of the object and
            move the mouse around the center of the object.

            <h4>5.3 Changing the shape of clickable areas</h4>
            After you select a clickable area, all the
            corners of this area are marked with a <square-outline-icon /> marker.
            You can move these corners with the manipulation tool
            by dragging them with the mouse.

            <h4>5.4 Remove objects and clickable areas</h4>
            To remove objects or clickable areas from a scene, press,
            after selecting the object you want to remove.

            <h3>6 Change layer order / overlap</h3>
            To change the order in which objects overlap, first select the tool
            "Bring elements to the foreground" <arrange-bring-forward-icon />.
            Then select the object you want to bring to the foreground.
            Then select the object over which you want to place the first selected object.
            The first selected object is now on top of the last selected object.

            <h3>7 Move view</h3>
            To move the view, first select the hand icon <hand-left-icon />
            at the upper right edge of the editing program. Then click
            anywhere within the scene and drag the scene in the desired direction.

            <h3>8 Enlarge / reduce view</h3>
            To make the view larger or smaller, use your
            mouse wheel by scrolling as you would on a web page, or in the case of a touch- /trackpad, the scroll gestures.
        </div>
    </div>
</template>

<script>
