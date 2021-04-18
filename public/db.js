
const request = window.indexedDB.open("toDoList", 1);

// Create schema
request.onupgradeneeded = event => {
    const db = event.target.result;
    // Creates an object store
    db.createObjectStore("offlineData", {
        autoIncrement: true
    });
};

// Opens a transaction, accesses the toDoList objectStore and statusIndex.
request.onsuccess = () => {
    const db = request.result;
    const transaction = db.transaction(["offlineData"], "readwrite");
    const offlineActions = transaction.objectStore("offlineData");
    const statusIndex = offlineActions.index("statusIndex");

    // // Adds data to our objectStore
    // toDoListStore.add({ listID: "1", status: "complete" });
    // toDoListStore.add({ listID: "2", status: "in-progress" });
    // toDoListStore.add({ listID: "3", status: "in-progress" });
    // toDoListStore.add({ listID: "4", status: "backlog" });

    // Opens a Cursor request and iterates over the documents.
    const getCursorRequest = offlineActions.openCursor();
    getCursorRequest.onsuccess = e => {
        const cursor = e.target.result;
        if (cursor) {
            if (cursor.value.status === "in-progress") {
                const todo = cursor.value;
                todo.status = "complete";
                cursor.update(todo);
            }
            cursor.continue();
        }
    };
};