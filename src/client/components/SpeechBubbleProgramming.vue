<template>
    <div class="speechBubbleProgramming">
        <div v-if="window.activeUser.locale === 'de-de'">
            Um Variablen zu nutzen, wird folgende Schreibweise verwendet: <br />
            <br />
            <code v-pre>{{ variablenName }}</code> <br />
            <br />
            VariablenName kann dabei folgendes sein:<br />
            <br />
            <span class="varName">activeUser</span> gibt das Objekt des aktiven Benutzers zurück (Für Erfahrene)<br /><br />
            <span class="varName">userName</span> gibt den fertig formatierten Namen des aktiven Benutzers zurück.<br /><br />
            <span class="varName">session</span> gibt das Objekt der aktuellen Spielesession zurück (Für Erfahrene)<br /><br />
            <span class="varName">lessonName</span> gibt den Namen der aktuellen Lektion zurück.<br /><br />
            <span class="varName">currentSceneName</span> gibt den Namen der aktuellen Szene zurück.<br /><br />
            <span class="varName">recipes</span> gibt eine Liste mit den Objekten aller verfügbaren Rezepte zurück (Für Erfahrene)<br /><br />
            <span class="varName">randomRecipeName([location[, usedOrUnused[, valid]]])</span><br />
            gibt den Namen eins zufälligen Rezeptes zurück. Wenn keines gefunden wurde, wird "Nichts gefunden" zurückgegeben.
            <div class="indent">
                <span class="varName">location</span> kann dabei folgende Werte annehmen:
                <div class="indent">
                    <span class="value">"currentLocation"</span> sucht nach Rezepten, die auf die aktuelle Szene zutreffen können.<br />
                    <span class="value">"lesson"</span> sucht nach Rezepten, die auf die gesamte Lektion zutreffen können. <strong>(Standard)</strong><br />
                </div>
                <span class="varName">usedOrUnused</span> kann dabei folgende Werte annehmen:
                <div class="indent">
                    <span class="value">"used"</span> sucht ausschließlich nach bereits angewendeten Rezepten.<br />
                    <span class="value">"unused"</span> sucht ausschließlich nach noch nicht angewendeten Rezepten.<br />
                    <span class="value">null</span> es ist egal, ob das Rezept bereits genutzt wurde oder nicht <strong>(standard)</strong><br />
                </div>
                <span class="varName">valid</span> kann dabei folgende Werte annehmen:
                <div class="indent">
                    <span class="value">true</span> validiert das Rezept. Es müssen also alle Zutaten am richtigen Platz und in der richtigen Menge vorhanden sein.<br />
                    <span class="value">false</span> validiert das Rezept nicht. Ort und Menge der Zutaten spielen keine Rolle <strong>(Standard)</strong>.<br />
                </div>
            </div>
            <br />
            Beispiel: Ein zufälliges Rezept, dass auf die aktuelle Szene zutreffend ist und bereits genutzt wurde<br />
            <br />
            <code v-pre>{{ randomRecipeName("currentLocation", "used") }}</code><br />
            <br />
            <span class="varName">anotherRandomRecipe([location[, usedOrUnused[, valid]]])</span><br />
            gibt das Objekt eines zufälligen Rezeptes zurück. Es wird nicht zwangsläufig ein Rezept zurückgegeben. Bei mehreren Aufrufen der Funktion wird es sich nie um das selbe Rezept wie beim vorherigen Aufruf handeln (Für Erfahrene). <br />
            <br />
            Für Weitere Informationen bitte folgende Dokumentation lesen: <a href="https://mozilla.github.io/nunjucks/templating.html#tags" target="_blanc" rel="noopener noreferrer">https://mozilla.github.io/nunjucks/templating.html#tags</a>
        </div>
        <div v-else>
            To use variables, the following notation is used: <br />
            <br />
            <code v-pre>{{ variableName }}</code> <br />
            <br />
            VariableName can be the following:<br />
            <br />
            <span class="varName">activeUser</span> returns the object of the active user (for experienced users)<br /><br />
            <span class="varName">userName</span> returns the final formatted name of the active user.<br /><br />
            <span class="varName">session</span> returns the object of the current game session (for experienced users)<br /><br />
            <span class="varName">lessonName</span> returns the name of the current lesson.<br /><br />
            <span class="varName">currentSceneName</span> returns the name of the current scene.<br /><br />
            <span class="varName">recipes</span> returns a list with the objects of all available recipes (For experienced users)<br /><br />
            <span class="varName">randomRecipeName([location[, usedOrUnused[, valid]]])</span><br />
            returns the name of a random recipe. If none was found, "Nothing found" is returned.
            <div class="indent">
                <span class="varName">location</span> can assume the following values:
                <div class="indent">
                    <span class="value">"currentLocation"</span> is looking for recipes that can apply to the current scene.<br />
                    <span class="value">"lesson"</span> searches for recipes that can apply to the entire lesson. <strong>(default)</strong><br />
                </div>
                <span class="varName">usedOrUnused</span> can assume the following values:
                <div class="indent">
                    <span class="value">"used"</span> searches exclusively for recipes that have already been applied.<br />
                    <span class="value">"unused"</span> searches exclusively for recipes that have not yet been applied.<br />
                    <span class="value">null</span> it does not matter whether the recipe has already been used or not <strong>(default)</strong>.<br />
                </div>
                <span class="varName">valid</span> can assume the following values:
                <div class="indent">
                    <span class="value">true</span> validates the recipe. So all the ingredients must be in the right place and in the right quantity.<br />
                    <span class="value">false</span> does not validate the recipe. Place and quantity of ingredients do not matter <strong>(default)</strong>.<br />
                </div>
            </div>
            <br />
            Example: A random recipe that is applicable to the current scene and has already been used<br />
            <br />
            <code v-pre>{{ randomRecipeName("currentLocation", "used") }}</code><br />
            <br />
            <span class="varName">anotherRandomRecipe([location[, usedOrUnused[, valid]]])</span><br />
            returns the object of a random recipe. It will not necessarily return a recipe. If the function is called several times, it will never be the same recipe as the previous call (For experienced users). <br />
            <br />
            For more information please read the following documentation: <a href="https://mozilla.github.io/nunjucks/templating.html#tags" target="_blanc" rel="noopener noreferrer">https://mozilla.github.io/nunjucks/templating.html#tags</a>
        </div>
    </div>
</template>

<script>
export default {};
</script>

<style lang="less" scoped src="~client/less/SpeechBubbleProgramming.less"></style>
