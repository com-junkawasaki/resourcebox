// DAG: story-dag
// Shapebox プロセスネットワーク DAG 定義
// トポロジカルソート: init → types → typecheck → api → context → validate-struct → validate-shape → test → complete

local dag = {
  // プロジェクト基盤初期化
  init: {
    id: 'init',
    description: 'package.json, tsconfig.json, biome.json, .gitignore, LICENSE 作成',
    dependencies: [],
    outputs: [
      'package.json',
      'tsconfig.json',
      'biome.json',
      'vitest.config.ts',
      '.gitignore',
      'LICENSE',
    ],
  },

  // Core 型定義層
  types: {
    id: 'types',
    description: 'IRI, Cardinality, Range, PropertyMeta, ShapeDefinition 型定義',
    dependencies: ['init'],
    outputs: [
      'src/core/types/iri.ts',
      'src/core/types/cardinality.ts',
      'src/core/types/range.ts',
      'src/core/types/property.ts',
      'src/core/types/shape.ts',
      'src/core/types/index.ts',
    ],
  },

  // 型レベル整合性チェック
  typecheck: {
    id: 'typecheck',
    description: 'Conditional types による型レベル整合性チェック実装',
    dependencies: ['types'],
    outputs: [
      'src/core/typecheck/cardinality-optional.ts',
      'src/core/typecheck/range-exclusivity.ts',
      'src/core/typecheck/extends-circular.ts',
      'src/core/typecheck/props-schema-consistency.ts',
      'src/core/typecheck/index.ts',
    ],
  },

  // DSL API
  api: {
    id: 'api',
    description: 'DSL API 実装 (iri, cardinality, range, defineShape)',
    dependencies: ['typecheck'],
    outputs: [
      'src/core/dsl/iri.ts',
      'src/core/dsl/cardinality.ts',
      'src/core/dsl/range.ts',
      'src/core/dsl/define-shape.ts',
      'src/core/dsl/index.ts',
    ],
  },

  // JSON-LD Context 生成
  context: {
    id: 'context',
    description: 'buildContext 実装 (JSON-LD @context 生成)',
    dependencies: ['api'],
    outputs: [
      'src/core/context/build-context.ts',
      'src/core/context/types.ts',
      'src/core/context/index.ts',
    ],
  },

  // 構造検証 (Ajv)
  'validate-struct': {
    id: 'validate-struct',
    description: 'validateStruct 実装 (Ajv ベース構造検証)',
    dependencies: ['context'],
    outputs: [
      'src/validate/struct/validate-struct.ts',
      'src/validate/struct/ajv-setup.ts',
      'src/validate/struct/index.ts',
      'src/validate/report/types.ts',
      'src/validate/report/index.ts',
    ],
  },

  // Shape 検証 (ShEx-like)
  'validate-shape': {
    id: 'validate-shape',
    description: 'validateShape 実装 (ShEx的局所shape検証)',
    dependencies: ['validate-struct'],
    outputs: [
      'src/validate/shape/validate-shape.ts',
      'src/validate/shape/cardinality-check.ts',
      'src/validate/shape/range-check.ts',
      'src/validate/shape/type-check.ts',
      'src/validate/shape/index.ts',
    ],
  },

  // テスト
  test: {
    id: 'test',
    description: 'Core と Validate の統合テスト',
    dependencies: ['validate-shape'],
    outputs: [
      'src/core/__tests__/types.test.ts',
      'src/core/__tests__/define-shape.test.ts',
      'src/core/__tests__/build-context.test.ts',
      'src/validate/__tests__/validate-struct.test.ts',
      'src/validate/__tests__/validate-shape.test.ts',
      'src/validate/__tests__/cardinality.test.ts',
      'src/validate/__tests__/range.test.ts',
    ],
  },

  // メインエントリーポイントと完成
  complete: {
    id: 'complete',
    description: 'メインエントリーポイント (src/index.ts) と README 更新',
    dependencies: ['test'],
    outputs: [
      'src/index.ts',
      'README.md',
      'story.jsonnet',
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
      depResults + [nodeId];
  
  std.foldl(
    function(acc, nodeId) acc + visit(nodeId),
    nodes,
    []
  );

{
  dag: dag,
  topologicalOrder: topoSort(dag),
  
  // 依存関係検証
  validate: {
    allNodesReachable: std.length(self.topologicalOrder) == std.length(std.objectFields(dag)),
    noCycles: true,  // topoSort がエラーを投げなければ true
  },
  
  // エントロピー最小化指標
  metrics: {
    totalNodes: std.length(std.objectFields(dag)),
    maxDepth: 9,  // init -> ... -> complete
    avgDependencies: 1.0,  // ほぼ線形依存
    structure: 'unified',  // 統合パッケージ構造
  },
}
