<template>
    <div class="trashUsage">
        <h2>{{ $t('trash') }}</h2>
        <div v-if="window.activeUser.locale === 'de-de'">
            <h3>1 Allgemein</h3>
            Im Mülleimer sind alle Objekte zu sehen, die eigentlich gelöscht wurden,
            aber noch nicht endgültig entfernt werden können, weil sie noch von
            anderen Objekten genutzt werden.
            Damit diese Objekte in ihrer Funktionalität nicht beeinträchtigt werden,
            werden die eigentlich gelöschten Objekte so lange an diesem Ort aufbewahrt,
            bis es keine Referenzen mehr zu diesen Objekten gibt.
            Bis das der Fall ist können gelöschte Objekte jeder Zeit wiederhergestellt werden.
            Objekte deren Existenz nur dann Sinn ergibt, wenn das Referenzierende
            Objekt vorhanden ist werden entsprechend mit in den Mülleimer verschoben,
            wenn das benötigte Objekt gelöscht wurde.
            Wurde ein Objekt gelöscht, wird es in der Auflistung bei allen
            anderen Objekten, die noch darauf zugreifen farblich hervorgehoben.
        </div>
        <div v-else>
            <h3>1 General</h3>
            In the trash can you can see all the objects that have actually been
            deleted, but cannot be removed yet because they are still used by
            other objects. are still being used by other objects. So that these
            objects are not impaired in their functionality, the objects that
            have actually been deleted are kept in this location, until there
            are no more references to these objects. Until that is the case,
            deleted objects can be restored at any time. Objects whose existence
            only makes sense, if the referencing object is present will be moved
            to the trash can accordingly, if the required object has been deleted.
            If an object has been deleted, it will be highlighted in the list of
            all other other objects that still have access to it.
        </div>
    </div>
</template>
