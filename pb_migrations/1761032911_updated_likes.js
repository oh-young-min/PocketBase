/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2190274710")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.id = user",
    "deleteRule": "@request.auth.id = user.id"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2190274710")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.id!=''",
    "deleteRule": "@request.auth.id=user.id"
  }, collection)

  return app.save(collection)
})
