export class FileTreeNode {
  children: Map<string, FileTreeNode> = new Map();
  parent: FileTreeNode | null = null;
  name: string;
  type: "file" | "directory";
  size: number; // 0 for directories
  created: Date;

  constructor(
    name: string,
    type: "file" | "directory",
    size: number = 0,
    created: Date = new Date()
  ) {
    this.name = name;
    this.type = type;
    this.size = size;
    this.created = created;
  }

  getFullNodePath(): string {
    if (!this.parent) return "/";
    const parts: string[] = [];
    let current: FileTreeNode | null = this;
    while (current && current.parent) {
      parts.unshift(current.name);
      current = current.parent;
    }
    return "/" + parts.join("/");
  }

  search(predicate: (node: FileTreeNode) => boolean): FileTreeNode[] {
    let results: FileTreeNode[] = [];
    if (predicate(this)) {
      results.push(this);
    }
    for (const child of this.children.values()) {
      results = results.concat(child.search(predicate));
    }
    return results;
  }

  isDescendantOf(potentialAncestor: FileTreeNode): boolean {
    let current: FileTreeNode | null = this.parent;
    while (current) {
      if (current === potentialAncestor) return true;
      current = current.parent;
    }
    return false;
  }
}
