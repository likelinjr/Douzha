import * as fileTools from './tools.js'

export const file_toolHandlers: Record<string, (args: any) => Promise<string>> = {
  'read_file':   (args) => fileTools.readFile(args.path),
  'write_file':  (args) => fileTools.writeFile(args.path, args.content),
  'list_files':  (args) => fileTools.listFiles(args.path || "."),
  'delete_file': (args) => fileTools.deleteFile(args.path),
  'copy_file':   (args) => fileTools.copyFile(args.source, args.destination),
  'edit_file':   (args) => fileTools.editFile(args.path, args.old_text, args.new_text),
}