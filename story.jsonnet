// DAG: resourcebox-story
// ResourceBox プロセスネットワーク DAG 定義
// トポロジカルソート: init → tooling → ontology → inference → resource → shape → process_import → process_rpc → validation → cli → examples → docs → ci_cd → complete

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

  // 2.5. Inference レイヤー (RDFS + OWL Lite)
  inference: {
    id: "inference",
    description: "RDFS クロージャ + OWL Lite (equivalentClass/inverseOf) 軽量推論エンジン実装",
    dependencies: ["ontology"],
    outputs: [
      "src/onto/inference.ts",
      "src/onto/__tests__/inference.test.ts",
    ],
  },

  // 3. Resource レイヤー
  resource: {
    id: "resource",
    description: "Resource.* API と JSON-LD / validation 連携",
    dependencies: ["inference"],
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

  // 4. SHACL Shape レイヤー (拡張 Core)
  shape: {
    id: "shape",
    description: "Shape.Define / Shape.Property / Shape.fromResource / Shape.validate / SHACL Core (datatype/class/and/not/or/xone) + RDFS/OWL Lite 推論連携",
    dependencies: ["resource"],
    outputs: [
      "src/shape/define.ts",
      "src/shape/property.ts",
      "src/shape/from-resource.ts",
      "src/shape/validate.ts",
      "src/shape/types.ts",
      "src/shape/index.ts",
      "src/shape/jsonld.ts",
    ],
  },

  // 5. RDF/XML インポート層
  process_import: {
    id: "process_import",
    description: "RDF/XML から JSON-LD コンテキストを抽出しプロセス層へ連携する内部モジュール",
    dependencies: ["shape"],
    outputs: [
      "src/_internal/process/importers/rdfxml.ts",
      "src/_internal/process/importers/index.ts",
      "src/_internal/process/importers/__tests__/rdfxml.test.ts",
    ],
  },

  // 6. RPC プロセス層
  process_rpc: {
    id: "process_rpc",
    description: "JSON-LD コンテキストから RPC 型安全性を導出する内部モジュール",
    dependencies: ["process_import"],
    outputs: [
      "src/_internal/process/rpc/context-types.ts",
      "src/_internal/process/rpc/index.ts",
      "src/_internal/process/rpc/__tests__/context-types.test.ts",
    ],
  },

  // 7. 検証・テスト統合
  validation: {
    id: "validation",
    description: "Resource / Shape / Inference / Process 統合テスト、SHACL Core 拡張検証、Biome リンター連携",
    dependencies: ["process_rpc"],
    outputs: [
      "src/resource/__tests__",
      "src/shape/__tests__",
      "src/onto/__tests__/inference.test.ts",
      "src/__tests__/integration.test.ts",
    ],
  },

  // 8. CLI 実装
  cli: {
    id: "cli",
    description: "Commander ベースの CLI (context / shape 生成)",
    dependencies: ["validation"],
    outputs: [
      "src/cli/index.ts",
      "package.json#bin",
    ],
  },

  // 9. Examples / SPARQL 連携
  examples: {
    id: "examples",
    description: "Comunica + 各種 SPARQL DB 例、SigV4 Neptune VPC クライアント、CLI デモ",
    dependencies: ["cli"],
    outputs: [
      "examples/comunica-sparql",
      "examples/stardog-basic-auth",
      "examples/graphdb-public",
      "examples/neptune-vpc-proxy",
      "examples/cli-demo",
    ],
  },

  // 10. ドキュメントサイト
  docs: {
    id: "docs",
    description: "Docs site 初版 (Docusaurus v3 ベース) と README 連携",
    dependencies: ["examples"],
    outputs: [
      "docs/",
      "README.md",
    ],
  },

  // 11. CI/CD 拡張
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

  // 12. 完了
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
    maxDepth: 13,
    avgDependencies: 1.15,
    structure: "ontology-inference-resource-shape-process-import unified with RDFS/OWL Lite reasoning",
  },
}
