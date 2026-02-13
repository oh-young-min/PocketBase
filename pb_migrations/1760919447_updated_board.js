/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2467337644")

  // remove field
  collection.fields.removeById("bool1228268391")

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2467337644")

  // add field
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
})
