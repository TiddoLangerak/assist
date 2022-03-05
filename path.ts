export interface Path {
  readonly root: string;
  readonly file: string;
  readonly fullPath : string;
}

class Path_ implements Path {
  readonly root: string;
  readonly file: string;
  get fullPath() {
    if (this.root === '/') {
      return this.file;
    }
    return this.root + '/' + this.file;
  }
  constructor(root: string, file: string) {
    this.root = root;
    this.file = file;
  }
}

export function path(root: string, file?: string) {
  if (!file) {
    const startOfFile = root.lastIndexOf('/');
    if (startOfFile === -1) {
      return new Path_("/", root);
    } else {
      return new Path_(root.substr(0, startOfFile), root.substr(startOfFile + 1));
    }
  }
  return new Path_(root, file);
}
