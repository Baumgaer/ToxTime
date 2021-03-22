declare type Request = import("express").Request
declare type Response = import("express").Response
declare type NextFunction = import("express").NextFunction
declare type RequestHandler = import("express").RequestHandler
declare type ModelExport = {
    RawClass: import("./src/common/lib/BaseModel").default,
    Schema: import("mongoose").Schema,
    Model: import("mongoose").Model<import("./src/common/lib/BaseModel").default>
}
