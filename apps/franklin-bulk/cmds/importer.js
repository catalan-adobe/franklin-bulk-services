exports.command = 'importer <command>'
exports.desc = 'Franklin Importer commands'
// exports.exclude = /.*_worker.js$/;
exports.builder = function (yargs) {
  return yargs.commandDir('importer_cmds')
}
exports.handler = function (argv) {}