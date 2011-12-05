var serverUrl = null;
var cmdErrors = {
  'badUsername': 'Bad username',
  'badPassword': 'Bad password',
  'usernameTaken': 'Username already taken',
  'badUserSid': 'You are not logged in',
  'badUsernameOrPassword': 'Wrong username or password'
};
var races = {
  null: '/pics/raceNone.png',
  '': '/pics/raceNone.png',
  'Amazons': '/pics/raceAmazons.png',
  'Dwarves': '/pics/raceDwarves.png',
  'Elves': '/pics/raceElves.png',
  'Giants': '/pics/raceGiants.png',
  'Halflings': '/pics/raceHalflings.png',
  'Humans': '/pics/raceHumans.png',
  'Orcs': '/pics/raceOrcs.png',
  'Ratmen': '/pics/raceRatmen.png',
  'Skeletons': '/pics/raceSkeletons.png',
  'Sorcerers': '/pics/raceSorcerers.png',
  'Tritons': '/pics/raceTritons.png',
  'Trolls': '/pics/raceTrolls.png',
  'Wizards': '/pics/raceWizards.png'
};
var specialPowers = {
  null: '/pics/spNone.png',
  '': '/pics/spNone.png',
  'Alchemist': '/pics/spAlchemist.png',
  'Berserk': '/pics/spBerserk.png',
  'Bivouacking': '/pics/spBivouacking.png',
  'Commando': '/pics/spCommando.png',
  'Diplomat': '/pics/spDiplomat.png',
  'DragonMaster': '/pics/spDragonMaster.png',
  'Flying': '/pics/spFlying.png',
  'Forest': '/pics/spForest.png',
  'Fortified': '/pics/spFortified.png',
  'Heroic': '/pics/spHeroic.png',
  'Hill': '/pics/spHill.png',
  'Merchant': '/pics/spMerchant.png',
  'Mounted': '/pics/spMounted.png',
  'Pillaging': '/pics/spPillaging.png',
  'Seafaring': '/pics/spSeafaring.png',
  'Stout': '/pics/spStout.png',
  'Swamp': '/pics/spSwamp.png',
  'Underworld': '/pics/spUnderworld.png',
  'Wealthy': '/pics/spWealthy.png'
};

var tokens = {
  null: '/pics/tokenNone.png',
  '': '/pics/tokenNone.png',
  'Amazons': '/pics/tokenAmazons.png',
  'Dwarves': '/pics/tokenDwarves.png',
  'Elves': '/pics/tokenElves.png',
  'Giants': '/pics/tokenGiants.png',
  'Halflings': '/pics/tokenHalflings.png',
  'Humans': '/pics/tokenHumans.png',
  'Orcs': '/pics/tokenOrcs.png',
  'Ratmen': '/pics/tokenRatmen.png',
  'Skeletons': '/pics/tokenSkeletons.png',
  'Sorcerers': '/pics/tokenSorcerers.png',
  'Tritons': '/pics/tokenTritons.png',
  'Trolls': '/pics/tokenTrolls.png',
  'Wizards': '/pics/tokenWizard.png'
};

var objects = {
  'holeInTheGround': '/pics/objHoleInTheGround.png',
  'lair': '/pics/objLair.png',
  'encampment': '/pics/objEncampment.png',
  'dragon': '/pics/objDragon.png',
  'fortified': '/pics/objFortified.png',
  'hero': '/pics/objHero.png'
};

messages = new Array();
maps = new Array();
games = new Array();
maxMessagesCount = 5, sentedGameId = null;
var data = {
      playerId: null,
      username: null,
      gameId: null,
      mapId: null,
      sid: 0
    };
var needMakeCurrent = false;

function showError(errorText, container) {
  if (container) $(container).html(errorText);
  else alert(errorText);
}

function sendRequest(query, callback, errorContainer) {
  $.ajax({
    type: "POST",
    url: "http://client.smallworld",
    dataType: "JSON",
    timeout: 10000,
    data: {request: JSON.stringify(query), address: serverUrl},
    beforeSend: function() {
      $.blockUI({ message: '<h3><img src="./pics/loading.gif" /> Loading...</h3>' });
    },
    success: function(response)  {
      if (!response || !response.result)
        showError("Unknown server response: " + JSON.stringify(response));
      else if (response.result == 'ok') {
        if (callback) callback(response);
      } else
        showError(response.result, errorContainer);
      $.unblockUI();
    },
    error: function(jqXHR, textStatus, errorThrown) {
      $.unblockUI();
      alert(textStatus);
    }
  });
}

function uploadMap(id) {
  $.ajaxFileUpload ({
    url:"http://client.smallworld/upload_map",
    secureuri:false,
    fileElementId: 'fileToUpload',
    data: {mapId: id, address: "http://server.smallworld/upload_map"},
    dataType: 'json',
    success: function (data, status) {
      if(typeof(data.error) != 'undefined') {
        alert(data);
        if (data.error != '') {
          alert(data.error);
        } else {
          alert(data.msg);
        }
      }
    },
    error: function (data, status, e) {
      alert(e);
    }
 });
}

function _setCookie(key, value) {
  for (var i in key) $.cookie(key[i], value[i]);
}

function addRow(list) {
  var s = '<tr>';
  for (var i in list)
    s += $.sprintf('<td>%s</td>', list[i]);
  s += '</tr>'
  return s;
}

