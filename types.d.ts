declare type Request = import("express").Request
declare type Response = import("express").Response
declare type NextFunction = import("express").NextFunction
declare type RequestHandler = import("express").RequestHandler

interface ModelExport {
    RawClass: import("./src/common/lib/BaseModel").default,
    Schema: import("mongoose").Schema,
    Model: import("mongoose").Model<import("./src/common/lib/BaseModel").default>
}

interface Window {
    _modelMap: Record<string, ModelExport>
    _activeUser: InstanceType<import("~client/models/User")["RawClass"]>
}

namespace NodeJS { // eslint-disable-line
    interface Global {
        _modelMap: Record<string, ModelExport>
    }
}
