const mongomatch = require('mongomatch');
const uuid       = require('uuid');
const fs         = require('fs');

module.exports.KatanDb = class KatanDb {
  constructor(opts) {
    opts = opts || {};
    /** @private {string} **/
    this.file = opts.file || '/tmp/katan.json'; // TODO
    /** @private {Object} **/
    this.data = this.load();
  }

  find(collection, query) {
    query = query || {};
    return Promise.resolve(filterWhere(this.data[collection] || [], query))
  }

  findOne(collection, query) {
    return Promise.resolve(findWhere(this.data[collection] || [], query));
  }

  update(collection, id, payload) {
    delete payload.id;
    return this.findOne(collection, {id})
      .then((entity)=> Object.assign(entity, payload))
      .then(this.persist.bind(this));
  }

  remove(collection, query) {
    this.data[collection] = this.data[collection].filter((entity)=> !mongomatch(query, entity))
    return this.findOne(collection, {id})
      .then((entity)=> Object.assign(entity, payload))
      .then(this.persist.bind(this));
  }

  insert(collection, payload) {
    if (!this.data[collection]) {
      this.data[collection] = [];
    }
    const entity = Object.assign({}, payload, {id: uuid.v4()});
    this.data[collection].push(entity);
    return Promise.resolve(entity)
      .then(this.persist.bind(this));
  }

  /** @private **/
  persist(data) {
    fs.writeFile(this.file, JSON.stringify(this.data), {flag: 'w'}, function (err) {
      if (err) {
        throw err;
      }
    });
    return data
  }

  /** @private **/
  load() {
    try {
      fs.accessSync(this.file, fs.F_OK);
      return JSON.parse(fs.readFileSync(this.file))
    } catch (e) {
      return {};
    }
  }
};

const findWhere = function (list, query) {
  return list.find(mongomatch.bind(null, query));
};

const filterWhere = function (list, query) {
  return list.filter(mongomatch.bind(null, query));
};
