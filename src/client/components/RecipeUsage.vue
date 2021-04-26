<template>
    <div class="recipeUsage">
        <h2>{{ $t('recipes') }}</h2>
        <div v-if="window.activeUser.locale === 'de-de'">
            <h3>1 Allgemein</h3>
            Rezepte verbinden alle Objekte miteinander, sodass dadurch ein Ereignisablauf entsteht.
            Sie stellen dabei zunächst einmal nur Blaupausen dar, die einen
            grundsätzlichen Ablauf so allgemein wie möglich modellieren sollten.
            Grundsätzlich werden immer Objekte miteinander kombiniert und es entstehen neue Objekte.
            Modelliert werden Rezepte mit einer Eingabe, einer Transition und einer Ausgabe.
            Wenn die Eingabe vollständig und die Herkunft der Objekte korrekt ist startet die Transition.
            Wann eine solche Transition genau startet hängt von ihren Einstellungen ab.
            Wurde die Transition durchlaufen, werden in der Ausgabe definierte Objekte
            an die entsprechenden Orte ausgegeben.

            <h3>2 Neues Rezept erstellen</h3>
            Um ein neues Rezept zu erstellen klicken Sie, während Sie sich in
            der Kategorie "Rezepte" <graph-icon /> (die aktuelle Kategorie) befinden,
            auf das Plussymbol <plus-icon /> am oberen Rand der Auflistung oder
            auf den Button "Artikel hinzufügen" am unteren Ende der Auflistung.
            Anschließend wird dieser Hilfetext durch ein grafisches Bearbeitungsprogramm ersetzt.
            Sie sehen dann ein Konstrukt mit einem umkreisten Plussymbol <plus-icon />
            auf der linken und rechten Seite eines Rechtecks.
            Die umkreisten Plussymbole <plus-icon /> werden Stellen genannt.
            Das Rechteck in der Mitte wird Transition genannt.

            <h3>3 Eingabe definieren</h3>
            Folgende Objekte können als Eingabe dienen: <br />
            <br />
            <ul>
                <li>
                    <strong><label-icon /> Label:</strong> Label stellen die allgemeinste Form der eingabe dar und bewirken,
                    dass alle Objekte, die ein entsprechendes Label tragen von dem Rezept erfasst werden können.
                    Bitte Beachten Sie, dass Label von anderen Objekten geerbt werden können.
                </li>
                <li>
                    <strong><ufo-icon /> Szenenobjekte:</strong> Szenenobjekte sind etwas genauer in ihrer Spezifikation als Label,
                    da sie ein markantes Erscheinungsbild haben. Sie bewirken,
                    dass das Rezept all diejenigen Objekte erfasst, die dieses Szenenobjekt nutzen.
                    Dabei kann es sich nur um ein Aktionsobjekt oder um das Szenenobjekt selbst handeln.
                </li>
                <li>
                    <strong><movie-open-icon /> Aktionsobjekte:</strong> Aktionsobjekte stellen neben den klickbaren Bereichen die
                    spezifischste Einheit dar, die ein Szenenobjekt zur Darstellung nutzen.
                    Im Grunde handelt es sich bei einem Aktionsobjekt um ein Szenenobjekt,
                    dass in einer speziellen Szene platziert wurde und ist somit eindeutig identifizierbar,
                    da jedes Aktionsobjekt nur in einer Szene gleichzeitig existieren kann.
                </li>
                <li>
                    <strong><cursor-default-click-icon /> Klickbare Bereiche:</strong> Klickbare Bereiche sind neben Aktionsobjekten die spezifischsten Objekte.
                    Sie befinden sich genau wie Aktionsobjekte immer nur in genau einer Szene gleichzeitig und können so eindeutig identifiziert werden.
                </li>
            </ul>
            Um nun eine Eingabe zu generieren, navigieren Sie zu ihrem gewünschten Objekt,
            wie beispielsweise einem klickbaren Bereich <cursor-default-click-icon />
            aus einer Szene <theater-icon />, und ziehen dieses Objekt aus der
            Auflistung heraus auf das linke umkreiste Plussymbol <plus-icon /> des Rezeptes.
            Nun wird eine neue Stelle hinzugefügt,
            die mit dem Symbol des hinzugefügten Objektes versehen ist,
            sowie einer Herkunft, die sich unter der Stelle befindet.<br />
            <br />
            Folgende Herkünfte sind möglich:
            <ul>
                <li>
                    <strong><hand-left-icon /> Hand:</strong> Die Hand zeigt an, dass sich das Objekt vor dem Auslösen
                    der Transition in der Hand des Spielers befinden muss.
                </li>
                <li>
                    <strong><bag-personal-icon /> Inventar:</strong> Das Inventar zeigt an, dass sich das Objekt vor
                    dem Auslösen der Transition im Inventar des Spielers befinden muss.
                </li>
                <li>
                    <strong><theater-icon /> Szene:</strong> Die Szene zeigt an, dass sich das Objekt vor dem Auslösen
                    der Transition in einer Szene befinden muss.
                </li>
            </ul>
            Rechts neben der Stelle befindet sich die Quantitätsangabe.
            Diese gibt an, wie oft sich das Objekt an dem angegebenen Ort befinden
            muss und ob ein Objekt nach dem Auslöden der Transition ausgeblendet
            oder entfernt werden soll. Diese Quantität ist in jedem Fall mindestens 0,
            was bedeutet, dass dieses Objekt zwingend benötigt aber weder
            ausgeblendet noch vom angegebenen Ort entfernt wird.
            Aktionsobjekte <movie-open-icon /> haben hier eine Sonderstellung.
            Da sich diese in genau einer Szene genau ein mal befinden und sichbar sind,
            kann die Quantität hier maximal 1 betragen.
            Ist die Quantität mindestens 1 wird das Objekt der Quantität
            entsprechend oft am angegebenen Ort benötigt und wird beim Auslösen
            der Transition entfernt oder ausgeblendet.

            <h3>4 Transitionen einstellen</h3>
            Transitionen haben verschiedene Einstellungsmöglichkeiten um das
            Verhalten eines Rezeptes (im speziellen der Transition) zu steuern:

            <ul>
                <li>
                    <strong>Verzögerung:</strong> Sie können verzögert ausgeführt werden in dem im Feld "Verzögerung"
                    eine beliebige positive Zahl eingegeben wird.
                    Die eingegebene Zahl stellt die Verzögerung in Sekunden dar.
                    Diese Verzögerung wird in Echtzeit ausgeführt.
                </li>
                <li>
                    <strong>Zutatenexakt:</strong> Transitionen können auf die Exakte Anwesenheit an den entsprechenden Orten eingestellt werden.
                    Wenn eine Transition vorraussetzt, dass sich im Inventar des Spielers ein Apfel und eine Birne befindet,
                    dann darf an diesem Ort kein weiteres Objekt vorhanden sein um die Transition auszulösen.
                    Die vorhandenen Quantitäten von Apfel und Birne spielen jedoch keine Rolle.
                </li>
                <li>
                    <strong>Mengenexakt:</strong> Transitionen können außerdem auf die Exakten Mengen der angegebenen Objekte an den entsprechenden Orten eingestellt werden.
                    Im Beispiel von Apfel und Birne werden beispielsweise drei Äpfel und eine Birne vorrausgesetzt.
                    Hat der Spieler zu viel von einem dieser Objekte, wird die Transition nicht ausgelöst.
                    Die Anwesenheit anderer Objekte spielt hierbei keine Rolle.
                </li>
            </ul>

            <h3>5 Ausgabe definieren</h3>
            Folgende Objekte können als Ausgabe dienen:
            <ul>
                <li>
                    <strong><label-icon /> Label:</strong> Label können genutzt werden um ein in einer Lektion vorhandenes
                    Objekt automatisch zu erkennen. Das Rezept versucht dann anhand der aktuellen Szene und des Inventars
                    zu ermitteln um welches Objekt es sich handeln könnte. Dabei wird das zuerst gefundene Objekt
                    am entsprechend angegebenen Ort verwendet.
                </li>
                <li>
                    <strong><ufo-icon /> Szenenobjekte:</strong> Szenenobjekte werden,
                    wenn der angegebene Ort die Hand oder das Inventar des Spielers ist sofort dort hinzugefügt.
                    Handelt es sich beim angegebenen Ort um eine Szene, wird das Aktionsobjekt eingeblendet,
                    welches dieses Szenenobjekt verwendet. Mehr zum Ein- und Ausblenden können Sie in der Hilfe der Lektionen erfahren.
                </li>
                <li>
                    <strong><movie-open-icon /> Aktionsobjekte:</strong> Aktionsobjekte können nur in das Inventar oder in die Hand des Spielers gelegt werden.
                    Da diese eindeutig definiert sind, können diese auch nur exakt ein mal dort abgelegt werden.
                </li>
                <li>
                    <strong><theater-icon /> Szenen:</strong> Szenen dienen bei der Ausgabe als Vergrößerung und werden über die aktuelle Szene gelegt.
                    Diese sind im Spiel nicht direkt betretbar und können über einen Zurückbutton am linken Rand des Bildschirms verlassen werden.
                </li>
                <li>
                    <strong><file-multiple-icon /> Dateien:</strong> Dateien dienen als Informationsquelle für den Spieler.
                    Hierbei kann es sich im Grunde um jede Art von Datei handeln,
                    solange ihr Inhalt für einen Menschen interpretierbar ist.
                    Das Popup mit dem diese Dateien angezeigt werden kann mit einem "X" am oberen Rand geschlossen werden.
                </li>
            </ul>

            <h3>6 Transition auslösen</h3>
            Transitionen können nur im Spiel ausgelöst werden. Dabei werden alle
            Ressourcen der aktuellen Szene, des Inventars und der Hand des Spielers beachtet.
            Klickt ein Spieler nun mit den entsprechenden Vorgaben (Objekte in Hand oder Inventar) auf ein Aktionsobjekt,
            einen klickbaren Bereich oder dem "kombinieren"-Button im Bereich der Hand,
            werden alle Objekte an den entsprechenden Orten mit allen möglichen Rezepten verglichen.
            Die Zutreffenden Rezepte werden der Relevant nach absteigend abgearbeitet.
            Die Relevant steigt, je genauer die Anzahl der Zutaten und die Zutaten selbst passen.
            Hierbei kommt es auf die Einstellungen der Transition an.
        </div>
        <div v-else>
            <h3>1 General</h3>
            Recipes connect all objects with each other so that an event
            sequence is created. They represent thereby first of all only blueprints,
            which should model a fundamental should model a basic sequence as
            generally as possible. Basically, objects are always combined with
            each other and new objects are created. Recipes are modeled with an
            input, a transition and an output. If the input is complete and the
            origin of the objects is correct, the transition starts. When exactly
            such a transition starts depends on its settings. If the transition
            has been passed, objects defined in the output will be are output
            to the corresponding places.

            <h3>2 Create new recipe</h3>
            To create a new recipe click while you are in. the "Recipes" <graph-icon />
            category (the current category), on the plus icon <plus-icon /> at
            the top of the listing, or on the "Add item" button at the bottom
            of the listing. Then this help text will be replaced by a graphical
            editor. You will then see a construct with an encircled plus icon
            <plus-icon /> on the left and right sides of a rectangle. The circled
            plus symbols <plus-icon /> are called places. The rectangle in the
            middle is called a transition.

            <h3>3 Define input</h3>
            The following objects can serve as input:<br />
            <br />
            <ul>
                <li>
                    <strong><label-icon /> Label:</strong> Labels represent the most general form of input and cause,
                    that all objects that have a corresponding label can be captured by the recipe. Please note that
                    labels can be inherited from other objects.
                </li>
                <li>
                    <strong><ufo-icon /> Scene objects:</strong> Scene objects are slightly more precise in their
                    specification than labels, since they have a distinctive appearance. They cause, that the recipe
                    captures all those objects that use this scene object. This can be just an action object or the
                    scene object itself.
                </li>
                <li>
                    <strong><movie-open-icon /> Action objects:</strong> Action objects, along with clickable areas,
                    represent the most specific entity that a scene object uses for rendering. Basically, an action
                    object is a scene object, that has been placed in a specific scene and is therefore uniquely
                    identifiable, since each action object can only exist in one scene at a time.
                </li>
                <li>
                    <strong><cursor-default-click-icon /> Clickable areas:</strong> Clickable areas are the most specific
                    objects next to action objects. Just like action objects, they are only ever in exactly one scene at
                    a time and can thus be uniquely identified.
                </li>
            </ul>
            To generate an input now, navigate to your
            desired object, such as a clickable area <cursor-default-click-icon />.
            from a scene <theater-icon />, and drag that object from the Listing
            onto the left circled plus icon <plus-icon /> of the recipe.
            Now a new location is added, which is marked with the symbol of the
            added object, as well as an origin located below the location.<br />
            <br />
            The following origins are possible:
            <ul>
                <li>
                    <strong><hand-left-icon /> Hand:</strong> The hand indicates that the object must be in the player's
                    hand before triggering of the transition must be in the hand of the player.
                </li>
                <li>
                    <strong><bag-personal-icon /> Inventory:</strong> The inventory indicates that the object must be
                    in the inventory before triggering the transition must be in the player's inventory.
                </li>
                <li>
                    <strong><theater-icon /> Scene:</strong> The scene indicates that the object must be in a scene
                    before triggering of the transition must be in a scene.
                </li>
            </ul>
            To the right of the location is the quantity specification. This
            indicates how often the object must be in the specified location
            and whether an object should be hidden or removed after triggering
            the transition or removed after the transition is triggered.
            This quantity is in any case at least 0, which means that this
            object is mandatory but neither faded out hidden nor removed from
            the specified location. Action objects <movie-open-icon /> have a
            special position here. Since these are in exactly one scene exactly
            once and are visible, the quantity here can amount to maximally 1.
            If the quantity is at least 1, the object will be needed at the is
            needed correspondingly often at the specified location and is
            removed or removed or hidden when the transition is triggered.

            <h3>4 Set transitions</h3>
            Transitions have different settings to control the behavior of a
            recipe (especially the transition):
            <ul>
                <li>
                    <strong>Delay:</strong> They can be delayed by entering any
                    positive number in the "Delay" field. The number entered
                    represents the delay in seconds. This delay is executed in
                    real time.
                </li>
                <li>
                    <strong>Exact presence:</strong> Transitions can be set to
                    Exact presence at the corresponding locations. If a transition
                    requires that there be an apple and a pear in the player's
                    inventory, then no other object may be present at that
                    location to trigger the transition. However, the existing
                    quantities of apple and pear do not matter.
                </li>
                <li>
                    <strong>Quantity Exact:</strong> Transitions can also be set
                    to the Exact Quantities of the specified objects at the corresponding
                    locations. For example, in the apple and pear example, three apples
                    and one pear are assumed. If the player has too much of one of these
                    objects, the transition will not be triggered. The presence of
                    other objects does not matter here.
                </li>
            </ul>

            <h3>5 Define output</h3>
            The following objects can serve as output:
            <ul>
                <li>
                    <strong><label-icon /> Label:</strong> Labels can be used to
                    automatically detect an object present in a lesson.
                    The recipe then tries to determine which object it might be
                    based on the current scene and inventory. The first object
                    found at the corresponding specified location is used.
                </li>
                <li>
                    <strong><ufo-icon /> Scene objects:</strong> Scene objects are,
                    if the specified location is the player's hand or inventory
                    immediately added there. If the specified location is a scene,
                    the action object that uses that scene object is faded in.
                    You can learn more about fading in and out in the lesson help.
                </li>
                <li>
                    <strong><movie-open-icon /> Action objects:</strong> Action
                    objects can only be placed in the inventory or in the player's
                    hand. Since these are uniquely defined, they can also only be
                    placed there exactly once.
                </li>
                <li>
                    <strong><theater-icon /> Scenes:</strong> Scenes serve as
                    an enlargement in the output and are placed over the current
                    scene. These are not directly accessible in the game and can
                    be exited via a back button on the left edge of the screen.
                </li>
                <li>
                    <strong><file-multiple-icon /> Files:</strong> Files serve
                    as a source of information for the player. This can basically
                    be any type of file, as long as its content is interpretable
                    to a human. The popup with which these files are displayed
                    can be closed with an "X" at the top.
                </li>
            </ul>

            <h3>6 Trigger Transition</h3> Transitions can only be triggered in-game.
            All resources of the current scene, inventory and the player's hand
            are taken into account. If a player now clicks on an action object,
            a clickable area or the "combine" button in the hand area with the
            corresponding defaults (objects in hand or inventory), all objects
            at the corresponding locations are compared with all possible recipes.
            The matching recipes are processed in descending order of relevance.
            The relevance increases, the more exactly the number of ingredients
            and the ingredients themselves fit. Here it depends on the settings
            of the transition.
        </div>
    </div>
</template>
