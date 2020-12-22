/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// __webpack_hash__
/******/ 	__webpack_require__.h = "41116cd6a5fb5ba9a57e";
/******/
/******/ 	// __webpack_chunkname__
/******/ 	__webpack_require__.cn = "server";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "../src/server/main.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "../node_modules/@babel/runtime/helpers/esm/classCallCheck.js":
/*!********************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/esm/classCallCheck.js ***!
  \********************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return _classCallCheck; });
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/esm/createClass.js":
/*!*****************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/esm/createClass.js ***!
  \*****************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return _createClass; });
function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

/***/ }),

/***/ "../src/server/main.js":
/*!*****************************!*\
  !*** ../src/server/main.js ***!
  \*****************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var core_js_modules_es_array_concat_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! core-js/modules/es.array.concat.js */ "core-js/modules/es.array.concat.js");
/* harmony import */ var core_js_modules_es_array_concat_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_concat_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var D_Atom_projects_ba_node_modules_babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../node_modules/@babel/runtime/helpers/esm/classCallCheck */ "../node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var D_Atom_projects_ba_node_modules_babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../node_modules/@babel/runtime/helpers/esm/createClass */ "../node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! express */ "express");
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var hpp__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! hpp */ "hpp");
/* harmony import */ var hpp__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(hpp__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var helmet__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! helmet */ "helmet");
/* harmony import */ var helmet__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(helmet__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var compression__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! compression */ "compression");
/* harmony import */ var compression__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(compression__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var express_session__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! express-session */ "express-session");
/* harmony import */ var express_session__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(express_session__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var connect_mongodb_session__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! connect-mongodb-session */ "connect-mongodb-session");
/* harmony import */ var connect_mongodb_session__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(connect_mongodb_session__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var uuid__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! uuid */ "uuid");
/* harmony import */ var uuid__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(uuid__WEBPACK_IMPORTED_MODULE_9__);
/* harmony import */ var http__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! http */ "http");
/* harmony import */ var http__WEBPACK_IMPORTED_MODULE_10___default = /*#__PURE__*/__webpack_require__.n(http__WEBPACK_IMPORTED_MODULE_10__);
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! path */ "path");
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_11___default = /*#__PURE__*/__webpack_require__.n(path__WEBPACK_IMPORTED_MODULE_11__);
/* harmony import */ var app_root_path__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! app-root-path */ "app-root-path");
/* harmony import */ var app_root_path__WEBPACK_IMPORTED_MODULE_12___default = /*#__PURE__*/__webpack_require__.n(app_root_path__WEBPACK_IMPORTED_MODULE_12__);
/* harmony import */ var ms__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ms */ "ms");
/* harmony import */ var ms__WEBPACK_IMPORTED_MODULE_13___default = /*#__PURE__*/__webpack_require__.n(ms__WEBPACK_IMPORTED_MODULE_13__);
/* harmony import */ var crypto__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! crypto */ "crypto");
/* harmony import */ var crypto__WEBPACK_IMPORTED_MODULE_14___default = /*#__PURE__*/__webpack_require__.n(crypto__WEBPACK_IMPORTED_MODULE_14__);
















