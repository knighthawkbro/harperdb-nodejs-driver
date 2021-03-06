// Core modules
var http = require("http");
var request = require("request");
var base64 = require("base-64");
var rp = require("request-promise");

// Event module
var events = require("events");

class HarperDB {
  constructor() {
    this.options = {};
    this.isConnected = false;
    this.event = new events.EventEmitter();
  }

  connect(url, username, password) {
    if (arguments.length !== 3)
      throw new Error("Connect must be passed 3 arguments");
    else if (
      typeof url !== "string" ||
      typeof username !== "string" ||
      typeof password !== "string"
    )
      throw new Error("connect() arguments must be strings");

    const authorization = `Basic ${base64.encode(`${username}:${password}`)}`;

    const options = {
      method: "POST",
      url,
      headers: {
        "content-type": "application/json",
        authorization
      },
      json: true
    };

    return rp({
      ...options,
      body: { operation: "list_users" }
    })
      .then(() => {
        this.event.emit("connection");
        this.isConnected = true;
        this.options = options;
      })
      .catch(error => {
        this.event.emit("error", error);
      });
  }

  request(query) {
    if (!this.isConnected) {
      this.event.emit("error");
      throw new Error("Must connect to DB first using .connect()");
    } else {
      this.event.emit("request");
      return rp({ ...this.options, body: query });
    }
  }
}

module.exports.HarperDB = HarperDB;
