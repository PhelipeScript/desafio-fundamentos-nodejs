import fs from 'node:fs/promises';

const databasePath = new URL('../db.json', import.meta.url);

export class Database {
  #database = {};

  constructor () {
    fs.readFile(databasePath, 'utf-8').then(data => {
      this.#database = JSON.parse(data);
    }).catch(() => {
      this.#persist();
    })
  }

  #persist() {
    fs.writeFile(databasePath, JSON.stringify(this.#database));
  }

  select(table, search) {
    let data = this.#database[table] ?? [];

    if (search) {
      data = data.filter(row => {
        return Object.entries(search).some(([key, value]) => {
          return row[key].toLowerCase().includes(value.toLowerCase());
        })
      })
    }

    return data;
  }

  insert(table, data) {
    if (Array.isArray(this.#database[table])) {
      this.#database[table].push(data);
    } else {
      this.#database[table] = [data];
    }

    this.#persist();
    return data;
  }

  update(table, id, data) {
    const rowIndex = this.#database[table] ? this.#database[table].findIndex(row => row.id === id) : -1;

    if (rowIndex > -1) {
      const filteredData = Object.entries(data).filter(([key, value]) => value !== undefined).reduce((acc, cur, i) => {
        acc[cur[0]] = cur[1];
        return acc;
      }, {});

      this.#database[table][rowIndex] = { ...this.#database[table][rowIndex], id, ...filteredData };
      this.#persist();
      return 'updated';
    } else {
      return 'id not found';
    }
  }

  completed(table, id) {
    const rowIndex = this.#database[table] ? this.#database[table].findIndex(row => row.id === id) : -1;

    if (rowIndex > -1) {
      this.#database[table][rowIndex].completed_at = this.#database[table][rowIndex].completed_at===null ? new Date() : null;
      this.#database[table][rowIndex].updated_at = new Date();
      this.#persist();
      return 'completed';
    } else {
      return 'id not found';
    }
  }

  delete(table, id) {
    const rowIndex = this.#database[table] ? this.#database[table].findIndex(row => row.id === id) : -1;

    if (rowIndex > -1) {
      this.#database[table].splice(rowIndex, 1);
      this.#persist();
      return 'deleted';
    } else {
      return 'id not found';
    }
  }
}