var WebServer = /*#__PURE__*/function () {
  function WebServer() {
    Object(D_Atom_projects_ba_node_modules_babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_1__["default"])(this, WebServer);

    this.app = express__WEBPACK_IMPORTED_MODULE_3___default()();
    this.server = Object(http__WEBPACK_IMPORTED_MODULE_10__["createServer"])(this.app);
    this.sessionSecret = Object(crypto__WEBPACK_IMPORTED_MODULE_14__["createHash"])("sha512").update(process.env.SESSION_SECRET).digest("base64");
    this.setupGeneralSettings();
    this.setupSecurity();
    this.setupSession();
    this.setupRoutes();
  }

  Object(D_Atom_projects_ba_node_modules_babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_2__["default"])(WebServer, [{
    key: "setupGeneralSettings",
    value: function setupGeneralSettings() {
      // parse the body to get post data and so on
      // NOTE: This is important for some middlewares to have directly.
      //       So this has to be the first middleware
      this.app.use(Object(express__WEBPACK_IMPORTED_MODULE_3__["json"])());
      this.app.use(Object(express__WEBPACK_IMPORTED_MODULE_3__["urlencoded"])({
        extended: true
      }));
      this.app.use(compression__WEBPACK_IMPORTED_MODULE_6___default()());
    }
  }, {
    key: "setupSecurity",
    value: function setupSecurity() {
      this.app.use(function (request, response, next) {
        var contentSecurityNonce = Object(uuid__WEBPACK_IMPORTED_MODULE_9__["v4"])();
        response.locals.cspNonce = contentSecurityNonce;
        var styleSrc = ["'self'"];
        var scriptSrc = styleSrc;

        if (true) {
          styleSrc.push("'unsafe-eval'", "'unsafe-inline'");
        } else {}

        var helmetMiddleWare = helmet__WEBPACK_IMPORTED_MODULE_5___default()({
          contentSecurityPolicy: {
            directives: {
              defaultSrc: ["'self'"],
              scriptSrc: scriptSrc,
              styleSrc: styleSrc
            }
          }
        });
        helmetMiddleWare(request, response, next);
      });
      this.app.use(hpp__WEBPACK_IMPORTED_MODULE_4___default()());
    }
  }, {
    key: "setupSession",
    value: function setupSession() {
      var MongoDBStore = connect_mongodb_session__WEBPACK_IMPORTED_MODULE_8___default()(express_session__WEBPACK_IMPORTED_MODULE_7___default.a);
      var store = new MongoDBStore({
        uri: "mongodb://".concat(process.env.DB_HOST, ":").concat(process.env.DB_PORT, "/").concat(process.env.DB_DATABASE_NAME),
        collection: "sessions",
        expires: ms__WEBPACK_IMPORTED_MODULE_13___default()(process.env.SESSION_MAX_AGE)
      });
      store.on("error", function (error) {
        console.error("Session store could not connect to Database. Reason:" + error.message);
      });
      store.on("connected", function () {
        console.debug("Session store connected to database");
      });
      this.app.use(express_session__WEBPACK_IMPORTED_MODULE_7___default()({
        secret: this.sessionSecret,
        cookie: {
          maxAge: ms__WEBPACK_IMPORTED_MODULE_13___default()(process.env.SESSION_MAX_AGE)
        },
        store: store,
        resave: true,
        saveUninitialized: true
      }));
    }
  }, {
    key: "setupRoutes",
    value: function setupRoutes() {
      this.app.use(Object(express__WEBPACK_IMPORTED_MODULE_3__["static"])(path__WEBPACK_IMPORTED_MODULE_11___default.a.resolve(app_root_path__WEBPACK_IMPORTED_MODULE_12__["path"], process.env.PATH_STATIC_FILES)));
    }
  }, {
    key: "start",
    value: function start() {
      this.server.listen(process.env.APP_PORT, process.env.APP_HOST);
    }
  }]);

  return WebServer;
}();

var server = new WebServer();
server.start();

/***/ }),

/***/ "app-root-path":
/*!********************************!*\
  !*** external "app-root-path" ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("app-root-path");

/***/ }),

/***/ "compression":
/*!******************************!*\
  !*** external "compression" ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("compression");

/***/ }),

/***/ "connect-mongodb-session":
/*!******************************************!*\
  !*** external "connect-mongodb-session" ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("connect-mongodb-session");

/***/ }),

/***/ "core-js/modules/es.array.concat.js":
/*!*****************************************************!*\
  !*** external "core-js/modules/es.array.concat.js" ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("core-js/modules/es.array.concat.js");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("crypto");

/***/ }),

/***/ "express":
/*!**************************!*\
  !*** external "express" ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("express");

/***/ }),

/***/ "express-session":
/*!**********************************!*\
  !*** external "express-session" ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("express-session");

/***/ }),

/***/ "helmet":
/*!*************************!*\
  !*** external "helmet" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("helmet");

/***/ }),

/***/ "hpp":
/*!**********************!*\
  !*** external "hpp" ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("hpp");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("http");

/***/ }),

