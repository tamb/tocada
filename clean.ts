import fs from "bun:fs";
import path from "bun:path";

function deleteFile(file: string) {
  if (fs.existsSync(file)) {
    fs.unlinkSync(file);
  }
}

function deleteAllTgzFiles() {
  const files = fs.readdirSync("./");
  for (const file of files) {
    if (file.endsWith(".tgz")) {
      deleteFile(file);
    }
  }
}

function deleteFolder(folder: string) {
  if (fs.existsSync(folder)) {
    fs.rmSync(folder, { recursive: true });
  }
}

function deleteFolderRecursive(folder: string) {
  if (fs.existsSync(folder)) {
    fs.rmSync(folder, { recursive: true, force: true });
  }
}

deleteAllTgzFiles();
deleteFile("local-demo/bun.lockb");
deleteFolderRecursive(".parcel-cache");
deleteFolderRecursive("local-demo/dist");
deleteFolderRecursive("local-demo/node_modules");
