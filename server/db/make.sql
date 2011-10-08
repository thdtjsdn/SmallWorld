CREATE DATABASE 'SMALLWORLD.FDB' USER 'sysdba' PASSWORD 'masterkey' DEFAULT CHARACTER SET UTF8;


CREATE TABLE PLAYERS (
  id        INTEGER NOT NULL PRIMARY KEY,
  username  VARCHAR(16) NOT NULL UNIQUE,
  pass      VARCHAR(18), 
  sid       INTEGER DEFAULT NULL
);

CREATE TABLE MAPS (
  id          INTEGER NOT NULL PRIMARY KEY,
  name        VARCHAR(16) NOT NULL UNIQUE,
  playersNum  SMALLINT NOT NULL,
  turnsNum    SMALLINT NOT NULL,
  json        BLOB SUB_TYPE 1
);

CREATE TABLE GAMES (
  id          INTEGER NOT NULL PRIMARY KEY,
  name        VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(300),
  isStarted   SMALLINT DEFAULT 0 NOT NULL, 
  state       BLOB SUB_TYPE 1
);

CREATE TABLE MESSAGES (
  id     INTEGER NOT NULL PRIMARY KEY,
  text   VARCHAR(100),
  userId INTEGER NOT NULL REFERENCES PLAYERS(id) ON UPDATE CASCADE ON DELETE CASCADE
);


CREATE GENERATOR GEN_PLAYER_ID;
CREATE GENERATOR GEN_SID;
CREATE GENERATOR GEN_MESSAGE_ID;
CREATE GENERATOR GEN_GAME_ID;
CREATE GENERATOR GEN_MAP_ID;


SET TERM ^;

CREATE TRIGGER PLAYERID FOR PLAYERS
BEFORE INSERT
AS
BEGIN 
  new.id = gen_id(GEN_PLAYER_ID, 1);
END^


CREATE PROCEDURE MAKENEWSID(id INTEGER)
RETURNS (newSid INTEGER)   
AS   
BEGIN   
  newSid = GEN_ID(GEN_SID, 1);
  UPDATE PLAYERS SET sid = :newSid WHERE id = :id;
  SUSPEND;  
END^ 

CREATE PROCEDURE LOGOUT(sid INTEGER)
AS   
BEGIN   
  UPDATE PLAYERS SET sid = NULL WHERE sid = :sid;
END^ 


CREATE TRIGGER MAPID FOR MAPS
BEFORE INSERT
AS
BEGIN 
  new.id = gen_id(GEN_MAP_ID, 1);
END^


CREATE TRIGGER GAMEID FOR GAMES
BEFORE INSERT
AS
BEGIN 
  new.id = gen_id(GEN_GAME_ID, 1);
END^

CREATE TRIGGER MESSAGEID FOR MESSAGES
BEFORE INSERT
AS
BEGIN 
  new.id = gen_id(GEN_MESSAGE_ID, 1);
END^

SET TERM ; ^


CONNECT 'SMALLWORLD.FDB' USER 'sysdba' PASSWORD 'masterkey';
