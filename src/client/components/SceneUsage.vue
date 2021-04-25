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
            Wechseln Sie dann in die Kategorie "Dateien" <file-multiple-icon />. Das Bearbeitungsprogramm bleibt dabei erhalten.
            Dateien dienen bei Szenen als Hintergrundbild und sollten die Umgebung darstellen.
            Auf diesen Hintergrundbild können sich bereits Einrichtungsgegenstände befinden.
            Diese können Sie später als einen Klickbaren Bereich markieren.<br />
            Sie können später ebenfalls externe Objekte als Einrichtungsgegenstände hinzufügen.
            <br />
            Mit dem Hinzufügen des Hintergrundbildes haben Sie bereits eine vollständige Szene erstellt und
            Sie können diese Speichern und das Bearbeitungsprogramm beenden.

            <ToolUsage />
        </div>
        <div v-else>
            <h3>1 General</h3>
            Scenes represent a fixed section of an environment a user can be in.
            They automatically adjust to the screen size and cannot be moved.
            There may be other objects in a scene that can be interacted with.
            These can either be defined by a clickable area or by dragging a scene object with the
            dragging in a scene object with the mouse.

            <h3>2 Create new scene</h3>
            To create a new scene, click while being in the category "Scenes" <theater-icon />
            (the current category), on the plus icon <plus-icon /> at the top of
            the listing or on the "Add Item" button at the bottom of the listing.<br />
            <br />
            Subsequently, this help text will be replaced by a graphical editing program.
            Then switch to the "Files" <file-multiple-icon /> category.
            The editing program is retained. Files serve as background images
            for scenes and should represent the environment.
            There may already be furnishings on these background images.
            You can mark these later as a clickable area. You can also add external objects as furnishings.<br />
            <br />
            With the addition you have already created a complete scene and
            You can save this and exit the editing program.

            <ToolUsage />
        </div>
    </div>
</template>

<script>
import ToolUsage from "~client/components/ToolUsage.vue";
export default {
    components: {
        ToolUsage
    }
};
</script>
