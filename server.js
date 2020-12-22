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
/******/ 	__webpack_require__.h = "0e5f6e4be7dfabe5f2fc";
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
/* harmony import */ var core_js_modules_es_array_concat__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! core-js/modules/es.array.concat */ "core-js/modules/es.array.concat");
/* harmony import */ var core_js_modules_es_array_concat__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_array_concat__WEBPACK_IMPORTED_MODULE_0__);
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















var WebServer = /*#__PURE__*/function () {
  function WebServer() {
    Object(D_Atom_projects_ba_node_modules_babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_1__["default"])(this, WebServer);

    this.app = express__WEBPACK_IMPORTED_MODULE_3___default()();
    this.server = Object(http__WEBPACK_IMPORTED_MODULE_10__["createServer"])(this.app);
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
        var helmetMiddleWare = helmet__WEBPACK_IMPORTED_MODULE_5___default()({
          contentSecurityPolicy: {
            directives: {
              defaultSrc: ["'self'"],
              scriptSrc: ["'self'", "'nonce-".concat(contentSecurityNonce, "'")].concat( true ? ["'unsafe-eval'"] : undefined),
              styleSrc: ["'self'", "'nonce-".concat(contentSecurityNonce, "'"), "'sha256-rJJyMDPmHMZS0mPmL877gjjApxGMVa4522UDb4ctw7I='"]
            }
          }
        });
        if ( true && request.path === "/api") return next();
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
        secret: process.env.SESSION_SECRET,
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

/***/ "core-js/modules/es.array.concat":
/*!**************************************************!*\
  !*** external "core-js/modules/es.array.concat" ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("core-js/modules/es.array.concat");

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4uL25vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL2VzbS9jbGFzc0NhbGxDaGVjay5qcyIsIndlYnBhY2s6Ly8vLi4vbm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvZXNtL2NyZWF0ZUNsYXNzLmpzIiwid2VicGFjazovLy8uLi9zcmMvc2VydmVyL21haW4uanMiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwiYXBwLXJvb3QtcGF0aFwiIiwid2VicGFjazovLy9leHRlcm5hbCBcImNvbXByZXNzaW9uXCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwiY29ubmVjdC1tb25nb2RiLXNlc3Npb25cIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJjb3JlLWpzL21vZHVsZXMvZXMuYXJyYXkuY29uY2F0XCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwiZXhwcmVzc1wiIiwid2VicGFjazovLy9leHRlcm5hbCBcImV4cHJlc3Mtc2Vzc2lvblwiIiwid2VicGFjazovLy9leHRlcm5hbCBcImhlbG1ldFwiIiwid2VicGFjazovLy9leHRlcm5hbCBcImhwcFwiIiwid2VicGFjazovLy9leHRlcm5hbCBcImh0dHBcIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJtc1wiIiwid2VicGFjazovLy9leHRlcm5hbCBcInBhdGhcIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJ1dWlkXCIiXSwibmFtZXMiOlsiX2NsYXNzQ2FsbENoZWNrIiwiaW5zdGFuY2UiLCJDb25zdHJ1Y3RvciIsIlR5cGVFcnJvciIsIl9kZWZpbmVQcm9wZXJ0aWVzIiwidGFyZ2V0IiwicHJvcHMiLCJpIiwibGVuZ3RoIiwiZGVzY3JpcHRvciIsImVudW1lcmFibGUiLCJjb25maWd1cmFibGUiLCJ3cml0YWJsZSIsIk9iamVjdCIsImRlZmluZVByb3BlcnR5Iiwia2V5IiwiX2NyZWF0ZUNsYXNzIiwicHJvdG9Qcm9wcyIsInN0YXRpY1Byb3BzIiwicHJvdG90eXBlIiwiV2ViU2VydmVyIiwiYXBwIiwiZXhwcmVzcyIsInNlcnZlciIsImNyZWF0ZVNlcnZlciIsInNldHVwR2VuZXJhbFNldHRpbmdzIiwic2V0dXBTZWN1cml0eSIsInNldHVwU2Vzc2lvbiIsInNldHVwUm91dGVzIiwidXNlIiwianNvbiIsInVybGVuY29kZWQiLCJleHRlbmRlZCIsImNvbXByZXNzaW9uIiwicmVxdWVzdCIsInJlc3BvbnNlIiwibmV4dCIsImNvbnRlbnRTZWN1cml0eU5vbmNlIiwidXVpZFY0IiwibG9jYWxzIiwiY3NwTm9uY2UiLCJoZWxtZXRNaWRkbGVXYXJlIiwiaGVsbWV0IiwiY29udGVudFNlY3VyaXR5UG9saWN5IiwiZGlyZWN0aXZlcyIsImRlZmF1bHRTcmMiLCJzY3JpcHRTcmMiLCJjb25jYXQiLCJwcm9jZXNzIiwic3R5bGVTcmMiLCJwYXRoIiwiaHBwIiwiTW9uZ29EQlN0b3JlIiwibW9uZ29EQlNlc3Npb24iLCJleHByZXNzU2Vzc2lvbiIsInN0b3JlIiwidXJpIiwiZW52IiwiREJfSE9TVCIsIkRCX1BPUlQiLCJEQl9EQVRBQkFTRV9OQU1FIiwiY29sbGVjdGlvbiIsImV4cGlyZXMiLCJtcyIsIlNFU1NJT05fTUFYX0FHRSIsIm9uIiwiZXJyb3IiLCJjb25zb2xlIiwibWVzc2FnZSIsImRlYnVnIiwic2VjcmV0IiwiU0VTU0lPTl9TRUNSRVQiLCJjb29raWUiLCJtYXhBZ2UiLCJyZXNhdmUiLCJzYXZlVW5pbml0aWFsaXplZCIsImV4cHJlc3NTdGF0aWMiLCJyZXNvbHZlIiwicm9vdFBhdGgiLCJQQVRIX1NUQVRJQ19GSUxFUyIsImxpc3RlbiIsIkFQUF9QT1JUIiwiQVBQX0hPU1QiLCJzdGFydCJdLCJtYXBwaW5ncyI6IjtRQUFBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFD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Ozs7O0FDQUEsaUM7Ozs7Ozs7Ozs7O0FDQUEsK0I7Ozs7Ozs7Ozs7O0FDQUEsaUM7Ozs7Ozs7Ozs7O0FDQUEsaUMiLCJmaWxlIjoic2VydmVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZ2V0dGVyIH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSBmdW5jdGlvbihleHBvcnRzKSB7XG4gXHRcdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuIFx0XHR9XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG4gXHR9O1xuXG4gXHQvLyBjcmVhdGUgYSBmYWtlIG5hbWVzcGFjZSBvYmplY3RcbiBcdC8vIG1vZGUgJiAxOiB2YWx1ZSBpcyBhIG1vZHVsZSBpZCwgcmVxdWlyZSBpdFxuIFx0Ly8gbW9kZSAmIDI6IG1lcmdlIGFsbCBwcm9wZXJ0aWVzIG9mIHZhbHVlIGludG8gdGhlIG5zXG4gXHQvLyBtb2RlICYgNDogcmV0dXJuIHZhbHVlIHdoZW4gYWxyZWFkeSBucyBvYmplY3RcbiBcdC8vIG1vZGUgJiA4fDE6IGJlaGF2ZSBsaWtlIHJlcXVpcmVcbiBcdF9fd2VicGFja19yZXF1aXJlX18udCA9IGZ1bmN0aW9uKHZhbHVlLCBtb2RlKSB7XG4gXHRcdGlmKG1vZGUgJiAxKSB2YWx1ZSA9IF9fd2VicGFja19yZXF1aXJlX18odmFsdWUpO1xuIFx0XHRpZihtb2RlICYgOCkgcmV0dXJuIHZhbHVlO1xuIFx0XHRpZigobW9kZSAmIDQpICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgJiYgdmFsdWUuX19lc01vZHVsZSkgcmV0dXJuIHZhbHVlO1xuIFx0XHR2YXIgbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIobnMpO1xuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkobnMsICdkZWZhdWx0JywgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdmFsdWUgfSk7XG4gXHRcdGlmKG1vZGUgJiAyICYmIHR5cGVvZiB2YWx1ZSAhPSAnc3RyaW5nJykgZm9yKHZhciBrZXkgaW4gdmFsdWUpIF9fd2VicGFja19yZXF1aXJlX18uZChucywga2V5LCBmdW5jdGlvbihrZXkpIHsgcmV0dXJuIHZhbHVlW2tleV07IH0uYmluZChudWxsLCBrZXkpKTtcbiBcdFx0cmV0dXJuIG5zO1xuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuIFx0Ly8gX193ZWJwYWNrX2hhc2hfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5oID0gXCIwZTVmNmU0YmU3ZGZhYmU1ZjJmY1wiO1xuXG4gXHQvLyBfX3dlYnBhY2tfY2h1bmtuYW1lX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18uY24gPSBcInNlcnZlclwiO1xuXG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gXCIuLi9zcmMvc2VydmVyL21haW4uanNcIik7XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7XG4gIGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTtcbiAgfVxufSIsImZ1bmN0aW9uIF9kZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07XG4gICAgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlO1xuICAgIGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTtcbiAgICBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBfY3JlYXRlQ2xhc3MoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7XG4gIGlmIChwcm90b1Byb3BzKSBfZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpO1xuICBpZiAoc3RhdGljUHJvcHMpIF9kZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7XG4gIHJldHVybiBDb25zdHJ1Y3Rvcjtcbn0iLCJpbXBvcnQgZXhwcmVzcywgeyBqc29uLCB1cmxlbmNvZGVkLCBzdGF0aWMgYXMgZXhwcmVzc1N0YXRpYyB9IGZyb20gJ2V4cHJlc3MnO1xuaW1wb3J0IGhwcCBmcm9tICdocHAnO1xuaW1wb3J0IGhlbG1ldCBmcm9tICdoZWxtZXQnO1xuaW1wb3J0IGNvbXByZXNzaW9uIGZyb20gJ2NvbXByZXNzaW9uJztcbmltcG9ydCBleHByZXNzU2Vzc2lvbiBmcm9tICdleHByZXNzLXNlc3Npb24nO1xuaW1wb3J0IG1vbmdvREJTZXNzaW9uIGZyb20gXCJjb25uZWN0LW1vbmdvZGItc2Vzc2lvblwiO1xuaW1wb3J0IHsgdjQgYXMgdXVpZFY0IH0gZnJvbSBcInV1aWRcIjtcbmltcG9ydCB7IGNyZWF0ZVNlcnZlciB9IGZyb20gJ2h0dHAnO1xuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcbmltcG9ydCB7IHBhdGggYXMgcm9vdFBhdGggfSBmcm9tIFwiYXBwLXJvb3QtcGF0aFwiO1xuaW1wb3J0IG1zIGZyb20gXCJtc1wiO1xuXG5jbGFzcyBXZWJTZXJ2ZXIge1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuYXBwID0gZXhwcmVzcygpO1xuICAgICAgICB0aGlzLnNlcnZlciA9IGNyZWF0ZVNlcnZlcih0aGlzLmFwcCk7XG5cbiAgICAgICAgdGhpcy5zZXR1cEdlbmVyYWxTZXR0aW5ncygpO1xuICAgICAgICB0aGlzLnNldHVwU2VjdXJpdHkoKTtcbiAgICAgICAgdGhpcy5zZXR1cFNlc3Npb24oKTtcbiAgICAgICAgdGhpcy5zZXR1cFJvdXRlcygpO1xuICAgIH1cblxuICAgIHNldHVwR2VuZXJhbFNldHRpbmdzKCkge1xuICAgICAgICAvLyBwYXJzZSB0aGUgYm9keSB0byBnZXQgcG9zdCBkYXRhIGFuZCBzbyBvblxuICAgICAgICAvLyBOT1RFOiBUaGlzIGlzIGltcG9ydGFudCBmb3Igc29tZSBtaWRkbGV3YXJlcyB0byBoYXZlIGRpcmVjdGx5LlxuICAgICAgICAvLyAgICAgICBTbyB0aGlzIGhhcyB0byBiZSB0aGUgZmlyc3QgbWlkZGxld2FyZVxuICAgICAgICB0aGlzLmFwcC51c2UoanNvbigpKTtcbiAgICAgICAgdGhpcy5hcHAudXNlKHVybGVuY29kZWQoeyBleHRlbmRlZDogdHJ1ZSB9KSk7XG4gICAgICAgIHRoaXMuYXBwLnVzZShjb21wcmVzc2lvbigpKTtcbiAgICB9XG5cbiAgICBzZXR1cFNlY3VyaXR5KCkge1xuICAgICAgICB0aGlzLmFwcC51c2UoKHJlcXVlc3QsIHJlc3BvbnNlLCBuZXh0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBjb250ZW50U2VjdXJpdHlOb25jZSA9IHV1aWRWNCgpO1xuICAgICAgICAgICAgcmVzcG9uc2UubG9jYWxzLmNzcE5vbmNlID0gY29udGVudFNlY3VyaXR5Tm9uY2U7XG4gICAgICAgICAgICBjb25zdCBoZWxtZXRNaWRkbGVXYXJlID0gaGVsbWV0KHtcbiAgICAgICAgICAgICAgICBjb250ZW50U2VjdXJpdHlQb2xpY3k6IHtcbiAgICAgICAgICAgICAgICAgICAgZGlyZWN0aXZlczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdFNyYzogW1wiJ3NlbGYnXCJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2NyaXB0U3JjOiBbXCInc2VsZidcIiwgYCdub25jZS0ke2NvbnRlbnRTZWN1cml0eU5vbmNlfSdgXS5jb25jYXQocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdkZXZlbG9wbWVudCcgPyBbXCIndW5zYWZlLWV2YWwnXCJdIDogW10pLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGVTcmM6IFtcIidzZWxmJ1wiLCBgJ25vbmNlLSR7Y29udGVudFNlY3VyaXR5Tm9uY2V9J2AsIFwiJ3NoYTI1Ni1ySkp5TURQbUhNWlMwbVBtTDg3N2dqakFweEdNVmE0NTIyVURiNGN0dzdJPSdcIl1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAnZGV2ZWxvcG1lbnQnICYmIHJlcXVlc3QucGF0aCA9PT0gXCIvYXBpXCIpIHJldHVybiBuZXh0KCk7XG4gICAgICAgICAgICBoZWxtZXRNaWRkbGVXYXJlKHJlcXVlc3QsIHJlc3BvbnNlLCBuZXh0KTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuYXBwLnVzZShocHAoKSk7XG4gICAgfVxuXG4gICAgc2V0dXBTZXNzaW9uKCkge1xuICAgICAgICBjb25zdCBNb25nb0RCU3RvcmUgPSBtb25nb0RCU2Vzc2lvbihleHByZXNzU2Vzc2lvbik7XG4gICAgICAgIGNvbnN0IHN0b3JlID0gbmV3IE1vbmdvREJTdG9yZSh7XG4gICAgICAgICAgICB1cmk6IGBtb25nb2RiOi8vJHtwcm9jZXNzLmVudi5EQl9IT1NUfToke3Byb2Nlc3MuZW52LkRCX1BPUlR9LyR7cHJvY2Vzcy5lbnYuREJfREFUQUJBU0VfTkFNRX1gLFxuICAgICAgICAgICAgY29sbGVjdGlvbjogXCJzZXNzaW9uc1wiLFxuICAgICAgICAgICAgZXhwaXJlczogbXMocHJvY2Vzcy5lbnYuU0VTU0lPTl9NQVhfQUdFKVxuICAgICAgICB9KTtcblxuICAgICAgICBzdG9yZS5vbihcImVycm9yXCIsIChlcnJvcikgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIlNlc3Npb24gc3RvcmUgY291bGQgbm90IGNvbm5lY3QgdG8gRGF0YWJhc2UuIFJlYXNvbjpcIiArIGVycm9yLm1lc3NhZ2UpO1xuICAgICAgICB9KTtcblxuICAgICAgICBzdG9yZS5vbihcImNvbm5lY3RlZFwiLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmRlYnVnKFwiU2Vzc2lvbiBzdG9yZSBjb25uZWN0ZWQgdG8gZGF0YWJhc2VcIik7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuYXBwLnVzZShleHByZXNzU2Vzc2lvbih7XG4gICAgICAgICAgICBzZWNyZXQ6IHByb2Nlc3MuZW52LlNFU1NJT05fU0VDUkVULFxuICAgICAgICAgICAgY29va2llOiB7IG1heEFnZTogbXMocHJvY2Vzcy5lbnYuU0VTU0lPTl9NQVhfQUdFKSB9LFxuICAgICAgICAgICAgc3RvcmUsXG4gICAgICAgICAgICByZXNhdmU6IHRydWUsXG4gICAgICAgICAgICBzYXZlVW5pbml0aWFsaXplZDogdHJ1ZVxuICAgICAgICB9KSk7XG4gICAgfVxuXG4gICAgc2V0dXBSb3V0ZXMoKSB7XG4gICAgICAgIHRoaXMuYXBwLnVzZShleHByZXNzU3RhdGljKHBhdGgucmVzb2x2ZShyb290UGF0aCwgcHJvY2Vzcy5lbnYuUEFUSF9TVEFUSUNfRklMRVMpKSk7XG4gICAgfVxuXG4gICAgc3RhcnQoKSB7XG4gICAgICAgIHRoaXMuc2VydmVyLmxpc3Rlbihwcm9jZXNzLmVudi5BUFBfUE9SVCwgcHJvY2Vzcy5lbnYuQVBQX0hPU1QpO1xuICAgIH1cbn1cblxuY29uc3Qgc2VydmVyID0gbmV3IFdlYlNlcnZlcigpO1xuc2VydmVyLnN0YXJ0KCk7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJhcHAtcm9vdC1wYXRoXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImNvbXByZXNzaW9uXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImNvbm5lY3QtbW9uZ29kYi1zZXNzaW9uXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImNvcmUtanMvbW9kdWxlcy9lcy5hcnJheS5jb25jYXRcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiZXhwcmVzc1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJleHByZXNzLXNlc3Npb25cIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiaGVsbWV0XCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImhwcFwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJodHRwXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIm1zXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcInBhdGhcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwidXVpZFwiKTsiXSwic291cmNlUm9vdCI6IiJ9