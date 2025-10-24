// DAG: story-dag
// Shapebox MVP プロセスネットワーク DAG 定義
// トポロジカルソート: init → core-types → core-typecheck → core-api → core-context → core-test → validate-struct → validate-shape → validate-test → examples

local dag = {
  // プロジェクト基盤初期化
  init: {
    id: 'init',
    description: 'pnpm workspace 初期化、tsconfig.base.json, biome.json, .gitignore, LICENSE 作成',
    dependencies: [],
    outputs: [
      'package.json',
      'pnpm-workspace.yaml',
      'tsconfig.base.json',
      'biome.json',
      '.gitignore',
      'LICENSE',
    ],
  },

  // @gftdcojp/shapebox-core パッケージ
  'core-types': {
    id: 'core-types',
    description: 'IRI, Cardinality, Range, PropertyMeta, ShapeDefinition 型定義',
    dependencies: ['init'],
    outputs: [
      'packages/core/src/types/iri.ts',
      'packages/core/src/types/cardinality.ts',
      'packages/core/src/types/range.ts',
      'packages/core/src/types/property.ts',
      'packages/core/src/types/shape.ts',
      'packages/core/src/types/index.ts',
    ],
  },

  'core-typecheck': {
    id: 'core-typecheck',
    description: 'Conditional types による型レベル整合性チェック実装',
    dependencies: ['core-types'],
    outputs: [
      'packages/core/src/typecheck/cardinality-optional.ts',
      'packages/core/src/typecheck/range-exclusivity.ts',
      'packages/core/src/typecheck/extends-circular.ts',
      'packages/core/src/typecheck/props-schema-consistency.ts',
      'packages/core/src/typecheck/index.ts',
    ],
  },

  'core-api': {
    id: 'core-api',
    description: 'DSL API 実装 (iri, cardinality, range, defineShape)',
    dependencies: ['core-typecheck'],
    outputs: [
      'packages/core/src/dsl/iri.ts',
      'packages/core/src/dsl/cardinality.ts',
      'packages/core/src/dsl/range.ts',
      'packages/core/src/dsl/define-shape.ts',
      'packages/core/src/dsl/index.ts',
    ],
  },

  'core-context': {
    id: 'core-context',
    description: 'buildContext 実装 (JSON-LD @context 生成)',
    dependencies: ['core-api'],
    outputs: [
      'packages/core/src/context/build-context.ts',
      'packages/core/src/context/types.ts',
      'packages/core/src/context/index.ts',
    ],
  },

  'core-test': {
    id: 'core-test',
    description: 'core パッケージのテスト (型テスト含む)',
    dependencies: ['core-context'],
    outputs: [
      'packages/core/src/__tests__/types.test.ts',
      'packages/core/src/__tests__/define-shape.test.ts',
      'packages/core/src/__tests__/build-context.test.ts',
      'packages/core/src/__tests__/type-safety.test-d.ts',
    ],
  },

  // @gftdcojp/shapebox-validate パッケージ
  'validate-struct': {
    id: 'validate-struct',
    description: 'validateStruct 実装 (Ajv ベース構造検証)',
    dependencies: ['core-test'],
    outputs: [
      'packages/validate/src/struct/validate-struct.ts',
      'packages/validate/src/struct/ajv-setup.ts',
      'packages/validate/src/struct/index.ts',
    ],
  },

  'validate-shape': {
    id: 'validate-shape',
    description: 'validateShape 実装 (ShEx的局所shape検証)',
    dependencies: ['validate-struct'],
    outputs: [
      'packages/validate/src/shape/validate-shape.ts',
      'packages/validate/src/shape/cardinality-check.ts',
      'packages/validate/src/shape/range-check.ts',
      'packages/validate/src/shape/type-check.ts',
      'packages/validate/src/shape/index.ts',
      'packages/validate/src/report/types.ts',
      'packages/validate/src/report/index.ts',
    ],
  },

  'validate-test': {
    id: 'validate-test',
    description: 'validate パッケージのテスト',
    dependencies: ['validate-shape'],
    outputs: [
      'packages/validate/src/__tests__/validate-struct.test.ts',
      'packages/validate/src/__tests__/validate-shape.test.ts',
      'packages/validate/src/__tests__/cardinality.test.ts',
      'packages/validate/src/__tests__/range.test.ts',
    ],
  },

  // サンプルとドキュメント
  examples: {
    id: 'examples',
    description: 'Person/Project サンプル作成と README 執筆',
    dependencies: ['validate-test'],
    outputs: [
      'examples/person.ts',
      'examples/project.ts',
      'examples/usage.ts',
      'README.md',
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
    maxDepth: 9,  // init -> ... -> examples
    avgDependencies: 1.0,  // ほぼ線形依存
  },
}

