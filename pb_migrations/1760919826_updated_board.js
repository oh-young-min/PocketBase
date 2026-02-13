/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2467337644")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.id!=''",
    "deleteRule": "@request.auth.id=user.id",
    "updateRule": "@request.auth.id=user.id"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2467337644")

  // update collection data
  unmarshal({
    "createRule": "",
    "deleteRule": null,
    "updateRule": ""
  }, collection)

  return app.save(collection)
})
