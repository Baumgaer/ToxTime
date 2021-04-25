<template>
    <div class="sceneObjectUsage">
        <h2>{{ $t('sceneObjects') }}</h2>
        <div v-if="window.activeUser.locale === 'de-de'">
            <h3>1 Allgemein</h3>
            Szenenobjekte stellen Einrichtungs- oder Gebrauchsgegenstände dar.
            Sie können genutzt werden um Szenen oder andere Szenenobjekte zu erweitern.
            Beispielsweise kann ein Szenenobjekt, dass einen Hammer darstellt
            auf die Hand eines Handwerkers platziert werden, der ein eigenes
            Szenenobjekt, dass eines Handwerkers, darstellt. Es können sich
            bereits Gegenstände wie Jackentaschen oder andere Objekte auf dem
            Hintergrundbild des Szenenobjektes befinden, die dann mit einem
            klickbaren Bereich als solche gekennzeichnet werden können.

            <h3>2 Neues Szenenobjekt erstellen</h3>
            Um ein neues Szenenobjekt zu erstellen klicken Sie, während Sie sich in der Kategorie "Szenenobjekte" <ufo-icon />
            befinden, auf das Plussymbol <plus-icon /> am oberen rand der Auflistung oder auf den Button "Artikel hinzufügen" am unteren Ende der Auflistung.
            Anschließend wird dieser Hilfetext durch ein grafisches Bearbeitungsprogramm ersetzt.
            Wechseln Sie dann in die Kategorie "Dateien" <file-multiple-icon />. Das Bearbeitungsprogramm bleibt dabei erhalten.
            Dateien dienen bei Szenenobjekten als Textur und sollten einen Gegenstand,
            eine Person oder etwas Anderes darstellen, dass keine vollständige Umgebung ist.
            Mit dem Hinzufügen einer Datei haben Sie bereits ein vollständiges Szenenobjekt
            erstellt und Sie können dieses Speichern und das Bearbeitungsprogram schließen.

            <ToolUsage />
        </div>
        <div v-else>
            <h3>1 General</h3>
            Scene objects represent furnishings or utensils.
            They can be used to expand scenes or other scene objects.
            For example, a scene object that represents a hammer
            to be placed on the hand of a craftsman who has his own
            Scene object that represents a craftsman. It can be
            already have items such as jacket pockets or other objects on the
            background image of the scene object, which then with a
            clickable area can be marked as such.

            <h3>2 Create new scene object</h3>
            To create a new scene object, click while being in category "scene objects" <ufo-icon />
            (the current category), on the plus icon <plus-icon /> at the top of
            the listing or on the "Add Item" button at the bottom of the listing.<br />
            <br />
            Subsequently, this help text will be replaced by a graphical editing program.
            Then switch to the "Files" <file-multiple-icon /> category.
            The editing program is retained. Files serve as texture in scene
            objects and should show an object, a person or something else which
            is not a complete environment.<br />
            <br />
            With the addition you have already created a complete scene and
            You can save this and exit the editing program.

            <ToolUsage />
        </div>
    </div>
</template>

<script>
import ToolUsage from "~client/components/ToolUsage";
export default {
    components: {
        ToolUsage
    }
};
</script>
