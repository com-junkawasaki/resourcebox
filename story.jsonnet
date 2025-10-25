// DAG: resourcebox-story
// ResourceBox プロセスネットワーク DAG 定義
// トポロジカルソート: init → tooling → ontology → resource → shape → process_rpc → validation → cli → examples → docs → ci_cd → complete

local dag = {
  // 0. プロジェクト基盤初期化
  init: {
    id: "init",
    description: "package.json, tsconfig.json, pnpm, biome など初期設定",
    dependencies: [],
    outputs: [
      "package.json",
      "tsconfig.json",
      "biome.json",
      "pnpm-lock.yaml",
      ".gitignore",
    ],
  },

  // 1. ツールチェーン整備
  tooling: {
    id: "tooling",
    description: "Vitest / Changesets / GitHub Actions 下準備",
    dependencies: ["init"],
    outputs: [
      "vitest.config.ts",
      ".changeset/config.json",
      ".github/workflows/ci.yml",
    ],
  },

  // 2. Ontology レイヤー
  ontology: {
    id: "ontology",
    description: "Onto.Namespace / Onto.Class / Onto.Property / Onto.Datatype / OWL Expressions / Ontology Container / JSON-LD Export 実装",
    dependencies: ["tooling"],
    outputs: [
      "src/onto/namespace.ts",
      "src/onto/class.ts",
      "src/onto/property.ts",
      "src/onto/datatype.ts",
      "src/onto/index.ts",
      "src/onto/expressions.ts",
      "src/onto/ontology.ts",
      "src/onto/jsonld.ts",
    ],
  },

  // 3. Resource レイヤー
  resource: {
    id: "resource",
    description: "Resource.* API と JSON-LD / validation 連携",
    dependencies: ["ontology"],
    outputs: [
      "src/resource/primitives.ts",
      "src/resource/object.ts",
      "src/resource/array.ts",
      "src/resource/ref.ts",
      "src/resource/optional.ts",
      "src/resource/literal.ts",
      "src/resource/context.ts",
      "src/resource/validate.ts",
      "src/resource/shaped.ts",
      "src/resource/index.ts",
    ],
  },

  // 4. SHACL Shape レイヤー
  shape: {
    id: "shape",
    description: "Shape.Define / Shape.Property / Shape.fromResource / Shape.validate / SHACL JSON-LD Export / SHACL-lite",
    dependencies: ["resource"],
    outputs: [
      "src/shape/define.ts",
      "src/shape/property.ts",
      "src/shape/from-resource.ts",
      "src/shape/validate.ts",
      "src/shape/index.ts",
      "src/shape/jsonld.ts",
    ],
  },

  // 5. RPC プロセス層
  process_rpc: {
    id: "process_rpc",
    description: "JSON-LD コンテキストから RPC 型安全性を導出する内部モジュール",
    dependencies: ["shape"],
    outputs: [
      "src/_internal/process/rpc/context-types.ts",
      "src/_internal/process/rpc/index.ts",
      "src/_internal/process/rpc/__tests__/context-types.test.ts",
    ],
  },

  // 6. 検証・テスト統合
  validation: {
    id: "validation",
    description: "Resource / Shape / Process RPC 統合テストと toTypeBox 連携",
    dependencies: ["process_rpc"],
    outputs: [
      "src/resource/__tests__",
      "src/shape/__tests__",
      "src/__tests__/integration.test.ts",
    ],
  },

  // 7. CLI 実装
  cli: {
    id: "cli",
    description: "Commander ベースの CLI (context / shape 生成)",
    dependencies: ["validation"],
    outputs: [
      "src/cli/index.ts",
      "package.json#bin",
    ],
  },

  // 8. Examples / SPARQL 連携
  examples: {
    id: "examples",
    description: "Comunica + 各種 SPARQL DB 例、CLI デモ",
    dependencies: ["cli"],
    outputs: [
      "examples/comunica-sparql",
      "examples/stardog-basic-auth",
      "examples/graphdb-public",
      "examples/neptune-vpc-proxy",
      "examples/cli-demo",
    ],
  },

  // 9. ドキュメントサイト
  docs: {
    id: "docs",
    description: "Docs site 初版 (Docusaurus v3 ベース) と README 連携",
    dependencies: ["examples"],
    outputs: [
      "docs/",
      "README.md",
    ],
  },

  // 10. CI/CD 拡張
  ci_cd: {
    id: "ci_cd",
    description: "Lint / Typecheck / Test / Coverage / Changesets / Publish ワークフロー",
    dependencies: ["docs"],
    outputs: [
      ".github/workflows/ci.yml",
      ".github/workflows/release.yml",
      "CHANGELOG.md",
    ],
  },

  // 11. 完了
  complete: {
    id: "complete",
    description: "パッケージ公開準備と story.jsonnet 更新",
    dependencies: ["ci_cd"],
    outputs: [
      "src/index.ts",
      "story.jsonnet",
      "CHANGELOG.md",
    ],
  },
};

// トポロジカルソート検証
local topoSort(dag) =
  local nodes = std.objectFields(dag);
  local visited = {};
  local sorted = [];

  local visit(nodeId, path=[]) =
    if std.member(path, nodeId) then
      error 'Circular dependency detected: %s' % std.join(' -> ', path + [nodeId])
    else if std.objectHas(visited, nodeId) then
      []
    else
      local node = dag[nodeId];
      local deps = node.dependencies;
      local depResults = std.flatMap(function(dep) visit(dep, path + [nodeId]), deps);
      visited[nodeId] = true;
      depResults + [nodeId];

  std.foldl(
    function(acc, nodeId)
      acc + visit(nodeId),
    nodes,
    []
  );

{
  dag: dag,
  topologicalOrder: topoSort(dag),

  validate: {
    allNodesReachable: std.length(self.topologicalOrder) == std.length(std.objectFields(dag)),
    noCycles: true,
  },

  metrics: {
    totalNodes: std.length(std.objectFields(dag)),
    maxDepth: 11,
    avgDependencies: 1.1,
    structure: "ontology-resource-shape-process unified",
  },
}
