const express    = require('express');
const bodyParser = require('body-parser');
const {KatanDb}  = require('./KatanDb');

module.exports.KatanServer = class KatanServer {
  constructor(opts) {
    opts = opts || {};
    /** @private {number} **/
    this.port = opts.port || 53411;
    /** @private {Express} **/
    this.app = express();

    /** @private {KatanDb} **/
    this.db = new KatanDb({file: opts.file});

    this.config();
  }

  /** @private **/
  config() {
    const app = this.app;

    app.use(bodyParser.json());
    app.use((req, res, next)=>{
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      next();
    });


    app.get('/', (req, res)=> {
      res.send('KatanDb ♥');
    });

    app.post('/:collection', (req, res, next)=> {
      const collection = req.params.collection;
      this.db.insert(collection, req.body)
        .then((payload)=> res.json(success(payload)))
        .catch(next);
    });

    app.get('/:collection', (req, res, next)=> {
      const collection = req.params.collection;
      this.db.find(collection)
        .then((response)=> res.json(success(response)))
        .catch(next);
    });

    app.get('/:collection/:id', (req, res, next)=> {
      const collection = req.params.collection;
      const id         = req.params.id;
      this.db.findOne(collection, {id})
        .then((entity)=> res.json(entity ? success(entity): error()))
        .catch(next);
    });

    app.get('/:collection/query/:query', (req, res, next)=> {
      const collection = req.params.collection;
      const query      = JSON.parse(decodeURIComponent(req.params.query));
      this.db.find(collection, query)
        .then((response)=> res.json(success(response)))
        .catch(next);
    });

    app.put('/:collection/:id', (req, res, next)=> {
      const collection = req.params.collection;
      const id         = req.params.id;
      const payload    = req.body;
      this.db.update(collection, id, payload)
        .then((entity)=> res.json(entity ? success(entity): error()))
        .catch(next);
    });

    app.delete('/:collection/:id', (req, res, next)=> {
      const collection = req.params.collection;
      const id         = req.params.id;
      this.db.remove(collection, {id})
        .then((entity)=> res.json(success(entity)))
        .catch(next);
    });

    app.delete('/:collection/query/:query', (req, res, next)=> {
      const collection = req.params.collection;
      const query      = JSON.parse(decodeURIComponent(req.params.query));
      this.db.remove(collection, query)
        .then((entity)=> res.json(success(entity)))
        .catch(next);
    });

    app.use((err, req, res, next)=> {
      res.json(error(err))
    })
  }

  start() {
    return new Promise((resolve, reject)=> {
      this.server = this.app.listen(this.port, (err)=> {
        console.log(`KatanDB listening on port ${this.port}!`);
        if (err) reject(err);
        else resolve();
      });
    })
  }

  stop() {
    return this.server && this.server.close();
  }
};

const success = (data) => ({success: 1, data});
const error   = (error) => ({success: 0, error});