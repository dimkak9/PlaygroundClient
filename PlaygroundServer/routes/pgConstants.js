function define(name, value) {
    Object.defineProperty(exports, name, {
        value:      value,
        enumerable: true
    });
}

define("PLACESTATUS_NEW", "new");
define("PLACESTATUS_APPROVED", "approved");
define("PLACESTATUS_REMOVED", "removed");
define("PLACESTATUS_UPDATED", "updated");