function addAreaPoly(coords, regionId) {
  var s = '';
  for (var i in coords) {
    if ( s != '') s = ',' + s;
    s = $.sprintf('%d,%d', coords[i][0], coords[i][1]) + s;
  }
  return $.sprintf(
      '<area id="area%d" shape="poly" coords="%s" href="#" onclick="areaClick(%d);" />',
      regionId, s, regionId);
}

function addPlayerInfo(player) {
  var s = $.sprintf(
    '<tr><td>%s</td><td>%s</td></tr>',
    currentPlayerCursor(player.userId),
    player.username);
  if (player.currentTokenBadge && player.currentTokenBadge.raceName != null) {
    s += $.sprintf(
      '<tr><td></td><td><img src="%s" /></td></tr>',
      tokens[player.currentTokenBadge.raceName]);
  }
  if (player.declinedTokenBadge && player.declinedTokenBadge.raceName != null) {
    s += $.sprintf(
      '<tr><td></td><td><img src="%s" /></td></tr>',
      tokens[player.declinedTokenBadge.raceName]);
  }
  return s;
}

function addOurPlayerInfo(player) {
  var s = $.sprintf(
    '<tr><td>%s</td><td>' +
    '<table id="tableOurPlayer">' +
    '<tr><td>%s</td><td></td></tr>' +
    '<tr><td>Tokens in hand:</td><td><a id="aTokensInHand">%d</a></td></tr>' +
    '<tr><td>Coins:</td><td>%d</td></tr>',
    currentPlayerCursor(player.userId),
    data.username,
    player.tokensInHand,
    player.coins);
  if (player.currentTokenBadge && player.currentTokenBadge.raceName != null) {
    s += $.sprintf(
      '<tr><td colspan="2">' +
      '<img src="%s" class="badge" /><img src="%s" class="badge" />' +
      '</td></tr>',
      races[player.currentTokenBadge.raceName],
      specialPowers[player.currentTokenBadge.specialPowerName]);
  }
  if (player.declinedTokenBadge && player.declinedTokenBadge.raceName != null) {
    s += $.sprintf(
      '<tr><td colspan="2">' +
      '<img src="%s" class="badge"/><img src="%s" class="badge" />' +
      '</td></tr>',
      races[player.declinedTokenBadge.raceName],
      specialPowers[player.declinedTokenBadge.specialPowerName]);
  }
  s += '</table></td></tr>';
  return s;
}

function currentPlayerCursor(playerId) {
  return playerId == data.game.activePlayerId
    ? '<img src="/pics/currentPlayerCursor.png" />'
    : '';
}

function addTokensToMap(region, i) {
  var race = '';
  if (region.currentRegionState.tokenBadgeId != null) {
    for (var j in data.game.players) {
      var cur = data.game.players[j];
      if (cur.currentTokenBadge.tokenBadgeId == region.currentRegionState.tokenBadgeId) {
        race = cur.currentTokenBadge.raceName;
      }
      if (cur.declinedTokenBadge && cur.declinedTokenBadge.tokenBadgeId == region.currentRegionState.tokenBadgeId) {
        race = cur.declinedTokenBadge.raceName;
      }
    }
  }
  return $.sprintf(
      '<div style="position: absolute; left: %dpx; top: %dpx;">' +
      '<a onmouseover="$(\'#area%d\').mouseover();" onmouseout="$(\'#area%d\').mouseout();" onclick="$(\'#area%d\').click();">' +
      '<img src="%s"/><a id="aTokensNum%d">%d</a>' +
      '</a>' +
      '</div>',
      maps[data.game.map.mapId].regions[i].raceCoords[0],
      maps[data.game.map.mapId].regions[i].raceCoords[1],
      i, i, i,
      tokens[race], i, region.currentRegionState.tokensNum);
}

function addObjectsToMap(region, i) {
  var result = '';
  for (var j in objects) {
    var num = region.currentRegionState[j];
    if (!num) continue;
    if (result === '') {
      result = $.sprintf(
          '<div style="position: absolute; left: %dpx; top: %dpx;">',
          maps[data.game.map.mapId].regions[i].powerCoords[0],
          maps[data.game.map.mapId].regions[i].powerCoords[1]),
          i;
    }
    num = (num == 1) ? '' : ('' + num);
    result += $.sprintf(
        '<a onmouseover="$(\'#area%d\').mouseover();" onmouseout="$(\'#area%d\').mouseout();" onclick="$(\'#area%d\').click();"><img src="%s" />%s</a>',
        i, i, i, objects[j], num);
  }
  if (result !== '') result += '</div>';
  return result;
}

function getMapName(mapId) {
  if (maps[mapId]) return maps[mapId].name
  else return $.sprintf("<span class='_tmpMap_%s'>...</span>", mapId);
}

function makeCurrentGame(game) {
  with (game) {
    $("#cgameName").html(name);
    $("#cgameDescription").html(description);
    $("#cgameMap").html(getMapName(mapId));
    $("#cgameTurnsNum").html(turnsNum);
  }
  showCurrentGame();
}

function setGame(gameId) {
  data.gameId = gameId;
  _setCookie(["gameId"], gameId);
  makeCurrentGame(games[gameId]);
  if (games[gameId].inGame) {
    cmdGetGameState(hdlGetGameState);
  }
}
