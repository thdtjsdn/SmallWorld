[
        { "action": "resetServer" },
        { "action": "register", "username": "username1", "password": "password" },
        { "action": "login", "username": "username1", "password": "password" },
        { "action": "uploadMap", "mapName": "map1", "playersNum": 2, "turnsNum": 5, "regions": [
            { "population": 1, "landDescription": [ "border", "coast" ], "adjacent": [ 2 ] },
            { "population": 0, "landDescription": [ "border" ],          "adjacent": [ 1 ] } ] },
        { "action": "createGame", "sid": 1, "gameName": "game1", "mapId": 1, "gameDescr": "description1" }
]