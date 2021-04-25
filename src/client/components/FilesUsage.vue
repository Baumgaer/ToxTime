<template>
    <div class="filesUsage">
        <h2>{{ $t('files') }}</h2>
        <div v-if="window.activeUser.locale === 'de-de'">
            <h3>1 Allgemein</h3>
            Dateien werden genutzt um Szenen sowie Szenenobjekten ein Aussehen
            zu verleihen indem eine Bilddatei ind das dafür vorgesehene
            Bearbeitungsprogramm gezogen wird. Dateien können außerdem dazu genutzt
            werden ein Rezept so zu modellieren, dass nach bestimmten Aktionen
            der Inhalt beispielsweise einer PDF-datei als Popup angezeigt wird.
            Es können grundsätzlich alle Arten von Dateien verwendet werden,
            die für einen Menschen einen interpretierbaren Inhalt besitzen,
            wie beispielsweise Bilddateien, Audio oder Videodateien oder
            Textdokumente jeglicher Art.

            <h3>2 Neue Dateien hinzufügen</h3>
            Um neue Dateien hochzuladen nutzen Sie entweder, während Sie sich
            in der Kategorie "Dateien" <file-multiple-icon /> (die aktuelle Kategorie) befinden,
            das Plussymbol <plus-icon /> am oberen Rand der Auflistung oder Sie
            klicken auf den Button "Artikel hinzufügen" am unteren Ende der Auflistung.
            Alternativ können Sie die Dateien auch direkt von ihrem Computer
            in den Browser an eine beliebige Stelle ziehen.
        </div>
        <div v-else>
            <h3>1 General</h3>
            Files are used to give scenes and scene objects an appearance by
            dragging an image file into the processing program provided for it.
            Files can also be used to model a recipe in such a way that the
            content of a PDF file, for example, is displayed as a popup after
            certain actions. In principle, all types of files can be used that
            have content that can be interpreted by a human being, such as image
            files, audio or video files or text documents of any kind.

            <h3>2 Add new files</h3>
            To upload new files, either while you are in the "Files" category
            <file-multiple-icon /> (the current category), use the plus symbol
            <plus-icon /> at the top of the list or click on the "Add Article"
            button at the bottom of the listing. Alternatively, you can drag
            the files directly from your computer to any location in the browser.
        </div>
    </div>
</template>
