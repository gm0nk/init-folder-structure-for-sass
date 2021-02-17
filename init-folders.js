const path = require("path");
const fs = require("fs/promises");
const types = {
  folder: "folder",
  file: "file",
};
const helpText = `Usage: you can just run the script with "node ${process.argv[1]}"
        which will result in creating folder structure in your current working directory
        or run it like this "node ${process.argv[1]} <path>"
        where <path> is where folder structure will be created
        (all nonexistent folders along the path will be created)
        !!!do not forget to inclose <path> in quotation marks if you're using backslashes (on Windows)!!!
        or run like this "node ${process.argv[1]} <path> <project-name>"
        where <project-name> is name of folder that will contain whole folder structure
        `;
const args = process.argv.slice(2);
let destinationPath = "./";
const fileRecord = (name) => ({ name, type: types.file });
const folderRecord = (name, children = []) => ({
  name,
  type: types.folder,
  children,
});
const folderStructureSass = folderRecord("sass", [
  folderRecord("components", []),
  folderRecord("layout", []),
  folderRecord("pages", []),
  folderRecord("abstracts", [
    fileRecord("_variable.scss"),
    fileRecord("_functions.scss"),
    fileRecord("_mixins.scss"),
  ]),
  folderRecord("base", [
    fileRecord("_animations.scss"),
    fileRecord("_base.scss"),
    fileRecord("_typography.scss"),
    fileRecord("_utilities.scss"),
  ]),
  fileRecord("main.scss"),
]);
const folderStructureAssets = folderRecord("assets", [
  folderRecord("images", []),
  folderRecord("videos", []),
]);
const folderStructureBase = folderRecord("", [
  folderStructureSass,
  folderStructureAssets,
]);
const createFolderStructure = async (folder, currentPath) => {
  const folderPath = path.join(currentPath, folder.name);
  await fs.mkdir(folderPath, { recursive: true });
  if (folder.children.length) {
    for (const child of folder.children) {
      if (child.type === types.file) {
        await fs.writeFile(path.join(folderPath, child.name), "");
      }
      if (child.type === types.folder) {
        await createFolderStructure(child, folderPath);
      }
    }
  }
};

async function main() {
  try {
    if (args.length) {
      if (
        args.find(
          (element) =>
            (element === "-h") | (element === "--help") | (element === "-help")
        )
      ) {
        console.log(helpText);
        return 0;
      }
      destinationPath = path.normalize(args[0]);
      if (args[1]) {
        folderStructureBase.name = args[1];
      }
    }
    createFolderStructure(folderStructureBase, destinationPath);
  } catch (error) {
    console.log(`There was an error ${error}`);
  }
}

main();
