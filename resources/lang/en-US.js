const ctx = require.context('./en-US', true, /^\.\/.*\.js$/)
ctx.keys().forEach(ctx)

console.log(ctx.keys())
