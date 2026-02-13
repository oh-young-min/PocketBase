/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2467337644")

  // update field
  collection.fields.addAt(3, new Field({
    "hidden": false,
    "id": "bool1228268391",
    "name": "isHidden",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2467337644")

  // update field
  collection.fields.addAt(3, new Field({
    "hidden": true,
    "id": "bool1228268391",
    "name": "isHidden",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  return app.save(collection)
})