/***/ "ms":
/*!*********************!*\
  !*** external "ms" ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("ms");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ }),

/***/ "uuid":
/*!***********************!*\
  !*** external "uuid" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("uuid");

/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4uL25vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL2VzbS9jbGFzc0NhbGxDaGVjay5qcyIsIndlYnBhY2s6Ly8vLi4vbm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvZXNtL2NyZWF0ZUNsYXNzLmpzIiwid2VicGFjazovLy8uLi9zcmMvc2VydmVyL21haW4uanMiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwiYXBwLXJvb3QtcGF0aFwiIiwid2VicGFjazovLy9leHRlcm5hbCBcImNvbXByZXNzaW9uXCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwiY29ubmVjdC1tb25nb2RiLXNlc3Npb25cIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJjb3JlLWpzL21vZHVsZXMvZXMuYXJyYXkuY29uY2F0LmpzXCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwiY3J5cHRvXCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwiZXhwcmVzc1wiIiwid2VicGFjazovLy9leHRlcm5hbCBcImV4cHJlc3Mtc2Vzc2lvblwiIiwid2VicGFjazovLy9leHRlcm5hbCBcImhlbG1ldFwiIiwid2VicGFjazovLy9leHRlcm5hbCBcImhwcFwiIiwid2VicGFjazovLy9leHRlcm5hbCBcImh0dHBcIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJtc1wiIiwid2VicGFjazovLy9leHRlcm5hbCBcInBhdGhcIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJ1dWlkXCIiXSwibmFtZXMiOlsiX2NsYXNzQ2FsbENoZWNrIiwiaW5zdGFuY2UiLCJDb25zdHJ1Y3RvciIsIlR5cGVFcnJvciIsIl9kZWZpbmVQcm9wZXJ0aWVzIiwidGFyZ2V0IiwicHJvcHMiLCJpIiwibGVuZ3RoIiwiZGVzY3JpcHRvciIsImVudW1lcmFibGUiLCJjb25maWd1cmFibGUiLCJ3cml0YWJsZSIsIk9iamVjdCIsImRlZmluZVByb3BlcnR5Iiwia2V5IiwiX2NyZWF0ZUNsYXNzIiwicHJvdG9Qcm9wcyIsInN0YXRpY1Byb3BzIiwicHJvdG90eXBlIiwiV2ViU2VydmVyIiwiYXBwIiwiZXhwcmVzcyIsInNlcnZlciIsImNyZWF0ZVNlcnZlciIsInNlc3Npb25TZWNyZXQiLCJjcmVhdGVIYXNoIiwidXBkYXRlIiwicHJvY2VzcyIsImVudiIsIlNFU1NJT05fU0VDUkVUIiwiZGlnZXN0Iiwic2V0dXBHZW5lcmFsU2V0dGluZ3MiLCJzZXR1cFNlY3VyaXR5Iiwic2V0dXBTZXNzaW9uIiwic2V0dXBSb3V0ZXMiLCJ1c2UiLCJqc29uIiwidXJsZW5jb2RlZCIsImV4dGVuZGVkIiwiY29tcHJlc3Npb24iLCJyZXF1ZXN0IiwicmVzcG9uc2UiLCJuZXh0IiwiY29udGVudFNlY3VyaXR5Tm9uY2UiLCJ1dWlkVjQiLCJsb2NhbHMiLCJjc3BOb25jZSIsInN0eWxlU3JjIiwic2NyaXB0U3JjIiwicHVzaCIsImhlbG1ldE1pZGRsZVdhcmUiLCJoZWxtZXQiLCJjb250ZW50U2VjdXJpdHlQb2xpY3kiLCJkaXJlY3RpdmVzIiwiZGVmYXVsdFNyYyIsImhwcCIsIk1vbmdvREJTdG9yZSIsIm1vbmdvREJTZXNzaW9uIiwiZXhwcmVzc1Nlc3Npb24iLCJzdG9yZSIsInVyaSIsIkRCX0hPU1QiLCJEQl9QT1JUIiwiREJfREFUQUJBU0VfTkFNRSIsImNvbGxlY3Rpb24iLCJleHBpcmVzIiwibXMiLCJTRVNTSU9OX01BWF9BR0UiLCJvbiIsImVycm9yIiwiY29uc29sZSIsIm1lc3NhZ2UiLCJkZWJ1ZyIsInNlY3JldCIsImNvb2tpZSIsIm1heEFnZSIsInJlc2F2ZSIsInNhdmVVbmluaXRpYWxpemVkIiwiZXhwcmVzc1N0YXRpYyIsInBhdGgiLCJyZXNvbHZlIiwicm9vdFBhdGgiLCJQQVRIX1NUQVRJQ19GSUxFUyIsImxpc3RlbiIsIkFQUF9QT1JUIiwiQVBQX0hPU1QiLCJzdGFydCJdLCJtYXBwaW5ncyI6IjtRQUFBO1FBQ0E7O1FBRUE7UUFDQTs7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QUFDQUcsTUFBTSxDQUFDZ0UsS0FBUCxHOzs7Ozs7Ozs7OztBQzNGQSwwQzs7Ozs7Ozs7Ozs7QUNBQSx3Qzs7Ozs7Ozs7Ozs7QUNBQSxvRDs7Ozs7Ozs7Ozs7QUNBQSwrRDs7Ozs7Ozs7Ozs7QUNBQSxtQzs7Ozs7Ozs7Ozs7QUNBQSxvQzs7Ozs7Ozs7Ozs7QUNBQSw0Qzs7Ozs7Ozs7Ozs7QUNBQSxtQzs7Ozs7Ozs7Ozs7QUNBQSxnQzs7Ozs7Ozs7Ozs7QUNBQSxpQzs7Ozs7Ozs7Ozs7QUNBQSwrQjs7Ozs7Ozs7Ozs7QUNBQSxpQzs7Ozs7Ozs7Ozs7QUNBQSxpQyIsImZpbGUiOiJzZXJ2ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBnZXR0ZXIgfSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiBcdFx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG4gXHRcdH1cbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbiBcdH07XG5cbiBcdC8vIGNyZWF0ZSBhIGZha2UgbmFtZXNwYWNlIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDE6IHZhbHVlIGlzIGEgbW9kdWxlIGlkLCByZXF1aXJlIGl0XG4gXHQvLyBtb2RlICYgMjogbWVyZ2UgYWxsIHByb3BlcnRpZXMgb2YgdmFsdWUgaW50byB0aGUgbnNcbiBcdC8vIG1vZGUgJiA0OiByZXR1cm4gdmFsdWUgd2hlbiBhbHJlYWR5IG5zIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDh8MTogYmVoYXZlIGxpa2UgcmVxdWlyZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy50ID0gZnVuY3Rpb24odmFsdWUsIG1vZGUpIHtcbiBcdFx0aWYobW9kZSAmIDEpIHZhbHVlID0gX193ZWJwYWNrX3JlcXVpcmVfXyh2YWx1ZSk7XG4gXHRcdGlmKG1vZGUgJiA4KSByZXR1cm4gdmFsdWU7XG4gXHRcdGlmKChtb2RlICYgNCkgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAmJiB2YWx1ZS5fX2VzTW9kdWxlKSByZXR1cm4gdmFsdWU7XG4gXHRcdHZhciBucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18ucihucyk7XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShucywgJ2RlZmF1bHQnLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2YWx1ZSB9KTtcbiBcdFx0aWYobW9kZSAmIDIgJiYgdHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSBmb3IodmFyIGtleSBpbiB2YWx1ZSkgX193ZWJwYWNrX3JlcXVpcmVfXy5kKG5zLCBrZXksIGZ1bmN0aW9uKGtleSkgeyByZXR1cm4gdmFsdWVba2V5XTsgfS5iaW5kKG51bGwsIGtleSkpO1xuIFx0XHRyZXR1cm4gbnM7XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG4gXHQvLyBfX3dlYnBhY2tfaGFzaF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmggPSBcIjQxMTE2Y2Q2YTVmYjViYTlhNTdlXCI7XG5cbiBcdC8vIF9fd2VicGFja19jaHVua25hbWVfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jbiA9IFwic2VydmVyXCI7XG5cblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4uL3NyYy9zZXJ2ZXIvbWFpbi5qc1wiKTtcbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHtcbiAgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpO1xuICB9XG59IiwiZnVuY3Rpb24gX2RlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTtcbiAgICBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7XG4gICAgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlO1xuICAgIGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIF9jcmVhdGVDbGFzcyhDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHtcbiAgaWYgKHByb3RvUHJvcHMpIF9kZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7XG4gIGlmIChzdGF0aWNQcm9wcykgX2RlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTtcbiAgcmV0dXJuIENvbnN0cnVjdG9yO1xufSIsImltcG9ydCBleHByZXNzLCB7IGpzb24sIHVybGVuY29kZWQsIHN0YXRpYyBhcyBleHByZXNzU3RhdGljIH0gZnJvbSAnZXhwcmVzcyc7XG5pbXBvcnQgaHBwIGZyb20gJ2hwcCc7XG5pbXBvcnQgaGVsbWV0IGZyb20gJ2hlbG1ldCc7XG5pbXBvcnQgY29tcHJlc3Npb24gZnJvbSAnY29tcHJlc3Npb24nO1xuaW1wb3J0IGV4cHJlc3NTZXNzaW9uIGZyb20gJ2V4cHJlc3Mtc2Vzc2lvbic7XG5pbXBvcnQgbW9uZ29EQlNlc3Npb24gZnJvbSBcImNvbm5lY3QtbW9uZ29kYi1zZXNzaW9uXCI7XG5pbXBvcnQgeyB2NCBhcyB1dWlkVjQgfSBmcm9tIFwidXVpZFwiO1xuaW1wb3J0IHsgY3JlYXRlU2VydmVyIH0gZnJvbSAnaHR0cCc7XG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHsgcGF0aCBhcyByb290UGF0aCB9IGZyb20gXCJhcHAtcm9vdC1wYXRoXCI7XG5pbXBvcnQgbXMgZnJvbSBcIm1zXCI7XG5pbXBvcnQgeyBjcmVhdGVIYXNoIH0gZnJvbSAnY3J5cHRvJztcblxuY2xhc3MgV2ViU2VydmVyIHtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmFwcCA9IGV4cHJlc3MoKTtcbiAgICAgICAgdGhpcy5zZXJ2ZXIgPSBjcmVhdGVTZXJ2ZXIodGhpcy5hcHApO1xuICAgICAgICB0aGlzLnNlc3Npb25TZWNyZXQgPSBjcmVhdGVIYXNoKFwic2hhNTEyXCIpLnVwZGF0ZShwcm9jZXNzLmVudi5TRVNTSU9OX1NFQ1JFVCkuZGlnZXN0KFwiYmFzZTY0XCIpO1xuXG4gICAgICAgIHRoaXMuc2V0dXBHZW5lcmFsU2V0dGluZ3MoKTtcbiAgICAgICAgdGhpcy5zZXR1cFNlY3VyaXR5KCk7XG4gICAgICAgIHRoaXMuc2V0dXBTZXNzaW9uKCk7XG4gICAgICAgIHRoaXMuc2V0dXBSb3V0ZXMoKTtcbiAgICB9XG5cbiAgICBzZXR1cEdlbmVyYWxTZXR0aW5ncygpIHtcbiAgICAgICAgLy8gcGFyc2UgdGhlIGJvZHkgdG8gZ2V0IHBvc3QgZGF0YSBhbmQgc28gb25cbiAgICAgICAgLy8gTk9URTogVGhpcyBpcyBpbXBvcnRhbnQgZm9yIHNvbWUgbWlkZGxld2FyZXMgdG8gaGF2ZSBkaXJlY3RseS5cbiAgICAgICAgLy8gICAgICAgU28gdGhpcyBoYXMgdG8gYmUgdGhlIGZpcnN0IG1pZGRsZXdhcmVcbiAgICAgICAgdGhpcy5hcHAudXNlKGpzb24oKSk7XG4gICAgICAgIHRoaXMuYXBwLnVzZSh1cmxlbmNvZGVkKHsgZXh0ZW5kZWQ6IHRydWUgfSkpO1xuICAgICAgICB0aGlzLmFwcC51c2UoY29tcHJlc3Npb24oKSk7XG4gICAgfVxuXG4gICAgc2V0dXBTZWN1cml0eSgpIHtcbiAgICAgICAgdGhpcy5hcHAudXNlKChyZXF1ZXN0LCByZXNwb25zZSwgbmV4dCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgY29udGVudFNlY3VyaXR5Tm9uY2UgPSB1dWlkVjQoKTtcbiAgICAgICAgICAgIHJlc3BvbnNlLmxvY2Fscy5jc3BOb25jZSA9IGNvbnRlbnRTZWN1cml0eU5vbmNlO1xuXG4gICAgICAgICAgICBjb25zdCBzdHlsZVNyYyA9IFtcIidzZWxmJ1wiXTtcbiAgICAgICAgICAgIGNvbnN0IHNjcmlwdFNyYyA9IHN0eWxlU3JjO1xuICAgICAgICAgICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAnZGV2ZWxvcG1lbnQnKSB7XG4gICAgICAgICAgICAgICAgc3R5bGVTcmMucHVzaChcIid1bnNhZmUtZXZhbCdcIiwgXCIndW5zYWZlLWlubGluZSdcIik7XG4gICAgICAgICAgICB9IGVsc2Ugc3R5bGVTcmMucHVzaChgJ25vbmNlLSR7Y29udGVudFNlY3VyaXR5Tm9uY2V9J2ApO1xuXG4gICAgICAgICAgICBjb25zdCBoZWxtZXRNaWRkbGVXYXJlID0gaGVsbWV0KHtcbiAgICAgICAgICAgICAgICBjb250ZW50U2VjdXJpdHlQb2xpY3k6IHtcbiAgICAgICAgICAgICAgICAgICAgZGlyZWN0aXZlczogeyBkZWZhdWx0U3JjOiBbXCInc2VsZidcIl0sIHNjcmlwdFNyYywgc3R5bGVTcmMgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaGVsbWV0TWlkZGxlV2FyZShyZXF1ZXN0LCByZXNwb25zZSwgbmV4dCk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmFwcC51c2UoaHBwKCkpO1xuICAgIH1cblxuICAgIHNldHVwU2Vzc2lvbigpIHtcbiAgICAgICAgY29uc3QgTW9uZ29EQlN0b3JlID0gbW9uZ29EQlNlc3Npb24oZXhwcmVzc1Nlc3Npb24pO1xuICAgICAgICBjb25zdCBzdG9yZSA9IG5ldyBNb25nb0RCU3RvcmUoe1xuICAgICAgICAgICAgdXJpOiBgbW9uZ29kYjovLyR7cHJvY2Vzcy5lbnYuREJfSE9TVH06JHtwcm9jZXNzLmVudi5EQl9QT1JUfS8ke3Byb2Nlc3MuZW52LkRCX0RBVEFCQVNFX05BTUV9YCxcbiAgICAgICAgICAgIGNvbGxlY3Rpb246IFwic2Vzc2lvbnNcIixcbiAgICAgICAgICAgIGV4cGlyZXM6IG1zKHByb2Nlc3MuZW52LlNFU1NJT05fTUFYX0FHRSlcbiAgICAgICAgfSk7XG5cbiAgICAgICAgc3RvcmUub24oXCJlcnJvclwiLCAoZXJyb3IpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJTZXNzaW9uIHN0b3JlIGNvdWxkIG5vdCBjb25uZWN0IHRvIERhdGFiYXNlLiBSZWFzb246XCIgKyBlcnJvci5tZXNzYWdlKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgc3RvcmUub24oXCJjb25uZWN0ZWRcIiwgKCkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5kZWJ1ZyhcIlNlc3Npb24gc3RvcmUgY29ubmVjdGVkIHRvIGRhdGFiYXNlXCIpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmFwcC51c2UoZXhwcmVzc1Nlc3Npb24oe1xuICAgICAgICAgICAgc2VjcmV0OiB0aGlzLnNlc3Npb25TZWNyZXQsXG4gICAgICAgICAgICBjb29raWU6IHsgbWF4QWdlOiBtcyhwcm9jZXNzLmVudi5TRVNTSU9OX01BWF9BR0UpIH0sXG4gICAgICAgICAgICBzdG9yZSxcbiAgICAgICAgICAgIHJlc2F2ZTogdHJ1ZSxcbiAgICAgICAgICAgIHNhdmVVbmluaXRpYWxpemVkOiB0cnVlXG4gICAgICAgIH0pKTtcbiAgICB9XG5cbiAgICBzZXR1cFJvdXRlcygpIHtcbiAgICAgICAgdGhpcy5hcHAudXNlKGV4cHJlc3NTdGF0aWMocGF0aC5yZXNvbHZlKHJvb3RQYXRoLCBwcm9jZXNzLmVudi5QQVRIX1NUQVRJQ19GSUxFUykpKTtcbiAgICB9XG5cbiAgICBzdGFydCgpIHtcbiAgICAgICAgdGhpcy5zZXJ2ZXIubGlzdGVuKHByb2Nlc3MuZW52LkFQUF9QT1JULCBwcm9jZXNzLmVudi5BUFBfSE9TVCk7XG4gICAgfVxufVxuXG5jb25zdCBzZXJ2ZXIgPSBuZXcgV2ViU2VydmVyKCk7XG5zZXJ2ZXIuc3RhcnQoKTtcbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImFwcC1yb290LXBhdGhcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiY29tcHJlc3Npb25cIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiY29ubmVjdC1tb25nb2RiLXNlc3Npb25cIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiY29yZS1qcy9tb2R1bGVzL2VzLmFycmF5LmNvbmNhdC5qc1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJjcnlwdG9cIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiZXhwcmVzc1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJleHByZXNzLXNlc3Npb25cIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiaGVsbWV0XCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImhwcFwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJodHRwXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIm1zXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcInBhdGhcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwidXVpZFwiKTsiXSwic291cmNlUm9vdCI6IiJ9