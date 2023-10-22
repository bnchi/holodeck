const DB_NAME = 'holodeck'

export default class Store {
  constructor() {
    if (!window.indexedDB) {
      throw new Error("indexedDB isn't supported by your browser")
    }

    this.connection = null
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
    })
  }
}
