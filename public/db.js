let db;


// Create a new db request for a "budgetdb" database.
const request = indexedDB.open('budgetdb', 1);

request.onupgradeneeded = function (event) {
    // 
    const db = event.target.result;
    db.createObjectStore("offlineStore", { autoIncrement: true });
};


request.onsuccess = function (event) {
    db = event.target.result;
    //check if app is online before reading from db
    if (navigator.onLine) {
        checkDatabase();
    }
};

request.onerror = function (e) {
    console.log(`Woops! ${e.target.errorCode}`);
};

function checkDatabase() {
    let transaction = db.transaction(['offlineStore'], 'readwrite');
    // access your BudgetStore object
    const store = transaction.objectStore('offlineStore');
    // Get all records from store and set to a variable
    const getAll = store.getAll();

    // If the request was successful
    getAll.onsuccess = function () {
        // If there are items in the store, we need to bulk add them when we are back online
        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json',
                },
            })
                .then((response) => response.json())
                .then((res) => {
                    // If our returned response is not empty
                    if (res.length !== 0) {
                        // Open another transaction to BudgetStore with the ability to read and write
                        transaction = db.transaction(['offlineStore'], 'readwrite');

                        // Assign the current store to a variable
                        const currentStore = transaction.objectStore('offlineStore');

                        // Clear existing entries because our bulk add was successful
                        currentStore.clear();
                        console.log('Clearing store 🧹');
                    }
                });
        }
    };
}


const saveRecord = (record) => {
    const transaction = db.transaction(['offlineStore'], 'readwrite');
    // Access your BudgetStore object store
    const store = transaction.objectStore('offlineStore');
    // Add record to your store with add method.
    store.add(record);
};

// Listen for app coming back online
window.addEventListener('online', checkDatabase);
