const DB_NAME = 'holodeck'
const STORE_NAME = 'projects'

export default class Store {
  constructor() {
    if (!window.crypto) { // maybe improve this later on by addding a pollyfill for un-supported browsers
      throw new Error("crypto isn't supported by your browser")
    }

    if (!window.indexedDB) {
      throw new Error("indexedDB isn't supported by your browser")
    }

    this.connection = null

    // make sure to close the connection when the user logsout
    window.addEventListener('beforeunload', () => {
      if (this.connection) {
        console.log('connection closed')
        this.connection.close()
      }
    })
  }

  async getProjects() {
    const connecton = await this.getConnection()
    const transaction = connecton.transaction(STORE_NAME, "readonly")
    const store = transaction.objectStore(STORE_NAME)
    return store.openCursor()
  }

  async addProject(data) {
    if (!data) throw new Error('must provide data for the store')
    const connection = await this.getConnection()
    const transaction = connection.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    store.add(data)
  }

  async getConnection() {
    try {
      if (!this.connection) {
        this.connection = await this.openDB()
      }
      return this.connection
    } catch (err) {
      console.error(err)
    }
  }

  openDB() {
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open(DB_NAME)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
      request.onupgradeneeded = (event) => this.initStore(event)
    })
  }

  initStore(event) {
    const connection = event.target.result
    const objectStore = connection.createObjectStore(STORE_NAME, { keyPath: "uuid" })
    objectStore.createIndex("title", "title", {unique: false})
    objectStore.createIndex("createdAt", "createdAt", {unique: false})
    objectStore.createIndex("updatedAt", "updatedAt", {unique: false})
  }
}
