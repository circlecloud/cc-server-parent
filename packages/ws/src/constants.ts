export const TYPE = {
    Namespace: Symbol.for('namespace'),
    SocketContext: Symbol.for('context')
}

export const METADATA_KEY = {
    namespace: "@cc-server/ws:namespace",
    listener: "@cc-server/ws:listener",
    defer: "@cc-server/ws:defer"
};
