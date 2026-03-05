/**
 * Wiaam Centralized Database Layer
 * Communicates with the Express Node.js backend.
 */

window.WiaamDB = {
    cache: null,
    backendUrl: 'http://127.0.0.1:3000',

    init: async function () {
        console.log('WiaamDB: Initializing connection to backend...');
        try {
            const response = await fetch(`${this.backendUrl}/api/all`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            this.cache = await response.json();
            console.log('WiaamDB: Cache loaded successfully:', Object.keys(this.cache));
            return true;
        } catch (error) {
            console.error('WiaamDB: Connection failed:', error);
            return false;
        }
    },

    getCollection: function (collection) {
        if (!this.cache) {
            console.error(`WiaamDB: Attempting to read ${collection} before initialization.`);
            return [];
        }
        return this.cache[collection] || [];
    },

    setCollection: async function (collection, data) {
        this.cache[collection] = data;
        await fetch(`${this.backendUrl}/api/set_collection/${collection}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    },

    getDoc: function (collection, docId) {
        if (!this.cache) {
            console.warn(`WiaamDB: getDoc called before cache loaded.`);
            return null;
        }
        if (!this.cache[collection]) return null;
        const doc = this.cache[collection][docId] || null;
        console.log(`WiaamDB: getDoc(${collection}, ${docId}) ->`, doc ? 'Found' : 'Not Found');
        return doc;
    },

    setDoc: async function (collection, docId, data) {
        if (!this.cache[collection]) this.cache[collection] = {};
        this.cache[collection][docId] = { ...this.cache[collection][docId], ...data, updated_at: new Date().toISOString() };

        await fetch(`${this.backendUrl}/api/doc/${collection}/${docId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    },

    addDoc: async function (collection, data) {
        const newItem = {
            ...data,
            id: '_' + Math.random().toString(36).substr(2, 9),
            created_at: new Date().toISOString()
        };

        if (!Array.isArray(this.cache[collection])) this.cache[collection] = [];
        this.cache[collection].push(newItem);

        await fetch(`${this.backendUrl}/api/add/${collection}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        return newItem;
    }
};
