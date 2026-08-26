declare class Expression {
    [key: string]: any;
}

declare namespace RealChart {
    interface ChartConfiguration {
        type?: string;
        [key: string]: any;
    }
}

declare namespace RealMap {
    type ProjectionType = string;
    type SVGStyleOrClass = any;
    interface ChartConfiguration {
        [key: string]: any;
    }
}


declare class AddTablePage extends UIFlexElement {
    private _headerView;
    private _promptView;
    private _footerView;
    private _book;
    private _prompter;
    private _opened;
    private _command;
    constructor(doc: Document);
    protected _doInit(doc: Document, initData: any): void;
    protected _doDispose(): void;
    prompterSend(prompter: AIPrompter, turn: AIPromptTurn): void;
    prompterBeforeResponse(prompter: AIPrompter, turn: AIPromptTurn): void;
    prompterResponse(prompter: AIPrompter, turn: AIPromptTurn): void;
    get promptView(): AIPrompterView;
    open(book: PivotBook): void;
    close(): void;
    layout(): void;
    click(target: Element, shift: boolean, meta: boolean): boolean;
    setPromptHeight(height: number): void;
    protected _doInitDom(doc: Document, dom: HTMLElement): void;
    private $_setCommand;
}

/**
 * CubeDataSource로부터 생성된 집계 결과 테이블.<br/>
 *
 * ColumnStore나 DataViewSource 등의 CubeDataSource에서 지정된 차원과 측정값을 기준으로
 * 집계된 결과를 (논리적으로) 테이블 형태로 저장한다.<br/>
 * columnar 단위로 저장하여 추가적인 피벗이나 필터링 연산에 최적화되어 있다.<br/>
 *
 * ## 데이터 구조
 * - **Dimension 컬럼**: 고유한 차원 값의 조합으로 각 그룹을 식별
 * - **Measure 컬럼**: 각 그룹별로 집계된 측정값 (sum, avg, min, max, count)
 *
 * ## 사용 예시
 * ```typescript
 * // 1. 기본 집계: 차원 [지역, 제품], 측정값 [매출, 수량]
 * const agg = AggTable.aggregate(source,
 *   ['region', 'product'],
 *   ['sales', 'quantity']
 * );
 *
 * // 결과 테이블:
 * // region | product | sales | quantity
 * // -------|---------|-------|----------
 * // Seoul  | A       | 10000 | 100
 * // Seoul  | B       | 20000 | 200
 * // Seoul  | C       | 0     | 0        (데이터 없음)
 * // Busan  | A       | 15000 | 150
 * // Busan  | B       | 5000  | 50
 * // Daegu  | A       | 8000  | 80
 * // Daegu  | C       | 12000 | 120
 *
 * // 2. 집계 함수 지정: sum, avg, min, max, count
 * const agg2 = AggTable.aggregate(source,
 *   ['region'],
 *   [
 *     { name: 'sales', type: 'f64', role: 'measure', aggFunc: 'sum' },
 *     { name: 'price', type: 'f64', role: 'measure', aggFunc: 'avg' },
 *     { name: 'quantity', type: 'i32', role: 'measure', aggFunc: 'count' }
 *   ]
 * );
 *
 * // 결과:
 * // region | sales (sum) | price (avg) | quantity (count)
 * // -------|-------------|-------------|------------------
 * // Seoul  | 30000       | 15000       | 3
 * // Busan  | 20000       | 10000       | 2
 * // Daegu  | 20000       | 10000       | 2
 *
 * // 3. 3개 차원으로 더 세밀한 집계
 * const agg3 = AggTable.aggregate(source,
 *   ['region', 'product', 'quarter'],
 *   ['sales', 'quantity']
 * );
 *
 * // 결과:
 * // region | product | quarter | sales | quantity
 * // -------|---------|---------|-------|----------
 * // Seoul  | A       | Q1      | 2000  | 20
 * // Seoul  | A       | Q2      | 3000  | 30
 * // Seoul  | A       | Q3      | 3000  | 30
 * // Seoul  | A       | Q4      | 2000  | 20
 * // Seoul  | B       | Q1      | 5000  | 50
 * // Seoul  | B       | Q2      | 5000  | 50
 * // Seoul  | B       | Q3      | 0     | 0        (데이터 없음)
 * // Seoul  | B       | Q4      | 5000  | 50
 * // Busan  | A       | Q1      | 4000  | 40
 * // Busan  | A       | Q2      | 4000  | 40
 * // Busan  | A       | Q3      | 4000  | 40
 * // Busan  | A       | Q4      | 3000  | 30
 * // Daegu  | A       | Q1      | 0     | 0        (데이터 없음)
 * // Daegu  | A       | Q2      | 3000  | 30
 * // Daegu  | A       | Q3      | 2000  | 20
 * // Daegu  | A       | Q4      | 3000  | 30
 * ```
 *
 * ## 특징
 * - **동적 그룹화**: 차원 조합에 따라 자동으로 그룹 생성
 * - **Null 처리**: 데이터가 없는 그룹은 0으로 표시
 * - **다양한 집계**: sum, avg, min, max, count 지원
 * - **캐시**: DataCube에서 동일한 집계 요청 시 재사용
 *
 * @see {@link DataCube} 이 테이블을 생성하는 큐브
 * @see {@link PivotMatrix} 이 테이블을 기반으로 피벗하는 행렬
 */
declare class AggTable extends DataSource {
    /**
     * ColumnMeta[]를 DimensionMeta[]로 변환한다.<br/>
     * role이 'dimension' 또는 'auto'인 컬럼을 변환한다.<br/>
     * 배열의 순서에 따라 자동으로 parentDimension을 설정한다.<br/>
     * 첫 번째 차원은 parentDimension=undefined, 이후 차원은 앞의 차원을 parent로 설정<br/>
     */
    private static toDimensionMetas;
    /**
     * ColumnMeta[]를 MeasureMeta[]로 변환한다.<br/>
     * role이 'measure' 또는 'auto'인 컬럼을 변환한다.<br/>
     * aggregate가 없으면 'sum'을 기본값으로 사용한다.<br/>
     */
    private static toMeasureMetas;
    /**
     * CubeDataSource로부터 집계 테이블을 생성한다.<br/>
     * 지정된 차원 메타데이터와 측정값 메타데이터를 사용하여 집계를 수행한다.<br/>
     *
     * @param source 집계 원본 데이터 소스
     * @param options 집계 옵션 (차원, 측정값, fillMissingCombinations 등)
     * @returns 생성된 AggTable 인스턴스
     *
     * @example
     * ```typescript
     * const agg = AggTable.aggregate(source, {
     *   dimensions: [regionCol, productCol],
     *   measures: [salesCol, quantityCol],
     *   fillMissingCombinations: true
     * });
     * ```
     */
    static aggregate(source: CubeDataSource, options: AggTableOptions): AggTable;
    /**
     * **이미 집계된 flat-rows 로부터 AggTable 을 직접 재구성(rehydrate)한다.**<br/>
     *
     * `aggregate()` 가 원본 데이터를 스캔·그룹핑해 집계하는 것과 달리, 이 메서드는
     * **그룹당 1행이 이미 확정된 결과 행**(`[dim_1..dim_N, measure_1..measure_M]`)을
     * 그대로 columnar 저장소에 적재한다. 재집계가 일어나지 않으므로 결정론적이며,
     * date-level 분해 / groups 매핑 / expression source 같은 옵션 부작용이 없다.<br/>
     *
     * ## 주 사용처 (실무)
     * 분석 모듈이 **새로운 데이터를 만들어 다시 AggTable 로 돌려줄 때** 사용한다.
     * 대표적으로 시계열 **예측(forecast)** 결과처럼 "원본에는 없던 미래 시점 행"을
     * 포함하는 테이블을 만들 때다. 결과가 AggTable 이므로 곧바로
     * `PivotMatrix.pivot()` 으로 화면에 표시하거나 다시 필터/정렬할 수 있다.
     *
     * ```typescript
     * // 예) 2022~2025 실적 AggTable 에서 2026 매출을 예측해 "과거+미래" 테이블 생성
     * const history = cube.aggregate(['region', 'year'], ['sales']); // 시간축 = year
     * const future  = AggTable.fromRows({
     *   dimensions: history.dimensions,                 // 스키마는 원본 그대로
     *   measures:   history.measures,
     *   source:     history.sourceData,                 // 참조용 소스(아래 주의 참고)
     *   rows: [
     *     ['Seoul', 2026, 1320],                        // 예측된 미래 행
     *     ['Busan', 2026,  540],
     *   ],
     * });
     * const pivot = PivotMatrix.pivot(future, { rows: ['region'], columns: ['year'] });
     * ```
     *
     * ## 동작
     * - 차원 컬럼: 각 값을 `Dictionary` 로 인코딩해 `DictCodeVector` 로 저장(원본 타입 보존).
     * - 측정값 컬럼: 숫자는 `Float64Array`(`null/빈값`은 `NaN`), i64 타입은 `I64Vector`.
     * - avg measure: 그룹당 1행이므로 사이드카를 `(sum=값, count=1)` 로 채워
     *   소계 평균 재계산(PivotMatrix fast-path)이 올바르게 동작한다.
     * - 생성된 테이블은 즉시 `frozen`(불변) 상태가 된다.
     *
     * ## 주의
     * - `source` 는 **스키마/참조 용도의 핸들**일 뿐, 행 데이터는 인자 `rows` 가 진실(authoritative)이다.
     *   따라서 `distinct/first/last/p25/p50/p75` 처럼 **원본 raw 값이 필요한 소계**는
     *   합성 테이블에서 의미가 없을 수 있다(합산 sum/avg 는 정상). 보통 파생 소스의
     *   `sourceData` 를 그대로 넘긴다.
     * - 측정값 타입은 `f64`(또는 `i32/i64`) 를 권장한다. 예측값은 실수이므로
     *   `i64` measure 는 `f64` 로 바꿔 넘기는 것이 안전하다.
     *
     * @param params.dimensions 결과 테이블의 차원 메타(보통 원본 `agg.dimensions` 그대로)
     * @param params.measures   결과 테이블의 측정값 메타(보통 원본 `agg.visibleMeasures` 그대로)
     * @param params.rows       `[dim_1..dim_N, measure_1..measure_M]` 형태의 확정 결과 행
     * @param params.source     스키마/참조용 CubeDataSource (보통 파생 원본의 `sourceData`)
     * @returns 결과 행이 적재된 frozen AggTable
     */
    static fromRows(params: {
        dimensions: DimensionMeta[];
        measures: MeasureMeta[];
        rows: any[][];
        source: CubeDataSource;
        /**
         * 출처 태그(범용). 생략 시 `'rows'`. 예측 결과 등 도메인 출처를 구분하려면
         * 상위 레이어가 `'forecast'` 같은 값을 넘긴다(코어는 의미 해석 안 함).
         */
        kind?: string;
        /** 출처 부가 메타데이터(범용). `sourceMeta` 로 그대로 노출된다. */
        meta?: unknown;
    }): AggTable;
    /**
     * 집계 원본 데이터 소스.<br/>
     */
    private _source;
    /**
     * 차원 컬럼 메타데이터.<br/>
     */
    private _dimensions;
    /**
     * 측정값 컬럼 메타데이터.<br/>
     */
    private _measures;
    /**
     * 집계 결과 데이터 (Columnar 저장소).<br/>
     *
     * 각 컬럼을 독립적인 ColumnVector로 저장하여 캐시 친화적이고 메모리 효율적이다.<br/>
     * - 차원 컬럼: DictCodeVector (Dictionary Encoding)
     * - 측정값 컬럼: ColumnVector<Int32Array | Float64Array>
     *
     * 예: 3개 차원 + 2개 측정값 = 5개 ColumnVector
     */
    private _columns;
    /**
     * metric 계산을 위해 추가되었지만 표시하지 않을 측정값 이름 집합.<br/>
     */
    private _hiddenMeasureNames;
    /**
     * 집계 결과 행 개수.<br/>
     */
    private _rowCount;
    /**
     * 집계 옵션.<br/>
     */
    private _options;
    /**
     * 변경 가능 상태 (디자인 타임용).<br/>
     * mutable=true로 생성된 경우 차원/측정값을 추가/삭제할 수 있다.<br/>
     */
    private _isMutable;
    /**
     * Frozen 상태 (런타임용).<br/>
     * freeze()가 호출되면 더 이상 변경할 수 없으며, 캐시 가능하다.<br/>
     */
    private _isFrozen;
    /**
     * 이 테이블이 어떤 경로로 만들어졌는지 나타내는 **범용 출처 태그**.<br/>
     * - `'aggregate'`: 원본 소스를 스캔·집계한 일반 결과(기본값).<br/>
     * - `'rows'`: {@link fromRows} 로 확정 행을 직접 적재한 합성 테이블.<br/>
     * - 그 외(`'forecast'` 등): 상위 레이어(analytics)가 부여한 도메인 출처.<br/>
     *
     * 코어는 이 값의 의미를 해석하지 않는다(도메인 비의존). 예측 결과처럼
     * "원본에 없던 합성 행"인지 구분해야 할 때 상위 레이어가 태그를 읽어 판별한다.<br/>
     */
    private _sourceKind;
    /**
     * 출처 부가 메타데이터(범용). {@link fromRows} 의 `meta` 로 주입된다.<br/>
     * 예) 예측 테이블이면 시리즈별 method/interval 정보 등을 담을 수 있다.<br/>
     * 코어는 구조를 알지 못하므로 `unknown` 으로 보관만 한다.<br/>
     */
    private _sourceMeta;
    /**
     * 필터링된 행 인덱스 (뷰 방식).<br/>
     * 이 배열이 설정되면, rows getter는 이 인덱스들만 반환한다.<br/>
     * filterByDimension/filterByMeasure/topByMeasure 호출 시 설정된다.<br/>
     */
    private _filteredRows?;
    /**
     * 이 AggTable을 생성한 DataCube 참조.<br/>
     * DataCube의 필터 변경 시 onCubeFiltered() 콜백을 받기 위해 필요.<br/>
     */
    private _sourceCube?;
    /**
     * AggTable 수준 필터 조건 목록.<br/>
     * filterByDimension/filterByMeasure/topByMeasure 호출 시 저장되어,<br/>
     * onCubeFiltered() 시 재적용된다.<br/>
     */
    private _filterConditions;
    /**
     * 집계 전 필터 (Pre-Filter).<br/>
     * Pivot 전용 보고서 필터로, DataCube 필터와 별도로 이 AggTable에만 적용된다.<br/>
     * 설정 시 내부 재집계가 트리거되며, onCubeFiltered() 시에도 자동 재적용된다.<br/>
     * Power BI의 Visual-level filter에 해당한다.<br/>
     */
    private _preFilters;
    /**
     * PivotMatrix 캐시.<br/>
     * frozen 상태의 AggTable에서만 캐시되며, 동일한 피벗 요청 시 재사용된다.<br/>
     * key: 행차원|열차원|측정값, value: PivotMatrix<br/>
     */
    private _pivotMatrices;
    /**
     * PivotMatrix 리스너 등록.<br/>
     * 이 AggTable에서 생성된 PivotMatrix들을 추적하여 데이터 변경 시 알림을 보낸다.<br/>
     */
    private _pivotMatrixListeners;
    /**
     * 외부 변경 콜백 리스너 목록.<br/>
     * onChange()로 등록되며, 재집계/필터 변경 시 호출된다.<br/>
     */
    private _changeListeners;
    /**
     * row-based 결과 캐시 (Dashboard 등에서 반복 접근 시 비용 절감).
     */
    private _rowsCache;
    /**
     * {@link baseFields} 결과 캐시(lazy). base 컬럼명 → 원본 measure 이름 Map.<br/>
     * whatif/derived 테이블은 frozen(불변)이라 한 번만 계산해 재사용한다.<br/>
     * whatif 가 아니거나 base 컬럼이 없으면 빈 Map.<br/>
     */
    private _baseFieldMap;
    /**
     * measure index 별 미리 계산한 empty fallback 값. lazy build.
     * `emptyValue` switch dispatch 를 hot path 에서 제거하기 위한 캐시.
     */
    private _emptyValueByMeasureIdx;
    /**
     * 각 집계 행의 CubeDataSource 원본 행 인덱스 목록.<br/>
     * _sourceRowIndices[aggRowIndex] = [sourceRowIdx1, sourceRowIdx2, ...]
     */
    private _sourceRowIndices;
    /**
     * avg measure 별 그룹(=집계 행)당 "원본 값 합".<br/>
     * `_avgSumByMeasure[measureIdx][rowIndex]` = 그 그룹의 비-null 유한값 합.<br/>
     * finalize 가 avg = sum/count 로 접기 전의 sum 을 보존한다(소계 재계산용).<br/>
     * avg 가 아닌 measure 는 null. avg measure 가 하나도 없으면 필드 자체가 null.<br/>
     * 인덱스 공간은 `_sourceRowIndices` 와 동일(필터 전 finalized row).<br/>
     */
    private _avgSumByMeasure;
    /**
     * avg measure 별 그룹당 "비-null 유한값 개수"(avg 분모).<br/>
     * `_avgCountByMeasure[measureIdx][rowIndex]`. `_avgSumByMeasure` 와 쌍.<br/>
     */
    private _avgCountByMeasure;
    /**
     * 정렬 상태: column과 direction.<br/>
     * sortBy() 호출 시 설정되고, rows getter에서 적용된다.<br/>
     */
    private _sortedBy?;
    /**
     * 행 개수 제한 (limit).<br/>
     * limit() 호출 시 설정되고, rows getter에서 마지막에 적용된다.<br/>
     */
    private _limit?;
    /**
     * 계산 컬럼 저장소.<br/>
     * addComputedColumn() 호출 시 추가되고, rows getter에서 적용된다.<br/>
     * key: 컬럼명, value: (row, index) => 계산값<br/>
     */
    private _computedColumns;
    /**
     * AggTable을 생성한다.<br/>
     * 일반적으로 직접 생성하지 않고 {@link aggregate} 정적 메서드를 사용한다.<br/>
     *
     * @param source 집계 원본 데이터 소스
     * @param options 집계 옵션 (차원, 측정값 포함)
     */
    constructor(source: CubeDataSource, options: AggTableOptions);
    /* Excluded from this release type: _doDispose */
    get cube(): DataCube;
    /**
     * 집계 전 원본 데이터 소스(CubeDataSource)를 반환한다.<br/>
     * subtotal에서 distinct/first/last/percentile 등 raw 값이 필요한 집계를
     * 정확히 계산하기 위해 PivotMatrix가 사용한다.<br/>
     */
    get sourceData(): CubeDataSource;
    /**
     * 차원 컬럼 메타데이터를 반환한다.<br/>
     */
    get dimensions(): DimensionMeta[];
    /**
     * 측정값 컬럼 메타데이터를 반환한다.<br/>
     */
    get measures(): MeasureMeta[];
    /**
     * 표시 대상(hidden 제외) 측정값 메타데이터를 반환한다.<br/>
     * rows getter와 동일한 순서로 반환된다.<br/>
     */
    get visibleMeasures(): MeasureMeta[];
    /**
     * 집계 결과 행 개수를 반환한다.<br/>
     * 필터링된 경우 (_filteredRows가 있으면) 필터링된 행의 개수를 반환한다.<br/>
     */
    get rowCount(): number;
    /**
     * 필터 적용 전 전체 집계 행 개수를 반환한다.<br/>
     * `filterByDimension()`, `filterByMeasure()`, `topByMeasure()` 등의
     * AggTable 필터와 무관하게 항상 전체 집계 그룹 수를 반환한다.<br/>
     *
     * @returns 전체 집계 행 개수
     *
     * @example
     * ```typescript
     * const agg = cube.aggregate(['region'], ['sales']);
     * console.log(agg.totalRowCount);  // 5 (전체 지역 수)
     * agg.filterByDimension('region', ['Seoul', 'Busan']);
     * console.log(agg.rowCount);       // 2 (필터된 행)
     * console.log(agg.totalRowCount);  // 5 (전체 행 불변)
     * ```
     *
     * @see {@link rowCount} 필터 반영된 집계 행 개수
     */
    get totalRowCount(): number;
    /**
     * 특정 집계 행에 해당하는 CubeDataSource 원본 행 인덱스 목록을 반환한다.<br/>
     * 필터링이 적용된 경우, 필터링된 행 인덱스 기준으로 조회한다.<br/>
     *
     * @param rowIndex 집계 행 인덱스 (필터링 적용 후 인덱스)
     * @returns CubeDataSource의 원본 행 인덱스 배열
     * @throws rowIndex가 범위를 벗어나면 에러 발생
     *
     * @example
     * ```typescript
     * const aggTable = AggTable.aggregate(source, { dimensions: [region], measures: [sales] });
     * // 첫 번째 집계 행(예: region='Seoul')에 해당하는 원본 행 인덱스들
     * const sourceIndices = aggTable.getSourceRowIndices(0);
     * // 결과: [0, 5, 12, 23] - CubeDataSource에서 Seoul인 행들의 인덱스
     * ```
     */
    getSourceRowIndices(rowIndex: number): number[];
    /**
     * 특정 집계 행에 해당하는 CubeDataSource 원본 행 개수를 반환한다.<br/>
     * getSourceRowIndices()보다 메모리 효율적이며, 개수만 필요할 때 사용한다.<br/>
     *
     * @param rowIndex 집계 행 인덱스 (필터링 적용 후 인덱스)
     * @returns CubeDataSource의 원본 행 개수
     * @throws rowIndex가 범위를 벗어나면 에러 발생
     *
     * @example
     * ```typescript
     * const count = aggTable.getSourceRowCount(0);
     * // 결과: 4 - 첫 번째 집계 행에 4개의 원본 행이 포함됨
     * ```
     */
    getSourceRowCount(rowIndex: number): number;
    /**
     * avg measure 의 그룹별 (Σ원본값, Σ비-null개수) 사이드카 배열을 measure 이름으로 조회한다.<br/>
     *
     * 소계/결합 시 셀별로 이 합/개수를 더해 `(Σsum)/(Σcount)` 로 평균을 재계산하면<br/>
     * 원본 재스캔(O(N_원본행)) 없이 엑셀 동일 결과를 O(N_집계행) 으로 얻는다.<br/>
     *
     * 반환 배열의 인덱스는 finalized row(필터 전) 공간이며, 호출자는
     * `getSourceRowIndices()` 와 동일하게 `getFilteredRowMap()` 으로
     * canonical(필터 후) 인덱스를 매핑해 사용해야 한다.<br/>
     *
     * @param measureName measure 이름
     * @returns `{ sum, count }` (avg measure 가 아니거나 미보존 시 null)
     */
    getAvgComponentArrays(measureName: string): {
        sum: Float64Array;
        count: Float64Array;
    } | null;
    /* Excluded from this release type: getFilteredRowMap */
    /**
     * 변경 가능(mutable) 상태인지 확인한다.<br/>
     * mutable 상태에서만 차원/측정값 추가/삭제가 가능하다.<br/>
     */
    get isMutable(): boolean;
    /**
     * Frozen 상태인지 확인한다.<br/>
     * Frozen 상태가 되면 더 이상 변경할 수 없으며, DataCube에서 캐시할 수 있다.<br/>
     */
    get isFrozen(): boolean;
    /**
     * 이 테이블의 **출처 태그**(범용)를 반환한다.<br/>
     * `'aggregate'`(일반 집계) | `'rows'`({@link fromRows} 합성) | 상위 레이어가
     * 부여한 도메인 값(`'forecast'` 등). 코어는 의미를 해석하지 않는다.<br/>
     */
    get sourceKind(): string;
    /**
     * 출처 부가 메타데이터(범용)를 반환한다. {@link fromRows} 의 `meta` 로 주입된 값.<br/>
     * 구조는 출처(상위 레이어)가 정의한다. 없으면 `undefined`.<br/>
     */
    get sourceMeta(): unknown;
    /**
     * 이 테이블이 **시계열 예측 결과**인지 여부.<br/>
     * `sourceKind === 'forecast'` 에 대한 편의 게터로, 예측 테이블은 원본에 없던
     * 미래 합성 행을 포함하므로 재집계/집계함수 변경 등의 대상이 아님을 빠르게 판별한다.<br/>
     */
    get isForecast(): boolean;
    /**
     * 이 테이블이 **What-if 시나리오 결과**인지 여부.<br/>
     * `sourceKind === 'whatif'` 에 대한 편의 게터로, 시나리오 규칙이 적용된 합성
     * 테이블(원본 불변)임을 빠르게 판별한다. {@link isForecast} 와 대칭.<br/>
     */
    get isWhatif(): boolean;
    /**
     * 이 테이블이 **analytics 가 파생 생성한 결과**(예측 또는 what-if)인지 여부.<br/>
     * `isForecast || isWhatif` 의 편의 게터로, 원본에 없던 합성 행/컬럼을 포함하며
     * 재집계·집계함수 변경·드릴다운 등의 대상이 아님을 한 번에 판별한다.<br/>
     * (저장소 수준 불변은 {@link isFrozen} 이며, 이 게터는 **출처(도메인) 판별**용이다.)<br/>
     */
    get isDerived(): boolean;
    /**
     * What-if(`includeBase`) 결과에 덧붙은 **기준값(base) 측정값** 목록을 반환한다.<br/>
     * 규약: 기준값 컬럼은 `<measure>_base` 이름이며, 원본 `<measure>` 측정값이 함께
     * 존재한다. 각 항목은 `{ name: '<measure>_base', of: '<measure>' }` 형태로,
     * 변형 전(base) ↔ 변형 후(of) 컬럼을 짝지어 증감/증감률 계산에 쓸 수 있다.<br/>
     * whatif 결과(`isWhatif`)가 아니거나 base 컬럼이 없으면 빈 배열을 반환한다.<br/>
     *
     * @example
     * ```typescript
     * const t = whatIfAgg(base, { name: 's', rules: [...], includeBase: true });
     * t.baseFields(); // [{ name: 'sales_base', of: 'sales' }, { name: 'qty_base', of: 'qty' }]
     * ```
     */
    baseFields(): {
        name: string;
        of: string;
    }[];
    isBaseField(fieldName: string): boolean;
    /* Excluded from this release type: $_ensureBaseFieldMap */
    getBaseFieldOf(fieldName: string): string | undefined;
    /**
     * 지정된 인덱스 또는 이름의 컬럼 벡터를 반환한다 (인덱싱 최적화용).<br/>
     *
     * @param columnIndex 컬럼 인덱스 (0부터 시작) 또는 dimension/measure 이름
     * @returns ColumnVector 인스턴스, 컬럼을 찾을 수 없으면 undefined
     *
     * @example
     * ```typescript
     * // 인덱스로 접근
     * const vector1 = agg.getColumnVector(0);
     *
     * // dimension 이름으로 접근
     * const regionVector = agg.getColumnVector('region');
     *
     * // measure 이름으로 접근
     * const salesVector = agg.getColumnVector('sales');
     * ```
     */
    getColumnVector(columnIndex: number | string): ColumnVector<any> | undefined;
    /**
     * 집계 결과 데이터를 row-based 2D 배열로 변환하여 반환한다.<br/>
     *
     * PivotMatrix 등 기존 코드와의 호환성을 위해 row-based 형식으로 제공한다.<br/>
     * 내부 저장은 columnar 형식이므로 접근 시에만 변환 오버헤드 발생.<br/>
     *
     * 필터링된 경우 (_filteredRows가 있으면) 필터링된 행만 반환한다.<br/>
     *
     * **정렬과 계산 컬럼 적용:**
     * - sortBy() 호출 시 해당 컬럼 기준으로 정렬된 결과 반환
     * - addComputedColumn() 호출 시 각 행 끝에 계산값 추가
     *
     * @returns 각 행이 [차원값1, ..., 측정값1, ..., 계산값1, ...] 형태의 2D 배열
     */
    get rows(): any[][];
    /**
     * 첫 번째 행을 반환한다.<br/>
     * 행이 없으면 undefined를 반환한다.<br/>
     */
    get firstRow(): any[] | undefined;
    /**
     * 첫 번째 행의 첫 번째 값(첫 번째 차원 또는 측정값)을 반환한다.<br/>
     * 행이 없으면 undefined를 반환한다.<br/>
     */
    get firstValue(): any;
    /**
     * `rows` 와 동일한 순서의 컬럼 메타데이터 배열을 반환한다.<br/>
     *
     * 순서: 차원(DimensionMeta) → 표시 측정값(MeasureMeta, 숨김 제외)
     * → 계산 컬럼(합성 MeasureMeta).<br/>
     *
     * `toArrays()` / `getRow()` 가 반환하는 값 배열의 각 인덱스를 해석하는
     * 헤더로 사용한다.<br/>
     *
     * @returns 컬럼 메타데이터 배열
     */
    get columns(): (DimensionMeta | MeasureMeta)[];
    /**
     * 지정된 인덱스의 집계 행 전체를 `columns` 순서에 맞춘 값 배열로 반환한다.<br/>
     *
     * `rows` 와 동일하게 필터 / 정렬 / limit / 계산 컬럼이 반영된 결과 기준이며,
     * 소계 · 총계는 포함하지 않는다.<br/>
     *
     * @param rowIndex 행 인덱스 (0부터 시작, 필터·정렬 적용 후 기준)
     * @returns 집계 행 값 배열, 범위를 벗어나면 undefined
     *
     * @example
     * ```typescript
     * const row = agg.getRow(0);
     * // ['Seoul', 1000]
     * ```
     */
    getRow(rowIndex: number): any[] | undefined;
    /**
     * 지정된 행과 컬럼의 값을 반환한다.<br/>
     *
     * @param row 행 인덱스 (0부터 시작, 필터링된 결과 기준)
     * @param columnIndex 컬럼 인덱스 (0부터 시작) 또는 dimension/measure 이름
     * @returns 지정된 위치의 값, 범위를 벗어나거나 컬럼을 찾을 수 없으면 undefined
     *
     * @example
     * ```typescript
     * // 인덱스로 접근
     * const value1 = agg.getValue(0, 0);
     *
     * // dimension 이름으로 접근
     * const region = agg.getValue(0, 'region');
     *
     * // measure 이름으로 접근
     * const sales = agg.getValue(0, 'sales');
     * ```
     */
    getValue(row: number, columnIndex: number | string): any;
    /**
     * 숨겨진 측정값( metric 계산용 dummy )을 행 순서에 맞춰 반환한다.<br/>
     * 표시되지 않는 측정값을 별도로 확인할 때 사용한다.<br/>
     */
    get baseMeasures(): Record<string, any[]>;
    getDateLevel(dimenison: string): DateField | undefined;
    /**
     * AggTable을 frozen 상태로 만든다.<br/>
     * Frozen 상태가 되면 더 이상 변경할 수 없으며, DataCube에서 캐시할 수 있다.<br/>
     *
     * @throws Error 이미 frozen 상태이면 에러
     *
     * @example
     * ```typescript
     * // 디자인 타임: mutable AggTable 생성 및 수정
     * const agg = cube.aggregate(['region'], ['sales'], { mutable: true });
     * agg.addDimension(regionCol);
     * agg.addMeasure(salesCol);
     *
     * // 런타임: frozen으로 확정 → 캐시 가능
     * agg.freeze();
     * ```
     */
    freeze(): void;
    /**
     * AggTable을 복제한다.<br/>
     * 모든 내부 데이터 구조(dimensions, measures, columns 등)를 깊은 복사하여
     * 원본과 독립적인 새 인스턴스를 생성한다.<br/>
     *
     * 주로 캐시된 immutable AggTable에 metric을 추가할 때 사용된다.<br/>
     *
     * @returns 복제된 AggTable 인스턴스 (unfrozen 상태)
     */
    clone(): AggTable;
    isSameSchema(dimensions: string[], measures: string[]): boolean;
    /**
     * 지정된 컬럼 기준으로 AggTable을 정렬한다.<br/>
     *
     * 이 메서드는 정렬 상태만 저장하고, 실제 정렬은 rows getter에서 수행된다.<br/>
     * rows 캐시가 무효화되어 다음 rows 호출 시 정렬된 결과를 반환한다.<br/>
     *
     * **메서드 체이닝 가능:**
     * ```typescript
     * const rows = agg
     *   .sortBy('sales', 'desc')
     *   .rows
     *   .slice(0, 10);  // Top 10
     * ```
     *
     * @param column 정렬 기준 컬럼명 (차원 또는 측정값)
     * @param direction 정렬 방향 ('asc'=오름차순, 'desc'=내림차순)
     * @returns this (메서드 체이닝용)
     * @throws Error 지정된 컬럼이 존재하지 않으면 에러 발생 (개발 시에만)
     *
     * @example
     * ```typescript
     * // 지역별 매출 집계 후 매출 내림차순 정렬
     * const agg = cube.aggregate(['region'], ['sales']);
     * agg.sortBy('sales', 'desc');
     *
     * // 날짜별 누적 매출 계산 (반드시 날짜순)
     * const agg2 = cube.aggregate(['date'], ['sales']);
     * agg2.sortBy('date', 'asc');  // Running Total 계산하려면 필수
     * agg2.addComputedColumn('runningTotal', (row, idx, rows) => {
     *   // idx까지의 누적값
     * });
     * ```
     */
    sortBy(column: string, direction?: 'asc' | 'desc'): this;
    /**
     * AggTable의 각 행에 계산 컬럼을 추가한다.<br/>
     *
     * 이 메서드는 rows의 끝에 새로운 컬럼을 추가한다.<br/>
     * rows getter에서 기존 행들을 생성한 후, 각 행마다 computer 함수를 호출하여 계산값을 추가한다.<br/>
     *
     * **주요 용도:**
     * - Running Total (누적 합계)
     * - Window 함수 (이동 평균, 순위 등)
     * - 조건부 계산 (status, flag 등)
     * - 백분율, 성장률 등 파생 지표
     *
     * @param name 새 컬럼명
     * @param computer 각 행에서 호출될 계산 함수
     *   - row: 현재 행의 데이터 배열 [dim1, ..., meas1, ...]
     *   - index: 현재 행의 인덱스 (0부터 시작)
     *   - rows: 전체 행 배열 (선택, window 함수용)
     * @returns void
     *
     * @example
     * ```typescript
     * // Running Total (누적 합계)
     * const agg = cube.aggregate(['date'], ['sales']);
     * agg.sortBy('date', 'asc');
     * let cumulative = 0;
     * agg.addComputedColumn('runningTotal', (row) => {
     *   cumulative += row.sales;
     *   return cumulative;
     * });
     *
     * // Rank (순위)
     * const agg2 = cube.aggregate(['product'], ['sales']);
     * agg2.sortBy('sales', 'desc');
     * agg2.addComputedColumn('rank', (_, index) => index + 1);
     *
     * // Growth Rate (성장률)
     * const agg3 = cube.aggregate(['date'], ['sales']);
     * agg3.sortBy('date', 'asc');
     * agg3.addComputedColumn('growthRate', (row, index, rows) => {
     *   if (index === 0) return null;
     *   const prev = rows[index - 1].sales;
     *   return ((row.sales - prev) / prev * 100).toFixed(2);
     * });
     *
     * // Percentage (백분율)
     * const agg4 = cube.aggregate(['region'], ['sales']);
     * const total = agg4.rows.reduce((sum, row) => sum + row.sales, 0);
     * agg4.addComputedColumn('percentage', (row) => {
     *   return ((row.sales / total) * 100).toFixed(2) + '%';
     * });
     * ```
     */
    addComputedColumn(name: string, computer: (row: any, index: number, rows?: any[][]) => any): void;
    /**
     * 결과 행의 개수를 제한한다.<br/>
     *
     * Top N 쿼리에 사용하며, sortBy()로 정렬한 후에 호출하는 것이 일반적이다.<br/>
     * rows getter에서 마지막에 적용되므로, 정렬과 계산 컬럼 후에 행을 제한한다.<br/>
     *
     * **메서드 체이닝:**
     * ```typescript
     * agg.sortBy('sales', 'desc')
     *    .limit(10)  // Top 10 반환
     * ```
     *
     * @param count 반환할 최대 행 개수
     * @returns this (메서드 체이닝 가능)
     *
     * @example
     * ```typescript
     * // Top 5 Sales
     * const agg = cube.aggregate(['region'], ['sales']);
     * agg.sortBy('sales', 'desc').limit(5);
     * const topN = agg.rows;
     *
     * // Top 10 with Rank
     * const agg2 = cube.aggregate(['product'], ['quantity']);
     * agg2.sortBy('quantity', 'desc')
     *     .addComputedColumn('rank', (_, i) => i + 1)
     *     .limit(10);
     * const topNWithRank = agg2.rows;
     * ```
     */
    limit(count: number): this;
    /* Excluded from this release type: getColumnIndexByName */
    /**
     * 주어진 행의 차원 값들이 날짜 계층 관계를 만족하는지 검증한다.
     * 예: Q1(분기1) → months는 01-03만 유효, Q2 → months 04-06만 유효
     */
    private $_isValidDateHierarchyRow;
    /**
     * 날짜 계층 차원의 자연 비교를 지원한다.
     * quarter(Hn/Qn), month(01-12), week/day/hour/minute/second 등은 숫자 비교로 처리.
     * DimensionMeta.sortBy.customOrder가 설정되어 있으면 해당 순서대로 비교.
     */
    private $_compareDimensionValue;
    /**
     * 차원을 추가한다.<br/>
     * mutable 상태에서만 호출 가능하며, 데이터를 재집계한다.<br/>
     *
     * @param dimensionColumn 추가할 차원 컬럼 메타데이터 (DimensionMeta 또는 ColumnMeta)
     * @throws Error frozen 상태이거나 mutable=false인 경우
     * @throws Error 동일한 이름의 차원이 이미 존재하는 경우
     *
     * @example
     * ```typescript
     * const agg = cube.aggregate(['region'], ['sales'], { mutable: true });
     * agg.addDimension({ name: 'product', source: 'product', type: 'str' });
     * // 재집계됨: region, product → sales
     * ```
     */
    addDimension(dimensionColumn: DimensionMeta | ColumnMeta): void;
    /**
     * 차원을 제거한다.<br/>
     * mutable 상태에서만 호출 가능하며, 데이터를 재집계한다.<br/>
     *
     * @param dimensionName 제거할 차원 이름
     * @throws Error frozen 상태이거나 mutable=false인 경우
     * @throws Error 해당 이름의 차원이 존재하지 않는 경우
     * @throws Error 마지막 차원을 제거하려는 경우 (최소 1개 필요)
     *
     * @example
     * ```typescript
     * const agg = cube.aggregate(['region', 'product'], ['sales'], { mutable: true });
     * agg.removeDimension('product');
     * // 재집계됨: region → sales
     * ```
     */
    removeDimension(dimensionName: string): void;
    /**
     * 측정값을 추가한다.<br/>
     * mutable 상태에서만 호출 가능하며, 데이터를 재집계한다.<br/>
     *
     * @param measureColumn 추가할 측정값 컬럼 메타데이터 (MeasureMeta 또는 ColumnMeta)
     * @throws Error frozen 상태이거나 mutable=false인 경우
     * @throws Error 동일한 이름의 측정값이 이미 존재하는 경우
     *
     * @example
     * ```typescript
     * const agg = cube.aggregate(['region'], ['sales'], { mutable: true });
     * agg.addMeasure({ name: 'quantity', source: 'quantity', type: 'i32', aggFunc: 'sum' });
     * // 재집계됨: region → sales, quantity
     * ```
     */
    addMeasure(measureColumn: MeasureMeta | ColumnMeta): void;
    /**
     * 측정값을 제거한다.<br/>
     * mutable 상태에서만 호출 가능하며, 데이터를 재집계한다.<br/>
     *
     * @param measureName 제거할 측정값 이름
     * @throws Error frozen 상태이거나 mutable=false인 경우
     * @throws Error 해당 이름의 측정값이 존재하지 않는 경우
     * @throws Error 마지막 측정값을 제거하려는 경우 (최소 1개 필요)
     *
     * @example
     * ```typescript
     * const agg = cube.aggregate(['region'], ['sales', 'quantity'], { mutable: true });
     * agg.removeMeasure('quantity');
     * // 재집계됨: region → sales
     * ```
     */
    removeMeasure(measureName: string): void;
    /**
     * 지정된 measure의 aggregate 함수 타입을 반환한다.<br/>
     *
     * @param measureName measure 이름
     * @returns aggregate 함수 타입 ('sum' | 'avg' | 'min' | 'max' | 'count' | 'distinct' | 'first' | 'last' | 'p25' | 'p50' | 'p75' | 'product' | 'stdev' | 'stdevp' | 'var' | 'varp' | 'total'),
     *          measure가 없으면 undefined
     *
     * @example
     * ```typescript
     * const agg = cube.aggregate(['region'], ['sales', 'quantity']);
     * agg.getAggregate('sales');    // 'sum' (schema에 정의된 기본값)
     *
     * // aggregate 오버라이드한 경우
     * const aggAvg = cube.aggregate(['region'], ['sales'], { aggregates: { sales: 'avg' } });
     * aggAvg.getAggregate('sales'); // 'avg' (오버라이드된 값)
     * ```
     */
    getAggregate(measureName: string): MeasureMeta['aggregate'] | undefined;
    /**
     * 차원 값 기반으로 행을 필터링한다.<br/>
     * 지정된 차원에서 주어진 값들을 포함하는 행만 유지한다.<br/>
     *
     * **[note]** 집계 후(post-aggregation) 필터로, 집계 결과를 변경하지 않고 행만 숨긴다.<br/>
     * 집계 자체를 변경하려면 `setPreFilter()`를 사용한다.<br/>
     * PivotMatrix와 함께 사용할 경우 PivotMatrix 쪽 필터로 대체 가능하다.<br/>
     *
     * @param dimensionName 필터링할 차원 이름
     * @param values 포함할 차원 값들
     * @returns this (메서드 체이닝 가능)
     * @throws Error 차원이 존재하지 않는 경우
     *
     * @example
     * ```typescript
     * // region이 'Seoul' 또는 'Busan'인 행만
     * const filtered = agg.filterByDimension('region', ['Seoul', 'Busan']);
     *
     * // product가 'A' 또는 'B'인 행만
     * const filtered2 = agg.filterByDimension('product', ['A', 'B']);
     *
     * // region이 'Seoul'이 아닌 행만 (exclude)
     * const filtered3 = agg.filterByDimension('region', ['Seoul'], true);
     * ```
     */
    filterByDimension(dimensionName: string, values: any[], exclude?: boolean): this;
    /**
     * 차원 레이블 기반으로 행을 필터링한다.<br/>
     * Excel 피벗 테이블의 '레이블 필터'에 대응한다.<br/>
     *
     * **[note]** 집계 후(post-aggregation) 필터로, 집계 결과를 변경하지 않고 행만 숨긴다.<br/>
     * 집계 자체를 변경하려면 `setPreFilter()`를 사용한다.<br/>
     *
     * @param dimensionName 필터링할 차원 이름
     * @param operator 필터 연산자
     * @param operand 비교할 값 (between일 경우 시작값)
     * @param operand2 between/notBetween일 경우 끝값
     * @returns this (메서드 체이닝 가능)
     * @throws Error 차원이 존재하지 않거나 between에 operand2가 없는 경우
     *
     * @example
     * ```typescript
     * // 'S'로 시작하는 region
     * agg.filterByLabel('region', 'beginsWith', 'S');
     *
     * // 'Phone'을 포함하는 product
     * agg.filterByLabel('product', 'contains', 'Phone');
     *
     * // 알파벳 D~M 사이의 region
     * agg.filterByLabel('region', 'between', 'D', 'M');
     *
     * // 와일드카드: S*l (Seoul 매칭)
     * agg.filterByLabel('region', 'wildcard', 'S*l');
     *
     * // 정규식
     * agg.filterByLabel('region', 'regex', '^(Seoul|Busan)$');
     * ```
     */
    filterByLabel(dimensionName: string, operator: LabelFilterOperator, operand: string, operand2?: string): this;
    /* Excluded from this release type: $_createLabelMatcher */
    /**
     * 측정값 조건으로 행을 필터링한다.<br/>
     * 지정된 측정값이 조건을 만족하는 행만 유지한다.<br/>
     *
     * **[note]** 집계 후(post-aggregation) 필터이다.<br/>
     *
     * @param measureName 필터 기준이 될 측정값 이름
     * @param predicate 필터 조건 함수 (측정값 -> boolean)
     * @returns this (메서드 체이닝 가능)
     * @throws Error 측정값이 존재하지 않는 경우
     *
     * @example
     * ```typescript
     * // sales > 1000000인 행만
     * const filtered = agg.filterByMeasure('sales', v => v > 1000000);
     *
     * // quantity >= 100인 행만
     * const filtered2 = agg.filterByMeasure('quantity', v => v >= 100);
     * ```
     */
    filterByMeasure(measureName: string, predicate: (value: any) => boolean): this;
    /**
     * 측정값 기준 상위 N개 행을 반환한다.<br/>
     * 지정된 측정값 기준으로 정렬하여 상위(또는 하위) N개 행만 유지한다.<br/>
     *
     * **[note]** 집계 후(post-aggregation) 필터이다.<br/>
     *
     * @param measureName 정렬 기준이 될 측정값 이름
     * @param ascending true이면 작은 값 N개(하위), false이면 큰 값 N개(상위, 기본값)
     * @param mode Top N 모드: 'count'(절대 개수), 'percent'(백분율), 'sum'(누적합)
     * @returns this (메서드 체이닝 가능)
     * @throws Error 측정값이 존재하지 않거나 limit이 0 이하인 경우
     *
     * @example
     * ```typescript
     * // 매출 상위 10개
     * const top10 = agg.topByMeasure('sales', 10);
     *
     * // 수량 하위 5개
     * const bottom5 = agg.topByMeasure('quantity', 5, true);
     *
     * // 매출 상위 10%
     * const topPercent = agg.topByMeasure('sales', 10, false, 'percent');
     *
     * // 매출 누적합이 100만에 도달할 때까지
     * const topSum = agg.topByMeasure('sales', 1000000, false, 'sum');
     * ```
     */
    topByMeasure(measureName: string, limit: number, ascending?: boolean, mode?: TopNMode): this;
    /**
     * 피벗 매트릭스 생성 시 예상되는 크기를 반환한다.<br/>
     *
     * 실제 pivot()을 호출하기 전에 UI 폭발 여부를 판단할 수 있다.<br/>
     * 카디날리티가 높은 차원을 축에 배치하면 셀 수가 기하급수적으로 증가할 수 있다.<br/>
     *
     * **계산 방식:**
     * - rowCount: row dimensions 각각의 고유값 개수의 곱
     * - colCount: column dimensions 각각의 고유값 개수의 곱
     * - totalCells: rowCount × colCount × measureCount
     *
     * **주의:** 실제 데이터에 존재하는 조합만 있다면 실제 셀 수는 이보다 적을 수 있다.
     *
     * @param rowDimensions 행에 배치할 차원 이름 배열
     * @param colDimensions 열에 배치할 차원 이름 배열
     * @param measureNames 표시할 측정값 이름 (단일 또는 배열)
     * @returns { rowCount, colCount, measureCount, totalCells }
         *
         * @example
         * ```typescript
         * const size = agg.estimatePivotSize(['region', 'product'], ['quarter'], ['sales', 'qty']);
         * // { rowCount: 15, colCount: 4, measureCount: 2, totalCells: 120 }
         *
         * // UI 폭발 방지
         * if (size.totalCells > 10000) {
         *     alert('셀 수가 너무 많습니다. 차원을 줄이거나 필터를 적용하세요.');
         *     return;
         * }
         * const pivot = agg.pivot('table1', ['region', 'product'], ['quarter'], ['sales', 'qty']);
         * ```
         */
     estimatePivotSize(rowDimensions: string[], colDimensions: string[], measureNames: string | string[]): {
         rowCount: number;
         colCount: number;
         measureCount: number;
         totalCells: number;
     };
     /**
      * 이 집계 테이블을 행/열 차원과 측정값으로 피벗하여 PivotMatrix를 생성한다.<br/>
      * 첫 인자 `tableKey`는 캐시 키에 포함된다. UI에서 동일한 pivot 구성(행/열/측정값/옵션)을
      * 여러 개의 개별 테이블 위젯에서 사용할 때, 위젯마다 다른 `tableKey`를 지정하면
      * 위젯별로 독립적인 PivotMatrix 인스턴스(독립적인 정렬/필터 상태)를 얻을 수 있다.<br/>
      *
      * @param tableKey 캐시 키에 포함할 테이블/위젯 식별자
      * @param rowDimensions 행에 배치할 차원 이름 배열
      * @param colDimensions 열에 배치할 차원 이름 배열
      * @param measureNames 표시할 측정값 이름 (단일 또는 배열)
      * @param options 피벗 옵션 (emptyValue 등)
      * @returns PivotMatrix
      * @throws Error 유효하지 않은 차원/측정값이 지정된 경우
      *
      * @example
      * ```typescript
      * // AggTable로부터 pivot 생성
      * const agg = cube.aggregate(['region', 'product'], ['sales', 'quantity']);
      * const pivot = agg.pivot('table1', ['region'], ['product'], 'sales');
      *
      * // 동일 구성을 서로 다른 UI 테이블에서 독립적으로 사용
      * const left  = agg.pivot('leftTable',  ['region'], ['product'], 'sales');
      * const right = agg.pivot('rightTable', ['region'], ['product'], 'sales');
      * // left !== right (각각 독립적인 PivotMatrix)
      * ```
      */
     pivot(tableKey: string, rowDimensions: string[], colDimensions: string[], measureNames: string | string[], options?: PivotMatrixOptions): PivotMatrix;
     /**
      * Mutable 상태인지 확인하고, 아니면 에러를 던진다.<br/>
      *
      * @param methodName 호출한 메서드 이름
      * @throws Error frozen 상태이거나 mutable=false인 경우
      */
     private $_checkMutable;
     /**
      * 필터를 초기화하여 모든 행을 다시 표시한다.<br/>
      *
      * **[note]** 집계 후(post-aggregation) 필터만 초기화한다. preFilter는 영향받지 않는다.<br/>
      *
      * @returns this (메서드 체이닝 가능)
      */
     clearFilter(): this;
     /**
      * 집계 전 필터(Pre-Filter)가 지정된 차원에 적용되어 있는지 확인한다.<br/>
      * @param dimensionName 확인할 차원 이름
      * @returns 적용 여부
      */
     isPreFiltered(dimensionName: string): boolean;
     /**
      * 집계 전 필터(Pre-Filter)를 반환한다.<br/>
      * @param dimensionName 확인할 차원 이름
      * @returns CubeFilter 또는 undefined (해당 차원에 preFilter가 없는 경우)
      */
     getPreFilter(dimensionName: string): CubeFilter | undefined;
     /* Excluded from this release type: $_isEffectivePreFilter */
     /* Excluded from this release type: $_isEqualPreFilter */
     /**
      * 집계 전 필터(Pre-Filter)를 설정한다.<br/>
      * DataCube 필터와 별도로 이 AggTable에만 적용되는 필터이다.<br/>
      * 기존 preFilter를 모두 교체하며, 내부 재집계가 즉시 실행된다.<br/>
      *
      * Power BI의 Visual-level filter에 해당하며,<br/>
      * Pivot의 row/column에 포함되지 않은 차원에 대한 필터링에 사용한다.<br/>
      *
      * @param filters CubeFilter 배열
      * @returns this (메서드 체이닝 가능)
      *
      * @example
      * ```typescript
      * // year가 pivot의 row/column에 없을 때
      * agg.setPreFilter([
      *     { dimension: 'year', values: [2024] }
      * ]);
      * // → 내부 재집계 + PivotMatrix 자동 갱신
      * ```
      */
     setPreFilters(filters: CubeFilter[]): this;
     /**
      * 단일 dimension의 집계 전 필터를 설정한다.<br/>
      * 유효한 필터 조건이 없으면(빈 values 등) 해당 dimension의 기존 필터를 제거한다.<br/>
      * 유효한 필터이고 기존과 다르면 교체한다.<br/>
      *
      * @param filter 설정할 CubeFilter
      * @returns true: 변경 발생 (추가/교체/제거), false: 변경 없음
      */
     setPreFilter(filter: CubeFilter): boolean;
     /**
      * 집계 전 필터를 추가한다.<br/>
      * 동일 dimension의 기존 필터는 교체된다.<br/>
      *
      * @param filter 추가할 CubeFilter
      * @returns true if the filter was added or updated, false if no changes were made (e.g. adding an identical filter or adding an ineffective filter)
      *
      * @example
      * ```typescript
      * agg.addPreFilter({ dimension: 'year', values: [2024] });
      * agg.addPreFilter({ dimension: 'status', values: ['active'] });
      * ```
      */
     addPreFilter(filter: CubeFilter): boolean;
     /**
      * 지정된 dimension의 집계 전 필터를 제거한다.<br/>
      *
      * @param dimension 제거할 필터의 dimension 이름
      * @returns true if the filter was removed, false if no filter was found for the specified dimension
      */
     removePreFilter(dimension: string): boolean;
     /**
      * 모든 집계 전 필터를 제거한다.<br/>
      *
      * @returns true if any filters were removed, false if no filters were found (i.e. there were no pre-filters to clear)
      */
     clearPreFilters(): boolean;
     /**
      * 현재 설정된 집계 전 필터 목록을 반환한다.<br/>
      *
      * @returns CubeFilter 배열 (복사본)
      */
     getPreFilters(): CubeFilter[];
     /* Excluded from this release type: $_setPreFiltersInternal */
     /**
      * 집계 전 필터가 설정되어 있는지 확인한다.<br/>
      * string이면 dimension 존재 여부만, CubeFilter이면 필터 조건까지 비교한다.<br/>
      *
      * @param filter 차원 이름(string) 또는 비교할 CubeFilter
      * @returns 필터 존재 여부
      */
     hasPreFilter(filter?: string | CubeFilter): boolean;
     /**
      * 지정된 차원의 고유값(도메인)을 반환한다.<br/>
      *
      * @param dimensionName 차원 이름
      * @param sort 값을 정렬할지 여부 (기본값: true)
      * @returns 고유값 배열
      * @throws Error 차원이 존재하지 않는 경우
      */
     getDimensionDomain(dimensionName: string, sort?: boolean): any[];
     /**
      * measure index 로 empty fallback 값을 조회한다.<br/>
      * `emptyValue` 옵션을 closure 로 1회 디스패치한 뒤 measure 별로
      * 미리 계산해 캡시하므로, NaN/null fallback hot path 에서
      * switch/typeof 분기를 완전 제거한다.
      */
     private $_getEmptyByIdx;
     /**
      * 모든 가능한 차원 조합을 생성한다. (Cartesian Product)<br/>
      *
      * @returns 모든 가능한 차원 값의 조합 배열
      */
     private $_generateAllCombinations;
     private $_maybeFillMissing;
     /**
      * options.groups에서 차원별 매핑 함수 배열을 구축한다.<br/>
      * 집계 루프에서 매 행마다 options.groups 객체를 조회하지 않도록,
      * 차원 인덱스 순서대로 매핑 함수(또는 null)을 미리 캐싱한다.<br/>
      *
      * ── 반환값 ──
      * - `resolvers[i]`: i번째 차원의 매핑 함수. null이면 매핑 없음.
      *   - 객체 매핑: `(val) => map[val] ?? val` (매핑에 없는 값은 원본 유지)
      *   - 함수 매핑: 사용자가 제공한 함수 그대로 사용
      *
      * @param dimensions 차원 메타데이터 배열
      * @returns 차원 인덱스 순서의 매핑 함수 배열 (매핑 없으면 null)
      */
     private $_buildGroupResolvers;
     /* Excluded from this release type: $_getSourceRowMap */
     /* Excluded from this release type: $_loadFromRows */
     private $_finalizeGroups;
     /**
      * 실제 집계를 수행한다.<br/>
      * 원본 데이터를 읽고 차원별로 그룹화한 후 측정값을 집계한다.<br/>
      * 결과를 columnar 형식으로 저장한다.<br/>
      *
      * ColumnStore인 경우 columnar 벡터를 직접 활용하여 고성능 집계를 수행한다.<br/>
      */
     private $_performAggregate;
     private $_aggregateFromDataViewSource;
     private $_aggregateFromColumnStore;
     /**
      * 백분위수를 계산한다.<br/>
      *
      * @param values 정렬 대상 값 배열
      * @param percentile 백분위수 (0-100)
      * @returns 계산된 백분위수 값
      */
     private $_calculatePercentile;
     /**
      * 값 배열의 곱을 계산한다.<br/>
      *
      * @param values 대상 값 배열
      * @returns 모든 값의 곱 (빈 배열이면 NaN)
      */
     private $_calculateProduct;
     /**
      * 값 배열의 분산을 계산한다.<br/>
      *
      * @param values 대상 값 배열
      * @param sample true면 표본 분산(n-1), false면 모집단 분산(n)
      * @returns 분산 값. 표본 분산은 값이 2개 미만이면 NaN.
      */
     private $_calculateVariance;
     /* Excluded from this release type: registerPivotListener */
     /* Excluded from this release type: unregisterPivotListener */
     /* Excluded from this release type: $_notifyPivotListeners */
     /* Excluded from this release type: setSourceCube */
     /**
      * PivotMatrix 캐시 키를 생성한다.<br/>
      * tableKey, 행차원, 열차원, 측정값, 옵션을 기반으로 고유한 캐시 키를 생성한다.<br/>
      *
      * @param rowDimensions 행 차원 배열
      * @param colDimensions 열 차원 배열
      * @param measures 측정값 이름 배열
      * @param options 피벗 옵션
      * @param tableKey 테이블/위젯 식별자
      * @returns 캐시 키 문자열
      */
     private _generatePivotCacheKey;
     /**
      * 데이터 변경 콜백을 등록한다.<br/>
      * DataCube 필터 변경으로 인한 재집계, 또는 AggTable 자체 필터 변경 시 호출된다.<br/>
      * 반환된 함수를 호출하면 콜백이 해제된다.<br/>
      *
      * @param callback 변경 시 호출될 콜백 함수
      * @returns 콜백 해제 함수
      *
      * @example
      * ```typescript
      * const unsub = agg.onChange(() => {
      *     renderTable(agg.rows);
      * });
      * // 해제
      * unsub();
      * ```
      */
     onChange(callback: () => void): () => void;
     /* Excluded from this release type: $_notifyChangeListeners */
     /* Excluded from this release type: onCubeFiltered */
     /* Excluded from this release type: $_reAggregateWithPreFilters */
     /* Excluded from this release type: $_reapplyFilterConditions */
     /* Excluded from this release type: $_setHiddenMeasures */
     /* Excluded from this release type: $_addMetricColumn */
    }

    /**
     * AggTable 옵션.<br/>
     */
    declare interface AggTableOptions {
        /**
         * 집계할 차원 컬럼 메타데이터 배열.<br/>
         * DimensionMeta[] 또는 ColumnMeta[] (role='dimension'인 경우 자동 변환)<br/>
         */
        dimensions: DimensionMeta[] | ColumnMeta[];
        /**
         * 집계할 측정값 컬럼 메타데이터 배열.<br/>
         * MeasureMeta[] 또는 ColumnMeta[] (role='measure'인 경우 자동 변환)<br/>
         */
        measures: MeasureMeta[] | ColumnMeta[];
        /**
         * Empty 조합도 행으로 생성할지 여부.<br/>
         * crosstab/pivot 생성 시 true로 지정하여 모든 가능한 차원 조합을 생성한다.<br/>
         * @default false
         */
        fillMissingCombinations?: boolean;
        /**
         * 빈 값(데이터 없는 조합)에 대한 표시 방식.<br/>
         * - **'zero'**: 0으로 표시
         * - **'null'**: null로 표시 (기본)
         * - **'dash'**: "-"로 표시
         * - **'empty'**: 빈 문자열
         * - **'na'**: "N/A"로 표시
         * - **function**: `(columnMeta) => any` 으로 measure 별 커스텀 값 결정
         *
         * **표시(display) / export 전용 fallback** 이다. 집계·정렬·필터에는 영향 없음.
         *
         * @default 'null'
         * @see EmptyValue
         */
        emptyValue?: EmptyValue;
        /**
         * 변경 가능한(mutable) AggTable 생성 여부.<br/>
         * - **true**: 디자인 타임용 - 차원/측정값 추가/삭제 가능, 캐시 불가
         * - **false**: 런타임용 - 불변(immutable), 캐시 가능 (기본값)
         *
         * @default false
         */
        mutable?: boolean;
        /**
         * 차원값 그룹핑 정의.<br/>
         * 집계 시 원본 차원값을 그룹값으로 매핑하여, 매핑된 값을 기준으로 그룹 키를 생성한다.<br/>
         * 원본 데이터는 변경하지 않으며, 집계 결과에만 반영된다.<br/>
         *
         * - **키**: 차원 이름 (dimensions에 포함된 컬럼명)
         * - **값**: 매핑 객체 `Record<원본값, 그룹값>` 또는 매핑 함수 `(원본값) => 그룹값`
         *   - 매핑 객체: 명시되지 않은 원본값은 그대로 유지
         *   - 매핑 함수: 모든 원본값에 대해 호출되어 그룹값을 결정
         *
         * ── 동작 원리 ──
         * 1. 각 행의 차원값을 읽은 후, groups에 해당 차원이 있으면 매핑을 적용
         * 2. 매핑된 값으로 그룹 키를 생성 → 같은 그룹값을 가진 행들이 하나로 집계됨
         * 3. 결과 테이블의 차원 컬럼에는 매핑된 그룹값이 저장됨
         *
         * @example
         * ```typescript
         * // 객체 매핑: 월 → 분기
         * groups: {
         *   '월': { '1월': 'Q1', '2월': 'Q1', '3월': 'Q1', '4월': 'Q2', ... }
         * }
         *
         * // 함수 매핑: 나이 → 연령대
         * groups: {
         *   '나이': (v) => v < 30 ? '청년' : v < 50 ? '중년' : '장년'
         * }
         *
         * // 객체 매핑: 매핑에 없는 값은 원본 유지
         * groups: {
         *   '지역': { '서울': '수도권', '경기': '수도권', '인천': '수도권' }
         *   // '부산', '대구' 등은 매핑되지 않아 원본값 그대로 사용
         * }
         * ```
         *
         * @default undefined
         */
        groups?: Record<string, Record<string, any> | ((value: any) => any)>;
    }

    declare type AIAddTableMode = 'dialog' | 'page';

    declare abstract class AIChatItem {
    }

    /**
     * provider 비종속 대화 메시지.<br/>
     * 베이스가 systemContext·history·현재 query를 이 형태로 구성하고,
     * 서브클래스가 각 provider의 요청 본문으로 변환한다.
     */
    export declare interface AIChatMessage {
        role: AIChatRole;
        content: string;
    }

    /** LLM에 전달하는 대화 메시지의 역할. */
    export declare type AIChatRole = "system" | "developer" | "user" | "assistant";

    /**
     * LLM이 호출할 수 있는 명령(도구)의 정의.<br/>
     * 모델에 등록되면 구현부에서 JSONSchema 기반 function/tool 정의로 변환되어 LLM에 전달된다.
     * @see https://json-schema.org/
     */
    export declare interface AICommand {
        readonly name: string;
        /** LLM이 명령의 용도·호출 시점을 판단하는 근거. function calling 품질을 좌우하므로 필수이다. */
        readonly description: string;
        readonly parameters?: AICommandParameter[];
        /**
         * 호출 패턴을 알려주는 few-shot 예시.<br/>
         * 변환 시 description에 합쳐져 LLM의 인자 채우기 정확도를 높인다.
         */
        readonly examples?: AIToolExample[];
        /**
         * 조회 전용(상태를 변경하지 않는) 명령 표식.<br/>
         * MCP 노출 시 표준 tool annotations(readOnlyHint)로 전달돼, 클라이언트가 도구 성격(조회/변경)을 표시·판단하는 근거가 된다.
         */
        readonly readOnly?: boolean;
    }

    /**
     * LLM이 선택한 단일 명령 호출.<br/>
     * 응답으로 받은 JSONSchema 인자를 parse하여 생성되며, 실행부에 전달되는 기본 단위다.
     */
    export declare interface AICommandCall {
        readonly tool: string;
        readonly arguments?: Record<string, any>;
        /**
         * 모델이 이 도구를 호출하며 기술한 처리 근거·수행 작업 설명.<br/>
         * 모든 도구에 자동 주입되는 reason 파라미터에서 추출되며, 실행 인자(arguments)에는 포함되지 않는다.
         */
        readonly reason?: string;
        agentMessage?: string;
    }

    /**
     * AICommand가 받는 단일 파라미터의 정의.<br/>
     * 구현부에서 JSONSchema의 properties 항목으로 변환된다.<br/>
     * 중첩 구조는 재귀적으로 표현한다 — array는 items로 원소 스키마를,
     * object는 properties로 하위 속성을 지정한다.
     */
    export declare interface AICommandParameter {
        readonly name: string;
        readonly type: "string" | "number" | "integer" | "boolean" | "object" | "array";
        readonly required?: boolean;
        readonly defaultValue?: any;
        /** LLM이 인자를 정확히 채우는 데 필요한 설명. function calling 품질을 위해 필수이다. */
        readonly description: string;
        /** 허용되는 값의 집합(예: 정렬 방향 "asc"|"desc", 집계 "sum"|"avg"|"count"). */
        readonly enum?: (string | number)[];
        /** UI 표시 여부. [주의] 현재 UI 용도로만 사용된다. */
        readonly visible?: boolean;
        /** 사용자 수정 가능 여부. [주의] 현재 UI 용도로만 사용된다. */
        readonly editable?: boolean;
        /** 값의 범위(예: 최소값, 최대값, 단계). [주의] 현재 UI 용도로만 사용된다. */
        readonly range?: {
            min?: number;
            max?: number;
            step?: number;
        };
        /** type이 "array"일 때 원소의 스키마. */
        readonly items?: AICommandParameter;
        /** type이 "object"일 때 하위 속성들의 스키마. */
        readonly properties?: AICommandParameter[];
    }

    declare class AIConversationItem extends AIChatItem {
        readonly turn: AIPromptTurn;
        constructor(turn: AIPromptTurn);
    }

    declare type AIConversationState = "pending" | "fulfilled" | "rejected";

    /**
     * 한 턴의 대화 기록.<br/>
     * 사용자가 보낸 요청(query)과 그에 대한 LLM의 응답(response)을 쌍으로 담는다.
     */
    export declare interface AIConversationTurn {
        readonly query: string;
        response: AIResponse;
        state: AIConversationState;
        error?: string;
    }

    declare class AIGreetingItem extends AIChatItem {
        readonly text: string;
        constructor(text: string);
    }

    /**
     * 브라우저에서 직접 LLM API를 호출하는 경우의 모델 인터페이스.<br/>
     * 멀티턴 대화를 위해 이전 응답을 내부에 누적하며, getHistory/clearHistory로 접근·초기화한다.<br/>
     * 주의: apiKey가 클라이언트에 노출되므로(번들·네트워크·DevTools에서 확인 가능)
     * 신뢰할 수 있는 내부/데모 환경에서만 사용해야 한다.
     * 운영 환경에서는 키를 서버에 두는 AIRemoteModel을 사용한다.
     */
    declare interface AILocalModel extends PivotAIModel {
        readonly provider: "openai" | "gemini" | "custom";
        readonly apiKey: string;
        readonly modelName: string;
        /** azure 또는 custom provider에서 호출 대상 endpoint(baseURL)를 지정한다. */
        readonly endpoint?: string;
        /** 누적된 대화 기록(사용자 요청 + LLM 응답)을 오래된 순서대로 반환한다. */
        getHistory(): AIConversationTurn[];
        /** 누적된 대화 기록을 모두 비워 새 대화를 시작한다. */
        clearHistory(): void;
    }

    /**
     * 브라우저에서 직접 LLM API를 호출하는 로컬 모델의 공통 베이스.<br/>
     * provider·apiKey·modelName·endpoint 보관, 멀티턴 history 누적·접근,
     * systemContext+history+query를 메시지 배열로 구성하는 call 흐름을 제공한다.<br/>
     * 명령(도구)은 매 호출 시 tools로 inline 전달하므로 별도 등록(_doRegisterCommands)은 no-op이다.<br/>
     * 실제 HTTP 호출과 네이티브 tool_calls/functionCall → AIResponse 파싱은 서브클래스가 _complete로 구현한다.
     */
    export declare abstract class AILocalModelImpl extends AIModelImpl implements AILocalModel {
        private _provider;
        private _apiKey;
        private _endpoint?;
        private _maxContextTurns;
        private _history;
        private _op;
        private _useContextCache;
        private _contextCacheTtl;
        private _embeddingModel?;
        private _ragTopK;
        private _ragEmbeddingsPath;
        private _ragChunksPath;
        private _ragMetaPath;
        private _ragLoading?;
        private _ragVectors?;
        private _ragChunks?;
        private _ragDim;
        constructor(options: PivotLocalAIModelOptions);
        protected abstract _getRagPath(): {
            embeddings: string;
            chunks: string;
            meta: string;
        };
        get provider(): AILocalModel["provider"];
        get apiKey(): string;
        get endpoint(): string | undefined;
        /** query 임베딩에 사용하는 모델명(미지정 시 provider 기본값 사용). */
        get embeddingModel(): string | undefined;
        /** 로드된 코퍼스의 임베딩 차원(meta.dim). RAG 로드 전에는 0. query 임베딩 차원을 코퍼스와 맞추는 데 쓴다. */
        protected get ragDim(): number;
        /** systemContext를 provider 컨텍스트 캐시로 재사용할지 여부(서브클래스가 provider별로 활용). */
        protected get useContextCache(): boolean;
        /** gemini 명시적 캐시 TTL(Duration 문자열). */
        protected get contextCacheTtl(): string;
        get useRag(): boolean;
        set useRag(value: boolean);
        getHistory(): AIConversationTurn[];
        clearHistory(): void;
        /** 로컬 모델은 매 호출 시 tools를 inline 전달하므로 별도 등록이 없다. */
        protected _doRegisterTools(_commands: AIToolSchema[], _clear?: boolean): Promise<void>;
        protected _doCall(api: PivotAIApi, query: string, toolChoice: AIToolChoice, contextDirty?: boolean): Promise<AIConversationTurn>;
        /**
         * 구성된 메시지·도구로 provider API를 호출하고 응답을 AIResponse로 파싱한다.<br/>
         * 네이티브 tool_calls(OpenAI)·functionCall(Gemini)을 AICommandCall로 변환하며,
         * 실패(네트워크·rate limit·parse 실패 등)는 예외를 throw한다.<br/>
         * toolChoice는 provider별 도구 호출 정책으로 매핑한다(생략 시 auto).
         */
        protected abstract _complete(messages: AIChatMessage[], tools: AIToolSchema[], toolChoice?: AIToolChoice): Promise<AIResponse>;
        /** systemContext + (제한된) history + (RAG) + 현재 query를 메시지 배열로 구성한다. */
        protected _buildMessages(api: PivotAIApi, query: string, ragContext?: string[]): AIChatMessage[];
        /** 컨텍스트로 포함할 history 구간(maxContextTurns 적용, 최신 우선). */
        private _contextTurns;
        /**
         * 미리 임베딩한 벡터 스냅샷에서 query와 유사한 chunk 상위 topK개를 검색한다.<br/>
         * 코퍼스 벡터는 빌드 시 정규화돼 있다고 가정하며(코사인=내적), query 벡터만 런타임에 정규화한다.<br/>
         * RAG 파일이 비어 있으면 빈 배열을 반환한다. 임베딩(_embed) 미구현 시 예외를 throw한다.
         *
         * 제약 사항(벡터 DB의 검색 코어만 떼어낸 경량 구현이므로):
         * - 검색 방식: brute-force 전수 내적(O(N·D)). ANN 인덱스(HNSW/IVF)가 아니다.
         *   → 정확한 top-k지만, 규모는 브라우저 메모리·연산 한계(수만 벡터 수준)까지만 현실적.
         * - 메타데이터 필터 없음: 전체 코퍼스를 대상으로만 검색(예: 부서/기간 조건부 검색 불가).
         * - 갱신 없음: 스냅샷을 통째로 교체할 뿐, 개별 벡터 upsert/delete 불가.
         * - 정규화 가정: 코퍼스가 정규화돼 있어야 점수가 코사인과 일치(미정규화면 순위 왜곡).
         * 대규모·실시간 필터·증분 갱신이 필요하면 벡터 DB REST 직접 호출 또는 remote 모델(서버 retrieve)로 가야 한다.
         */
        retrieve(query: string, topK?: number): Promise<string[]>;
        /**
         * query 텍스트를 임베딩 벡터로 변환한다(provider별 임베딩 API 호출).<br/>
         * RAG를 사용하는 모델은 반드시 override해야 하며, 기본 구현은 예외를 throw한다.<br/>
         * 코퍼스와 동일한 임베딩 모델·차원을 사용해야 검색이 유효하다.
         */
        protected _embed(_text: string): Promise<Float32Array>;
        /** RAG 스냅샷(meta/embeddings/chunks)을 최초 1회만 적재한다(동시 호출 dedupe, 실패 시 재시도 허용). */
        private $_ensureRagLoaded;
        private $_loadRag;
        /** 벡터를 L2 정규화한다(0 벡터는 그대로). */
        private $_normalize;
    }

    /**
     * PivotAIModel 구현체의 공통 베이스.<br/>
     * name/description, 등록된 명령 캐시, registerCommands 흐름(서버 전송 → 캐시 갱신),
     * AICommand → JSONSchema 변환을 제공한다.<br/>
     * 실제 전송(_doRegisterCommands)과 질의(call)는 서브클래스가 구현한다.
     */
    export declare abstract class AIModelImpl extends RObject implements PivotAIModel {
        private _name;
        private _modelName;
        private _description?;
        private _tools;
        private _systemContext?;
        private _developerContext?;
        private _contextDirty;
        constructor(name: string, modelName: string, description: string);
        get name(): string;
        get modelName(): string;
        get description(): string | undefined;
        get tools(): AIToolSchema[];
        get systemContext(): string | undefined;
        get developerContext(): string | undefined;
        get label(): string;
        /**
         * 시스템 컨텍스트를 설정한다(피벗 데이터·필드가 정해질 때 호출 측에서 지정).<br/>
         * undefined를 전달하면 컨텍스트를 해제한다.
         */
        setSystemContext(context?: string): void;
        /**
         * 개발자 컨텍스트를 설정한다(개발자 관련 정보가 필요할 때 호출 측에서 지정).<br/>
         * undefined를 전달하면 컨텍스트를 해제한다.
         */
        setDeveloperContext(context?: string): void;
        /**
         * 명령(도구) 목록을 등록한다.<br/>
         * 전송(_doRegisterTools)이 성공한 경우에만 로컬 캐시를 갱신한다.<br/>
         * clear가 true이면 기존 목록을 비운 뒤 등록하고, false(기본)이면 추가한다.
         */
        registerTools(tools: AIToolSchema[], clear?: boolean): Promise<void>;
        /**
         * 명령 등록을 실제로 전송한다(원격은 서버 호출, 로컬은 보통 no-op).<br/>
         * 전달되는 tools는 아직 캐시에 반영되기 전의 신규 목록이다.
         */
        protected abstract _doRegisterTools(tools: AIToolSchema[], clear?: boolean): Promise<void>;
        protected abstract _doCall(api: PivotAIApi, query: string, toolChoice: AIToolChoice, contextDirty: boolean): Promise<AIConversationTurn>;
        /**
         * 사용자의 자연어 요청을 전달하고 LLM의 응답을 받는다.
         */
        call(api: PivotAIApi, query: string, toolChoice?: AIToolChoice): Promise<AIConversationTurn>;
        private $_ensureTools;
        /** toolChoice가 특정 도구를 강제할 때 해당 도구가 등록돼 있는지 검증한다. */
        protected _assertToolChoice(toolChoice?: AIToolChoice): void;
        /**
         * 모델이 반환한 인자에서 reason 예약 파라미터를 분리해 AIToolCall을 만든다.<br/>
         * reason은 전용 필드로 승격되며, 실행 인자(arguments)에서는 제거된다.
         */
        protected _buildToolCall(name: string, rawArgs?: Record<string, any>): AICommandCall;
    }

    declare type AIPanelPosition = 'inspector' | 'explorer' | 'right' | 'left' | 'float';

    /**
     * 사용자 확인을 기다리는 지연 실행 command.<br/>
     * completeTurn에서 deferred인 command를 즉시 실행하지 않고 이 형태로 담아둔다.<br/>
     * view가 확인·매개변수 입력을 받은 뒤 prompter.runPending / cancelPending으로 개별 처리한다.
     */
    declare interface AIPendingCommand {
        readonly turn: AIPromptTurn;
        readonly command: PivotAICommand;
        state: AIPendingState;
        result: AIToolResult | undefined;
    }

    /** pending command의 처리 상태. */
    declare type AIPendingState = "pending" | "confirmed" | "canceled";

    /**
     * 사용자 입력을 받아 LLM 모델을 호출하고, 그 결과를 해석하여 피벗 명령으로 변환하는 PivotAI 에이전트의 챗봇 모델.<br/>
     */
    declare class AIPrompter extends ROptionable<AIPrompterOptions> {
        private _book;
        static defaults: AIPrompterOptions;
        private _listeners;
        private _greetings;
        private _suggestions;
        private _items;
        private _started;
        private _turn;
        private _toolChoice;
        private _queryContext;
        private _toolArguments?;
        constructor(_book: PivotBook);
        get book(): PivotBook;
        get ai(): PivotAI;
        get started(): boolean;
        get greetings(): readonly AIGreetingItem[];
        get suggestions(): readonly AISuggestionItem[];
        get items(): readonly AIConversationItem[];
        get turn(): AIPromptTurn | null;
        get state(): AIConversationState | null;
        addListener(listener: Partial<AIPromterEvents>): void;
        removeListener(listener: Partial<AIPromterEvents>): void;
        setToolChoice(choice: AIToolChoice): this;
        /**
         * UI가 이미 확정한 인자를 모델 응답 위에 덮어쓰도록 지정한다.<br/>
         * 모델이 같은 인자를 생성하더라도 여기 지정한 값이 우선한다(force).
         */
        setToolArguments(tool: string, args: Record<string, any>): this;
        send(prompt: string): this;
        reset(): this;
        /**
         * pending queue의 command 하나를 실행한다(개별 처리).<br/>
         * 사용자 확인·매개변수 입력을 마친 뒤 view에서 호출한다. 이미 처리된 pending은 무시한다.
         */
        runPending(pending: AIPendingCommand): Promise<this>;
        /**
         * pending queue의 command 하나를 실행하지 않고 취소한다(개별 처리).<br/>
         * 이미 처리된 pending은 무시한다.
         */
        cancelPending(pending: AIPendingCommand): this;
        protected _doApply(op: AIPrompterOptions): void;
        _optionChanged(tag?: any): void;
        private $_fireEvent;
        private $_completeTurn;
        /**
         * 실행 결과(results)의 메시지·오류를 turn.response.message와 turn.state에 반영한다.<br/>
         * completeTurn의 즉시 실행분과 runPending의 개별 실행분이 같은 규칙으로 누적되도록 공유한다.
         */
        private $_applyResults;
    }

    declare interface AIPrompterOptions extends ROptions {
        /**
         * 프롬프트 입력창에 표시할 인사말/설명 텍스트.<br/>
         */
        greetings?: string | string[];
        /**
         * 프롬프트 입력창 아래에 표시할 제안 텍스트 목록.<br/>
         */
        suggestions?: string[];
        /**
         * 프롬프트 입력창 placeholder.<br/>
         */
        placeholder?: string;
        /**
         * AI 응답을 기다리는 동안 표시할 메시지.<br/>
         *
         * @default "분석 중..."
         */
        waitingMessage?: string;
    }

    /**
     * AI prompt 입력창과 response 출력창을 포함하는 뷰.<br/>
     */
    declare class AIPrompterView extends UIFlexElement implements AIPromterEvents {
        private static readonly PLACEHOLDER;
        private _responseLayer;
        private _paramView;
        private _promptLayer;
        protected _promptInput: HTMLTextAreaElement;
        protected _actionLayer: HTMLDivElement;
        private _modelView;
        private _clearButton;
        private _submitButton;
        private _model;
        private _pending;
        private _autoLayout;
        private _promptHistory;
        private _historyIndex;
        private _promptDraft;
        constructor(doc: Document, className?: string);
        protected _doInit(doc: Document, initData: any): void;
        prompterChanged(prompter: AIPrompter, tag?: any): void;
        prompterSend(prompter: AIPrompter, turn: AIConversationTurn): void;
        prompterBeforeResponse(prompter: AIPrompter, turn: AIPromptTurn): void;
        prompterResponse(prompter: AIPrompter, turn: AIConversationTurn): void;
        get model(): AIPrompter;
        set model(value: AIPrompter);
        setAutoLayout(): this;
        setPlaceholder(text: string): this;
        setPromptStyles(styles: Partial<CSSStyleDeclaration>): this;
        focus(): this;
        prepareRender(): void;
        measure(hintWidth: number, hintHeight: number): {
            width: number;
            height: number;
        };
        layout(): void;
        private $_submitParams;
        click(target: Element, shift: boolean, meta: boolean): boolean;
        copyAll(): void;
        copyLast(): void;
        private $_writeClipboard;
        getPopupMenu(target: Element): PopupMenu | undefined;
        protected _doInitDom(doc: Document, dom: HTMLElement): void;
        protected _registerEvents(): void;
        protected _unregisterEvents(): void;
        private $_refresh;
        private $_submit;
        /**
         * suggestion/prompt 링크 텍스트를 입력창에 채운다.<br/>
         * meta가 true면(Ctrl/Cmd + click) 곧바로 전송한다.
         */
        private $_usePrompt;
        private $_updateActionState;
        private $_autoResize;
        /** 제출한 쿼리를 히스토리에 누적한다(직전과 동일하면 생략). 누적 후 탐색 상태를 초기화한다. */
        private $_pushHistory;
        /**
         * Up/Down 히스토리 탐색을 처리한다. 처리했으면 true.<br/>
         * - Up: 첫 줄이면 우선 텍스트 처음으로 caret 이동, 이미 처음일 때만 이전 쿼리로.<br/>
         * - Down: 마지막 줄이면 우선 텍스트 끝으로 caret 이동, 이미 끝일 때만 다음 쿼리/초안으로.
         */
        private $_navigateHistory;
        /** 이전(더 오래된) 쿼리로 이동한다. 이동했으면 true. */
        private $_historyPrev;
        /** 다음(더 최근) 쿼리 또는 편집 중이던 초안으로 이동한다. 이동했으면 true. */
        private $_historyNext;
        /** 히스토리/초안 텍스트를 입력창에 반영하고 caret를 끝으로 둔다. */
        private $_applyHistoryText;
        private $_clickHandler;
        private $_keyHandler;
        private _inputHandler;
        private _menu;
    }

    declare interface AIPromptTurn extends AIConversationTurn {
        results: AIToolResult[] | undefined;
        /** 즉시 실행하지 않고 사용자 확인을 기다리는 command 목록(deferred). */
        pendings: AIPendingCommand[] | undefined;
    }

    declare interface AIPromterEvents {
        prompterChanged?: (prompter: AIPrompter, tag?: any) => void;
        prompterSend?: (prompter: AIPrompter, turn: AIPromptTurn) => void;
        prompterBeforeResponse?: (prompter: AIPrompter, turn: AIPromptTurn) => void;
        prompterResponse?: (prompter: AIPrompter, turn: AIPromptTurn) => void;
    }

    /**
     * 원격 서버를 경유하여 LLM을 호출하는 경우의 모델 인터페이스.<br/>
     * 키는 서버에 보관되며, 서버에는 RAG(Retrieval-Augmented Generation) 등의
     * 추가 기능이 구현되어 있을 수 있다.
     */
    export declare interface AIRemoteModel extends PivotAIModel {
        readonly url: string;
    }

    /**
     * 원격 서버를 경유하여 LLM을 호출하는 AIRemoteModel 구체 구현.<br/>
     * 통신은 fetch로 직접 수행하며, 와이어 프로토콜은 다음과 같다:<br/>
     * - 명령 등록: POST `{url}/{commandsPath}` 본문 `{ tools, clear }`
     *   (tools는 AICommand를 JSONSchema tool 정의로 변환한 배열)<br/>
     * - 컨텍스트 등록: POST `{url}/{contextPath}` 본문 `{ systemContext, reasonInstruction }`
     *   (tools와 동일하게 세션에 한 번 등록하며, 변경되었을 때만 다음 질의 직전에 전송.
     *    reasonInstruction은 message/도구별 reason의 역할 계약으로, 서버가 프롬프트에 주입한다)<br/>
     * - 질의: POST `{url}/{queryPath}` 본문 `{ query }` → 응답 본문이 AIResponse<br/>
     * 응답이 2xx가 아니거나 본문 parse에 실패하면 예외를 throw한다.<br/>
     * 등록된 명령은 UI 표시 등을 위해 로컬에도 캐시하며(베이스 처리), 서버 등록이 성공한 경우에만 갱신한다.<br/>
     * 서버가 세션별로 tools/컨텍스트를 보관한다는 전제(stateful)이며, 매 질의에 컨텍스트를 재전송하지 않는다.
     */
    export declare class AIRemoteModelImpl extends AIModelImpl implements AIRemoteModel {
        private _url;
        private _headers?;
        private _commandsPath;
        private _contextPath;
        private _queryPath;
        constructor(options: PivotRemoteAIModelOptions);
        get url(): string;
        protected _doRegisterTools(commands: AIToolSchema[], clear?: boolean): Promise<void>;
        _doCall(api: PivotAIApi, query: string, toolChoice?: AIToolChoice, contextDirty?: boolean): Promise<AIConversationTurn>;
        private $_post;
    }

    /**
     * LLM 모델의 응답을 wrap하는 인터페이스.<br/>
     * 사용자에게 표시할 message와, 한 턴에 호출된 다수의 명령(tools)을 함께 담는다.<br/>
     * 실행할 명령이 없이 단순 대화만 응답한 경우 tools는 빈 배열이다.
     */
    export declare interface AIResponse {
        message: string;
        readonly tools: AICommandCall[];
    }

    declare class AISuggestionItem extends AIChatItem {
        readonly text: string;
        constructor(text: string);
    }

    /**
     * call 시 LLM의 도구(tool) 호출 정책.<br/>
     * - "auto"(기본): 모델이 호출 여부·대상을 판단한다.<br/>
     * - "none": 도구 호출 없이 메시지만 응답한다.<br/>
     * - "required": 등록된 도구 중 하나를 반드시 호출한다.<br/>
     * - { tool }: 지정한 특정 도구를 강제로 호출한다(args는 모델이 채움).<br/>
     * provider별로 OpenAI tool_choice / Gemini functionCallingConfig로 매핑된다.<br/>
     * 주의: 특정 도구 강제 시 의도와 무관하게 args를 억지로 만들 수 있으므로 확신할 때만 사용한다.
     */
    export declare type AIToolChoice = "auto" | "none" | "required" | {
        tool: string;
    };

    /**
     * 도구 호출의 few-shot 예시.<br/>
     * 특정 상황(query)에서 어떤 인자(arguments)로 호출해야 하는지를 보여준다.<br/>
     * OpenAI/Gemini function 정의에는 function 레벨 examples 필드가 없으므로,
     * 구현부에서 description 끝에 합쳐져 LLM에 전달된다.
     */
    declare interface AIToolExample {
        /** 예시가 가정하는 사용자 발화 또는 상황. */
        readonly query: string;
        /** 그 상황에서 채워야 하는 인자. */
        readonly arguments: Record<string, any>;
    }

    /**
     * executeTool의 실행 결과.<br/>
     * 외부 agent가 적용 성공 여부를 판단하고 self-correct하는 근거로 사용한다.<br/>
     * ok가 false이면 error에 실패 원인이, true이면 message에 실행 설명이 담긴다.
     */
    export declare interface AIToolResult {
        readonly tool: string;
        readonly ok: boolean;
        readonly message?: string;
        readonly error?: string;
    }

    /**
     * LLM에 전달하는 function/tool 정의(JSONSchema 기반).
     */
    export declare interface AIToolSchema {
        name: string;
        description?: string;
        parameters: JSONSchema;
    }

    declare class AllField extends InspectorField {
        constructor(field: PivotField);
    }

    /**
     * 전체 필드 섹션 Model.
     * 피벗 데이터에서 제공하는 모든 필드를 관리.
     */
    declare class AllFieldSection extends InspectorFieldSection<AllField> {
        constructor(panel: PivotFieldPanel);
        protected _createField(model: PivotField): AllField;
        moveToSection(field: AllField, targetSection: InspectorFieldSection, toIndex?: number): boolean;
        /**
         * 전체 필드 섹션은 다른 섹션에서 돌아오는 필드를 받을 수 있음.
         */
        canDrop(data: IFieldDragData): boolean;
        getMenu(): PopupMenu;
        getFieldMenu(field: InspectorField): PopupMenu;
        private _menu;
        private _fieldMenu;
    }

    declare interface AncestorInfo {
        dims: string[];
        labels: any[];
    }

    /**
     * 측정 후보 항목.<br/>
     * - `text`: 측정 대상 문자열 (이미 formatter / showAs 적용된 결과)
     * - `kind`: 측정 셀 종류 (view 측이 폰트/패딩을 다르게 적용할 수 있도록)
     */
    declare interface AutoWidthCandidate {
        text: string;
        kind: AutoWidthCellKind;
    }

    /**
     * 컬럼 너비 자동 계산 시 측정 후보 셀의 종류.
     */
    declare type AutoWidthCellKind = 'header' | 'total' | 'cell' | 'rowHeader' | 'cellGrand';

    declare abstract class BodyCellView extends PivotCellView {
        info: IPivotBodyCellInfo | null;
    }

    /**
     * 버튼 selector 옵션.<br/>
     */
    declare interface ButtonSelectorOptions extends FilterSelectorOptions {
        /** @dummy */
        type?: typeof ButtonSelectorType;
        /**
         * 헤더에 표시되는 simple 모드에서 셀렉터의 최대 너비(px).<br/>
         * 버튼이 컨테이너 너비를 초과하면 스크롤로 접근하도록 한다.<br/>
         * 숫자로 지정하면 px 단위로 해석한다.
         * 문자열로 지정하면 '%' 등 CSS width 값으로 해석한다.<br/>
         *
         * @default 'auto'
         */
        simpleWidth?: number | string;
        /**
         * 헤더에 표시되는 simple 모드에서 셀렉터의 최대 너비(px).<br/>
         * 숫자로 지정하면 px 단위로 해석한다.
         * 문자열로 지정하면 '%' 등 CSS width 값으로 해석한다.<br/>
         *
         * @default 400
         */
        simpleMaxWidth?: number | string;
    }

    declare const ButtonSelectorType = "button";

    /**
     * 계산 필드 설정 옵션.<br/>
     * Expression 수식을 이용해 다른 필드의 값을 참조하여 자동 계산되는 필드를 정의한다.<br/>
     *
     * @example
     * ```typescript
     * const table = new DataTable({
     *     fields: [
     *         { name: 'qty', type: 'number' },
     *         { name: 'price', type: 'number' },
     *     ],
     *     calculatedFields: [
     *         { name: 'total', type: 'number', expression: 'qty * price' },
     *         { name: 'tax', type: 'number', expression: 'total * 0.1' },
     *     ]
     * });
     * ```
     */
    declare interface CalculatedFieldOptions {
        /**
         * 필드 이름.<br/>
         */
        name: string;
        /**
         * 필드 유형.<br/>
         * 기본값은 ValueType.TEXT.<br/>
         */
        type?: ValueType;
        /**
         * 필드 헤더.<br/>
         * 지정하지 않으면 name과 동일하게 설정된다.<br/>
         */
        header?: string;
        /**
         * 계산 수식.<br/>
         * Expression 수식 문자열로, 다른 필드의 값을 참조하여 자동으로 계산된다.<br/>
         * 계산 필드가 다른 계산 필드를 참조하는 경우, 참조되는 필드를 먼저 정의해야 한다.<br/>
         * setValue 등으로 직접 값을 설정할 수 없다.<br/>
         */
        expression: string;
    }

    /**
     * 셀 위치 컨텍스트.
     *
     * `'rowGroup'` / `'columnGroup'` 축을 사용할 때는 `prow` / `pcol`을 함께 전달해야 한다.
     */
    declare interface CellContext {
        vt: ValueCellType;
        prow?: PivotRow;
        pcol?: PivotColumn;
    }

    /**
     * 셀 오버레이 옵션 인터페이스.
     */
    declare interface CellOverlayOptions extends ROptions {
        /**
         * 표시 가능 여부.
         *
         * @default true
         */
        visible?: boolean;
    }

    /**
     * overlay를 적용할 셀 타입.
     * - `'value'`    : 상세 셀 (vt='m')
     * - `'subtotal'` : 소계 셀 (vt='d')
     * - `'total'`    : 총계(grand total) 셀 (vt='g')
     * - `'all'`      : 모든 셀
     *
     * 배열로 조합 가능하다. 예: `['value', 'subtotal']` → 상세 셀과 소계 셀에만 적용.
     *
     * @see [docs/cell-overlay-scope.md](https://github.com/woori-tech/realpivot2/blob/main/docs/cell-overlay-scope.md) 자세한 설명과 예제.
     */
    declare type CellScope = 'value' | 'subtotal' | 'total' | 'all' | ('value' | 'subtotal' | 'total')[];

    declare class Color {
        static readonly TRANSPARENT: Color;
        static readonly WHITE: Color;
        static readonly BLACK: Color;
        private static readonly COLORS;
        static create(color?: string): Color | undefined;
        static isBright(color: string): boolean;
        static getContrast(color: string, darkColor?: string, brightColor?: string): string;
        static interpolate(color1: Color, color2: Color, rate: number): Color;
        static interpolate3(color1: Color, color2: Color, color3: Color, rate: number, midPoint?: number): Color;
        private r;
        private g;
        private b;
        private a;
        constructor(color?: string);
        get rgba(): string;
        isBright(): boolean;
        getContrast(darkColor: string, brightColor: string): string;
        brighten(rate: number, color?: Color): Color;
        setAlpha(a: number): this;
        toString(): string;
        private $_parseRgb;
        private $_parseNumber;
    }

    declare class ColorPalette {
        static DEFAULT: ColorPalette;
        private _colors;
        private _index;
        constructor(colors: string[]);
        reset(): void;
        next(): string;
    }

    /**
     * 열별 행 그룹 소계.<br/>
     * 각 열에 대해 상위 행 차원값별로 합계를 제공한다.<br/>
     * 예: rowDimensions=['region','city']일 때, 각 열의 'region별' 소계.
     */
    declare interface ColumnByRowGroupTotals {
        /** 행 차원명 (예: 'region') */
        rowDimension: string;
        /** 행 차원 인덱스 */
        rowDimensionIndex: number;
        /** 행 그룹별 고유값 목록 */
        rowGroupValues: any[];
        /** 열별 행그룹 소계 [열][행그룹][measure] (i64 measure 는 bigint) */
        totals: any[][][];
    }

    declare class ColumnFieldView extends PivotDimensionView {
        constructor(doc: Document);
    }

    declare class ColumnGrandCellView extends PivotHeaderGrandCelllView {
        model: PivotColumnHeaderGrandCell;
        constructor(doc: Document);
        getTooltip(table: PivotTable): string;
        render(width: number, table: PivotTable, model: PivotColumnHeaderGrandCell): void;
    }

    declare class ColumnHeaderCellView extends PivotHeaderCellView {
        model: PivotColumnHeaderCell;
        constructor(doc: Document);
        getTooltip(table: PivotTable): string | undefined;
        render(width: number, table: PivotTable, model: PivotColumnHeaderCell): void;
    }

    declare class ColumnHeaderGrandValueCellView extends PivotHeaderGrandValueCellView {
        constructor(doc: Document);
        getTooltip(table: PivotTable): string;
    }

    /**
     * 컬럼 헤더의 series 셀 view. 임시로 series.label ?? series.name 만 표시한다.
     */
    declare class ColumnHeaderSeriesCellView extends HeaderCellView {
        model: PivotColumnHeaderSeriesCell;
        constructor(doc: Document);
        getTooltip(_table: PivotTable): string | undefined;
        render(_width: number, _table: PivotTable, model: PivotColumnHeaderSeriesCell): void;
    }

    declare class ColumnHeaderTotalCellView extends PivotHeaderTotalCellView {
        model: PivotColumnHeaderTotalCell;
        constructor(doc: Document);
        render(width: number, table: PivotTable, model: PivotColumnHeaderTotalCell): void;
    }

    declare class ColumnHeaderValueCellView extends PivotHeaderTotalCellView {
        model: PivotColumnHeaderValueCell;
        constructor(doc: Document);
        render(width: number, table: PivotTable, model: PivotColumnHeaderValueCell): void;
    }

    declare type ColumnMeta = {
        name: string;
        descirption?: string;
        source: string | ((row: any) => any);
        sourceFieldName?: string;
        dateLevel?: DateField;
        /**
         * date-decomposed 컴럼의 source 결과(패딩 문자열 또는 숫자)를 **0-based** raw 숫자로 변환한다.<br/>
         * UI에서 locale별 label 테이블을 배열 인덱스로 관리할 때 사용한다.<br/>
         * - `month`: `"01" → 0`, `"12" → 11`
         * - `day`: `"01" → 0`, `"31" → 30`
         * - `half`: `"H1" → 0`, `"H2" → 1`
         * - `quarter`: `"Q1" → 0`, `"Q4" → 3`
         * - `week`/`weekOfYear`/`dayOfYear`/`dayOfWeek`/`weekOfMonth`: 원본 1-based → 0-based
         * - `year`: 절댓값 그대로 (`2024 → 2024`)
         * - `hour`/`minute`/`second`: 이미 0-based → 그대로
         * - `ytd`/`mtd`/`htd`/`qtd`/`wtd`: boolean 레벨 → 미부착
         */
        dateValue?: (value: any) => number | null;
        type: CubeColumnDataType;
        encoding?: 'dict';
        hidden?: boolean;
        nulls?: {
            policy: 'skip' | 'bucket';
        };
        /**
         * 컬럼의 역할 지정<br/>
         * - 'dimension': 차원(범주형) 컬럼
         * - 'measure': 측정값(수치형) 컬럼
         * - 'metric': 집계 후 계산되는 지표 (post-aggregate)
         * - 'auto': 타입과 사용 맥락에 따라 차원/측정값 모두 가능
         */
        role: 'dimension' | 'measure' | 'metric' | 'auto';
        parentDimension?: string;
        dateFields?: DateField[];
        /**
         * 가상 컬럼 여부.<br/>
         * true이면 컬럼 메타데이터만 존재하고 실제 데이터(ColumnVector)는 생성하지 않는다.
         * dateFields 분해가 지정된 date 차원에서, 원본 date 컬럼의 데이터가 불필요할 때 사용한다.<br/>
         */
        virtual?: boolean;
        /**
         * 측정값 컬럼의 집계 함수.<br/>
         */
        aggregate?: CubeAggregateType;
        /**
         * 차원의 기본 정렬 순서.<br/>
         * 집계 결과에서 이 차원의 값들을 정렬할 기준을 정의한다.<br/>
         */
        sortBy?: DimensionSortOption;
    };

    /**
     * 컬럼 기준 벡터 데이터 구조.<br/>
     */
    declare class ColumnVector<T extends Typed> extends RObject {
        readonly values: T;
        readonly validity?: Uint8Array;
        constructor(values: T, validity?: Uint8Array);
        /**
         * 벡터의 길이.<br/>
         */
        get length(): number;
        /**
         * 지정된 인덱스의 값이 null인지 여부를 반환한다.<br/>
         *
         * @param i 인덱스
         * @returns null 여부
         */
        isNull(i: number): boolean;
    }

    declare interface ColumnWidthEntry {
        value: number;
        source: ColumnWidthSource;
    }

    /**
     * 너비 항목의 출처.
     *  - `'user'`: 사용자가 명시적으로 지정한 값. 다른 값으로 덮어쓰지 않는다.
     *  - `'precise'`: 사용자 액션(메뉴/더블클릭 등)에 의한 정밀 자동 측정 결과.
     *    `'computed'`(자동 fast path) 값으로 덮어쓰지 않는다. `'user'`/`'precise'`로는 덮어쓸 수 있다.
     *  - `'computed'`: 자동 계산(fast path) 결과. `'user'`/`'precise'` 값이 없을 때만 적용된다.
     */
    declare type ColumnWidthSource = 'user' | 'precise' | 'computed';

    /**
     * 컬럼별 너비 저장소.<br/>
     * 컬럼의 인덱스가 아닌 "안정 키"(필드/측정/그룹 라벨 경로 기반)를 키로 사용해
     * grand 위치 변경, 그룹 펼침/접힘, 컬럼 순서 변경 등에 영향을 받지 않는다.
     */
    declare class ColumnWidthStore {
        private _byKey;
        get size(): number;
        get(key: string): ColumnWidthEntry | undefined;
        /**
         * 컬럼 너비 값을 보관한다.<br/>
         * 우선순위: `'user'` > `'precise'` > `'computed'`. 약한 source는 강한 source 항목을 덮어쓰지 못한다.
         */
        set(key: string, value: number, source: ColumnWidthSource): void;
        delete(key: string): boolean;
        /**
         * 모든 항목 또는 조건부 삭제.
         */
        clear(predicate?: (key: string, entry: ColumnWidthEntry) => boolean): void;
        forEach(cb: (key: string, entry: ColumnWidthEntry) => void): void;
        keys(): IterableIterator<string>;
        /**
         * 직렬화. 사용자가 조정한 너비를 세션/스토리지에 저장하는 용도.
         */
        toJSON(): Record<string, ColumnWidthEntry>;
        fromJSON(obj: Record<string, ColumnWidthEntry> | null | undefined): void;
    }

    declare type CompareAxis = 'row' | 'column' | 'level' | 'rowGroup' | 'columnGroup';

    /**
     * 값을 비교(정규화 또는 평가)할 범위.
     *
     * heatmap/dataBar의 정규화 기준과 highlight의 topN/aboveAvg 등 통계 조건 평가 범위를 결정한다.
     *
     * - `'all'`         : 적용 대상 셀 전체를 하나의 범위로 취급한다. (기본)
     * - `'row'`         : 같은 행(row index)의 셀끊이리 비교한다. 행별로 정규화/평가된다.
     * - `'column'`      : 같은 열(col index)의 셀끊이리 비교한다.
     * - `'level'`       : 셀 레벨(value/subtotal/total)별로 분리해 비교한다.
     *                     소계/총계는 값이 포함 관계로 상세 셀보다 항상 크며, 이를 섮어서 비교하면
     *                     의미가 악화되므로 레벨을 분리해서 비교하는 용도.
     * - `'rowGroup'`    : **같은 직속 부모 행을 공유하는 형제 행 그룹**끼리 비교한다.
     *                     예: `rows: ['대륙','국가']` + `'rowGroup'` → 같은 대륙 안의 국가들끼리 비교.
     * - `'columnGroup'` : `'rowGroup'`의 열 방향 버전.
     *
     * 배열로 조합 가능하며, 조합된 축들의 교차 그룹별로 분리된다.
     *
     * @example
     * ```ts
     * // 1) 각 행별로 topN/heatmap (가장 흔한 패턴)
     * compareScope: 'row'
     *
     * // 2) 각 열별로
     * compareScope: 'column'
     *
     * // 3) 그룹 내 비교: rows=['대륙','국가']일 때 "아시아에서 가장 많이 팔린 나라 top 5"
     * compareScope: 'rowGroup'
     *
     * // 4) 열 그룹 내 비교: columns=['분기','월']일 때 "Q1 안에서 가장 많이 팔린 월 top 3"
     * compareScope: 'columnGroup'
     *
     * // 5) 행 그룹 안에서 열별로: 아시아 그룹의 각 월별 top N
     * compareScope: ['rowGroup', 'column']
     *
     * // 6) 열 그룹 안에서 행별로: Q1 내에서 각 국가별 top N
     * compareScope: ['columnGroup', 'row']
     *
     * // 7) 행 그룹 ∩ 열 그룹: 아시아 × Q1 교차 그룹마다 top N
     * compareScope: ['rowGroup', 'columnGroup']
     *
     * // 8) 소계/총계 셀도 포함해 비교하고 싶을 때 (레벨 섞임 방지)
     * cellScope: ['value', 'subtotal'], compareScope: ['row', 'level']
     * ```
     *
     * @see [docs/cell-overlay-scope.md](https://github.com/woori-tech/realpivot2/blob/main/docs/cell-overlay-scope.md) 자세한 설명과 예제.
     */
    declare type CompareScope = 'all' | 'row' | 'column' | 'level' | 'rowGroup' | 'columnGroup' | ('row' | 'column' | 'level' | 'rowGroup' | 'columnGroup')[];

    declare interface ConfigObject {
        [key: string]: any;
    }

    export declare const createControl: typeof Globals.createControl;

    export declare const createCubeManager: typeof Globals.createCubeManager;

    export declare const createDataSet: typeof Globals.createDataSet;

    /**
     * paint-only 화이트리스트 스타일들(크기/위치 무영향)<br/>
     * border는 box-shadow로 대체한다. (border는 크기에 영향을 주지만 box-shadow는 영향을 주지 않는다.)
     * ```
     * // 아래쪽 2px 라인 (안쪽)
     * { boxShadow: 'inset 0 -2px 0 0 #198754' }
     * // 위 + 아래
     * { boxShadow: 'inset 0 2px 0 0 #198754, inset 0 -2px 0 0 #198754' }
     * // 바깥쪽 아래 라인
     * { boxShadow: '0 2px 0 0 #198754' }
     * ```
     */
    declare type CSSAppearance = Partial<Pick<CSSStyleDeclaration, 'color' | 'backgroundColor' | 'background' | 'backgroundImage' | 'outline' | 'outlineColor' | 'outlineStyle' | 'outlineWidth' | 'outlineOffset' | 'boxShadow' | 'borderRadius' | 'textDecoration' | 'textDecorationColor' | 'textDecorationLine' | 'textShadow' | 'fontWeight' | 'fontStyle' | 'fontSize' | 'fontFamily' | 'opacity' | 'filter'>>;

    declare type CsvLoadOptions = {
        /**
         * 구분자.<br/>
         * 기본값은 쉼표(,)이다.<br/>
         */
        delimiter?: string;
        /**
         * 헤더 포함 여부.<br/>
         * 기본값은 true이다.<br/>
         */
        hasHeader?: boolean;
        /**
         * 데이터 시작 행 인덱스.<br/>
         * 지정하지 않으면 hasHeader가 true일 때 1, 아니면 0이다.<br/>
         */
        rowStart?: number;
        /**
         * 따옴표 포함 여부.<br/>
         * 기본값은 false이다.<br/>
         */
        quoted?: boolean;
        /**
         * 따옴표 문자.<br/>
         * 기본값은 쌍따옴표(")이다.<br/>
         */
        quoteChar?: string;
        /**
         * 마지막 빈 행들 무시 여부.<br/>
         * 기본값은 true이다.<br/>
         */
        trimLast?: boolean;
        /**
         * 필드 매핑 객체.<br/>
         * 키는 결과 필드 이름, 값은 헤더의 필드 이름 또는 컬럼 인덱스이다.<br/>
         * 이 매핑이 지정되면 여기에 명시된 필드들만 결과에 포함된다.<br/>
         * 예) { "Id": "id", "Name": "name", "Age": 2 }<br/>
         */
        fieldMap?: {
            [field: string]: string | number;
        };
    };

    declare type CsvLoadResult = {
        fields?: string[];
        rows: any[][];
    };

    /**
     * 측정값 컬럼의 집계 함수.<br/>
     * - 'sum': 합계
     * - 'avg': 평균
     * - 'min': 최솟값
     * - 'max': 최댓값
     * - 'count': 건수 (null/NaN 제외)
     * - 'distinct': 고유값 수
     * - 'product': 곱 (그룹 내 모든 값의 곱)
     * - 'stdev': 표본 표준편차 (n-1 기준)
     * - 'stdevp': 표준편차 (모집단, n 기준)
     * - 'var': 표본 분산 (n-1 기준)
     * - 'varp': 분산 (모집단, n 기준)
     * - 'first': 그룹 내 첫 번째 값 (원본 데이터 순서 기준, 결정론적)
     * - 'last': 그룹 내 마지막 값 (원본 데이터 순서 기준, 결정론적)
     * - 'p25': 25백분위수(값) (선형 보간)
     * - 'p50': 50백분위수(값) (중앙값, median, 선형 보간)
     * - 'p75': 75백분위수(값) (선형 보간)
     */
    declare type CubeAggregateType = 'sum' | 'avg' | 'min' | 'max' | 'count' | 'distinct' | 'first' | 'last' | 'p25' | 'p50' | 'p75' | 'product' | 'stdev' | 'stdevp' | 'var' | 'varp';

    declare type CubeColumnDataType = 'i32' | 'f64' | 'i64' | 'str' | 'date';

    /**
     * DataCube의 데이터 소스를 위한 추상 기본 클래스.<br/>
     *
     * ColumnStore와 DataViewSource 등 다양한 큐브 데이터 소스의 공통 인터페이스를 정의한다.<br/>
     * 큐브의 데이터는 이 추상 클래스를 통해 접근되므로, 실제 데이터 저장 방식(columnar/row-based)에
     * 관계없이 통일된 방식으로 처리할 수 있다.<br/>
     *
     * ## 상속 관계
     * ```
     * DataSource (공통 기반 클래스)
     *     ↑
     * CubeDataSource (추상 클래스)
     *     ↑
     *     ├── ColumnStore (columnar 저장소)
     *     └── DataViewSource (DataFrame 래퍼)
     * ```
     *
     * ## 주요 역할
     * - **데이터 메타데이터 관리**: 컬럼 정보(이름, 타입, 역할 등) 제공
     * - **원본 데이터 참조**: 집계/피벗 대상이 되는 실제 데이터 접근
     * - **인터페이스 통일**: 다양한 저장 방식의 데이터를 통일된 인터페이스로 처리
     *
     * ## 구현 클래스
     *
     * ### ColumnStore
     * - DataFrame을 columnar 형태로 변환/저장
     * - TypedArray 기반 고성능 저장소
     * - Dictionary Encoding으로 문자열 압축
     * - 용도: 원시 데이터 변환 시, 대용량 데이터 처리, 높은 집계 성능 필요
     *
     * ### DataViewSource
     * - 기존 DataFrame을 그대로 래핑
     * - 데이터 복사 없음 (Zero-Copy)
     * - row-based 접근 방식 유지
     * - 용도: 빠른 큐브 생성, 메모리 효율성, 실시간 반영 필요
     *
     * @see {@link ColumnStore} 컬럼 기반 저장소 구현
     * @see {@link DataViewSource} DataFrame 래퍼 구현
     * @see {@link DataCube} 이 소스를 사용하는 큐브
     */
    declare abstract class CubeDataSource extends DataSource {
        /**
         * 컬럼 메타데이터 배열.<br/>
         * 각 컬럼의 이름, 타입, 인코딩 방식, 역할(dimension/measure/any) 등을 정의한다.<br/>
         * 집계/피벗 시 차원과 측정값을 식별하는 데 사용된다.<br/>
         */
        protected _columns: ColumnMeta[];
        /**
         * 원본 데이터 프레임.<br/>
         * DataTable, DataTableView 등 큐브의 실제 데이터를 포함하는 DataFrame 인스턴스.<br/>
         * 구현 클래스(ColumnStore, DataViewSource)에 따라 다르게 저장/참조된다.<br/>
         * - ColumnStore: 변환된 columnar 데이터로 저장
         * - DataViewSource: 원본 DataFrame을 그대로 참조
         */
        protected _dataView: DataFrame;
        /**
         * CubeDataSource를 초기화한다.<br/>
         *
         * @param columns 컬럼 메타데이터 배열
         * @param dataView 원본 DataFrame 인스턴스
         */
        constructor(columns: ColumnMeta[], dataView: DataFrame);
        /**
         * 컬럼 메타데이터 배열을 반환한다.<br/>
         *
         * @returns 컬럼 메타데이터 배열
         */
        get columns(): ColumnMeta[];
        /**
         * 원본 DataFrame을 반환한다.<br/>
         *
         * @returns DataFrame 인스턴스
         */
        get dataView(): DataFrame;
        /**
         * 지정된 행과 컬럼의 값을 반환한다.<br/>
         *
         * ColumnStore와 DataViewSource는 각각 다른 방식으로 구현하여
         * 큐브 집계 연산에서 통일된 인터페이스로 접근할 수 있게 한다.<br/>
         *
         * @param row 행 인덱스 (0부터 시작)
         * @param col 컬럼 인덱스 (0부터 시작)
         * @returns 해당 위치의 값. 범위를 벗어나면 null 반환
         *
         * @example
         * ```typescript
         * // ColumnStore: columnar 저장소에서 값 조회
         * const store = new ColumnStore(columns, dataView);
         * const value = store.valueAt(0, 1);  // 첫 번째 행, 두 번째 컬럼
         *
         * // DataViewSource: DataFrame에서 값 조회
         * const view = new DataViewSource(columns, dataTable);
         * const value = view.valueAt(5, 2);  // 여섯 번째 행, 세 번째 컬럼
         *
         * // AggTable에서 데이터 집계 시 사용
         * for (let row = 0; row < dataView.rowCount; row++) {
         *     const dimensionValue = dataView.valueAt(row, dimensionColIndex);
         *     const measureValue = dataView.valueAt(row, measureColIndex);
         *     // ...집계 로직
         * }
         * ```
         *
         * @see {@link rowCount} 전체 행 개수
         * @see {@link AggTable} 이 메서드를 사용하는 집계 테이블
         */
        abstract valueAt(row: number, col: number): any;
        /**
         * 전체 행 개수를 반환한다.<br/>
         *
         * 큐브 집계 연산에서 모든 데이터를 순회하는 데 필요한 행의 총 개수를 제공한다.<br/>
         *
         * @returns 행의 개수 (0 이상)
         *
         * @example
         * ```typescript
         * // ColumnStore: columnar 저장소의 행 개수
         * const store = new ColumnStore(columns, dataView);
         * console.log(store.rowCount);  // 예: 1000
         *
         * // DataViewSource: 원본 DataFrame의 행 개수
         * const view = new DataViewSource(columns, dataTable);
         * console.log(view.rowCount);  // 예: 5000
         *
         * // AggTable에서 모든 데이터 순회
         * for (let row = 0; row < dataView.rowCount; row++) {
         *     // 각 행 처리
         * }
         * ```
         *
         * @see {@link valueAt} 지정된 위치의 값 조회
         * @see {@link AggTable} 이 메서드를 사용하는 집계 테이블
         */
        abstract get rowCount(): number;
        /**
         * 지정된 컬럼의 모든 값을 배열로 반환한다.<br/>
         *
         * 집계 연산 시 전체 컬럼을 효율적으로 접근하기 위한 메서드이다.<br/>
         * 각 구현체(ColumnStore, DataViewSource)가 자신의 저장 방식에 맞게 최적화하여 제공한다.<br/>
         *
         * ## 최적화 전략
         * - **ColumnStore**: columnar 벡터에서 직접 데이터 추출 (매우 빠름)
         * - **DataViewSource**: row-by-row로 배열 생성 (fallback)
         *
         * ## 집계 성능
         * - row-by-row 호출 (valueAt loop): 데이터 수만큼 메서드 호출 오버헤드
         * - getColumn: 한 번의 호출로 전체 컬럼 데이터 확보
         * - 결과: 훨씬 빠른 캐시 친화적 순회 가능
         *
         * @param colIndex 컬럼 인덱스 (0부터 시작)
         * @returns 해당 컬럼의 모든 값 배열. 범위를 벗어나면 null 반환
         *
         * @example
         * ```typescript
         * // AggTable에서 효율적인 고유값 추출
         * const regionData = source.getColumn(0);  // 한 번에 모든 값 가져오기
         * const uniqueRegions = new Set(regionData);  // 빠른 순회
         *
         * // vs. row-by-row (느림)
         * // for (let row = 0; row < source.rowCount; row++) {
         * //     const val = source.valueAt(row, 0);  // 메서드 호출 오버헤드
         * //     uniqueValues.add(val);
         * // }
         * ```
         *
         * @see {@link valueAt} 특정 셀 값 조회
         * @see {@link rowCount} 행 개수
         * @see {@link AggTable} 이 메서드를 사용하는 집계 테이블
         */
        abstract getColumn(colIndex: number): any[] | null;
        /**
         * 지정된 행의 데이터를 객체로 반환한다 (source 필드 계산용).<br/>
         *
         * MeasureMeta의 source가 함수일 때 원본 행 데이터가 필요하므로,
         * 각 행을 객체 형태로 제공한다.<br/>
         *
         * @param rowIndex 행 인덱스 (0부터 시작)
         * @returns 컬럼명을 키로 하는 행 객체. 범위를 벗어나면 null 반환
         *
         * @example
         * ```typescript
         * // DataCube 설정에서 source가 함수인 경우
         * const measure = {
         *     name: 'discount_rate',
         *     source: (row) => row.quantity * row.unit_price * 0.1  // 할인율 계산
         * };
         *
         * // AggTable이 rowAt을 사용하여 계산값을 추출
         * const row = source.rowAt(0);  // { quantity: 100, unit_price: 1000, ... }
         * const discountRate = measure.source(row);  // 10000
         * ```
         *
         * @see {@link valueAt} 특정 셀 값 조회
         * @see {@link getColumn} 전체 컬럼 조회
         * @see {@link AggTable} 이 메서드를 사용하는 집계 테이블
         */
        abstract rowAt(rowIndex: number): any | null;
    }

    /**
     * 큐브 필터 조건 타입.<br/>
     */
    declare interface CubeFilter {
        /**
         * 필터를 적용할 차원(dimension) 이름 또는 수식 필터 이름.<br/>
         * expression이 정의된 경우 차원 이름이 아닌 필터 이름으로 사용됨.<br/>
         */
        dimension: string;
        /**
         * 선택된 값들 (list, search 타입).<br/>
         */
        values?: any[];
        /**
         * 범위 값 [시작, 끝] (range, date 타입).<br/>
         */
        range?: [any, any];
        /**
         * 날짜 프리셋 (date 타입).<br/>
         */
        datePreset?: DateRangePreset;
        /**
         * 검색 텍스트 (search 타입).<br/>
         */
        searchText?: string;
        /**
         * 부정 필터 여부 (NOT 조건).<br/>
         * @default false
         */
        exclude?: boolean;
        /**
         * 수식 필터 (이 필드가 정의되면 expression 기반 필터로 처리).<br/>
         * expression이 정의된 경우 다른 필드(values, range 등)는 무시됨.<br/>
         */
        expression?: string;
    }

    /**
     * 큐브 스키마 정의 타입.<br/>
     */
    declare type CubeSchema = {
        dimensions: DimensionMeta[];
        measures: MeasureMeta[];
        metrics?: MetricMeta[];
    };

    declare interface DataBarAxisOptions extends PivotItemOptions {
        /**
         * 축 위치. 기본값은 'center'로, 양방향 표시일 때 기준값이 가운데에 오도록 표시한다.
         * 'auto'로 지정하면 양쪽 절대값을 기준으로 위치가 결정된다.
         */
        position?: 'center' | 'auto';
        /**
         * 축 색상.
         *
         * @default 'black'
         */
        color?: string;
        /**
         * true로 지정하면 축이 점선으로 표시된다.<br/>
         * 기본값은 false로, 실선으로 표시한다.
         */
        dashed?: boolean;
    }

    declare class DataCube extends DataSource {
        /**
         * 집계 캐시 키를 생성한다.<br/>
         * 차원과 측정값 조합을 문자열로 표현하여 캐시 키로 사용한다.<br/>
         * userKey가 주어지면 동일한 차원/측정값 조합이라도 논리적으로 분리된 캐시 키를 생성한다.<br/>
         *
         * @param dimensionNames 차원 이름 배열
         * @param measureColumns 측정값 컬럼 메타데이터 배열
         * @param userKey (선택) 캐시를 논리적으로 분리하기 위한 사용자 지정 키
         * @returns 캐시 키 (형식: agg[@userKey]:dim1|dim2|...:measure1:aggregate1|measure2:aggregate2|...)
         */
        static generateAggregateKey(dimensionNames: string[], measureColumns: ColumnMeta[], userKey?: string): string;
        private _name?;
        /**
         * 큐브 스키마 정의.<br/>
         * 차원(dimensions)과 측정값(measures)의 메타데이터를 포함한다.<br/>
         */
        private _schema?;
        /**
         * 컬럼 메타데이터 배열.<br/>
         * 각 컬럼의 이름, 타입, 인코딩 방식, 역할(dimension/measure) 등을 정의한다.<br/>
         */
        private _columns;
        private _columnMap;
        /** 큐브 컬럼 → 소스 컬럼 인덱스 매핑 캐시. _columns 변경 시 무효화된다. */
        private _sourceColMap?;
        /**
         * 큐브 데이터 소스.<br/>
         * ColumnStore 또는 DataViewSource 중 하나를 사용한다.<br/>
         * - ColumnStore: 원시 데이터를 컬럼 기반으로 변환하여 저장 (CSV/JSON 로드 시)
         * - DataViewSource: 기존 DataFrame을 래핑 (DataTable/View 재사용 시)<br/>
         */
        private _source;
        /**
         * YTD/MTD/QTD/WTD 계산의 기준 날짜.<br/>
         * - ytd: 연초부터 이 날짜까지의 누적값
         * - mtd: 월초부터 이 날짜까지의 누적값
         * - qtd: 분기 시작부터 이 날짜까지의 누적값
         * - wtd: 주 시작부터 이 날짜까지의 누적값
         * 기본값: 현재 날짜<br/>
         */
        private _today;
        /**
         * 집계 테이블 캐시.<br/>
         * 차원 조합별로 생성된 AggTable을 Map으로 관리하여 재계산을 방지한다.<br/>
         * key: 차원 조합을 나타내는 문자열, value: 집계 결과 테이블<br/>
         */
        private _aggTables;
        /**
         * 모든 필터의 병합 결과 (읽기 전용, 내부 캐시).<br/>
         * `_slicerFilters`와 `_apiFilters`를 병합한 결과이다.<br/>
         * `$_rebuildFilters()`에 의해 갱신되며, 집계/슬라이스 등에서 참조된다.<br/>
         */
        private _filters?;
        /**
         * applySlicers()/filterAll()에 의해 관리되는 필터.<br/>
         * `filterAll()`이 호출되면 이 맵이 교체된다.<br/>
         */
        private _slicerFilters?;
        /**
         * addFilter()/addExpressionFilter()에 의해 관리되는 API 필터.<br/>
         * Slicer 필터와 독립적으로 유지된다.<br/>
         */
        private _apiFilters?;
        /**
         * 필터 적용 후 행 수 캐시.<br/>
         * `$_rebuildFilters()`에서 갱신된다.<br/>
         */
        private _filteredRowCount?;
        /**
         * 필터 적용된 소스 캐시.<br/>
         * `$_rebuildFilters()`에서 갱신된다.<br/>
         */
        private _filteredSource?;
        /**
         * AggTable 리스너 등록.<br/>
         * 이 DataCube에서 생성된 AggTable들을 추적하여 필터 변경 시 알림을 보낸다.<br/>
         */
        private _aggTableListeners;
        /**
         * 외부 변경 콜백 리스너 목록.<br/>
         * onChange()로 등록되며, 필터 변경 시 호출된다.<br/>
         */
        private _changeListeners;
        /**
         * 등록된 Slicer 목록.<br/>
         */
        private _slicers;
        /**
         * DataCube를 생성한다.<br/>
         * source와 schema는 필수 항목이며, 누락 시 예외를 발생시킨다.<br/>
         *
         * @param options 큐브 생성 옵션 (필수)
         *   - source: 데이터 소스 (DataFrame) - 필수
         *   - schema: 큐브 스키마 (차원 + 측정값) - 필수
         *   - columnar: 컬럼 기반 저장소 사용 여부 (기본값: true) - 선택사항
         *     true: ColumnStore 사용 (columnar format으로 변환)
         *     false: DataViewSource 사용 (기존 DataFrame 래핑)
         *   - aggregate: 초기 집계 정보 (선택사항)
         *     { dimensions: string[], measures?: string[] }
         *
         * @throws {Error} source가 없을 때
         * @throws {Error} schema가 없을 때
         * @throws {Error} schema.dimensions 또는 schema.measures가 비어있을 때
         *
         * @example
         * ```typescript
         * // 기본 생성
         * const cube = new DataCube({
         *   source: table,
         *   schema: schema
         * });
         * cube.aggregate(['region'], ['sales']);  // 필요할 때 호출
         *
         * // ColumnStore 사용 (columnar format으로 최적화)
         * const cube = new DataCube({
         *   source: table,
         *   schema: schema,
         *   columnar: true,  // ColumnStore 사용 (기본값)
         *   aggregate: { dimensions: ['region', 'product'], measures: ['sales'] }
         * });
         *
         * // DataViewSource 사용 (기존 DataFrame 래핑)
         * const cube = new DataCube({
         *   source: table,
         *   schema: schema,
         *   columnar: false,  // DataViewSource 사용
         *   aggregate: { dimensions: ['region'] }
         * });
         * ```
         */
        constructor(options: DataCubeOptions, ds?: DataSet);
        get name(): string;
        set name(value: string);
        /**
         * 큐브 스키마를 반환한다.<br/>
         *
         * @returns 큐브 스키마
         */
        get schema(): CubeSchema;
        /**
         * 컬럼 메타데이터 배열을 반환한다.<br/>
         *
         * @returns 컬럼 메타데이터 배열
         */
        get columns(): ColumnMeta[];
        /**
         * 큐브 데이터 소스를 반환한다.<br/>
         * ColumnStore 또는 DataViewSource 인스턴스일 수 있다.<br/>
         *
         * @returns CubeDataSource 인스턴스
         */
        get source(): CubeDataSource | undefined;
        /**
         * 필터 적용된 행 개수를 반환한다.<br/>
         * `addFilter()`, `filterAll()`, `applySlicers()` 등으로 설정된 필터를 반영한다.<br/>
         * 필터가 없으면 전체 행 수(`totalRowCount`)와 동일한 값을 반환한다.<br/>
         *
         * @returns 필터 적용 후 행 개수. source가 없으면 0
         *
         * @example
         * ```typescript
         * console.log(cube.totalRowCount);  // 10000 (전체)
         * cube.addFilter({ dimension: 'region', values: ['Seoul'] });
         * console.log(cube.rowCount);       // 3200 (필터 적용 후)
         * console.log(cube.totalRowCount);  // 10000 (원본 불변)
         * ```
         *
         * @see {@link totalRowCount} 원본 전체 행 개수
         * @see {@link addFilter} 필터 추가
         * @see {@link filterAll} 필터 일괄 적용
         */
        get rowCount(): number;
        /**
         * 필터와 무관한 원본 전체 행 개수를 반환한다.<br/>
         *
         * @returns 원본 행 개수. source가 없으면 0
         *
         * @see {@link rowCount} 필터 적용 후 행 개수
         */
        get totalRowCount(): number;
        get table(): DataTable | undefined;
        /** 큐브 컬럼 → 소스 컬럼 인덱스 매핑을 반환한다. 캐시가 없으면 빌드한다. */
        private $_getSourceColMap;
        /**
         * 지정한 행과 컬럼의 단일 값을 반환한다.<br/>
         * 원본 데이터소스의 전체 필드가 아닌, 큐브 스키마에 정의된 컬럼 기준으로 조회한다.<br/>
         * metric 컬럼은 집계 후 계산되는 파생값이므로 데이터소스에 존재하지 않아 undefined를 반환한다.<br/>
         *
         * @param row - 행 인덱스
         * @param col - 큐브 컬럼 인덱스 또는 컬럼 이름
         * @param filtered - true이면 필터 적용된 데이터에서 조회, false이면 원본 전체 데이터에서 조회 (기본값: true)
         * @returns 셀 값. 범위를 벗어나면 undefined
         */
        getValue(row: number, col: number | string, filtered?: boolean): any;
        /**
         * 지정한 행의 값을 큐브 컬럼(dimensions + measures) 순서로 반환한다.<br/>
         * 원본 데이터소스의 전체 필드가 아닌, 큐브 스키마에 정의된 컬럼들만 포함한다.<br/>
         * 수식 컬럼(expression source)의 계산된 값도 포함된다.<br/>
         * metric 컬럼은 집계 후 계산되는 파생값이므로 데이터소스에 존재하지 않아 undefined를 반환한다.<br/>
         *
         * @param row - 행 인덱스
         * @param filtered - true이면 필터 적용된 데이터에서 조회, false이면 원본 전체 데이터에서 조회 (기본값: true)
         * @returns 큐브 컬럼 순서의 값 배열. 범위를 벗어나면 undefined
         */
        getRow(row: number, filtered?: boolean): any[] | undefined;
        /**
         * 지정한 범위의 행들을 큐브 컬럼(dimensions + measures) 순서로 반환한다.<br/>
         * 원본 데이터소스의 전체 필드가 아닌, 큐브 스키마에 정의된 컬럼들만 포함한다.<br/>
         * 수식 컬럼(expression source)의 계산된 값도 포함된다.<br/>
         * metric 컬럼은 집계 후 계산되는 파생값이므로 데이터소스에 존재하지 않아 undefined를 반환한다.<br/>
         *
         * @param start - 시작 행 인덱스 (기본값: 0)
         * @param count - 가져올 행 수 (기본값: 전체)
         * @param filtered - true이면 필터 적용된 데이터에서 조회, false이면 원본 전체 데이터에서 조회 (기본값: true)
         * @returns 행 배열. 범위를 벗어나면 빈 배열
         */
        getRows(start?: number, count?: number, filtered?: boolean): any[][];
        /**
         * 행 인덱스에 대응하는 원본 소스의 행 인덱스를 반환한다.<br/>
         * filtered=true이면 필터 적용된 뷰 기준, false이면 원본 소스 기준으로 매핑한다.<br/>
         * 필터가 없으면 동일한 인덱스를 반환한다.<br/>
         *
         * @param row - 행 인덱스
         * @param filtered - true이면 필터 적용된 데이터 기준, false이면 원본 전체 데이터 기준 (기본값: true)
         * @returns 원본 소스의 행 인덱스. 범위를 벗어나면 -1
         */
        getSourceRowIndex(row: number, filtered?: boolean): number;
        /**
         * 행 인덱스 범위에 대응하는 원본 소스의 행 인덱스 배열을 반환한다.<br/>
         * filtered=true이면 필터 적용된 뷰 기준, false이면 원본 소스 기준으로 매핑한다.<br/>
         * 필터가 없으면 start부터 순차적인 인덱스 배열을 반환한다.<br/>
         *
         * @param start - 시작 행 인덱스 (기본값: 0)
         * @param count - 가져올 행 수 (기본값: 전체)
         * @param filtered - true이면 필터 적용된 데이터 기준, false이면 원본 전체 데이터 기준 (기본값: true)
         * @returns 원본 소스의 행 인덱스 배열. 범위를 벗어나면 빈 배열
         */
        getSourceRowIndices(start?: number, count?: number, filtered?: boolean): number[];
        getColumn(column: string): ColumnMeta | undefined;
        getColumnType(column: string): ColumnMeta['type'] | undefined;
        /**
         * 큐브의 모든 차원(dimension) 정보를 반환한다.<br/>
         * 각 차원의 이름, 타입, 상위 차원(parentDimension) 정보를 포함한다.<br/>
         * UI에서 계층 구조를 표시할 때 사용한다.<br/>
         *
         * @returns 차원 정보 배열
         *
         * @example
         * ```typescript
         * const dimensions = cube.getDimensions();
         * // [
         * //   { name: 'order_date.year', type: 'i32', parentDimension: undefined },
         * //   { name: 'order_date.month', type: 'str', parentDimension: 'order_date.year' },
         * //   { name: 'order_date.day', type: 'str', parentDimension: 'order_date.month' },
         * //   { name: 'region', type: 'str', parentDimension: undefined }
         * // ]
         * ```
         */
        getDimensions(): Array<{
            name: string;
            type: string;
            parentDimension?: string;
        }>;
        /**
         * 지정된 차원의 상위 차원을 반환한다.<br/>
         * 계층 관계를 탐색할 때 사용한다.<br/>
         *
         * @param dimensionName 차원 이름
         * @returns 상위 차원 이름 또는 undefined
         *
         * @example
         * ```typescript
         * cube.getParentDimension('order_date.month'); // 'order_date.year'
         * cube.getParentDimension('order_date.year');  // undefined
         * ```
         */
        getParentDimension(dimensionName: string): string | undefined;
        /**
         * 지정된 차원의 자식 차원들을 반환한다.<br/>
         * 계층 관계를 탐색할 때 사용한다.<br/>
         *
         * @param dimensionName 차원 이름
         * @returns 자식 차원 이름 배열
         *
         * @example
         * ```typescript
         * cube.getChildDimensions('order_date.year'); // ['order_date.month']
         * cube.getChildDimensions('order_date.month'); // ['order_date.day']
         * ```
         */
        getChildDimensions(dimensionName: string): string[];
        canDimension(name: string): boolean;
        canMeasure(name: string): boolean;
        isMetric(name: string): boolean;
        /**
         * 지정된 이름이 DataCube에 존재하는지 검사한다.<br/>
         * @param name
         * @returns
         */
        hasColumn(name: string): boolean;
        /**
         * 동적 계산 측정값(calculated measure)을 DataCube에 등록한다.<br/>
         * 등록된 측정값은 aggregate()에서 이름으로 참조할 수 있다.<br/>
         *
         * 이 메서드는 row-level 계산을 정의한다.<br/>
         * 각 행에서 계산된 값을 지정된 집계 함수(aggregate)로 집계한다.<br/>
         *
         * ## Row-level 계산
         * - 각 데이터 행에서 먼저 값을 계산
         * - 계산된 값들을 aggregate로 집계 (sum, avg, min, max, count)
         *
         * @param name 측정값 이름 (고유해야 함)
         * @param options 옵션 객체
         *                - source: 계산 수식(expression 문자열) 또는 계산 함수 (필수)
         *                  - 문자열: 'profit / sales * 100' 같은 expression
         *                  - 함수: (row: any) => row.profit / row.sales * 100
         *                - aggregate: 집계 함수 (기본값: 'sum')
         *                - type: 결과 타입 'f64' | 'i32' (기본값: 'f64')
         * @returns this (메서드 체이닝 가능)
         * @throws Error 이미 같은 이름의 측정값이 존재하는 경우
         *
         * @example
         * ```typescript
         * // Expression string 사용
         * cube.addMeasure('margin', { source: 'profit / sales * 100', aggregate: 'avg' });
         * cube.addMeasure('total_revenue', { source: 'price * quantity', aggregate: 'sum' });
         *
         * // 함수 사용
         * cube.addMeasure('margin_pct', {
         *   source: (row) => row.sales > 0 ? (row.profit / row.sales * 100) : 0,
         *   aggregate: 'avg'
         * });
         *
         * // aggregate에서 이름으로 참조
         * const agg = cube.aggregate(['region'], ['sales', 'margin', 'total_revenue']);
         * ```
         */
        addMeasure(name: string, options: {
            source: string | ((row: any) => any);
            aggregate?: MeasureMeta['aggregate'];
            type?: MeasureMeta['type'];
        }): this;
        /**
         * 집계 후 계산할 지표(metric)을 DataCube에 등록한다.<br/>
         * 이미 집계된 다른 measure들의 값으로부터 계산되는 post-aggregate 지표이다.<br/>
         *
         * Metric은 반드시 적어도 하나의 차원을 가지고 있어야 하며,
         * 차원이 없는 전체 집계에서는 계산되지 않는다.<br/>
         *
         * ## Row-level Measure vs Metric
         * - **Measure**: 각 row에서 계산 후 집계
         *   - 예: `profit / qty` (각 row에서 계산)
         * - **Metric**: 집계 후 계산
         *   - 예: `profit / sales * 100` (sum(profit) / sum(sales) * 100)
         *
         * @param name 지표 이름 (고유해야 함)
         * @param expression 계산 수식 (다른 measure 이름 참조)
         *                   - 예: 'profit / sales * 100'
         *                   - 참조 가능: 등록된 모든 measure와 다른 metric
         * @returns this (메서드 체이닝 가능)
         * @throws Error 이미 같은 이름의 지표가 존재하는 경우
         *
         * @example
         * ```typescript
         * // Measure 등록
         * cube.addMeasure('profit', { source: 'profit', aggregate: 'sum' });
         * cube.addMeasure('sales', { source: 'sales', aggregate: 'sum' });
         * cube.addMeasure('qty', { source: 'qty', aggregate: 'sum' });
         *
         * // Metric 등록
         * cube.addMetric('profit_margin', 'profit / sales * 100');
         * cube.addMetric('profit_per_qty', 'profit / qty');
         *
         * // aggregate에서 함께 사용
         * const agg = cube.aggregate(['region'], [
         *   'profit',           // Measure
         *   'sales',            // Measure
         *   'profit_margin',    // Metric (자동으로 차원 필요)
         *   'profit_per_qty'    // Metric
         * ]);
         * ```
         */
        addMetric(name: string, expression: string): this;
        /**
         * 등록된 measure를 제거한다.<br/>
         * measure 제거 후 관련 캐시는 자동으로 무효화된다.<br/>
         *
         * @param name 제거할 measure 이름
         * @returns this (메서드 체이닝 가능)
         * @throws Error 존재하지 않는 measure인 경우
         *
         * @example
         * ```typescript
         * cube.removeMeasure('old_measure');
         * cube.removeMeasure('cost')
         *     .removeMeasure('expense');
         * ```
         */
        removeMeasure(name: string): this;
        /**
         * 등록된 metric을 제거한다.<br/>
         * metric 제거 후 관련 캐시는 자동으로 무효화된다.<br/>
         *
         * @param name 제거할 metric 이름
         * @returns this (메서드 체이닝 가능)
         * @throws Error 존재하지 않는 metric인 경우
         *
         * @example
         * ```typescript
         * cube.removeMetric('profit_margin');
         * cube.removeMetric('roi')
         *     .removeMetric('margin_pct');
         * ```
         */
        removeMetric(name: string): this;
        /**
         * 등록된 measure를 수정한다.<br/>
         * measure의 source, aggregate, type 등을 변경할 수 있다.<br/>
         * 필드명 변경은 불가능하며 (removeMeasure + addMeasure 사용),
         * source나 aggregate 변경 시에만 캐시가 초기화된다.<br/>
         *
         * @param name 수정할 measure 이름
         * @param options 수정할 옵션
         *                - source?: 새로운 source (컬럼명 또는 계산식)
         *                - aggregate?: 새로운 집계 함수
         *                - type?: 새로운 타입 ('f64' | 'i32')
         * @returns this (메서드 체이닝 가능)
         * @throws Error 존재하지 않는 measure인 경우
         *
         * @example
         * ```typescript
         * // 집계 함수 변경
         * cube.updateMeasure('sales', { aggregate: 'avg' });
         *
         * // Source 변경
         * cube.updateMeasure('cost', { source: 'actual_cost * rate' });
         *
         * // 타입 변경
         * cube.updateMeasure('count', { type: 'i32' });
         *
         * // 여러 속성 동시 변경
         * cube.updateMeasure('total', {
         *     source: 'amount * quantity',
         *     aggregate: 'sum',
         *     type: 'f64'
         * });
         * ```
         */
        updateMeasure(name: string, options?: {
            source?: string | ((row: any) => any);
            aggregate?: MeasureMeta['aggregate'];
            type?: 'f64' | 'i32';
        }): this;
        /**
         * 등록된 metric을 수정한다.<br/>
         * metric의 계산식을 변경할 수 있다.<br/>
         * 계산식 변경 시 캐시가 초기화된다.<br/>
         *
         * @param name 수정할 metric 이름
         * @param expression 새로운 계산식 (measure/metric 이름 참조)
         * @returns this (메서드 체이닝 가능)
         * @throws Error 존재하지 않는 metric인 경우
         *
         * @example
         * ```typescript
         * // 계산식 수정 (버그 수정)
         * cube.updateMetric('margin', 'profit / sales * 100');
         *
         * // 다른 measure 참조로 변경
         * cube.updateMetric('ratio', 'revenue / cost');
         *
         * // 메서드 체이닝
         * cube.updateMetric('m1', 'a + b')
         *     .updateMetric('m2', 'a * b');
         * ```
         */
        updateMetric(name: string, expression: string): this;
        /**
         * 현재 DataCube의 전체 스키마 정보를 반환한다.<br/>
         * addMeasure/addMetric으로 동적으로 추가된 필드도 포함한다.<br/>
         *
         * @returns 스키마 정보 객체
         * - dimensions: 모든 차원 필드 목록
         * - measures: 모든 measure 필드 목록 (동적 추가된 measure 포함)
         * - metrics: 모든 metric 필드 목록
         *
         * @example
         * ```typescript
         * cube.addMeasure('custom_cost', { source: 'cost * qty' });
         * cube.addMetric('custom_roi', 'profit / investment');
         *
         * const schema = cube.getSchema();
         * // {
         * //   dimensions: [{ name: 'region', type: 'str' }, ...],
         * //   measures: [
         * //     { name: 'sales', type: 'f64', aggregate: 'sum' },
         * //     { name: 'custom_cost', type: 'f64', aggregate: 'sum' }, // 동적 추가됨
         * //     ...
         * //   ],
         * //   metrics: [
         * //     { name: 'margin', source: 'profit / sales * 100', type: 'f64' },
         * //     { name: 'custom_roi', source: '...' }, // 동적 추가됨
         * //     ...
         * //   ]
         * // }
         * ```
         */
        getSchema(): {
            dimensions: DimensionMeta[];
            measures: MeasureMeta[];
            metrics: ColumnMeta[];
        };
        /**
         * 현재 등록된 모든 measure와 metric 목록을 반환한다.<br/>
         * UI에서 동적으로 필드 목록을 관리할 때 유용하다.<br/>
         *
         * @returns measure와 metric 필드 목록
         * - name: 필드 이름
         * - type: 필드 타입 ('f64', 'i32')
         * - role: 'measure' 또는 'metric'
         * - aggregate?: measure의 경우 집계 함수 (metric은 undefined)
         * - source?: expression 또는 source 컬럼명
         *
         * @example
         * ```typescript
         * const fields = cube.getMeasuresAndMetrics();
         * // [
         * //   { name: 'sales', type: 'f64', role: 'measure', aggregate: 'sum', source: 'sales' },
         * //   { name: 'quantity', type: 'i32', role: 'measure', aggregate: 'sum', source: 'qty' },
         * //   { name: 'margin', type: 'f64', role: 'metric', source: 'profit / sales * 100' },
         * // ]
         *
         * // UI에서 드롭다운 구성
         * const options = fields.map(f => ({ label: f.name, value: f.name }));
         * ```
         */
        getMeasuresAndMetrics(): Array<{
            name: string;
            type: 'f64' | 'i32' | 'i64' | 'str' | 'date';
            role: 'measure' | 'metric';
            aggregate?: string;
            source?: string | ((row: any) => any);
        }>;
        /**
         * 현재 등록된 모든 measure 목록을 반환한다.<br/>
         *
         * @returns measure 필드 목록
         *
         * @example
         * ```typescript
         * const measures = cube.getMeasures();
         * console.log(measures.map(m => m.name));  // ['sales', 'quantity', 'cost']
         * ```
         */
        getMeasures(): MeasureMeta[];
        /**
         * 현재 등록된 모든 metric 목록을 반환한다.<br/>
         *
         * @returns metric 필드 목록
         *
         * @example
         * ```typescript
         * const metrics = cube.getMetrics();
         * console.log(metrics.map(m => m.name));  // ['profit_margin', 'roi']
         * ```
         */
        getMetrics(): ColumnMeta[];
        getMeasure(name: string): MeasureMeta | undefined;
        /**
         * 컬럼의 고유값 목록을 리턴한다.<br/>
         * dimension, measure 구분 없이 모든 컬럼에 대해 사용 가능하다.<br/>
         *
         * ## 반환값 특성
         * - 중복 제거된 고유값만 포함
         * - null/undefined 값은 필터링됨
         * - 정렬: 숫자는 오름차순, 문자는 사전순
         * - 원본 데이터 타입 유지
         *
         * @param columnName 컬럼 이름
         * @param filtered true이면 slicer 필터가 적용된 데이터에서 추출, false(기본)이면 원본 전체에서 추출
         * @returns 고유값 배열 (정렬됨), 컬럼이 없으면 undefined
         *
         * @example
         * ```typescript
         * // 원본 전체 고유값
         * const regions = cube.getColumnValues('region');
         *
         * // 필터 적용된 고유값
         * const filtered = cube.getColumnValues('region', true);
         * ```
         */
        getColumnValues(columnName: string, filtered?: boolean): any[] | undefined;
        /* Excluded from this release type: $_setSourceDirect */
        /* Excluded from this release type: $_validateSchemaFieldNames */
        /* Excluded from this release type: $_validateStarSchemaFieldNames */
        /* Excluded from this release type: $_validateStarSchemaColumnRef */
        /* Excluded from this release type: $_buildColumns */
        private $_setSchema;
        /**
         * 지정된 차원과 측정값으로 집계 테이블을 생성한다.<br/>
         *
         * 일반 차트(막대, 선, 파이 등)는 이 메서드로 충분하며,
         * 피벗 테이블(crosstab)이 필요한 경우에만 pivot()을 사용한다.<br/>
         *
         * ## 디자인 타임 vs 런타임
         * - **mutable: false** (기본값): 불변 AggTable 생성, 캐시 가능
         *   - 런타임용, 프로덕션 차트에 최적
         *   - 동일 조합 요청 시 캐시된 인스턴스 재사용
         * - **mutable: true**: 가변 AggTable 생성, 캐시 불가
         *   - 디자인 타임용, 차트 설정 중 차원/측정값 변경 가능
         *   - 확정 후 freeze() 호출 필요
         *
         * ## Aggregate 오버라이드
         * Schema에 정의된 기본 aggregate를 특정 AggTable에서만 변경할 수 있다.<br/>
         *
         * **Metric과의 관계:**
         * - Metric(post-aggregate 지표)은 집계된 measure 값을 참조하여 계산됨
         * - aggregate 오버라이드 시, 해당 AggTable 내의 metric도 오버라이드된 집계값을 사용
         * - 예: `profit_rate = profit / sales * 100`에서 sales를 avg로 오버라이드하면,
         *   profit_rate는 `profit(sum) / sales(avg) * 100`으로 계산됨
         * - 각 AggTable은 독립적이므로, 다른 AggTable의 metric 계산에는 영향 없음
         *
         * ## 집계 결과 구조
         * - **Dimension 컬럼**: 그룹화 기준이 되는 차원들의 고유 조합
         * - **Measure 컬럼**: 각 그룹별로 집계된 측정값 (sum, avg, min, max, count)
         * - **Metric 컬럼**: 집계된 measure를 기반으로 계산된 지표
         *
         * @param dimensionNames 집계할 차원 이름 배열 (예: ['region', 'product'])
         * @param measureNames 집계할 측정값/지표 이름 배열 (생략 시 스키마의 모든 측정값 사용).
         *                     measure와 metric을 함께 지정 가능.
         * @param options 집계 옵션
         * @param options.mutable 가변 AggTable 생성 여부 (기본값: false)
         * @param options.aggregates measure별 aggregate 오버라이드 (예: { sales: 'avg' }).
         *                           metric이 참조하는 measure의 aggregate도 변경 가능.
         * @returns 집계 결과 테이블 (AggTable)
         * @throws Error 데이터 소스가 설정되지 않았거나 유효하지 않은 차원/측정값이 지정된 경우
         *
         * @example
         * ```typescript
         * // 동적 측정값 등록
         * cube.addMeasure('margin', { source: 'profit / sales * 100', aggregate: 'avg' });
         *
         * // 런타임: immutable AggTable (캐시됨)
         * const agg1 = cube.aggregate(['region'], ['sales', 'margin']);
         * const agg2 = cube.aggregate(['region'], ['sales', 'margin']); // 캐시에서 재사용 ✓
         *
         * // 디자인 타임: mutable AggTable (캐시 안됨)
         * const draft = cube.aggregate(['region'], ['sales'], { mutable: true });
         * draft.addDimension(productCol);    // 차원 추가
         * draft.removeMeasure('quantity');   // 측정값 제거
         * draft.freeze();                    // 확정 → 이후 캐시 가능
         *
         * // aggregate 오버라이드: 기본 sum → avg로 변경
         * // metric (profit_rate)도 오버라이드된 sales(avg) 값을 사용
         * const aggAvg = cube.aggregate(['region'], ['sales', 'profit_rate'], {
         *     aggregates: { sales: 'avg' }
         * });
         * // sales: avg로 집계
         * // profit_rate = profit(sum) / sales(avg) * 100  ← 오버라이드된 값 사용
         *
         * // 다중 오버라이드
         * const aggMulti = cube.aggregate(['region'], ['sales', 'quantity', 'avg_price'], {
         *     aggregates: { sales: 'avg', quantity: 'max' }
         * });
         * // avg_price = sales(avg) / quantity(max)
         * ```
         */
        aggregate(dimensionNames: string[], measureNames?: (string | MeasureAlias)[], options?: {
            mutable?: boolean;
            force?: boolean;
            aggregates?: Record<string, CubeAggregateType>;
            /**
             * 캐시를 논리적으로 분리하기 위한 사용자 지정 키.<br/>
             * 동일한 차원/측정값 조합이라도 서로 다른 `userKey`를 지정하면 캐시 키가 분리되어
             * 독립적인 AggTable 인스턴스를 얻을 수 있다.<br/>
             * UI에서 동일 구성을 여러 논리 테이블/뷰에서 사용해야 할 때 유용하다.<br/>
             *
             * @example
             * ```typescript
             * const left  = cube.aggregate(['region'], ['sales'], { userKey: 'left' });
             * const right = cube.aggregate(['region'], ['sales'], { userKey: 'right' });
             * // left !== right (각각 독립적인 AggTable)
             * ```
             */
            userKey?: string;
            /**
             * 집계 전 필터 (Pre-Filter).<br/>
             * 이 AggTable에만 적용되는 Visual-level 필터.<br/>
             * DataCube 필터와 별도로 동작하며, Pivot의 row/column에 포함되지 않은 차원에 대한 필터링에 사용한다.<br/>
             * 지정 시 mutable로 생성되며 캐시되지 않는다.<br/>
             *
             * @example
             * ```typescript
             * const agg = cube.aggregate(['region'], ['sales'], {
             *     filters: [{ dimension: 'year', values: [2024] }]
             * });
             * ```
             */
            filters?: CubeFilter[];
        }): AggTable;
        /**
         * 모든 차원과 모든 측정값을 사용하여 집계를 수행한다.<br/>
         * 내부적으로 aggregate()를 호출하여 전체 데이터에 대한 집계 테이블을 생성한다.<br/>
         *
         * ## 동작 방식
         * 1. 스키마에서 모든 차원(dimension)을 조회한다.
         * 2. 스키마에서 모든 측정값(measure)과 메트릭(metric)을 조회한다.
         * 3. aggregate(allDimensions, allMeasuresAndMetrics)를 호출한다.
         *
         * @returns 모든 차원으로 그룹화하고 모든 측정값을 집계한 불변 AggTable
         * @throws Error 데이터 소스가 설정되지 않았을 때
         * @throws Error 차원이나 측정값이 하나도 없을 때
         *
         * @example
         * ```typescript
         * // 스키마: dimensions = ['region', 'product'], measures = ['sales', 'quantity']
         * const agg = cube.aggregateAll();
         * // 동일: cube.aggregate(['region', 'product'], ['sales', 'quantity'])
         * ```
         */
        aggregateAll(): AggTable;
        /**
         * 지정된 차원 값으로 데이터를 슬라이싱한다.<br/>
         * 특정 차원의 값을 필터링하여 부분 큐브를 생성하는 OLAP 슬라이싱 연산이다.<br/>
         * 슬라이싱을 통해 큐브의 차원을 1개 줄이면서 해당 차원 값만 포함하는 부분 큐브를 만들 수 있다.<br/>
         *
         * ## 동작 방식
         * 1. 지정된 차원 이름과 값으로 원본 데이터를 필터링한다.
         * 2. 필터링된 데이터를 새로운 DataTableView로 래핑한다.
         * 3. 래핑된 뷰를 DataViewSource로 변환한다.
         * 4. 새로운 DataCube 인스턴스를 생성하여 반환한다.
         * 5. 원본 큐브는 변경되지 않는다 (불변 연산).
         *
         * ## 필터 체이닝
         * 슬라이스된 큐브에 다시 slice()를 호출하면 필터들이 AND 조건으로 결합된다.<br/>
         * 기존 필터 조건과 새로운 필터 조건을 모두 만족하는 행만 포함된다.<br/>
         *
         * ## 메모리 효율성
         * - **Zero-Copy**: 원본 데이터를 복사하지 않고 필터 뷰만 생성
         * - **지연 평가**: 실제 데이터 접근은 집계/피벗 시점에만 발생
         * - **캐시 독립성**: 각 슬라이스된 큐브는 독립적인 캐시 유지
         *
         * @param dimensionName 슬라이스할 차원 이름<br/>
         *                      ColumnMeta의 name 속성과 일치하는 문자열
         * @param value 필터링할 차원 값<br/>
         *              null, undefined를 포함한 모든 JavaScript 값 가능
         * @returns 슬라이스된 새로운 DataCube 인스턴스<br/>
         *          원본 큐브의 데이터 소스와 동일한 스키마를 가지며,
         *          지정된 차원 값으로 필터링된 데이터만 포함
         * @throws Error 다음의 경우 에러 발생:
         *         - 데이터 소스가 설정되지 않았을 때 ("DataCube source is not set")
         *         - 지정된 차원 이름이 존재하지 않을 때 ("Dimension '...' not found")
         *         - 차원의 source 필드가 DataTable에 없을 때 ("Field '...' not found in DataTable")
         *         - 데이터 소스가 DataTable/DataTableView가 아닐 때
         *
         * @example
         * ```typescript
         * // 기본 사용 예시: 지역별로 슬라이싱
         * const cube = new DataCube();
         * cube.setSource(dataViewSource);
         *
         * // Seoul 지역의 데이터만 추출
         * const seoulCube = cube.slice('region', 'Seoul');
         *
         * // 슬라이스된 큐브로 제품별 집계
         * const productAgg = seoulCube.aggregate(['product'], ['sales']);
         * // 결과: Seoul 지역의 제품별 매출만 포함
         * ```
         *
         * @example
         * ```typescript
         * // 다중 값 필터링 (OR 조건)
         * const cube = new DataCube();
         * cube.setSource(dataViewSource);
         *
         * // Seoul 또는 Busan 지역만 추출 (OR 조건)
         * const selectedCube = cube.slice('region', ['Seoul', 'Busan']);
         *
         * // 제품 A 또는 B만 추출
         * const productCube = cube.slice('product', ['A', 'B']);
         * ```
         *
         * @example
         * ```typescript
         * // 범위 필터링
         * const cube = new DataCube();
         * cube.setSource(dataViewSource);
         *
         * // 매출 1000~5000 범위만 추출
         * const rangeCube = cube.slice('sales', [1000, 5000]);
         * ```
         *
         * @example
         * ```typescript
         * // 필터 체이닝: 다단계 필터링
         * const cube = new DataCube();
         * cube.setSource(dataViewSource);
         *
         * // Step 1: Seoul 지역 필터링
         * const seoulCube = cube.slice('region', 'Seoul');
         *
         * // Step 2: 제품 A 필터링 (Seoul AND Product A)
         * const seoulProductACube = seoulCube.slice('product', 'A');
         *
         * // Step 3: 분기별 필터링 (Seoul AND Product A AND Q1)
         * const q1Cube = seoulProductACube.slice('quarter', 'Q1');
         *
         * // 최종 집계: Seoul, Product A, Q1의 데이터만
         * const agg = q1Cube.aggregate(['date'], ['sales']);
         * ```
         *
         * @example
         * ```typescript
         * // 피벗과 함께 사용
         * const cube = new DataCube();
         * cube.setSource(dataViewSource);
         *
         * // Busan 지역만 추출
         * const busanCube = cube.slice('region', 'Busan');
         *
         * // 제품 x 분기 피벗 생성 (Busan 지역만)
         * const pivot = busanCube.pivot(
         *   ['product'],      // 행: 제품
         *   ['quarter'],      // 열: 분기
         *   'sales',          // 값: 매출
         *   { emptyValue: 'dash' }
         * );
         *
         * // 결과 예시:
         * // rowLabels:    [['A'], ['B'], ['C']]
         * // columnLabels: [['Q1'], ['Q2'], ['Q3'], ['Q4']]
         * // matrix:       [[10000, 12000, '-', 9000],
         * //                [5000, 6000, 7000, 5500],
         * //                ['-', 3000, 2000, '-']]
         * ```
         *
         * @example
         * ```typescript
         * // 독립적인 캐시: 여러 슬라이스 큐브 생성
         * const cube = new DataCube();
         * cube.setSource(dataViewSource);
         *
         * // 지역별로 별도의 큐브 생성
         * const seoulCube = cube.slice('region', 'Seoul');
         * const busanCube = cube.slice('region', 'Busan');
         * const daeguCube = cube.slice('region', 'Daegu');
         *
         * // 각 큐브는 독립적인 캐시를 유지
         * const seoulAgg = seoulCube.aggregate(['product'], ['sales']);
         * const busanAgg = busanCube.aggregate(['product'], ['sales']);
         *
         * // 원본 큐브의 캐시에는 영향 없음
         * const originalAgg = cube.aggregate(['region', 'product'], ['sales']);
         * ```
         *
         * @example
         * ```typescript
         * // Excel pivot 스타일: 필터링과 피벗을 한 번에
         * const cube = new DataCube();
         * cube.setSource(dataViewSource);
         *
         * // Seoul 지역의 제품x분기 피벗을 한 번에 생성
         * const pivot = cube.slice(
         *   'region', 'Seoul',
         *   ['product'],    // 행 차원
         *   ['quarter'],    // 열 차원
         *   'sales'         // 측정값
         * );
         *
         * // 결과는 PivotMatrix
         * console.log(pivot.rowLabels);    // [['A'], ['B']]
         * console.log(pivot.columnLabels); // [['Q1'], ['Q2'], ['Q3'], ['Q4']]
         * ```
         *
         * @see {@link dice} 여러 차원을 동시에 필터링
         * @see {@link aggregate} 슬라이스된 데이터 집계
         * @see {@link pivot} 슬라이스된 데이터 피벗
         */
        /**
         * 필터 변경 콜백을 등록한다.<br/>
         * addFilter(), removeFilter(), filterAll() 등으로 필터가 변경될 때 호출된다.<br/>
         * 반환된 함수를 호출하면 콜백이 해제된다.<br/>
         *
         * @param callback 필터 변경 시 호출될 콜백 함수
         * @returns 콜백 해제 함수
         *
         * @example
         * ```typescript
         * const unsub = cube.onChange(() => {
         *     console.log('filters changed:', cube.getFilters());
         * });
         * // 해제
         * unsub();
         * ```
         */
        onChange(callback: () => void): () => void;
        /* Excluded from this release type: $_notifyChangeListeners */
        registerListener(listener: any): void;
        unregisterListener(listener: any): void;
        /**
         * 여러 Slicer 필터를 일괄 적용한다.<br/>
         * 각 필터를 현재 큐브의 `_filters` Map에 저장하고, 등록된 AggTable 리스너들에게 알림을 보낸다.<br/>
         *
         * @param filters 적용할 CubeFilter 배열
         *
         * @remarks
         * **주의**: 이 메소드는 현재 DataCube 인스턴스를 변경합니다 (mutable).
         *
         * ### slice(), dice()와의 차이점
         *
         * | 메소드 | 반환값 | 동작 방식 | 사용 용도 |
         * |--------|--------|-----------|-----------|
         * | `slice()` | 새 DataCube | 새 인스턴스 생성 (immutable) | 단일 차원 필터링, 체이닝 |
         * | `dice()` | 새 DataCube | 새 인스턴스 생성 (immutable) | 다중 차원 필터링 |
         * | `filterAll()` | void | 현재 인스턴스 변경 (mutable) | Slicer와 함께 사용, 리스너 알림 |
         *
         * ### 동작 방식
         * - 빈 배열이나 null이 전달되면 모든 필터를 초기화 (`_filters = undefined`)
         * - list 타입: 값 또는 값 배열을 `_filters` Map에 저장
         * - range/date 타입: [min, max] 범위를 `_filters` Map에 저장
         * - 필터 업데이트 후 등록된 모든 AggTable 리스너에게 `onCubeFiltered(this)` 호출
         *
         * @example
         * ```typescript
         * // 직접 사용 (현재 큐브가 변경됨)
         * cube.filterAll([
         *   { dimension: 'region', type: 'list', values: ['Seoul', 'Busan'] },
         *   { dimension: 'sales', type: 'range', range: [1000, 5000] }
         * ]);
         *
         * // 필터 초기화
         * cube.filterAll([]);
         * ```
         *
         * @see {@link slice} 단일 차원 필터링 (새 DataCube 반환, immutable)
         * @see {@link dice} 다중 차원 필터링 (새 DataCube 반환, immutable)
         */
        filterAll(filters: CubeFilter[]): void;
        /**
         * 단일 필터를 추가하거나 업데이트한다.<br/>
         * CubeFilter 형식의 필터를 추가한다. 같은 dimension 필터가 있으면 대체된다.<br/>
         *
         * @param filter 추가할 CubeFilter
         */
        addFilter(filter: CubeFilter): void;
        /**
         * 수식 기반 필터를 추가한다.<br/>
         *
         * @param name 필터 이름 (고유해야 함)
         * @param expression 필터 수식 (예: 'sales > 1000 AND profit > 100')
         */
        addExpressionFilter(name: string, expression: string): void;
        /**
         * 필터를 제거한다.<br/>
         * API 필터에서 제거한다. Slicer 필터에서도 해당 키를 찾아 제거한다.<br/>
         *
         * @param name 제거할 필터명 (dimension 이름 또는 expression 필터 이름)
         */
        removeFilter(name: string): void;
        /**
         * 필터 값을 업데이트한다.<br/>
         *
         * @param name 필터명 (dimension 이름 또는 expression 필터 이름)
         * @param value 새로운 값 또는 수식
         */
        updateFilter(name: string, value: any): void;
        /**
         * 모든 필터를 제거한다 (API 필터 + Slicer 필터 모두).<br/>
         */
        clearFilters(): void;
        /**
         * 현재 적용된 필터들을 반환한다 (API + Slicer 병합).<br/>
         *
         * @returns 필터 맵 (필터명/dimension → 값/수식)
         */
        getFilters(): Map<string, any> | undefined;
        /**
         * API 필터만 반환한다.<br/>
         */
        getApiFilters(): Map<string, any> | undefined;
        /**
         * Slicer 필터만 반환한다.<br/>
         */
        getSlicerFilters(): Map<string, any> | undefined;
        /**
         * Slicer를 추가한다.<br/>
         *
         * @param options - Slicer 옵션 (name 필수)
         * @returns 생성된 Slicer 인스턴스
         * @throws name이 없으면 에러
         *
         * @example
         * ```typescript
         * const slicer = cube.addSlicer({ name: 'region', dimension: 'region' });
         * slicer.select(['Seoul', 'Busan']);
         * cube.applySlicers();
         * ```
         */
        addSlicer(options: SlicerOptions): Slicer;
        /**
         * Slicer를 제거한다.<br/>
         *
         * @param name - 제거할 Slicer 이름
         * @returns 제거 성공 여부
         */
        removeSlicer(name: string): boolean;
        /**
         * Slicer를 가져온다.<br/>
         *
         * @param name - Slicer 이름
         */
        getSlicer(name: string): Slicer | undefined;
        /**
         * 모든 Slicer를 가져온다.<br/>
         */
        getSlicers(): Map<string, Slicer>;
        /**
         * 등록된 모든 Slicer의 활성 필터를 수집하여 DataCube에 일괄 적용한다.<br/>
         * 내부적으로 `filterAll()`을 호출한다.<br/>
         *
         * @remarks
         * Slicer의 `select()`, `setRange()` 등의 메서드는 기본적으로 `apply=true`이므로 자동으로
         * 이 메서드를 호출한다. 여러 Slicer를 동시에 변경할 때는 `apply=false`로
         * 개별 변경한 후 이 메서드를 직접 호출하여 불필요한 재계산을 방지한다.
         *
         * @example
         * ```typescript
         * // 개별 변경: select()가 자동으로 applySlicers() 호출
         * cube.getSlicer('region')?.select(['Seoul']);
         *
         * // 배치 변경: apply=false로 지연 후 직접 호출
         * cube.getSlicer('region')?.select(['Seoul'], false);
         * cube.getSlicer('category')?.select('Electronics', false);
         * cube.applySlicers();  // 한 번만 filterAll() 호출
         * ```
         */
        applySlicers(): void;
        /**
         * 활성화된 Slicer 필터 목록을 반환한다.<br/>
         */
        getActiveSlicerFilters(): CubeFilter[];
        /**
         * 모든 Slicer를 초기화한다.<br/>
         */
        resetSlicers(): void;
        /**
         * 모든 Slicer를 새로고침한다.<br/>
         */
        refreshSlicers(): void;
        /**
         * Slicer 상태를 JSON으로 저장한다.<br/>
         */
        saveSlicerState(): Record<string, any>;
        /**
         * 저장된 Slicer 상태를 복원한다.<br/>
         *
         * @param state - saveSlicerState()로 저장한 상태 객체
         */
        restoreSlicerState(state: Record<string, any>): void;
        /**
         * 내부 필터 Map의 range 객체({ _min, _max })를 [min, max] 배열로 변환하여 복사본을 반환한다.
         * @private
         */
        private static $_unwrapFilterMap;
        slice(dimensionName: string, value: any): DataCube;
        /**
         * 지정된 차원의 특정 범위로 데이터를 다이싱한다.<br/>
         * 여러 차원에 대한 필터 조건을 동시에 적용하여 부분 큐브를 생성하는 OLAP 다이싱 연산이다.<br/>
         * 슬라이싱(slice)은 단일 차원을 필터링하는 반면, 다이싱(dice)은 다중 차원을 한 번에 필터링한다.<br/>
         *
         * ## 동작 방식
         * 1. 필터 맵의 각 차원별 조건을 검증한다.
         * 2. 모든 필터 조건을 AND로 결합하여 적용한다.
         * 3. 필터링된 데이터를 새로운 DataTableView로 래핑한다.
         * 4. 래핑된 뷰를 DataViewSource로 변환한다.
         * 5. 새로운 DataCube 인스턴스를 생성하여 반환한다.
         *
         * ## slice()와의 차이점
         *
         * | 기능 | slice() | dice() |
         * |------|---------|--------|
         * | 필터 개수 | 1개 차원 | 여러 차원 |
         * | 호출 방식 | 단일 호출 | 단일 호출 |
         * | 적용 방식 | 순차적 (체이닝 필요) | 동시 적용 |
         * | 사용 사례 | 단계별 드릴다운 | 한번에 다중 조건 |
         *
         * ## 필터 조건 형식
         *
         * 필터 맵의 각 값은 다음 두 가지 형식을 지원한다:
         *
         * ### 1. 정확한 값 필터 (Exact Match)
         * ```typescript
         * { region: 'Seoul', quarter: 'Q1' }
         * // region == 'Seoul' AND quarter == 'Q1'
         * ```
         *
         * ### 2. 범위 필터 (Range)
         * ```typescript
         * { sales: [1000, 5000] }  // 1000 <= sales <= 5000
         * { quantity: [0, 100] }   // 0 <= quantity <= 100
         * ```
         *
         * ## 성능 고려사항
         * - **장점**: 여러 조건을 한 번에 적용하므로 필터링 비용 최소화
         * - **비용**: 모든 필터 조건을 각 행에서 평가해야 함
         * - **권장**: 3개 이상의 차원 필터가 필요한 경우 dice() 사용
         *
         * @param filters 차원별 필터 조건 맵<br/>
         *                키: 차원 이름 (string)<br/>
         *                값: 필터 값 (any) 또는 범위 [최소값, 최대값]<br/>
         *                빈 맵은 필터링 없음 (전체 데이터)
         * @returns 다이싱된 새로운 DataCube 인스턴스<br/>
         *          원본 큐브의 데이터 소스와 동일한 스키마를 가지며,
         *          지정된 모든 조건을 만족하는 데이터만 포함
         * @throws Error 다음의 경우 에러 발생:
         *         - 데이터 소스가 설정되지 않았을 때 ("DataCube source is not set")
         *         - 필터 맵의 차원 이름이 존재하지 않을 때 ("Dimension '...' not found")
         *         - 범위 필터가 올바른 형식이 아닐 때 ("Invalid range filter for '...'")
         *
         * @example
         * ```typescript
         * // 기본 사용: 다중 정확한 값 필터
         * const cube = new DataCube();
         * cube.setSource(dataViewSource);
         *
         * // Seoul 지역, Q1 분기의 데이터만 추출
         * const dicedCube = cube.dice(
         *   new Map([
         *     ['region', 'Seoul'],
         *     ['quarter', 'Q1']
         *   ])
         * );
         *
         * // 결과: region == 'Seoul' AND quarter == 'Q1'인 행만 포함
         * const agg = dicedCube.aggregate(['product'], ['sales']);
         * ```
         *
         * @example
         * ```typescript
         * // 범위 필터 사용: 매출액 범위 제한
         * const cube = new DataCube();
         * cube.setSource(dataViewSource);
         *
         * // 매출이 10,000 ~ 50,000 범위인 데이터만
         * const dicedCube = cube.dice(
         *   new Map([
         *     ['sales', [10000, 50000]]  // 10000 <= sales <= 50000
         *   ])
         * );
         *
         * // 결과: 매출 범위에 해당하는 행만 포함
         * const agg = dicedCube.aggregate(['region'], ['quantity']);
         * ```
         *
         * @example
         * ```typescript
         * // 혼합 필터: 정확한 값 + 범위 필터
         * const cube = new DataCube();
         * cube.setSource(dataViewSource);
         *
         * // Seoul 지역 + Q1 분기 + 판매량 50~100
         * const dicedCube = cube.dice(
         *   new Map([
         *     ['region', 'Seoul'],           // 정확한 값
         *     ['quarter', 'Q1'],             // 정확한 값
         *     ['quantity', [50, 100]]        // 범위 필터
         *   ])
         * );
         *
         * // 결과: 모든 조건을 만족하는 행만 포함
         * const agg = dicedCube.aggregate(['product'], ['sales']);
         * ```
         *
         * @example
         * ```typescript
         * // 복잡한 다중 조건 필터
         * const cube = new DataCube();
         * cube.setSource(dataViewSource);
         *
         * // 여러 지역 + 가격대 + 시간 범위 조합
         * const dicedCube = cube.dice(
         *   new Map([
         *     ['region', 'Seoul'],          // 특정 지역
         *     ['product', 'A'],             // 특정 제품
         *     ['price', [1000, 5000]],      // 가격대
         *     ['date', ['2024-01-01', '2024-03-31']]  // 날짜 범위
         *   ])
         * );
         *
         * // 모든 조건을 만족하는 상세 분석
         * const pivot = dicedCube.pivot(
         *   ['region', 'product'],
         *   ['quarter'],
         *   'sales'
         * );
         * ```
         *
         * @example
         * ```typescript
         * // 빈 필터 맵 (필터링 없음)
         * const cube = new DataCube();
         * cube.setSource(dataViewSource);
         *
         * // 필터 없이 전체 데이터
         * const dicedCube = cube.dice(new Map()); // 또는 new Map([])
         *
         * // 원본 큐브와 동일한 결과
         * const agg1 = cube.aggregate(['region'], ['sales']);
         * const agg2 = dicedCube.aggregate(['region'], ['sales']);
         * // agg1과 agg2는 동일한 결과
         * ```
         *
         * @example
         * ```typescript
         * // slice()와의 비교
         * const cube = new DataCube();
         * cube.setSource(dataViewSource);
         *
         * // 방법 1: slice() 체이닝 (3번의 호출)
         * const result1 = cube
         *   .slice('region', 'Seoul')
         *   .slice('quarter', 'Q1')
         *   .slice('product', 'A')
         *   .aggregate(['date'], ['sales']);
         *
         * // 방법 2: dice() 단일 호출
         * const result2 = cube
         *   .dice(new Map([
         *     ['region', 'Seoul'],
         *     ['quarter', 'Q1'],
         *     ['product', 'A']
         *   ]))
         *   .aggregate(['date'], ['sales']);
         *
         * // 두 결과는 동일하지만 dice()가 더 효율적
         * ```
         *
         * @example
         * ```typescript
         * // Excel pivot 스타일: 다중 필터와 피벗을 한 번에
         * const cube = new DataCube();
         * cube.setSource(dataViewSource);
         *
         * // Seoul 지역 + Q1 분기의 제품x날짜 피벗을 한 번에 생성
         * const pivot = cube.dice(
         *   new Map([
         *     ['region', 'Seoul'],
         *     ['quarter', 'Q1']
         *   ]),
         *   ['product'],    // 행 차원
         *   ['date'],       // 열 차원
         *   'sales'         // 측정값
         * );
         *
         * // 결과는 PivotMatrix
         * console.log(pivot.rowLabels);    // [['A'], ['B']]
         * console.log(pivot.columnLabels); // [['2024-01-01'], ['2024-01-02'], ...]
         * ```
         *
         * @see {@link slice} 단일 차원 필터링
         * @see {@link drillDown} 계층적 드릴다운
         * @see {@link aggregate} 다이싱된 데이터 집계
         * @see {@link pivot} 다이싱된 데이터 피벗
         */
        dice(filters: Map<string, any | [any, any]>): DataCube;
        /**
         * 차원 계층을 따라 드릴다운한다.<br/>
         * 상위 차원에서 하위 차원으로 세부 수준을 낮춰 분석하는 OLAP 연산이다.<br/>
         * 상위 수준의 요약 데이터에서 세부 수준으로 분해하며, 롤업의 역 연산이다.<br/>
         *
         * @param fromDimension 현재(상위) 차원 이름
         * @param toDimension 드릴다운할 하위 차원 이름
         * @returns 드릴다운된 집계 테이블
         * @throws Error 다음의 경우 에러 발생:
         *         - 데이터 소스가 설정되지 않았을 때
         *         - fromDimension 또는 toDimension이 존재하지 않을 때
         *         - fromDimension과 toDimension 사이 계층 관계가 정의되지 않았을 때
         *         - toDimension이 fromDimension의 하위 계층이 아닐 때
         */
        drillDown(fromDimension: string, toDimension: string): AggTable;
        /**
         * 계층적 필터링을 수행한다.<br/>
         * 날짜(year/month/day)같은 계층 구조에서 상위 수준을 선택하면
         * 하위 수준이 자동으로 포함된다.<br/>
         *
         * @example
         * ```typescript
         * // year/month/day 계층의 경우
         * // 2024년만 필터 → 2024년의 모든 월, 일 자동 포함
         * cube.filterHierarchical('order_date', [2024])
         *
         * // 명시적으로 특정 월만 선택
         * cube.filterHierarchical('order_date', [['2024', '01'], ['2024', '02']])
         *
         * // 여러 연도의 특정 월
         * cube.filterHierarchical('order_date', [
         *   ['2024', '01'],
         *   ['2025', '01']
         * ])
         * ```
         *
         * @param dimensionName 계층 구조가 있는 차원 이름 (e.g., 'order_date')
         * @param paths 포함할 경로 배열
         *              - 단일 값 배열: [2024, '01', '15'] 또는 [2024, '01']
         *              - 이중 배열: [[2024, '01'], [2024, '02']]
         * @returns 필터링된 새로운 DataCube 인스턴스
         */
        filterHierarchical(dimensionName: string, paths: (any | any[])[]): DataCube;
        /* Excluded from this release type: $_applyHierarchicalFilter */
        /**
         * Expression을 사용하여 필터링한다.<br/>
         * @realgrid/expression 라이브러리를 사용하여 복잡한 필터 조건을 적용한다.<br/>
         *
         * ## 지원하는 연산자
         * - 비교: `>`, `>=`, `<`, `<=`, `==`, `!=`
         * - 논리: `AND`, `OR`, `NOT`
         * - 문자열: `CONTAINS`, `STARTSWITH`, `ENDSWITH`
         * - IN: `IN (value1, value2, ...)`
         * - 범위: `BETWEEN min AND max`
         * - NULL: `IS NULL`, `IS NOT NULL`
         *
         * @param expressionString Expression 문자열
         * @returns 필터링된 새로운 DataCube
         *
         * @example
         * ```typescript
         * // 단순 비교
         * const cube1 = cube.filter('sales > 1000');
         * const cube2 = cube.filter('region == "Seoul"');
         *
         * // 논리 연산
         * const cube3 = cube.filter('sales > 1000 AND region == "Seoul"');
         * const cube4 = cube.filter('product == "A" OR product == "B"');
         *
         * // IN 연산자
         * const cube5 = cube.filter('region IN ("Seoul", "Busan", "Daegu")');
         *
         * // 범위 필터
         * const cube6 = cube.filter('sales BETWEEN 1000 AND 5000');
         *
         * // 문자열 패턴
         * const cube7 = cube.filter('productName CONTAINS "Phone"');
         * const cube8 = cube.filter('productCode STARTSWITH "P-"');
         *
         * // NULL 체크
         * const cube9 = cube.filter('discount IS NOT NULL');
         *
         * // 복잡한 조합
         * const cube10 = cube.filter(
         *   '(region == "Seoul" OR region == "Busan") AND sales > 1000'
         * );
         * ```
         */
        filter(expressionString: string): DataCube;
        /**
         * 차원 계층을 따라 롤업한다.<br/>
         * 하위 차원에서 상위 차원으로 세부 수준을 높여 요약하는 OLAP 연산이다.<br/>
         * 상세한 데이터를 더 높은 수준의 집계로 변환하며, 드릴다운의 역 연산이다.<br/>
         *
         * ## 개념
         * 롤업(Roll-up)은 세부 차원에서 상위 차원으로 이동하면서 데이터를 요약하는 OLAP 연산이다.<br/>
         * 예를 들어, 일(Day) 단위의 상세 데이터를 월(Month)로 요약하거나,<br/>
         * 월(Month)의 데이터를 분기(Quarter)로 요약하는 방식으로 동작한다.<br/>
         *
         * ## 계층 구조 예시
         *
         * ```
         * 시간 계층:          조직 계층:              지역 계층:
         * 년도                회사                   국가
         *  ↑                   ↑                      ↑
         *  분기               부서                   대륙
         *  ↑                   ↑                      ↑
         *  월                 팀                     국가
         *  ↑                   ↑                      ↑
         *  일                 개인                   지역
         *
         * 롤업 방향: 아래에서 위로 (세부 → 요약)
         * ```
         *
         * ## 동작 방식
         * 1. fromDimension에서 현재 집계된 데이터 조회
         * 2. toDimension이 fromDimension의 상위 계층임을 확인
         * 3. fromDimension의 각 행을 toDimension으로 매핑
         * 4. 동일한 상위 차원 값을 가진 행들을 집계
         * 5. 측정값을 해당 집계 함수로 병합 (합계, 평균 등)
         * 6. 롤업된 결과를 AggTable로 반환
         *
         * ## drillDown()과의 비교
         *
         * | 기능 | drillDown() | rollUp() |
         * |------|------------|----------|
         * | 방향 | 위 → 아래 | 아래 → 위 |
         * | 차원 이동 | 상위 → 하위 | 하위 → 상위 |
         * | 세부도 | 증가 (세부화) | 감소 (요약) |
         * | 행 개수 | 증가 | 감소 |
         * | 측정값 | 분해/조회 | 병합/요약 |
         * | 사용 사례 | 상세 분석 드릴다운 | 상위 수준 보고서 생성 |
         *
         * ## 계층 검증 규칙
         *
         * ```typescript
         * // 유효한 롤업 (fromDimension이 toDimension의 하위 계층)
         * rollUp('date', 'month')      // 일 → 월 ✓
         * rollUp('month', 'quarter')   // 월 → 분기 ✓
         * rollUp('quarter', 'year')    // 분기 → 연도 ✓
         *
         * // 무효한 롤업
         * rollUp('month', 'date')      // 상위 → 하위 ✗ (드릴다운이어야 함)
         * rollUp('date', 'date')       // 동일 차원 ✗
         * rollUp('date', 'region')     // 관계없는 차원 ✗ (계층 관계 없음)
         * ```
         *
         * ## 측정값 병합 전략
         *
         * ```typescript
         * // 날짜별 판매량 데이터
         * 2024-01-01: 100 판매량
         * 2024-01-02: 150 판매량
         * 2024-01-03: 120 판매량
         *
         * // 월로 롤업 시 (Sum 집계)
         * 2024-01: 370 판매량 (100+150+120)
         *
         * // 월로 롤업 시 (Average 집계)
         * 2024-01: 123.33 판매량 (평균값)
         * ```
         *
         * ## 성능 고려사항
         * - **비용**: 하위 차원의 모든 행을 읽고 상위 차원으로 그룹화
         * - **최적화**: 이미 하위 차원 집계가 있으면 재사용 가능
         * - **메모리**: 결과 행 개수가 현저히 감소하므로 메모리 효율적
         * - **권장**: 대시보드 요약이나 경영진 보고서 생성 시 활용
         *
         * @param fromDimension 현재(하위) 차원 이름<br/>
         *                     세부 수준의 차원 (예: 'date', 'month')
         * @param toDimension 롤업할 상위 차원 이름<br/>
         *                   더 높은 수준의 차원 (예: 'month', 'year')<br/>
         *                   fromDimension의 상위 계층이어야 함
         * @returns 롤업된 집계 테이블<br/>
         *         toDimension 차원으로 그룹화된 데이터, 행 개수 감소
         * @throws Error 다음의 경우 에러 발생:
         *         - 데이터 소스가 설정되지 않았을 때
         *         - fromDimension 또는 toDimension이 존재하지 않을 때
         *         - fromDimension과 toDimension 사이 계층 관계가 정의되지 않았을 때
         *         - toDimension이 fromDimension의 상위 계층이 아닐 때
         *
         * @example
         * ```typescript
         * // 기본 사용: 일 → 월로 롤업
         * const cube = new DataCube();
         * cube.setSource(dataViewSource);
         *
         * // 먼저 일별로 집계
         * const dayAgg = cube.aggregate(['date'], ['sales', 'quantity']);
         * // 결과: 2024-01-01, 2024-01-02, 2024-01-03, ... (상세)
         *
         * // 월로 롤업하여 요약
         * const monthAgg = cube.rollUp('date', 'month');
         * // 결과: 2024-01, 2024-02, ... (요약)
         * ```
         *
         * @example
         * ```typescript
         * // 다단계 롤업: 일 → 월 → 분기 → 연도
         * const cube = new DataCube();
         * cube.setSource(dataViewSource);
         *
         * // Step 1: 일별 판매 데이터
         * const dayData = cube.aggregate(['date'], ['sales']);
         *
         * // Step 2: 월로 롤업
         * const monthData = cube.rollUp('date', 'month');
         *
         * // Step 3: 분기로 롤업
         * const quarterData = cube.rollUp('month', 'quarter');
         *
         * // Step 4: 연도로 롤업 (최상위 요약)
         * const yearData = cube.rollUp('quarter', 'year');
         * // 결과: 2024년의 총합 1건 (가장 요약된 형태)
         * ```
         *
         * @example
         * ```typescript
         * // 조직 계층 롤업: 개인 → 팀 → 부서 → 회사
         * const cube = new DataCube();
         * cube.setSource(dataViewSource);
         *
         * // 직원별 목표 달성률
         * const employeePerf = cube.aggregate(['employee'], ['target', 'actual']);
         * // 결과: 100명의 직원 데이터
         *
         * // 팀 단위로 롤업 (평균 달성률)
         * const teamPerf = cube.rollUp('employee', 'team');
         * // 결과: 10개 팀의 평균 성과
         *
         * // 부서 단위로 롤업
         * const deptPerf = cube.rollUp('team', 'department');
         * // 결과: 3개 부서의 평균 성과
         *
         * // 회사 전체 성과
         * const companyPerf = cube.rollUp('department', 'company');
         * // 결과: 회사 전체 1개 행 (최종 요약)
         * ```
         *
         * @example
         * ```typescript
         * // 지역 계층 롤업: 지점 → 지역 → 대구역 → 전국
         * const cube = new DataCube();
         * cube.setSource(dataViewSource);
         *
         * // 지점별 매출
         * const storeData = cube.aggregate(['store'], ['sales']);
         * // 결과: 50개 지점
         *
         * // 지역 단위로 롤업
         * const regionData = cube.rollUp('store', 'region');
         * // 결과: 8개 지역
         *
         * // 대구역 단위로 롤업
         * const areaData = cube.rollUp('region', 'largeArea');
         * // 결과: 3개 대구역 (서부, 중부, 동부)
         *
         * // 전국 단위 (최종)
         * const nationalData = cube.rollUp('largeArea', 'country');
         * // 결과: 전국 1개 행
         * ```
         *
         * @example
         * ```typescript
         * // drillDown()과의 비교
         * const cube = new DataCube();
         * cube.setSource(dataViewSource);
         *
         * // 연도 데이터에서 시작
         * const yearData = cube.aggregate(['year'], ['sales']);
         * // 2024년 총 매출: 1,000,000
         *
         * // 방법 1: drillDown으로 분기 단위로 드릴다운
         * const quarterData = cube.drillDown('year', 'quarter');
         * // Q1: 200,000 / Q2: 300,000 / Q3: 250,000 / Q4: 250,000
         *
         * // 방법 2: 분기에서 다시 month로 드릴다운
         * const monthData = cube.drillDown('quarter', 'month');
         * // Jan: 50,000 / Feb: 60,000 / ...
         *
         * // 역방향: rollUp으로 월에서 분기로 롤업
         * const backToQuarter = cube.rollUp('month', 'quarter');
         * // Q1: 200,000 (다시 집계)
         * ```
         *
         * @example
         * ```typescript
         * // 피벗과 함께 사용
         * const cube = new DataCube();
         * cube.setSource(dataViewSource);
         *
         * // 일별 제품별 판매 데이터
         * const dailyData = cube.aggregate(['date', 'product'], ['sales']);
         *
         * // 월로 롤업하여 월별 제품별 판매
         * const monthlyByProduct = cube.rollUp('date', 'month')
         *   .then(agg => {
         *     // 월별 제품별 피벗 생성
         *     return cube.pivot(['month'], ['product'], 'sales');
         *   });
         *
         * // 결과: 월(행) x 제품(열) 의 크로스탭
         * // 형태: 12행 (월) x 5열 (제품) 매트릭스
         * ```
         *
         * @see {@link drillDown} 역 연산 - 상위에서 하위로 드릴다운
         * @see {@link aggregate} 기본 집계 연산
         * @see {@link pivot} 롤업 결과의 피벗 처리
         */
        rollUp(fromDimension: string, toDimension: string): AggTable;
        /**
         * 지정된 차원의 카디날리티(고유값 개수)를 반환한다.<br/>
         *
         * Dictionary Encoding된 컬럼은 O(1)로 즉시 반환하며,
         * 그렇지 않은 경우 전체 컬럼을 순회하여 계산한다.<br/>
         *
         * **주의**: 필터가 적용된 경우에도 전체 데이터의 카디날리티를 반환한다.
         * 필터링된 데이터의 카디날리티가 필요하면 `getColumnValues(name).length`를 사용한다.
         *
         * @param dimensionName 차원 이름
         * @returns 고유값 개수
         * @throws Error 데이터 소스가 없거나 차원이 존재하지 않는 경우
         *
         * @example
         * ```typescript
         * const cube = new DataCube({source, schema});
         *
         * // 지역 차원의 카디날리티
         * const regionCount = cube.getCardinality('region');  // 4 (O(1) - Dictionary 활용)
         *
         * // 전체 차원의 카디날리티 확인
         * cube.schema.dimensions.forEach(dim => {
         *     console.log(`${dim.name}: ${cube.getCardinality(dim.name)}`);
         * });
         * ```
         */
        getCardinality(dimensionName: string): number;
        /**
         * 모든 차원의 카디날리티(고유값 개수)를 한 번에 반환한다.<br/>
         *
         * 피벗 UI에서 row/column 필드 배치 가능 여부를 판단할 때 유용하다.<br/>
         * 카디날리티가 높은 차원을 축에 배치하면 UI 폭발이 발생할 수 있다.<br/>
         *
         * @returns 차원 이름을 키로, 카디날리티를 값으로 하는 객체
         * @throws Error 데이터 소스가 없는 경우
         *
         * @example
         * ```typescript
         * const cards = cube.getCardinalities();
         * // { region: 3, product: 5, quarter: 2, customer_id: 100000 }
         *
         * // 카디날리티 100 이하인 차원만 피벗 축에 배치 가능
         * const pivotableDims = Object.entries(cards)
         *     .filter(([_, card]) => card <= 100)
         *     .map(([name]) => name);
         * // ['region', 'product', 'quarter']
         * ```
         */
        getCardinalities(): Record<string, number>;
        /**
         * 지정된 차원의 수치 범위(최소값, 최대값)를 반환한다.<br/>
         * 필터가 적용되어 있으면 필터링된 데이터 범위 내에서의 min/max를 반환한다.<br/>
         * 수치형 차원에서만 의미있는 값을 반환하며, 문자형 차원에서는 null을 반환한다.<br/>
         *
         * ## 용도
         * - 범위 필터 UI의 슬라이더 최소/최대값 설정
         * - 데이터 분포 확인 (최소값, 최대값)
         * - 차트의 축(axis) 범위 설정
         * - 동적 범위 검증
         *
         * ## 반환값 특성
         * - 수치형 차원: {min: number, max: number} 반환
         * - 문자형 차원: null 반환
         * - 빈 데이터: null 반환
         * - 필터된 범위 내에서 계산 (필터 자동 반영)
         *
         * ## 필터 적용
         * - 현재 큐브에 적용된 필터가 있으면 자동으로 반영
         * - 필터링된 데이터 범위 내에서만 min/max를 계산
         *
         * @param dimensionName 차원 이름 (수치형이어야 함)
         * @returns 범위 객체 {min: number, max: number} 또는 null<br/>
         *         - 수치형 차원: 범위 객체
         *         - 문자형/날짜형 차원: null
         *         - 빈 데이터: null
         * @throws Error 다음의 경우 에러 발생:
         *         - 데이터 소스가 설정되지 않았을 때
         *         - 차원이 존재하지 않을 때
         *
         * @example
         * ```typescript
         * const cube = new DataCube({source, schema});
         *
         * // 판매량의 범위 확인
         * const salesRange = cube.getDimensionRange('sales');
         * // 반환: { min: 100, max: 50000 }
         *
         * // 슬라이더 UI 구성
         * const range = cube.getDimensionRange('quantity');
         * if (range) {
         *     setupSlider({
         *         min: range.min,
         *         max: range.max,
         *         step: 10
         *     });
         * }
         *
         * // 필터 후 범위 확인
         * const filtered = cube.slice('region', 'Seoul');
         * const seoulRange = filtered.getDimensionRange('sales');
         * // 반환: Seoul 지역의 판매량 범위
         * ```
         */
        getDimensionRange(dimensionName: string): {
            min: any;
            max: any;
        } | null;
        /**
         * 캐시된 모든 집계 테이블과 피벗 매트릭스를 제거한다.<br/>
         * 메모리를 확보하거나 데이터 변경 후 재계산이 필요할 때 사용한다.<br/>
         */
        clearCache(): void;
        /**
         * 큐브의 메모리 사용량 정보를 반환한다.<br/>
         *
         * 큐브가 사용 중인 전체 메모리를 세 부분으로 나누어 추정한다:
         * - **source**: 원본 데이터(ColumnStore/DataViewSource)의 메모리
         * - **aggTables**: 캐시된 집계 테이블들의 총 메모리
         * - **pivotMatrices**: 캐시된 피벗 매트릭스들의 총 메모리
         *
         * ## 메모리 추정 방식
         *
         * ### 1. 데이터 소스 메모리 (source)
         * 데이터 소스의 메모리는 각 컬럼의 데이터 타입을 기반으로 추정된다:<br/>
         * - **숫자형 (i32, f64)**: 행 개수 × 바이트/값
         *   - i32: 4바이트/값
         *   - f64: 8바이트/값
         * - **문자열 (str)**: 행 개수 × (평균 문자열 길이 × 2 + 메타데이터)
         *   - 평균 문자열 길이 추정: 50자
         *   - 메타데이터 오버헤드: 16바이트/값
         * - **객체 오버헤드**: 약 1KB
         *
         * ### 2. 집계 테이블 메모리 (aggTables)
         * 각 캐시된 AggTable의 메모리는 차원 컬럼과 측정값 컬럼의 합으로 계산된다:<br/>
         * - 행 개수 × (컬럼별 바이트 크기)
         * - AggTable 객체 오버헤드: 약 2KB
         *
         * 예시:
         * ```
         * 차원 2개 (문자열) + 측정값 3개 (숫자)
         * 100행의 경우:
         * - 문자열 차원: 100 × (30 × 2 + 16) × 2 = 15,200바이트
         * - 숫자 측정값: 100 × 8 × 3 = 2,400바이트
         * - 오버헤드: 2,048바이트
         * - 합계: 약 19.6KB
         * ```
         *
         * ### 3. 피벗 매트릭스 메모리 (pivotMatrices)
         * 피벗 매트릭스의 메모리는 레이블과 셀 데이터로 구성된다:<br/>
         * - **행 레이블**: 행 개수 × 레이블당 평균 바이트
         * - **열 레이블**: 열 개수 × 레이블당 평균 바이트
         * - **셀 데이터**: 행 개수 × 열 개수 × 8바이트 (Float64Array)
         * - **객체 오버헤드**: 약 2KB
         *
         * 예시:
         * ```
         * 5행(지역) × 4열(분기)의 피벗:
         * - 행 레이블: 5 × (10 × 2 + 16) = 180바이트
         * - 열 레이블: 4 × (5 × 2 + 16) = 104바이트
         * - 셀 데이터: 5 × 4 × 8 = 160바이트
         * - 오버헤드: 2,048바이트
         * - 합계: 약 2.5KB
         * ```
         *
         * ## 메모리 최적화 팁
         *
         * ### 1. 불필요한 캐시 제거
         * ```typescript
         * const cube = new DataCube();
         * cube.setSource(dataViewSource);
         *
         * // 여러 집계 작업 수행
         * const agg1 = cube.aggregate(['region'], ['sales']);
         * const agg2 = cube.aggregate(['product'], ['sales']);
         * const agg3 = cube.aggregate(['date'], ['sales']);
         *
         * // 캐시 메모리 확인
         * const usage = cube.getMemoryUsage();
         * console.log(`전체 메모리: ${(usage.total / 1024 / 1024).toFixed(2)}MB`);
         *
         * // 캐시 제거하여 메모리 절약
         * cube.clearCache();
         * const usageAfter = cube.getMemoryUsage();
         * console.log(`캐시 제거 후: ${(usageAfter.total / 1024 / 1024).toFixed(2)}MB`);
         * ```
         *
         * ### 2. 데이터 소스 크기 최소화
         * ```typescript
         * // 방법 1: DataViewSource 사용 (복사 없음)
         * const viewSource = new DataViewSource(columns, dataView);
         * cube1.setSource(viewSource);  // 메모리 효율적
         *
         * // 방법 2: ColumnStore 사용 (복사 + 최적화)
         * const columnStore = new ColumnStore(columns, dataFrame);
         * cube2.setSource(columnStore);  // 더 많은 메모리 사용
         * ```
         *
         * ### 3. 필터링으로 데이터 크기 줄이기
         * ```typescript
         * const cube = new DataCube();
         * cube.setSource(dataViewSource);
         *
         * // 전체 메모리
         * const fullUsage = cube.getMemoryUsage();
         * console.log(`전체: ${fullUsage.total}바이트`);
         *
         * // 필터링된 큐브 (더 적은 메모리)
         * const filtered = cube.slice('region', 'Seoul');
         * const filteredUsage = filtered.getMemoryUsage();
         * console.log(`필터링: ${filteredUsage.total}바이트`);
         * ```
         *
         * ## 메모리 모니터링 예시
         *
         * ```typescript
         * const cube = new DataCube();
         * cube.setSource(dataViewSource);
         *
         * // 초기 메모리
         * console.log('=== 메모리 사용량 ===');
         * let usage = cube.getMemoryUsage();
         * console.log(`소스: ${(usage.source / 1024).toFixed(2)}KB`);
         * console.log(`집계: ${(usage.aggTables / 1024).toFixed(2)}KB`);
         * console.log(`피벗: ${(usage.pivotMatrices / 1024).toFixed(2)}KB`);
         * console.log(`총계: ${(usage.total / 1024).toFixed(2)}KB`);
         *
         * // 집계 추가
         * cube.aggregate(['region'], ['sales']);
         * usage = cube.getMemoryUsage();
         * console.log(`\n집계 후: ${(usage.total / 1024).toFixed(2)}KB`);
         *
         * // 피벗 추가
         * cube.pivot(['region'], ['quarter'], 'sales');
         * usage = cube.getMemoryUsage();
         * console.log(`피벗 후: ${(usage.total / 1024).toFixed(2)}KB`);
         * ```
         *
         * ## 주의사항
         * - 메모리 사용량은 **추정값**이며 JavaScript 엔진의 최적화에 따라 실제 값과 다를 수 있다.
         * - 문자열 길이는 평균값(50자, 30자)으로 추정되므로 실제 데이터와 차이가 날 수 있다.
         * - 동적으로 캐시가 추가될 때마다 메모리 사용량이 증가한다.
         * - 대용량 데이터의 경우 정기적으로 `clearCache()`를 호출하여 메모리를 관리하는 것을 권장한다.
         *
         * @returns 메모리 사용량 정보 객체 (단위: 바이트)<br/>
         *         - **source**: 원본 데이터 소스 메모리
         *         - **aggTables**: 캐시된 집계 테이블 메모리 (모든 테이블의 합)
         *         - **pivotMatrices**: 캐시된 피벗 매트릭스 메모리 (모든 매트릭스의 합)
         *         - **total**: 전체 메모리 (source + aggTables + pivotMatrices)
         *
         * @example
         * ```typescript
         * // 기본 사용
         * const cube = new DataCube();
         * cube.setSource(dataViewSource);
         *
         * const usage = cube.getMemoryUsage();
         * console.log(`메모리 사용량: ${usage.total} 바이트`);
         * console.log(`소스: ${usage.source} 바이트`);
         * console.log(`집계: ${usage.aggTables} 바이트`);
         * console.log(`피벗: ${usage.pivotMatrices} 바이트`);
         * ```
         *
         * @example
         * ```typescript
         * // 메모리 단위 변환
         * const cube = new DataCube();
         * cube.setSource(dataViewSource);
         *
         * const usage = cube.getMemoryUsage();
         *
         * // 바이트 → KB
         * const totalKB = usage.total / 1024;
         * console.log(`총 메모리: ${totalKB.toFixed(2)}KB`);
         *
         * // 바이트 → MB
         * const totalMB = usage.total / 1024 / 1024;
         * console.log(`총 메모리: ${totalMB.toFixed(2)}MB`);
         * ```
         *
         * @example
         * ```typescript
         * // 메모리 성장 추적
         * const cube = new DataCube();
         * cube.setSource(dataViewSource);
         *
         * const memoryLog: { step: string; memory: number }[] = [];
         *
         * // 초기 상태
         * memoryLog.push({
         *   step: '초기',
         *   memory: cube.getMemoryUsage().total
         * });
         *
         * // 첫 번째 집계
         * cube.aggregate(['region'], ['sales']);
         * memoryLog.push({
         *   step: '집계1(region)',
         *   memory: cube.getMemoryUsage().total
         * });
         *
         * // 두 번째 집계
         * cube.aggregate(['product'], ['sales']);
         * memoryLog.push({
         *   step: '집계2(product)',
         *   memory: cube.getMemoryUsage().total
         * });
         *
         * // 피벗
         * cube.pivot(['region'], ['product'], 'sales');
         * memoryLog.push({
         *   step: '피벗(region×product)',
         *   memory: cube.getMemoryUsage().total
         * });
         *
         * // 메모리 성장 확인
         * for (const log of memoryLog) {
         *   console.log(`${log.step}: ${(log.memory / 1024).toFixed(2)}KB`);
         * }
         * ```
         *
         * @example
         * ```typescript
         * // 메모리 상한선 모니터링
         * const cube = new DataCube();
         * cube.setSource(dataViewSource);
         *
         * const MAX_MEMORY_MB = 100; // 100MB 상한선
         *
         * // 여러 집계 작업
         * const dimensions = [
         *   ['region'],
         *   ['product'],
         *   ['quarter'],
         *   ['region', 'product'],
         *   ['product', 'quarter'],
         *   ['region', 'quarter']
         * ];
         *
         * for (const dims of dimensions) {
         *   cube.aggregate(dims, ['sales', 'quantity']);
         *
         *   const usage = cube.getMemoryUsage();
         *   const usageMB = usage.total / 1024 / 1024;
         *
         *   console.log(`${dims.join('×')}: ${usageMB.toFixed(2)}MB`);
         *
         *   // 상한선 초과 시 캐시 제거
         *   if (usageMB > MAX_MEMORY_MB) {
         *     console.log('경고: 메모리 상한선 초과! 캐시를 제거합니다.');
         *     cube.clearCache();
         *   }
         * }
         * ```
         *
         * @see {@link clearCache} 캐시 제거하여 메모리 해제
         * @see {@link aggregate} 집계 테이블 생성
         * @see {@link pivot} 피벗 매트릭스 생성
         */
        getMemoryUsage(): {
            source: number;
            aggTables: number;
            total: number;
        };
        /**
         * 피벗 매트릭스 캐시 키를 생성한다.<br/>
         *
         * @param rowDimensions 행 차원 이름 배열
         * @param colDimensions 열 차원 이름 배열
         * @param measureName 측정값 이름
         * @returns 캐시 키
         */
        private $_generatePivotKey;
        /**
         * 지정된 차원 이름들이 유효한지 검증하고 메타데이터를 반환한다.<br/>
         *
         * @param dimensionNames 검증할 차원 이름 배열
         * @returns 유효한 차원 메타데이터 배열
         */
        private $_validateDimensions;
        /**
         * measure 사양 배열을 정규화하며 숫자 타입 검증을 수행한다.<br/>
         * 입력은 measure 이름 문자열 또는 {@link MeasureAlias} 객체이다.<br/>
         * alias 객체의 경우 base measure 의 source/type 을 상속받고 aggregate 만 override 한다.<br/>
         * 반환된 ColumnMeta 는 AggTable 안에서의 식별자(name) 와 실제 원본(source) 을 분리해 가진다.<br/>
         */
        private $_normalizeMeasures;
        /**
         * 주어진 measure 사양 배열을 measure 와 metric 으로 분리한다.<br/>
         * alias 객체는 항상 measure 로 취급된다 (metric 별칭은 지원하지 않음).<br/>
         * aggregate() 호출 시 사용되는 helper 메서드이다.
         *
         * @param items measure 사양 배열 (이름 문자열 또는 {@link MeasureAlias})
         * @returns { measures: (string | MeasureAlias)[], metrics: string[] } 분리된 결과
             */
         private $_separateMeasuresAndMetrics;
         /**
          * AggTable에 metric 컬럼을 추가하고 계산한다.<br/>
          * metric은 post-aggregate로 이미 집계된 measure 값들을 사용해 계산된다.
          *
          * @param aggTable 집계 결과 테이블
          * @param metricNames 계산할 metric 이름 배열
          */
         private $_computeMetrics;
         /**
          * 스키마에서 정의된 모든 측정값을 반환한다.<br/>
          * 숫자 타입만 반환하며 role이 dimension인 경우 제외한다.<br/>
          */
         private $_getAllMeasures;
         /**
          * 부모 큐브의 AggTable을 현재 큐브(slice/dice된 큐브)에 맞게 필터링한다.<br/>
          *
          * 이 메서드는 slice/dice로 생성된 자식 큐브가 부모의 집계 결과를 재사용할 수 있도록 한다.<br/>
          * 부모의 AggTable에서 현재 큐브의 데이터에 해당하는 행만 필터링하여 새로운 AggTable을 생성한다.<br/>
          *
          * ## 최적화 효과
          * - 원본 데이터를 다시 스캔하지 않고 이미 집계된 테이블만 필터링
          * - 대용량 데이터에서 특히 효과적 (집계 결과 << 원본 데이터)
          * - 메모리 사용량 감소 (중복 집계 결과 생성 안 함)
          *
          * @param parentAgg 부모 큐브의 AggTable
          * @param dimensionNames 집계할 차원 이름 배열
          * @param measureNames 집계할 측정값 이름 배열
          * @returns 필터링된 AggTable, 재사용 불가능하면 null
          */
         private $_filterAggTable;
         /* Excluded from this release type: $_rebuildFilters */
         /**
          * 저장된 필터들을 DataSource에 적용한다.<br/>
          * slice/dice로 설정된 필터 조건들을 DataTableView로 변환하여 적용한다.<br/>
          *
          * @param source 필터를 적용할 원본 DataSource
          * @returns 필터링된 DataViewSource
          */
         private $_applyFiltersToSource;
         /* Excluded from this release type: $_cubeFiltersToMap */
         /* Excluded from this release type: $_getFilteredSource */
         /**
          * 데이터 소스의 메모리 사용량을 추정한다.<br/>
          *
          * @returns 추정된 메모리 사용량 (바이트)
          */
         private $_estimateSourceMemory;
         /**
          * 집계 테이블의 메모리 사용량을 추정한다.<br/>
          *
          * @param aggTable 집계 테이블
          * @returns 추정된 메모리 사용량 (바이트)
          */
         private $_estimateAggTableMemory;
        }

        /**
         * DataCubeManager는 여러 DataCube 인스턴스를 이름 기반으로 관리하는 컨테이너.<br/>
         */
        declare class DataCubeManager<T extends DataCube = DataCube> extends REventAware<DataCubeManagerEvents> {
            private _ds;
            private _cubes;
            constructor(ds: DataSet);
            get ds(): DataSet;
            names(): string[];
            cubes(): T[];
            first(): T | undefined;
            get(name?: string): T | undefined;
            has(name: string): boolean;
            forEach(callback: (name: string, cube: T) => void): void;
            add(options: DataCubeOptions): T;
            remove(name: string): boolean;
            protected _createCube(options: DataCubeOptions): T;
        }

        declare interface DataCubeManagerEvents {
            onDataCubeAdded(cm: DataCubeManager, cube: DataCube): void;
            onDataCubeRemoved(cm: DataCubeManager, cubeName: string): void;
        }

        /**
         * DataCube 생성 옵션 타입.<br/>
         * source는 단일 DataFrame 또는 StarSchema(스타 스키마)를 지정할 수 있다.<br/>
         */
        declare type DataCubeOptions = {
            /**
             * 큐브 이름.<br/>
             */
            name?: string;
            /**
             * 데이터 소스.<br/>
             * - DataFrame: 단일 테이블 (DataTable, DataTableView, RawTable 등)
             * - StarSchema: Fact + Dimension 테이블들로 구성된 스타 스키마
             * - string: DataSet 내 테이블 이름 (DataSet에서 해당 이름의 테이블을 찾아 큐브 생성)
             */
            source: any;
            /**
             * 큐브 스키마 (차원 + 측정값)<br/>
             */
            schema: CubeSchema;
            /**
             * 컬럼 기반 저장소 사용 여부 (기본값: true)<br/>
             * - true: ColumnStore 사용 (원시 데이터를 columnar format으로 변환)
             *   TypedArray 기반으로 메모리 효율과 성능 최적화
             * - false: DataViewSource 사용 (기존 DataFrame을 래핑, 복사 없음)
             *   빠른 큐브 생성이 필요하거나 메모리 절약이 중요한 경우
             */
            columnar?: boolean;
            /**
             * YTD/MTD/QTD/WTD 계산의 기준 날짜 (기본값: 현재 날짜)<br/>
             * - ytd: 연초부터 이 날짜까지의 누적값
             * - mtd: 월초부터 이 날짜까지의 누적값
             * - qtd: 분기 시작부터 이 날짜까지의 누적값
             * - wtd: 주 시작부터 이 날짜까지의 누적값
             */
            today?: Date;
            /**
             * 초기 필터 목록.<br/>
             * DataCube 생성 시 API 필터로 자동 적용된다.<br/>
             * CubeFilter 형식으로 지정하며, addFilter()와 동일하게 동작한다.<br/>
             */
            filters?: CubeFilter[];
            /**
             * 초기 Slicer 목록.<br/>
             * DataCube 생성 시 addSlicer()로 자동 등록된다.<br/>
             * 각 SlicerOptions.name이 Slicer를 식별하는 키로 사용된다.<br/>
             */
            slicers?: SlicerOptions[];
        };

        /**
         * 데이터 필드.<br/>
         */
        declare class DataField {
            _reader: (val: any) => any;
            _comparer: (val1: any, val2: any) => number;
            _expression: Expression | undefined;
            constructor(fieldOptions: DataFieldOptions | CalculatedFieldOptions);
            name: string;
            type: ValueType;
            header: string | undefined;
            required: boolean | undefined;
            defaultValue: any;
            expression: string | undefined;
            /**
             * 계산 필드 여부.<br/>
             */
            get isCalculated(): boolean;
        }

        /**
         * 데이터 필드 설정 옵션.<br/>
         */
        declare interface DataFieldOptions {
            /**
             * 필드 이름.<br/>
             */
            name: string;
            /**
             * 필드 유형.<br/>
             * 기본값은 ValueType.TEXT.<br/>
             */
            type?: ValueType;
            /**
             * 필드 헤더.<br/>
             * 지정하지 않으면 name과 동일하게 설정된다.<br/>
             */
            header?: string;
            /**
             * 필수 여부.<br/>
             */
            required?: boolean;
            /**
             * 기본값.<br/>
             */
            defaultValue?: any;
        }

        /**
         * DataTable, DataTableView 등 테이블 형태 데이터 소스의 기본 인터페이스.<br/>
         * DataView가 이미 javascript의 기본 타입 이름으로 사용되고 있어 DataFrame으로 명명함.<br/>
         */
        declare interface DataFrame {
            /**
             * 필드 수.<br/>
             */
            readonly fieldCount: number;
            /**
             * 행 수.<br/>
             */
            readonly rowCount: number;
            /**
             * 지정된 인덱스의 필드 이름을 반환한다.<br/>
             *
             * @param field 필드 인덱스
             * @returns 필드 이름
             */
            getFieldName(field: number): string;
            getFieldNames(): string[];
            /**
             * bound 체크를 하지 않고 지정된 위치의 값을 반환한다.<br/>
             *
             * @param row 행 인덱스
             * @param field 필드 인덱스
             * @returns 값
             */
            valueAt(row: number, field: number): any;
            /**
             * 지정된 위치의 필드 값을 반환한다.<br/>
             * row, field가 범위를 벗어나면 에러를 발생시킨다.<br/>
             *
             * @param row 행 인덱스
             * @param field 필드 이름 또는 인덱스
             * @returns 값
             */
            getValue(row: number, field: string | number): any;
            /**
             * 지정된 위치의 행 전체 필드 값을 배열로 반환한다.<br/>
             *
             * @param row 행 인덱스
             */
            getValues(row: number): any;
        }

        declare interface DataGridColumn {
            field: string;
            type: 'number' | 'string' | 'boolean' | 'date';
            label: string;
            width: number;
            x: number;
        }

        /**
         * DataSet은 여러 DataTable 또는 RawTable을 name 기반으로 관리하는 컨테이너입니다.<br/>
         * 테이블 간의 join 작업은 DataTable의 `join()` 메서드를 사용합니다.<br/>
         *
         * 제약: DataSet.join()에서 **왼쪽(left)** 테이블은 반드시 `DataTable` 이어야 합니다.<br/>
         * 오른쪽(right)은 `DataTable` 또는 `RawTable`을 지원합니다.<br/>
         *
         * @example
         * ```typescript
         * const ds = new DataSet();
         *
         * // left: DataTable (필수)
         * const left = new DataTable({
         *   fields: [ { name: 'id', type: 'text' }, { name: 'name', type: 'text' } ]
         * });
         * left.insertRow(0, ['1', 'Alice']);
         * ds.add('left', left);
         *
         * // right: DataTable 또는 RawTable
         * const right = new DataTable({
         *   fields: [ { name: 'id', type: 'text' }, { name: 'dept', type: 'text' } ]
         * });
         * right.insertRow(0, ['1', 'Engineering']);
         * ds.add('right', right);
         *
         * // DataSet을 통한 INNER JOIN
         * const joined = ds.join('left', 'right', 'joined', {
         *   type: 'inner',
         *   on: (l, r) => l[0] === r[0], // id 필드 인덱스 비교
         * });
         * ```
         */
        declare class DataSet extends DataSource<DataSetEvents> {
            private _tables;
            get tableCount(): number;
            /**
             * 모든 테이블을 반환합니다.<br/>
             *
             * @returns 테이블 배열
             */
            tables(): Array<DataTable | RawTable>;
            getAt(index: number): DataTable | RawTable | undefined;
            first(): DataTable | RawTable | undefined;
            /**
             * 모든 테이블 이름을 반환합니다.<br/>
             *
             * @returns 테이블 이름 배열
             */
            names(): string[];
            /**
             * 이름으로 테이블을 조회합니다.<br/>
             *
             * @param name 테이블 이름
             * @returns DataTable 또는 RawTable 인스턴스, 없으면 undefined
             */
            get(name: string): DataTable | RawTable | undefined;
            /**
             * 지정한 이름의 테이블이 존재하는지 확인합니다.<br/>
             *
             * @param name 테이블 이름
             * @returns 존재 여부
             */
            has(name: string): boolean;
            forEach(callback: (name: string, table: DataTable | RawTable) => void): void;
            /**
             * 테이블을 추가합니다.<br/>
             *
             * @param name 테이블 이름
             * @param table DataTable 또는 RawTable 인스턴스
             */
            add(name: string, table: DataTable | RawTable): void;
            /**
             * 테이블을 제거합니다.<br/>
             *
             * @param name 테이블 이름
             * @returns 제거 성공 여부
             */
            remove(name: string): boolean;
            /**
             * 모든 테이블을 제거합니다.<br/>
             */
            clear(): void;
            /**
             * 두 테이블을 join하여 새로운 DataTable을 생성하고 DataSet에 추가합니다.<br/>
             * 왼쪽 테이블(`leftName`)은 반드시 `DataTable`이어야 합니다.<br/>
             *
             * @param leftName 왼쪽 테이블의 이름 (DataTable)
             * @param rightName 오른쪽 테이블의 이름 (DataTable 또는 RawTable)
             * @param resultName join 결과 테이블의 이름
             * @param options join 옵션 (type, on 등)
             * @returns join 결과 DataTable
             * @throws 지정한 테이블이 없는 경우 에러
             */
            join(leftName: string, rightName: string, resultName: string, options: JoinOptions): DataTable;
        }

        declare interface DataSetEvents {
            onTableAdded(dataset: DataSet, name: string, table: DataTable | RawTable): Promise<void> | void;
            onTableRemoved(dataset: DataSet, name: string): Promise<void> | void;
        }

        /**
         * 데이터 소스의 기본 클래스.<br/>
         */
        declare abstract class DataSource<T = any> extends REventAware<T> {
            protected _throwDataError(message: string): never;
        }

        /**
         * in-memory data table.<br/>
         */
        declare class DataTable extends DataSource<DataTableEvents> implements DataFrame {
            private _options;
            private _fields;
            private _fieldMap;
            private _rows;
            private _originalRows;
            private _nextRowId;
            private _deletedCount;
            private _checkStates;
            private _softDeleting;
            private _sortCriteria;
            private _filter;
            private _calcFieldStart;
            private _operationMutex;
            private _operationQueue;
            constructor(config: DataTableOptions);
            /**
             * 테이블 이름.<br/>
             */
            get name(): string;
            set name(value: string);
            /**
             * 필드 목록.<br/>
             */
            get fields(): DataField[];
            /**
             * 일반 필드 목록.<br/>
             */
            get dataFields(): DataField[];
            /**
             * 계산 필드 목록.<br/>
             */
            get calculatedFields(): DataField[];
            /**
             * 필드 수.<br/>
             */
            get fieldCount(): number;
            /**
             * 일반 필드 개수.<br/>
             */
            get dataFieldCount(): number;
            /**
             * 계산 필드 개수.<br/>
             */
            get calculatedFieldCount(): number;
            /**
             * 행 수.<br/>
             */
            get rowCount(): number;
            /**
             * 삭제된 행을 실제로 제거하지 않고 상태만 DELETED로 변경하는지 여부.<br/>
             */
            get softDeleting(): boolean;
            /**
             * {@page softDeleting}이 true일 때, 삭제된 행의 수를 반환한다.<br/>
             */
            get deletedRowCount(): number;
            /**
             * 필드 이름으로 필드 인덱스를 조회한다.<br/>
             * undefined >= 0 비교가 hasOwnProperty보다 빠르므로 이 방식을 사용한다.
             *
             * @param fieldName 필드 이름
             * @returns 필드 인덱스 (존재하지 않으면 -1)
             */
            getFieldIndex(fieldName: string): number;
            getFieldName(fieldIndex: number): string;
            /**
             * 모든 필드 이름을 반환한다.<br/>
             *
             * @returns 필드 이름 배열
             */
            getFieldNames(): string[];
            _internalGetField(fieldIndex: number): DataField;
            _internalFields(): DataField[];
            getField(field: string | number): DataField;
            /**
             * 필드를 추가한다.<br/>
             *
             * @param fieldOptions 필드 옵션
             */
            addField(fieldOptions: DataFieldOptions): void;
            /**
             * 계산 필드를 추가한다.<br/>
             * 기존 행들에 대해 즉시 수식을 평가한다.
             *
             * @param options 계산 필드 옵션
             */
            addCalculatedField(options: CalculatedFieldOptions): void;
            /**
             * 필드를 제거한다.<br/>
             * 지정한 필드가 존재하지 않으면 오류가 발생한다.
             *
             * @param field 필드 이름 또는 인덱스
             */
            removeField(field: string | number): void;
            /**
             * 지정된 행의 상태를 반환한다.<br/>
             *
             * @param row 행 번호
             * @returns 행 상태. row가 유효하지 않으면 오류 발생
             */
            getRowState(row: number): RowState | undefined;
            /**
             * 지정된 행의 이전 상태를 반환한다.<br/>
             *
             * @param row 행 번호
             * @returns 이전 행 상태. row가 유효하지 않으면 오류 발생
             */
            getPrevRowState(row: number): RowState | undefined;
            /**
             * 지정된 상태를 가진 행들의 인덱스를 반환한다.<br/>
             *
             * @param state 행 상태
             * @returns 지정된 상태를 가진 행들의 인덱스 배열
             */
            getStateRows(state: RowState): number[];
            _internalGetRowValues(row: number): RowValues;
            /**
             * bounds 체크를 하지 않고 지정된 행과 필드 인덱스의 값을 반환한다.<br/>
             *
             * @param row 행 번호
             * @param fieldIndex 필드 인덱스
             * @returns 필드 값
             */
            valueAt(row: number, fieldIndex: number): any;
            /**
             * 지정된 행의 고유 ID를 반환한다.<br/>
             *
             * @param row 행 번호
             * @returns 고유 ID. row가 유효하지 않으면 오류 발생
             */
            getRowId(row: number): number;
            /**
             * 지정된 행의 원본 값을 반환한다.<br/>
             * 행이 변경되지 않았으면 undefined를 반환한다.
             *
             * @param row 행 번호
             * @returns 원본 값 배열. row가 유효하지 않으면 오류 발생
             */
            getOrgValue(row: number): RowValues | undefined;
            /**
             * 지정된 범위의 행들의 원본 값을 반환한다.<br/>
             * 변경되지 않은 행은 undefined를 반환한다.
             *
             * @param startRow 시작 행 번호
             * @param endRow 종료 행 번호. 기본값은 -1 (0보다 작으면 마지막 행)
             * @returns 원본 값 배열. startRow 또는 endRow가 유효하지 않으면 오류 발생
             */
            getOrgValues(startRow: number, endRow?: number): (RowValues | undefined)[];
            /**
             * 지정된 행과 필드의 값을 반환한다.<br/>
             * 필드 인덱스 또는 필드 이름으로 접근 가능하다. 대량 반복 호출 시 {@page valueAt} 사용 권장.
             *
             * @param row 행 번호
             * @param field 필드 인덱스 또는 필드 이름
             * @returns 필드 값
             */
            getValue(row: number, field: string | number): any;
            getValues(row: number): any;
            /**
             * 지정된 행에 데이터가 존재하는지 여부를 반환한다.<br/>
             *
             * @param row 행 번호
             * @returns 데이터 존재 여부. row가 유효하지 않으면 오류 발생
             */
            hasData(row: number): boolean;
            /**
             * 지정된 행의 값을 배열로 반환한다.<br/>
             *
             * @param row 행 번호
             * @returns 행 값 배열. row가 유효하지 않으면 오류 발생
             */
            getRow(row: number): RowValues;
            /**
             * 지정된 범위의 행 값을 배열로 반환한다.<br/>
             *
             * @param startRow 시작 행 번호. 기본값은 0
             * @param endRow 종료 행 번호. 기본값은 -1 (0보다 작으면 마지막 행)
             * @returns 행 값 배열. startRow 또는 endRow가 유효하지 않으면 오류 발생
             */
            getRows(startRow?: number, endRow?: number): RowValues[];
            /**
             * 지정된 행의 값을 객체로 반환한다.<br/>
             *
             * @param row 행 번호
             * @returns 행 값 객체. row가 유효하지 않으면 오류 발생
             */
            getRowObject(row: number): RowObject;
            /**
             * 지정된 범위의 행 값을 객체 배열로 반환한다.<br/>
             *
             * @param startRow 시작 행 번호. 기본값은 0
             * @param endRow 종료 행 번호. 기본값은 -1 (0보다 작으면 마지막 행)
             * @returns 행 값 객체 배열. startRow 또는 endRow가 유효하지 않으면 오류 발생
             */
            getRowObjects(startRow?: number, endRow?: number): RowObject[];
            /**
             * 지정된 필드의 값을 배열로 반환한다.<br/>
             *
             * @param field 필드 인덱스 또는 필드 이름
             * @param fromRow 시작 행 번호. 기본값은 0
             * @param toRow 종료 행 번호. 기본값은 -1 (0보다 작으면 마지막 행)
             * @returns 필드 값 배열. fromRow 또는 toRow가 유효하지 않으면 오류 발생
             */
            getFieldValues(field: string | number, fromRow?: number, toRow?: number): any[];
            /**
             * 모든 행 데이터를 제거한다 (동기).<br/>
             * 동기 핸들러만 즉시 호출되고 비동기 핸들러는 무시된다.
             *
             * @returns 행이 제거되었으면 true, 이미 비어있었으면 false
             */
            clearRows(): boolean;
            /**
             * 모든 행 데이터를 제거한다 (비동기).<br/>
             * 동기/비동기 핸들러를 모두 호출하고 Promise를 반환하는 핸들러가 완료될 때까지 대기한다.
             *
             * @returns 행이 제거되었으면 true, 이미 비어있었으면 false
             */
            clearRowsAsync(): Promise<boolean>;
            /**
             * 행 데이터를 설정한다 (동기).<br/>
             * 동기 핸들러만 즉시 호출되고 비동기 핸들러는 무시된다.
             *
             * @param rows 행 데이터 배열
             * @returns 설정된 행 수
             */
            setRows(rows: RowData[]): number;
            /**
             * 행 데이터를 설정한다 (비동기).<br/>
             * 동기/비동기 핸들러를 모두 호출하고 Promise를 반환하는 핸들러가 완료될 때까지 대기한다.
             *
             * @param rows 행 데이터 배열
             * @returns 설정된 행 수
             */
            setRowsAsync(rows: RowData[]): Promise<number>;
            setCsvRows(csv: string | CsvLoadResult, options?: CsvLoadOptions): number;
            setCsvRowsAsync(csv: string | CsvLoadResult, options?: CsvLoadOptions): Promise<number>;
            /**
             * 지정된 행과 필드의 값을 설정한다.<br/>
             * 필드 인덱스 또는 필드 이름으로 접근 가능하다.
             *
             * @param row 행 번호
             * @param field 필드 인덱스 또는 필드 이름
             * @param value 설정할 값
             * @param strict 엄격 비교 모드 여부. true이면 === 연산자로, false이면 == 연산자로 비교한다. (기본값: true)
             * @returns 값이 변경되었으면 true, 변경되지 않았으면 false. row가 유효하지 않으면 오류 발생
             */
            setValue(row: number, field: string | number, value: any, strict?: boolean): boolean;
            /**
             * 지정된 행과 필드의 값을 설정한다 (비동기).<br/>
             * 필드 인덱스 또는 필드 이름으로 접근 가능하다.
             *
             * @param row 행 번호
             * @param field 필드 인덱스 또는 필드 이름
             * @param value 설정할 값
             * @param strict 엄격 비교 모드 여부. true이면 === 연산자로, false이면 == 연산자로 비교한다. (기본값: true)
             * @returns 값이 변경되었으면 true, 변경되지 않았으면 false. row가 유효하지 않으면 오류 발생
             */
            setValueAsync(row: number, field: string | number, value: any, strict?: boolean): Promise<boolean>;
            /**
             * 지정된 행 데이터를 갱신한다 (동기).<br/>
             *
             * @param row 행 번호
             * @param values 행 데이터
             * @param strict 엄격 비교 모드 여부. true이면 === 연산자로, false이면 == 연산자로 비교한다. (기본값: true)
             * @returns 갱신 성공 여부. row가 유효하지 않으면 오류 발생
             */
            updateRow(row: number, values: RowData, strict?: boolean): boolean;
            /**
             * 지정된 행 데이터를 갱신한다 (비동기).<br/>
             *
             * @param row 행 번호
             * @param values 행 데이터
             * @param strict 엄격 비교 모드 여부. true이면 === 연산자로, false이면 == 연산자로 비교한다. (기본값: true)
             * @returns 갱신 성공 여부. row가 유효하지 않으면 오류 발생
             */
            updateRowAsync(row: number, values: RowData, strict?: boolean): Promise<boolean>;
            /**
             * 여러 행의 데이터를 갱신한다.<br/>
             *
             * @param row 시작 행 번호
             * @param values 행 데이터 배열
             * @param strict 엄격 비교 모드 여부. true이면 === 연산자로, false이면 == 연산자로 비교한다. (기본값: true)
             * @returns 갱신 성공 여부. 하나 이상의 행이 갱신되면 true
             */
            updateRows(row: number, values: RowData[], strict?: boolean): boolean;
            /**
             * 여러 행의 데이터를 갱신한다 (비동기).<br/>
             *
             * @param row 시작 행 번호
             * @param values 행 데이터 배열
             * @param strict 엄격 비교 모드 여부. true이면 === 연산자로, false이면 == 연산자로 비교한다. (기본값: true)
             * @returns 갱신 성공 여부. 하나 이상의 행이 갱신되면 true
             */
            updateRowsAsync(row: number, values: RowData[], strict?: boolean): Promise<boolean>;
            /**
             * 변경된 행을 원래 값으로 복원한다.<br/>
             *
             * @param row 행 번호
             */
            restoreUpdatedRow(row: number): void;
            /**
             * 변경된 행을 원래 값으로 복원한다 (비동기).<br/>
             *
             * @param row 행 번호
             */
            restoreUpdatedRowAsync(row: number): Promise<void>;
            /**
             * 삭제된 행을 복원한다.<br/>
             *
             * @param row 행 번호
             */
            restoreDeletedRow(row: number): void;
            /**
             * 삭제된 행을 복원한다 (비동기).<br/>
             *
             * @param row 행 번호
             */
            restoreDeletedRowAsync(row: number): Promise<void>;
            /**
             * 새로 추가된 행을 복원한다.<br/>
             *
             * @param row 행 번호
             */
            restoreCreatedRow(row: number): void;
            /**
             * 새로 추가된 행을 복원한다 (비동기).<br/>
             *
             * @param row 행 번호
             */
            restoreCreatedRowAsync(row: number): Promise<void>;
            /**
             * 변경되거나 삭제된 행을 복원하고 새로 추가된 행은 제거한다.<br/>
             *
             * @param row 행 번호
             */
            restoreRow(row: number): void;
            /**
             * 변경되거나 삭제된 행을 복원하고 새로 추가된 행은 제거한다 (비동기).<br/>
             *
             * @param row 행 번호
             */
            restoreRowAsync(row: number): Promise<void>;
            /**
             * 지정된 위치에 행을 삽입한다.<br/>
             * values가 배열인 경우 필드 순서대로, 객체인 경우 필드 이름으로 매핑한다.
             * 지정하지 않은 필드는 undefined로 설정된다.
             *
             * @param row 행 번호
             * @param values 행 데이터 (배열 또는 객체)
             * @returns 삽입 후의 전체 행 수. row가 유효하지 않으면 오류 발생
             */
            insertRow(row: number, values: RowData): number;
            /**
             * 행을 마지막에 추가한다.<br/>
             *
             * @param values 행 데이터 (배열 또는 객체)
             * @returns 추가 후의 전체 행 수
             */
            appendRow(values: RowData): number;
            /**
             * 지정된 위치에 행을 삽입한다 (비동기).<br/>
             * values가 배열인 경우 필드 순서대로, 객체인 경우 필드 이름으로 매핑한다.
             * 지정하지 않은 필드는 undefined로 설정된다.
             *
             * @param row 행 번호
             * @param values 행 데이터 (배열 또는 객체)
             * @returns 삽입 후의 전체 행 수. row가 유효하지 않으면 오류 발생
             */
            insertRowAsync(row: number, values: RowData): Promise<number>;
            /**
             * 행을 마지막에 추가한다 (비동기).<br/>
             *
             * @param values 행 데이터 (배열 또는 객체)
             * @returns 추가 후의 전체 행 수
             */
            appendRowAsync(values: RowData): Promise<number>;
            /**
             * 여러 행을 삽입한다.<br/>
             *
             * @param row 삽입할 위치 (0부터 시작)
             * @param values 삽입할 행 데이터 배열
             * @returns 삽입 후 전체 행 개수
             */
            insertRows(row: number, values: RowData[]): number;
            /**
             * 여러 행을 마지막에 추가한다.<br/>
             *
             * @param values 삽입할 행 데이터 배열
             * @returns 삽입 후 전체 행 개수
             */
            appendRows(values: RowData[]): number;
            /**
             * 여러 행을 삽입한다 (비동기).<br/>
             *
             * @param row 삽입할 위치 (0부터 시작)
             * @param values 삽입할 행 데이터 배열
             * @returns 삽입 후 전체 행 개수
             */
            insertRowsAsync(row: number, values: RowData[]): Promise<number>;
            /**
             * 여러 행을 마지막에 추가한다 (비동기).<br/>
             *
             * @param values 삽입할 행 데이터 배열
             * @returns 삽입 후 전체 행 개수
             */
            appendRowsAsync(values: RowData[]): Promise<number>;
            deleteRow(row: number): void;
            deleteRowAsync(row: number): Promise<void>;
            /**
             * 시작 행부터 지정된 개수만큼 행을 삭제한다.<br/>
             * 트랜잭션 방식으로 처리되며, 모든 행이 검증된 후 일괄 삭제된다.
             * 하나라도 유효하지 않으면 전체가 취소된다.
             *
             * @param row 시작 행 번호
             * @param count 삭제할 행 개수
             * @returns 삭제된 행 수
             */
            deleteRows(row: number, count: number): number;
            /**
             * 지정된 행 번호들을 삭제한다.<br/>
             * 트랜잭션 방식으로 처리되며, 모든 행이 검증된 후 일괄 삭제된다.
             * 하나라도 유효하지 않으면 전체가 취소된다.
             *
             * @param rows 삭제할 행 번호 배열
             * @returns 삭제된 행 수
             */
            deleteRows(rows: number[]): number;
            /**
             * 시작 행부터 지정된 개수만큼 행을 삭제한다 (비동기).<br/>
             * 트랜잭션 방식으로 처리되며, 모든 행이 검증된 후 일괄 삭제된다.
             * 하나라도 유효하지 않으면 전체가 취소된다.
             *
             * @param row 시작 행 번호
             * @param count 삭제할 행 개수
             * @returns 삭제된 행 수
             */
            deleteRowsAsync(row: number, count: number): Promise<number>;
            /**
             * 지정된 행 번호들을 삭제한다 (비동기).<br/>
             * 트랜잭션 방식으로 처리되며, 모든 행이 검증된 후 일괄 삭제된다.
             * 하나라도 유효하지 않으면 전체가 취소된다.
             *
             * @param rows 삭제할 행 번호 배열
             * @returns 삭제된 행 수
             */
            deleteRowsAsync(rows: number[]): Promise<number>;
            private $_load;
            private $_loadFields;
            /**
             * 계산 필드 간의 순환 참조를 검사한다.<br/>
             * 순환 참조가 발견되면 오류를 발생시킨다.
             *
             * @param calculatedFields 검사할 계산 필드 옵션 목록
             */
            private $_checkCircularReference;
            /**
             * 지정된 행의 계산 필드 값을 평가한다.<br/>
             * 계산 필드가 다른 계산 필드를 참조하는 경우, 정의된 순서대로 평가한다.
             *
             * @param dataRow 행 데이터
             */
            private $_evaluateCalculatedFields;
            private $_checkRowIndex;
            private $_checkFieldIndex;
            private $_clearRows;
            private $_jsonToArray;
            private $_readRowValues;
            private $_createRow;
            private $_initRows;
            private $_setRows;
            private $_parseCsv;
            private $_setRowState;
            private $_setRowStateAsync;
            private $_checkRequired;
            private $_checkRequiredFields;
            private $_setValue;
            private $_updateRow;
            private $_deleteRow;
            private $_deleteRowAsync;
            private $_insertRow;
            private $_restoreUpdatedRow;
            private $_restoreDeletedRow;
            private $_restoreCreatedRow;
            private $_deleteRowsRange;
            private $_deleteRowsRangeAsync;
            private $_deleteRows;
            private $_deleteRowsAsync;
            /**
             * 데이터를 정렬한다.<br/>
             * 원본 데이터의 행 순서를 변경한다.
             *
             * @param sort 정렬 함수, Expression 객체, 수식 문자열, 또는 정렬 기준 배열
             */
            sort(sort: SortFunction | Expression | string): void;
            sort(...criteria: SortCriteria[]): void;
            sort(field: string | number, order?: SortOrder): void;
            /**
             * 정렬을 해제한다.<br/>
             */
            clearSort(): void;
            /**
             * 데이터를 필터링한다.<br/>
             * 필터링된 행들만 보인다 (원본 데이터는 변경되지 않음).
             *
             * @param filter 필터 함수, Expression 객체, 또는 수식 문자열
             */
            filter(filter: FilterFunction | Expression | string): void;
            /**
             * 필터를 해제한다.<br/>
             */
            clearFilter(): void;
            /**
             * 필터링 및 정렬을 모두 해제한다.<br/>
             */
            clearSortAndFilter(): void;
            /**
             * 정렬/필터링을 적용하여 _rows 배열을 재정렬한다.<br/>
             * 원본 상태는 _originalRows에 보관한다.
             */
            private $_applySortAndFilter;
            /**
             * 다른 DataTable과 조인한다.<br/>
             *
             * @param other 조인할 DataTable
             * @param options 조인 옵션 (type, on 콜백함수)
             * @returns 조인된 새로운 DataTable
             */
            join(other: DataTable | RawTable, options: JoinOptions): DataTable;
            /**
             * RawTable을 DataTable로 변환합니다.<br/>
             /**
             * 뮤텍스 패턴으로 작업을 순차 실행한다.<br/>
             * 동시에 호출된 async 메소드들이 순차적으로 실행되도록 보장한다.
             * Queue 모드(beginQueue ~ endQueue)일 때는 큐에 작업을 추가하고,
             * 일반 모드일 때는 Promise 체인으로 순차 실행한다.
             *
             * @param operation 실행할 작업
             * @returns 작업 결과
             */
            private $_runWithMutex;
            /**
             * Queue 모드 시작
             * 이 메소드 호출 후 모든 비동기 메소드는 큐에 추가되며,
             * endQueue() 호출 시 순차적으로 처리됩니다.
             * 대량의 작업을 효율적으로 처리할 때 사용합니다.
             *
             * **사용 필수 사유:**
             * Promise 체인 모드에서 async 메소드를 대량 호출하면:
             * - 1000개 호출 → 1000개 Promise 객체가 메모리에 유지됨
             * - Promise 체인이 깊어져서 콜 스택 오버헤드 증가
             * - Event loop 부하 증가 (다른 작업 응답성 저하)
             * - 메모리 사용량 증가로 GC 압력 증가
             *
             * Queue 모드 사용 시:
             * - Promise 객체 생성 최소화 (효율적 구조)
             * - Event loop에 더 공평한 작업 분배
             * - 메모리 효율성 향상
             *
             * @example
             * // 1000개 작업: Queue 모드 권장
             * await table.beginQueue();
             * for (let i = 0; i < 1000; i++) {
             *     table.updateRowAsync(i, data);  // 큐에 추가
             * }
             * await table.endQueue();  // 순차 처리
             *
             * @throws Error 이미 Queue 모드가 활성화된 경우
             * @see endQueue 모드 종료
             */
            beginQueue(): Promise<void>;
            /**
             * Queue 모드 종료
             * beginQueue() 이후 큐에 추가된 모든 작업을 순차적으로 처리합니다.
             *
             * @throws Error Queue 모드가 활성화되지 않은 경우
             */
            endQueue(): Promise<void>;
        }

        declare interface DataTableEvents {
            onFieldAdded(table: DataTable, fieldIndex: number): Promise<void> | void;
            onFieldRemoved(table: DataTable, fieldIndex: number): Promise<void> | void;
            onDataChanged(table: DataTable): Promise<void> | void;
            onRowStateChanged(table: DataTable, row: number, newState: RowState | undefined, oldState: RowState | undefined): Promise<void> | void;
            onRowsCleared(table: DataTable): Promise<void> | void;
            onRowsSet(table: DataTable, newRowCount: number, oldRowCount: number): Promise<void> | void;
            onValueChanging(table: DataTable, row: number, fieldIndex: number, newValue: any, oldValue: any): Promise<boolean> | boolean;
            onValueChanged(table: DataTable, row: number, fieldIndex: number, newValue: any, oldValue: any): Promise<void> | void;
            onRowUpdating(table: DataTable, row: number, values: RowData): Promise<boolean> | boolean;
            onRowUpdated(table: DataTable, row: number): Promise<void> | void;
            onRowsUpdating(table: DataTable, startRow: number, count: number): Promise<boolean> | boolean;
            onRowsUpdated(table: DataTable, updatedRows: number[]): Promise<void> | void;
            onRowInserting(table: DataTable, row: number, values: RowData): Promise<boolean> | boolean;
            onRowInserted(table: DataTable, row: number): Promise<void> | void;
            onRowsInserting(table: DataTable, row: number, count: number): Promise<boolean> | boolean;
            onRowsInserted(table: DataTable, startRow: number, count: number): Promise<void> | void;
            onRowDeleting(table: DataTable, row: number): Promise<boolean> | boolean;
            onRowDeleted(table: DataTable, row: number): Promise<void> | void;
            onRowsDeleting(table: DataTable, rows: number[]): Promise<boolean> | boolean;
            onRowsDeleted(table: DataTable, deletedRows: number[]): Promise<void> | void;
            onRowRestored(table: DataTable, row: number, oldState: RowState | undefined): Promise<void> | void;
        }

        /**
         * 데이터 테이블 설정 옵션.<br/>
         */
        declare interface DataTableOptions {
            /**
             * 테이블 이름.<br/>
             */
            name?: string;
            /**
             * 데이터 필드 옵션 목록.<br/>
             */
            fields: DataFieldOptions[];
            /**
             * 계산 필드 옵션 목록.<br/>
             * Expression 수식을 이용해 자동 계산되는 필드들을 정의한다.<br/>
             * 일반 fields 뒤에 추가되며, 정의 순서대로 평가된다.<br/>
             */
            calculatedFields?: CalculatedFieldOptions[];
            /**
             * true인 경우 삭제된 행은 실제로 삭제되지 않고 상태만 DELETED로 변경된다.<br/>
             * keepRowState가 true인 경우에만 적용된다. 기본값은 false.<br/>
             */
            softDeleting?: boolean;
            /**
             * true인 경우 data 변경 시 행의 상태(row state)를 유지한다.<br/>
             * false인 경우 데이터 변경 시 상태를 추적하지 않는다. 기본값은 true.<br/>
             */
            keepRowState?: boolean;
        }

        /**
         * 날짜 필드 분해 레벨 타입.<br/>
         * year: 연도, half: 반기, quarter: 분기, month: 월, week: 주(월중), day: 일(월중), hour: 시간, minute: 분, second: 초<br/>
         * weekOfYear: ISO 8601 연중 주차(1-53), dayOfYear: 연중 일차(1-366), dayOfWeek: ISO 요일(1=월요일 ~ 7=일요일), weekOfMonth: 월중 주차(1-6)<br/>
         * ytd: 연초부터 기준 날짜까지 누적, mtd: 월초부터 기준 날짜까지 누적, qtd: 분기 시작부터 기준 날짜까지 누적, wtd: 주 시작부터 기준 날짜까지 누적, htd: 반기 시작부터 기준 날짜까지 누적<br/>
         * "이름;레벨" 형식으로 커스텀 이름 지정 가능 (예: "판매분기;quarter")<br/>
         */
        declare type DateField = 'year' | 'half' | 'quarter' | 'month' | 'week' | 'day' | 'hour' | 'minute' | 'second' | 'weekOfYear' | 'dayOfYear' | 'dayOfWeek' | 'weekOfMonth' | 'ytd' | 'mtd' | 'qtd' | 'wtd' | 'htd' | string;

        /**
         * 날짜 범위 프리셋 타입.<br/>
         */
        declare type DateRangePreset = 'today' | 'yesterday' | 'last7days' | 'last30days' | 'thisWeek' | 'lastWeek' | 'thisMonth' | 'lastMonth' | 'thisQuarter' | 'lastQuarter' | 'thisYear' | 'lastYear' | 'custom';

        /**
         * //TODO: Intl.DateTimeFormat 사용할 것.
         */
        declare class DatetimeFormatter {
            private static readonly Formatters;
            static getFormatter(format: string): DatetimeFormatter;
            static get Default(): DatetimeFormatter;
            private _format;
            private _baseYear;
            private _preserveTime;
            private _tokens;
            private _hasAmPm;
            private _formatString;
            constructor(format: string);
            /** format */
            get format(): string;
            /** formatString */
            get formatString(): string;
            set formatString(value: string);
            toStr(date: Date, startOfWeek: number): string;
            private parseDateFormatTokens;
            private parse;
        }

        /**
         * 차원(컬럼/행) 필드 섹션 Model.
         * 컬럼 또는 행 필드들을 관리.
         */
        declare class DimensionFieldSection extends InspectorFieldSection<InspectorDimensionField> {
            readonly dimensionType: DimensionType;
            private _menu;
            private _fieldMenu;
            constructor(panel: PivotFieldPanel, dimensionType: DimensionType);
            protected _createField(model: PivotField): InspectorDimensionField;
            getMenu(): PopupMenu;
            getFieldMenu(field: InspectorDimensionField): PopupMenu;
            canDrop(data: IFieldDragData): boolean;
            private $_createMenus;
        }

        /**
         * 차원(필드) 정렬 설정.
         */
        declare interface DimensionFieldSort {
            /** 정렬 유형 */
            type: DimensionFieldSortType;
            /**
             * 정렬 방향.
             * - `'asc' | 'desc'`: 일반 정렬.
             * - `'none'`: 명시적으로 "정렬 안 함" 상태. UI에서 정렬 토글(asc → desc → none)을 표현할 때 사용한다.
             *   기본 fallback (scope: `'unset'`) 은 이 필드를 "명시 설정됨"으로 간주하여 fallback 을 적용하지 않는다.
             *   fallback 의 scope 가 `'all'` 이면 `'none'` 인 필드에도 fallback 이 적용된다.
             */
            direction: 'asc' | 'desc' | 'none';
            /** 'value' 정렬 시: 정렬 기준 측정값 (인덱스 또는 필드명, 기본: 0) */
            measure?: number | string;
            /**
             * 'value' 정렬 시: 반대편 축의 대상 위치.
             * - 행 차원 정렬일 땐 열 위치, 열 차원 정렬일 땐 행 위치를 의미한다.
             * - number: 반대편 축의 리프 인덱스 (= 전체 차원 길이 string[]로 동일 leaf 경로를 지정한 것과 동치).
             * - string[]: dimension label 배열로 그룹 위치 지정 (예: ['Q1', '01'], ['Q1']).
             *             해당 그룹의 값 기준으로 정렬. 마지막 라벨이 leaf가 아니면 해당 레벨의 소계 기준으로 정렬.
             * - 'total': Grand Total.
             * - 미지정 또는 []: 'total' 과 동일하게 처리됨.
             */
            target?: number | string[] | 'total';
            /** 'custom' 정렬 시: 사용자 정의 값 순서 */
            values?: (string | number | null)[];
            /** 'callback' 정렬 시: 비교 함수 */
            compareFn?: (a: string, b: string, params: DimensionFieldSortCallbackParams) => number;
        }

        /**
         * 차원 정렬 콜백 함수 파라미터.
         */
        declare interface DimensionFieldSortCallbackParams {
            /** 정렬 대상 축 */
            axis: 'row' | 'column';
            /** 비교 중인 필드의 차원 인덱스 (해당 축 내에서) */
            dimensionIndex: number;
            /** A의 전체 레이블 배열 (정렬 대상 축의 레이블) */
            labelsA: string[];
            /** B의 전체 레이블 배열 */
            labelsB: string[];
            /** A의 소계 배열 (각 측정값별) */
            subtotalsA: number[];
            /** B의 소계 배열 (각 측정값별) */
            subtotalsB: number[];
        }

        /**
         * 차원(필드) 정렬 유형.
         * - **'label'**: 차원 값(레이블) 기준 정렬
         * - **'value'**: 반대편 축의 특정 행/열 값 기준 정렬 (target 미지정 시 Grand Total)
         * - **'custom'**: 사용자 정의 값 순서로 정렬
         * - **'callback'**: 사용자 정의 비교 함수로 정렬
         */
        declare type DimensionFieldSortType = 'label' | 'value' | 'custom' | 'callback';

        /**
         * 스타 스키마의 Dimension 테이블 연결 정의.<br/>
         * Fact 테이블 또는 다른 Dimension 테이블에서 Dimension 테이블로의 연결을 정의한다.<br/>
         * 테이블은 DataSet에 등록된 이름으로 참조한다.<br/>
         */
        declare type DimensionLink = {
            /**
             * DataSet에 등록된 Dimension 테이블 이름.<br/>
             */
            table: string;
            /**
             * 테이블 별칭 (선택사항).<br/>
             * 스키마에서 컬럼 참조 시 사용 (예: 'product.name')<br/>
             * 생략 시 table 이름을 alias로 사용.<br/>
             * 같은 테이블을 여러 역할(role-playing)로 쓸 때는 alias가 반드시 달라야 한다.<br/>
             */
            alias?: string;
            /**
             * FK(Foreign Key) 컬럼명.<br/>
             * from이 생략되면 Fact 테이블의 컬럼, 지정되면 해당 alias 테이블의 컬럼이다.<br/>
             */
            foreignKey: string;
            /**
             * Dimension 테이블의 PK(Primary Key) 컬럼명.<br/>
             * 생략 시 첫 번째 컬럼을 PK로 사용.<br/>
             */
            primaryKey?: string;
            /**
             * FK가 위치한 소스 테이블의 alias.<br/>
             * - 생략: Fact 테이블의 FK (순수 star)<br/>
             * - 다른 dimension alias: snowflake chain (해당 dim에서 이어지는 link)<br/>
             * 순환 참조는 허용되지 않는다 (DAG).<br/>
             */
            from?: string;
        };

        /**
         * 큐브의 차원 타입 정의.<br/>
         */
        declare type DimensionMeta = {
            name: string;
            descirption?: string;
            source?: string | ((row: any) => any);
            type: 'i32' | 'str' | 'date';
            parentDimension?: string;
            dateFields?: DateField[];
            sourceFieldName?: string;
            dateLevel?: DateField;
            /**
             * 가상 차원 여부 (원본 date 컬럼 제외).<br/>
             * dateFields로 분해된 date 차원에서 true로 지정하면, 분해된 컬럼들만 큐브에 추가하고
             * 원본 date 컬럼은 큐브 columns에서 완전히 제외한다(메타·데이터 모두 생성하지 않음).<br/>
             * 원본 date 값으로 필터/슬라이서를 참조할 필요가 없을 때 사용한다.<br/>
             * @example
             * ```typescript
             * dimensions: [
             *   { name: 'order_date', type: 'date', dateFields: ['year', 'month'], virtual: true }
             * ]
             * // order_date 컬럼은 큐브에 존재하지 않고, order_date.year / order_date.month 만 존재
             * ```
             */
            virtual?: boolean;
            /**
             * 차원의 기본 정렬 순서.<br/>
             * 집계 결과에서 이 차원의 값들을 정렬할 기준을 정의한다.<br/>
             * AggTable 집계 후, PivotMatrix 생성 시 자동 적용된다.<br/>
             */
            sortBy?: DimensionSortOption;
        };

        /**
         * 차원 정렬 옵션 타입.<br/>
         * 차원(Dimension)의 기본 정렬 순서를 정의한다.<br/>
         */
        declare type DimensionSortOption = {
            /**
             * 정렬 방향.<br/>
             * - 'asc': 오름차순
             * - 'desc': 내림차순
             */
            order: 'asc' | 'desc';
            /**
             * 정렬 기준 (기본값: 'label').<br/>
             * - 'label': 문자열 사전순 정렬
             * - 'numeric': 숫자 인식 정렬 (e.g., 'A2' < 'A10')
             */
            type?: 'label' | 'numeric';
            /**
             * 커스텀 정렬 순서.<br/>
             * 지정된 값들의 순서대로 정렬한다.<br/>
             * 예: ['Q1', 'Q2', 'Q3', 'Q4'] - 분기 순서 강제<br/>
             * 예: ['Jan', 'Feb', 'Mar', ...] - 월 순서 강제<br/>
             * customOrder에 없는 값은 order에 따라 뒤에 정렬된다.<br/>
             */
            customOrder?: string[];
        };

        /**
         * 축 타입 (컬럼/행)
         */
        declare enum DimensionType {
            COLUMN = "column",
            ROW = "row"
        }

        declare abstract class DockableView extends UIFlexElement { [key: string]: any; }

        /**
         * 드롭다운 selector 옵션.<br/>
         */
        declare interface DropdownSelectorOptions extends FilterSelectorOptions {
            /** @dummy */
            type?: typeof DropdownSelectorType;
            /**
             * 드롭다운에 생성할 최대 값 개수.<br/>
             *
             * @default 100
             */
            maxCount?: number;
            /**
             * 리스트 형태로 표시할 값 개수.<br/>
             *
             * @default 10
             */
            listCount?: number;
            /**
             * 드롭다운으로 표시될 때 한 번에 표시할 값 개수.<br/>
             *
             * @default 8
             */
            dropdownCount?: number;
            /**
             * TODO: 구현할 것.
             * 검색창 표시 여부.<br/>
             *
             * @default false
             */
            showSearchBox?: boolean;
            /**
             * 헤더에 표시되는 simple 모드에서 셀렉터의 최대 너비(px).<br/>
             * 숫자로 지정하면 px 단위로 해석한다.
             * 문자열로 지정하면 '%' 등 CSS width 값으로 해석한다.<br/>
             *
             * @default 'auto'
             */
            simpleWidth?: number | string;
            /**
             * 헤더에 표시되는 simple 모드에서 셀렉터의 최대 너비(px).<br/>
             * 숫자로 지정하면 px 단위로 해석한다.
             * 문자열로 지정하면 '%' 등 CSS width 값으로 해석한다.<br/>
             *
             * @default 300
             */
            simpleMaxWidth?: number | string;
            /**
             * 헤더에 표시되는 simple 모드에서 팝업 리스트의 최대 높이(px).<br/>
             *
             * @default 200
             */
            simpleListHeight?: number;
        }

        declare const DropdownSelectorType = "dropdown";

        /**
         * 드롭 위치 인디케이터 관리자.
         * 인디케이터 DOM 조작과 드롭 정보 보관만 담당.
         * 드롭 가능 여부 판단은 섹션에서 수행.
         */
        declare class DropIndicatorManager {
            private static _currentDragData;
            static setCurrentDragData(data: IFieldDragData | null): void;
            static getCurrentDragData(): IFieldDragData | null;
            private _indicator;
            private _dropSource;
            private _dropTarget;
            private _canDrop;
            constructor(doc: Document);
            setDropSource(source: IFieldDragData | null): this;
            show(section: FieldSectionView, index: number, canDrop: boolean): void;
            hide(): void;
            getDropInfo(): IDropInfo | null;
            /**
             * 인디케이터 top 위치 계산
             */
            private _calculateIndicatorTop;
        }

        /**
         * Edit command base.
         * 편집 행위 외에 다른 로직이 포함되지 않도록 한다.
         */
        declare abstract class EditCommand extends RObject {
            static createGroup(...commands: EditCommand[]): EditCommandGroup;
            static throwError(message: string): never;
            static throwFailed(message: string): never;
            abstract get source(): any;
            error: any;
            abstract undo(): void;
            abstract redo(redoing: boolean): any;
            run(): any;
        }

        /**
         * Edit command group base.
         * 하나 이상의 command를 동시에 실행하거나 undo한다.
         */
        declare class EditCommandGroup extends EditCommand {
            private _commands;
            constructor(commands: EditCommand[]);
            protected _doDispose(): void;
            get commands(): EditCommand[];
            undo(): void;
            redo(redoing: boolean): any;
            get source(): any;
        }

        /**
         * Edit command stack.
         * 커맨드는 반드시 이 객체를 통해서 실행되거나 undo 되어야 한다.
         */
        declare class EditCommandStack extends REventAware<EditCommandStackEvents> {
            private _commands;
            private _current;
            private _closed;
            private _undoing;
            private _redoing;
            protected _doDispose(): void;
            /** length */
            get length(): number;
            /** current */
            get current(): number;
            /** empty */
            get empty(): boolean;
            /** canUndo */
            get canUndo(): boolean;
            /** canRedo */
            get canRedo(): boolean;
            /** undoing */
            get undoing(): boolean;
            /** redoing */
            get redoing(): boolean;
            /** dirty */
            get dirty(): boolean;
            get(index: number): EditCommand;
            peek(): EditCommand;
            undo(): boolean;
            redo(redoing?: boolean): boolean;
            execute(command: EditCommand): any;
            flush(): void;
            /**
             * 현 위치를 marking한다. dirty는 마지막 marking 시점과 다른 경우 true가 된다.
             */
            close(): void;
            getHistory(all?: boolean): EditCommand[];
            protected _changed(oldCurrent: number, cmd: EditCommand): void;
            private $_shrink;
        }

        /**
         * Edit command stack owner spec.
         */
        declare interface EditCommandStackEvents {
            editCommandStackChanged(stack: EditCommandStack, cmd: EditCommand, undoable: boolean, redoable: boolean): void;
            editCommandStackDirtyChanged(stack: EditCommandStack): void;
            editCommandError(stack: EditCommandStack, command: EditCommand): void;
        }

        /**
         * 빈 셀(데이터 없음)에 사용할 값을 지정한다.<br/>
         * 리터럴 또는 컬럼 메타를 받아 값을 반환하는 함수로 지정 가능하다.<br/>
         *
         * - **'zero'**: 0으로 표시 (기본 fallback)
         * - **'null'**: null로 표시
         * - **'dash'**: "-"로 표시
         * - **'empty'**: 빈 문자열로 표시
         * - **'na'**: "N/A"로 표시
         * - **function**: `(columnMeta) => any` 로 measure 별 커스텀 값 결정
         *
         * 주의: 여기서 결정된 값은 **표시(display) / export 전용 fallback** 이다.
         * 집계(subtotal/total), value 정렬, value 필터는 빈 셀을 "데이터 없음" 으로
         * 취급하므로 이 값이 그쪽 계산에 흘러들지 않는다.
         */
        declare type EmptyValue = 'zero' | 'null' | 'dash' | 'empty' | 'na' | ((columnMeta: ColumnMeta | MeasureMeta) => any);

        declare type ExplorerMode = 'detail' | 'chart' | 'map' | 'ai';

        /**
         * 페이지에서 탐색기 패널이 붙는 위치.<br/>
         * - `bottom`: 피벗 뷰 아래쪽에 배치되고 상/하로 분할
         * - `right`: 피벗 뷰 오른쪽에 배치되고 좌/우로 분할
         * - `left`: 피벗 뷰 왼쪽에 배치되고 좌/우로 분할
         */
        export declare type ExplorerPosition = 'bottom' | 'left' | 'right';

        /**
         * 등록된 모든 명령의 meta를 JSON 배열 문자열로 반환한다.<br/>
         * 외부 agent도 내부 호출과 동일하게, 모든 도구에 예약 파라미터 reason을 마지막에 포함한 형태로 내보낸다.
         */
        export declare function exportAITools(): string;

        /**
         * 축(행 또는 열) 전체에 적용되는 fallback 정렬 설정.
         *
         * 각 차원에 `setFieldSort()` 로 명시 정렬이 지정되지 않았을 때 적용되는
         * 기본 정렬 규칙이다. 항상 `'value'` 타입으로 동작하며, 반대 축의 특정
         * 셀/그룹 소계/Grand Total 을 기준으로 같은 축의 모든 차원을 정렬한다.
         *
         * - 명시 `setFieldSort` 와는 완전히 독립적으로 보관된다.
         * - 명시 정렬이 있는 차원은 fallback 을 무시한다 (단, scope 가 `'all'` 인
         *   경우 명시 direction 이 `'none'` 인 차원도 fallback 으로 덮는다).
         * - measure 차원(`valuesAsRows` 시 행 측의 measure 레벨 등) 은 fallback
         *   대상에서 자동 제외된다.
         */
        declare interface FallbackFieldSort {
            /**
             * fallback 정렬 방향.
             * - `'asc' | 'desc'`: fallback 활성.
             * - `'none'`: fallback 비활성 (설정은 유지되며 UI 토글에 활용).
             */
            direction: 'asc' | 'desc' | 'none';
            /** 정렬 기준 측정값 (인덱스 또는 필드명, 기본 0). */
            measure?: number | string;
            /**
             * 반대 축의 대상 위치.
             * - `number`: 반대 축 리프 인덱스.
             * - `string[]` (전체 차원 수): 특정 리프 셀.
             * - `string[]` (부분 차원): 해당 prefix 의 그룹 소계.
             * - `'total'` 또는 [],  미지정: Grand Total.
             */
            target?: number | string[] | 'total';
            /**
             * 적용 범위.
             * - `'unset'` (기본): `setFieldSort` 가 전혀 없는 차원에만 적용.
             *   명시 direction 이 `'none'` 인 차원은 fallback 대상에서 제외.
             * - `'all'`: 위에 더해, 명시 direction 이 `'none'` 인 차원에도 fallback 을 적용.
             */
            scope?: 'unset' | 'all';
        }

        declare class FieldPanelBodyView extends UIElement { [key: string]: any; }

        /**
         * 필드 섹션 타입
         */
        declare enum FieldSectionType {
            ALL = "all",
            COLUMN = "column",
            ROW = "row",
            FILTER = "filter",
            VALUE = "value"
        }

        /**
         * 필드 섹션 추상 View 클래스.
         * FieldSectionModel을 참조하여 UI를 렌더링.
         * EventDelegator를 상속받아 드롭 이벤트를 자동으로 처리.
         */
        declare abstract class FieldSectionView<M extends InspectorFieldSection = InspectorFieldSection, FV extends InspectorFieldView = InspectorFieldView> extends UIElement {
            private static readonly DROP_TARGET_CLASS;
            private static readonly DROP_HOVER_CLASS;
            static isDropTarget(dom: Element): boolean;
            private _headerView;
            protected _contentElement: HTMLDivElement;
            protected _model: M;
            private _fieldPool;
            protected _fieldViews: FV[];
            private _listner;
            private _indicatorManager?;
            constructor(doc: Document, model: M, className: string, listener: IFieldSectionViewEvents);
            protected _doInit(doc: Document, model: M): void;
            get model(): M;
            get sectionType(): FieldSectionType;
            get contentView(): HTMLDivElement;
            canDrop(data: IFieldDragData): boolean;
            addFieldView(fieldElement: FV): void;
            findFieldView(fieldName: string): FV | undefined;
            getFieldView(elt: Element): FV | undefined;
            setIndicatorManager(manager: DropIndicatorManager | undefined): void;
            click(dom: Element): boolean;
            getPopupMenu(target: Element): PopupMenu | undefined;
            render(doc: Document): void;
            protected _doRender(model: M, views: FV[]): void;
            protected abstract _createFieldView(doc: Document): FV;
            protected _prepareFieldViews(doc: Document, count: number): FV[];
            /**
             * 교차 섹션 드롭을 Model 단일 경로로 처리
             */
            protected _handleCrossSectionDrop(data: IFieldDragData, dropIndex: number): void;
            /**
             * 드롭 인덱스 계산
             */
            private $_calculateDropIndex;
            protected _getFieldMenu(fieldElement: FV): PopupMenu | undefined;
            /**
             * 드래그 데이터 파싱
             */
            private $_parseDragData;
            /**
             * 필드 드래그 시작 처리 - 이미 배치된 같은 이름의 필드에 하이라이트 표시
             */
            onFieldDragStarted(data: IFieldDragData): void;
            /**
             * 필드 드래그 종료 처리 - 모든 하이라이트 제거
             */
            onFieldDragEnded(): void;
            /**
             * 드롭 처리 - 서브클래스에서 구현
             */
            protected _handleDrop(data: IFieldDragData, dropIndex: number): void;
            /**
             * 섹션 아이콘 반환
             */
            protected abstract _getSectionIcon(): string;
            onDragStart(_e: DragEvent): void;
            onDragEnd(_e: DragEvent): void;
            onDragOver(e: DragEvent): void;
            onDragLeave(e: DragEvent): void;
            onDrop(e: DragEvent): void;
        }

        /**
         * 필터 설정 (행/열 공통).
         * 한 필드당 label, value, topN 중 하나만 설정 가능.
         */
        declare interface FilterConfig {
            /** 필터 유형 */
            type: 'label' | 'value' | 'topN';
            /** 필터 대상 차원 필드명 */
            field: string;
            /** label 유형: 선택할 값 배열 (values 모드) */
            values?: any[];
            /** label 유형: true면 제외 (기본: false = 포함) */
            exclude?: boolean;
            /** label 유형: 연산자 (operator 모드) */
            operator?: LabelFilterOperator_2;
            /** label/value 유형: 연산자 피연산자 */
            operand?: string | number;
            /** label/value 유형: between 연산자의 두 번째 피연산자 */
            operand2?: string | number;
            /** label/value 유형: 사용자 정의 조건 함수 (predicate 모드) */
            predicate?: (value: any) => boolean;
            /** value/topN 유형: 측정값 이름 또는 인덱스 */
            measure?: string | number;
            /** value 유형: 연산자 (operator 모드) */
            valueOperator?: ValueFilterOperator;
            /** topN 유형: 개수 */
            limit?: number;
            /** topN 유형: true면 하위 N */
            ascending?: boolean;
        }

        /**
         * 필터 필드 섹션 Model.
         * 필터 필드들을 관리.
         */
        declare class FilterFieldSection extends InspectorFieldSection<InspectorFilterField> {
            constructor(panel: PivotFieldPanel);
            protected _createField(model: PivotField): InspectorFilterField;
            getMenu(): PopupMenu;
            getFieldMenu(field: InspectorFilterField): PopupMenu;
            private _menu;
            private _fieldMenu;
        }

        /**
         * 필터 함수.<br/>
         * values 배열과 원본 테이블의 행 인덱스를 받아서 해당 행을 포함할지 여부를 반환한다.
         * values는 undefined 이거나 필드 값이 없을 수 있다.<br/>
         * [주의] values 배열은 내부적으로 사용되므로 수정하거나 별도로 보관하지 말 것.<br/>
         *
         * @param values 행의 값 배열. undefined 이거나 필드 값이 없을 수 있음
         * @param row 원본 테이블의 행 인덱스
         */
        declare type FilterFunction = (values: any[], row: number) => boolean;

        /**
         * DataCube 수준의 필터 ui 모델.<br/>
         * 실행 시간 사용자가 필터 설정을 변경할 수 있도록 지원한다.<br/>
         * PivotTable과는 달리, PivotSlicer는 DataCube에 직접 연결되어 있으며,
         * 여러 PivotTable에서 공유될 수 있다.<br/>
         * PivotSlicer는 PivotTable의 특정 필드에 대한 필터링을 담당하며,
         * 사용자가 선택한 필터 조건에 따라 DataCube의 데이터를 동적으로 필터링한다.<br/>
         * 또한, PivotSlicer는 다양한 유형(버튼, 드롭다운, 트리, 타임라인)으로 표시될 수 있으며,
         * 각 유형은 사용자 인터페이스에서 다른 방식으로 표시되고 상호 작용할 수 있다.<br/>
         */
        declare abstract class FilterSelector<OP extends FilterSelectorOptions = FilterSelectorOptions> extends ROptionable<OP> {
            static defaults: Partial<FilterSelectorOptions>;
            protected _owner: IFilterSelectorOwner;
            private _name;
            protected _slicer: Slicer;
            private _tables;
            constructor(owner: IFilterSelectorOwner, name: string, slicer: Slicer, tables?: string[]);
            get name(): string;
            /**
             * 표시 여부.
             */
            get visible(): boolean;
            set visible(value: boolean);
            protected _isVisible(): boolean;
            get slicer(): Slicer;
            get tables(): string[] | undefined;
            get label(): string;
            get count(): string;
            get collapsed(): boolean;
            toggle(): void;
            /**
             * 현재 필터 적용 상태의 요약 텍스트를 반환한다.<br/>
             * collapsed 시 표시용.<br/>
             */
            getSummary(): string;
            getMenu(): PopupMenu;
            _optionChanged(tag?: any): void;
            protected _applyFilter(): void;
        }

        declare class FilterSelectorCollection extends RCollection<FilterSelector, FilterSelectorCollectionOptions> {
            private readonly owner;
            constructor(owner: IFilterSelectorOwner);
            protected get keyProp(): string;
            protected _normalizeOptions(items: any): any[];
            _optionChanged(tag?: string | string[]): void;
            protected _createItem(source?: any): FilterSelector;
        }

        declare interface FilterSelectorCollectionOptions extends RCollectionOptions {
        }

        /**
         * 필터 selector 공통 옵션.<br/>
         */
        declare interface FilterSelectorOptions extends ROptions {
            /**
             * 셀렉터 이름.<br/>
             * [주의] 생성 시 필수이며, 생성 후에는 변경할 수 없다.
             */
            name: string;
            /**
             * 셀렉터 유형.<br/>
             */
            type?: FilterSelectorTypes;
            /**
             * 셀렉터 표시 여부.<br/>
             *
             * @default true
             */
            visible?: boolean;
            /**
             * selector가 연결될 DataCube 이름.<br/>
             * 지정하지 않으면 기본 DataCube에 연결된다.<br/>
             */
            cube?: string;
            /**
             * selector가 연결될 큐브 슬라이서 필터 이름.<br/>
             */
            slicer?: string;
            /**
             * selector가 적용될 테이블 목록.<br/>
             * 지정하지 않으면 모든 테이블에 적용된다.<br/>
             */
            tables?: string[];
            /**
             * selector가 표시될 위치.<br/>
             * - header: 헤더 영역에 표시.<br/>
             * - panel: 필터 패널에 표시.<br/>
             * - both: header와 panel 모두에 표시.<br/>
             *
             * @default 'panel'
             */
            position?: 'header' | 'panel' | 'both';
            label?: string;
            description?: string;
            collapsed?: boolean;
        }

        /**
         * @dummy
         */
        declare type FilterSelectorOptionsTypes = ButtonSelectorOptions | DropdownSelectorOptions | TreeSelectorOptions | TimelineSelectorOptions | SliderSelectorOptions;

        /**
         * @dummy
         */
        declare type FilterSelectorTypes = typeof ButtonSelectorType | typeof DropdownSelectorType | typeof TreeSelectorType | typeof TimelineSelectorType | typeof SliderSelectorType;

        /**
         * 분석이 가리키는 **하나의 위치(셀/행) + 계산값**.<br/>
         * 새 데이터를 만들지 않고 기존 AggTable 의 어느 지점이 흥미로운지 알려준다.
         * `row`/`dims` 로 기존 피벗/그리드에서 바로 하이라이트할 수 있다.
         */
        declare interface Finding {
            /** 기존 AggTable.rows(필터 적용 뷰) 기준 행 인덱스. UI 하이라이트용. */
            row: number;
            /** 그 행의 차원 값 조합(=위치). 예: ['Seoul', 2025]. */
            dims: any[];
            /** 관련 measure 이름. */
            measure: string;
            /** 그 위치의 실제 값. */
            value: number;
            /** 분석이 계산한 지표값(zscore / 성장률% / 기여도% 등). 규칙마다 의미가 다르다. */
            metric?: number;
            /** 기준/기대값(평균·중앙값·이전 기간값 등). 있으면 value 와 비교 가능. */
            expected?: number;
            /** 심각도. flag 임계 초과 시 warning/critical, 그 외 info/ok. */
            severity: Severity;
            /** 어떤 규칙이 만든 finding 인지. 예: 'outlier-zscore', 'growth', 'contribution'. */
            rule: string;
            /** 사람이 읽는 설명(선택). */
            note?: string;
        }

        /**
         * {@link PivotValueFieldOptions.formatterStats} 옵션.
         *
         * 모든 속성이 생략되면 `cellScope='value'`, `compareScope='all'`, 합계/정렬 없이
         * `min`/`max`/`count`만 계산된다.
         */
        declare interface FormatterStatsOptions {
            /** 통계에 포함할 셀 레벨. 기본 `'value'`. */
            cellScope?: CellScope;
            /** 그룹 분리 축. 기본 `'all'`(분리 없이 전체 1개 그룹). */
            compareScope?: CompareScope;
            /** 합계/평균이 필요하면 `true`. */
            withSum?: boolean;
            /** 정렬된 값 배열(percentile/rank 계산용)이 필요하면 `true`. `withSum`도 자동 포함. */
            withSorted?: boolean;
        }

        /**
         * Google Gemini generateContent API를 직접 호출하는 로컬 모델.<br/>
         * system 메시지는 systemInstruction으로, 나머지는 contents(role user/model)로 변환하며
         * (assistant→model), tools는 functionDeclarations로 전달해 native function-calling을 사용한다.<br/>
         * Gemini의 functionCall.args는 이미 객체이므로 별도 JSON parse가 필요 없다.
         */
        export declare class GeminiModel extends AILocalModelImpl {
            /** 생성된 cachedContents 리소스 이름("cachedContents/xxx"). 미생성/폴백 시 undefined. */
            private _cacheName?;
            /** 현재 캐시가 대응하는 systemContext(변경 감지용). */
            private _cacheKey?;
            /** 캐시 생성이 실패(최소 토큰 미달 등)한 경우 재시도를 막는 폴백 플래그. */
            private _cacheDisabled;
            /** 캐시 생성 in-flight promise(동시 호출 dedupe). */
            private _cacheLoading?;
            protected _complete(messages: AIChatMessage[], tools: AIToolSchema[], toolChoice?: AIToolChoice): Promise<AIResponse>;
            /**
             * generateContent 요청 body를 구성한다(cacheName 유무로 캐시/인라인 경로 분기).<br/>
             * contents는 매 호출 새로 생성한다(캐시 재시도 시 이전 병합이 누적되지 않도록).<br/>
             * 캐시 사용 시 systemInstruction·tools는 캐시에 있으므로 요청에 넣지 않는다
             * (Gemini는 cachedContent와 이들의 동시 지정을 금지).
             */
            private $_buildGenerateBody;
            /** generateContent 엔드포인트로 POST하고 상태·본문 텍스트를 반환한다(본문은 1회만 읽는다). */
            private $_postGenerate;
            /** 등록된 도구를 Gemini functionDeclarations 블록으로 변환한다. */
            private $_buildToolsBlock;
            /** 실패 응답이 캐시 미스(만료·삭제된 cachedContent 참조)인지 판정한다. */
            private $_isCacheMiss;
            protected _getRagPath(): {
                embeddings: string;
                chunks: string;
                meta: string;
            };
            /** Gemini embedContent API로 query를 임베딩한다(RAG용). */
            protected _embed(text: string): Promise<Float32Array>;
            /** AIToolChoice를 Gemini functionCallingConfig로 매핑한다(auto는 기본이므로 undefined). */
            private $_toFunctionCallingConfig;
            /**
             * 캐시 미스로 판명된 stale cachedContent 참조를 버리고 다음 호출에서 재생성되게 한다.<br/>
             * systemContext(_cacheKey)는 그대로 두므로 동일 프롬프트면 재생성 경로를 탄다(폴백 비활성).
             */
            private $_invalidateContextCache;
            /**
             * systemContext에 대응하는 명시적 캐시(cachedContents) 이름을 보장한다.<br/>
             * systemContext가 바뀌면 캐시를 무효화하고 재생성하며, 생성 실패(최소 토큰 미달 등)는
             * 폴백 플래그를 세워 반복 실패를 막고 undefined(=인라인 systemInstruction)를 반환한다.
             */
            private $_ensureContextCache;
            /**
             * cachedContents 리소스를 생성한다(systemInstruction + tools를 함께 캐시).<br/>
             * Gemini는 cachedContent와 요청 내 systemInstruction/tools/toolConfig 동시 지정을 금지하므로,
             * 재사용 대상인 systemInstruction·tools를 캐시에 넣는다(toolConfig는 요청 단위라 제외).<br/>
             * 최소 토큰 미달 등 4xx는 예외 없이 undefined를 반환해 인라인 경로로 폴백한다.
             */
            private $_createContextCache;
        }

        export declare function getAITools(): AICommand[];

        export declare const getVersion: typeof Globals.getVersion;

        declare type GhostPosition = "left" | "right" | "float" | any;

        declare class Globals {
            /**
             * RealPivot2 라이브러리의 버전 정보를 리턴한다.<br/>
             *
             * ```js
             * console.log(RealPivot2.getVersion()); // ex) '1.1.2'
             * ```
             *
             * @returns 버전 문자열
             */
            static getVersion(): string;
            /**
             * RealPivot2의 licenseKey를 등록한다.
             */
            static setLicenseKey(key: string): void;
            static setLogging(enabled: boolean): void;
            static createDataSet(tableOptions: (PivotDataTableOptions | PivotStarSchemaOptions)[], loadOptions?: {
                indicator?: true | 'progress';
                control?: PivotControl;
            }): Promise<PivotDataSet>;
            static createCubeManager(ds: PivotDataSet, cubes: PivotCubeOptions[]): PivotCubeManager;
            static use(moduleId: string, moduleObject: any): void;
            static useAll(modules: Record<string, any>): void;
            static createControl(doc: Document, container: string | HTMLDivElement, cm?: PivotCubeManager, config?: PivotBookConfiguration, callback?: (book: PivotBook) => void): PivotControl;
        }

        /**
         * 그룹 셀들의 통계.
         *
         * `getStats()` 호출 시 전달한 옵션에 따라 일부 필드는 채워지지 않는다.
         */
        declare interface GroupStats {
            /** 셀 개수 (null/NaN 제외) */
            count: number;
            /** 최소값. count==0 이면 +Infinity */
            min: number;
            /** 최대값. count==0 이면 -Infinity */
            max: number;
            /** 합계. `withSum` 또는 `withSorted` 일 때만 의미 있음 (그 외엔 0). */
            sum: number;
            /** 내림차순 정렬된 값. `withSorted: true` 호출에서만 채워진다. */
            sorted?: number[];
            /** 평균. `withSum` 또는 `withSorted` 일 때 & `count > 0` 일 때만 있음. */
            readonly avg?: number;
        }

        declare type HeaderCellBuildInfo = { [key: string]: any; };

        declare abstract class HeaderCellView extends PivotCellView {
            getTooltip(table: PivotTable): string | undefined;
        }

        declare class HeaderView extends UIFlexElement {
            private _model;
            private _buttonBar;
            private _menuButton;
            private _floatButton;
            private _closeButton;
            constructor(doc: Document);
            protected _doInit(doc: Document, initData: any): void;
            protected _doDispose(): void;
            render(model: PivotInspector): void;
            click(element: Element): boolean;
            getPopupMenu(target: Element): PopupMenu | undefined;
        }

        declare class HeaderView_2 extends UIFlexElement {
            private _model;
            private _titleView;
            private _menuButton;
            private _closeButton;
            constructor(doc: Document, _model: PivotAiPanel);
            protected _doInit(doc: Document, initData: any): void;
            click(container: PivotAIContainer, target: Element): boolean;
            canDrag(target: Element): boolean;
            getPopupMenu(target: Element): PopupMenu | undefined;
            protected _doInitDom(doc: Document, dom: HTMLElement): void;
        }

        /**
         * 하이라이트 조건 유형.
         * - `'top'` / `'bottom'` : 상위/하위 N개 값 강조
         * - `'topPercent'` / `'bottomPercent'` : 상위/하위 N% 값 강조
         * - `'aboveAvg'` / `'belowAvg'` : 평균 이상/이하 강조
         * - `'greater'` / `'less'` : 지정값 초과/미만 강조
         * - `'greaterEqual'` / `'lessEqual'` : 지정값 이상/이하 강조
         * - `'between'` / `'notBetween'` : 범위 안/밖 강조
         * - `'equal'` / `'notEqual'` : 일치/불일치 강조
         * - `'in'` / `'notIn'` : 지정 값 목록(set) 중 하나와 일치/불일치
         */
        declare type HighlightType_2 = 'greater' | 'greaterEqual' | 'less' | 'lessEqual' | 'between' | 'notBetween' | 'equal' | 'notEqual' | 'in' | 'notIn' | 'top' | 'bottom' | 'topPercent' | 'bottomPercent' | 'aboveAvg' | 'belowAvg';

        /**
         * 체크 리스트용 개별 항목.<br/>
         */
        declare interface ICheckListItem {
            /** 값 식별자 */
            value: string;
            /** 표시 레이블 */
            label?: string;
            /** 체크 여부 */
            checked?: boolean;
        }

        /**
         * Icon overlay에서 `thresholds` 경계값의 해석 방식 및 자동 N등분 기준.
         * - `'percent'`    : 0~100 백분율 기준. `thresholds` 미지정 시 min~max 범위를 균등 N등분 (기본)
         * - `'percentile'` : 0~100 백분위수 기준. `thresholds` 미지정 시 분포 균등 N등분
         * - `'value'`      : 실제 데이터 값 기준. `thresholds`에 raw 값을 직접 지정 가능
         */
        declare type IconDivideMode = 'percent' | 'percentile' | 'value';

        /**
         * 아이콘 배치 방식.
         *
         * 텍스트 옆 배치 (text와 함께 셀 정렬을 따라 이동):
         * - `'auto'`  : 셀의 텍스트 정렬을 따라감(기본). right-align이면 텍스트 오른쪽, 그 외(left/center)는 텍스트 왼쪽.
         * - `'left'`  : 항상 텍스트 왼쪽.
         * - `'right'` : 항상 텍스트 오른쪽.
         *
         * 셀 가장자리 고정 (텍스트 정렬과 무관):
         * - `'start'` : 셀 왼쪽 edge에 고정.
         * - `'end'`   : 셀 오른쪽 edge에 고정.
         *
         * `iconOnly`(텍스트 숨김) 일 때:
         * - `'auto'`/`'left'`/`'right'` → 텍스트가 없어 의미가 없으므로 셀 중앙에 단독 표시.
         * - `'start'`/`'end'` → 그대로 가장자리 고정 유지.
         */
        declare type IconPlacement = 'auto' | 'start' | 'end' | 'left' | 'right';

        declare interface IControlEvents {
        }

        declare interface IControlTool {
            activate?(control: RControl<any>): void;
            deactivate?(control: RControl<any>): void;
            pointerDown(ev: PointerEvent): boolean;
            pointerMove(ev: PointerEvent): void;
            pointerUp(ev: PointerEvent): void;
            pointerCancel(ev: PointerEvent): void;
            pointerEnter(ev: PointerEvent): void;
            pointerLeave(ev: PointerEvent): void;
            pointerOver(ev: PointerEvent): void;
            touchStart(ev: TouchEvent): void;
            touchMove(ev: TouchEvent): void;
            touchEnd(ev: TouchEvent): void;
            click(ev: PointerEvent): void;
            dblClick(ev: PointerEvent): void;
            keyPress(ev: KeyboardEvent): void;
            wheel(ev: WheelEvent): void;
            keydown(ev: KeyboardEvent): void;
            keyup(ev: KeyboardEvent): void;
            keypress(ev: KeyboardEvent): void;
            contextMenu?(ev: MouseEvent): boolean;
        }

        declare interface IDataGridSource {
            get filtered(): boolean;
            getColumns(): DataGridColumn[];
            getRowCount(): number;
            getValue(row: number, column: number): any;
            dispose(): void;
        }

        declare interface IDataLoadIndicator {
            onDataLoad(progress: {
                tableCount: number;
                tableIndex: number;
                tableName?: string;
                current?: number;
                total?: number;
                parsed?: boolean;
                loaded?: boolean;
            }): void;
        }

        /**
         * 드롭 정보 인터페이스
         */
        declare interface IDropInfo {
            source: IFieldDragData;
            target: {
                section: FieldSectionView;
                index: number;
            };
            canDrop: boolean;
        }

        /**
         * 축(행 또는 열) 전체에 적용되는 fallback 정렬 설정.
         *
         * 각 차원에 `setFieldSort()` 로 명시 정렬이 지정되지 않았을 때 적용되는
         * 기본 정렬 규칙이다. 항상 `'value'` 타입으로 동작하며, 반대 축의 특정
         * 셀/그룹 소계/Grand Total 을 기준으로 같은 축의 모든 차원을 정렬한다.
         *
         * - 명시 `setFieldSort` 와는 완전히 독립적으로 보관된다.
         * - 명시 정렬이 있는 차원은 fallback 을 무시한다 (단, scope 가 `'all'` 인
         *   경우 명시 direction 이 `'none'` 인 차원도 fallback 으로 덮는다).
         * - measure 차원(`valuesAsRows` 시 행 측의 measure 레벨 등) 은 fallback
         *   대상에서 자동 제외된다.
         */
        declare interface IFallbackFieldSort {
            /**
             * fallback 정렬 방향.
             * - `'asc' | 'desc'`: fallback 활성.
             * - `'none'`: fallback 비활성 (설정은 유지되며 UI 토글에 활용).
             */
            direction: 'asc' | 'desc' | 'none';
            /** 정렬 기준 측정값 필드명. */
            measure?: string;
            /**
             * 반대 축의 대상 위치.
             * - `number`: 반대 축 리프 인덱스.
             * - `string[]` (전체 차원 수): 특정 리프 셀.
             * - `string[]` (부분 차원): 해당 prefix 의 그룹 소계.
             * - `'total'` 또는 미지정: Grand Total.
             */
            target?: string[] | 'total';
            /**
             * 적용 범위.
             * - `'unset'` (기본): `setFieldSort` 가 전혀 없는 차원에만 적용.
             *   명시 direction 이 `'none'` 인 차원은 fallback 대상에서 제외.
             * - `'all'`: 위에 더해, 명시 direction 이 `'none'` 인 차원에도 fallback 을 적용.
             */
            scope?: 'unset' | 'all';
        }

        /**
         * 드래그 데이터
         */
        declare interface IFieldDragData {
            fieldName: string;
            measure?: string;
            sourceSection: FieldSectionType;
        }

        declare interface IFieldSectionViewEvents {
            onFieldDragStarted(data: IFieldDragData): void;
            onFieldDragEnded(): void;
        }

        declare interface IFilterSelectorOwner {
            cubeManager: DataCubeManager;
            getSelectorPopupMenu: (selector: FilterSelector) => PopupMenu;
            onFilterSelectorChanged(selector: FilterSelector): void;
            onFilterSelectorAdded(selector: FilterSelector): void;
            onFilterSelectorRemoved(selector: FilterSelector): void;
            onFilterApply(selector: FilterSelector): void;
        }

        /**
         * 작업 진행 상태를 표시하는 인디케이터 뷰의 기반 클래스.<br/>
         * 지정한 컨테이너 위에 절대 위치로 덮어 표시한다.
         */
        declare abstract class IndicatorView extends UIElement {
            constructor(doc: Document, className: string);
            /**
             * 지정 컨테이너에 인디케이터를 부착하고 표시한다.<br/>
             * 컨테이너는 position이 static이 아니어야 절대 위치가 정상 동작한다.
             */
            showIndicator(container: HTMLElement): void;
            hideIndicator(): void;
        }

        /**
         * 차원(컬럼/행) 필드 컴포넌트를 위한 Model.
         * 필드 정보와 순서(order) 관리.
         */
        declare class InspectorDimensionField extends InspectorField {
            constructor(field: PivotField, dimensionType: DimensionType);
        }

        /**
         * 단일 필드 데이터를 관리하는 추상 Model 클래스.
         * UI 의존성 없이 필드 데이터만 관리.
         */
        declare abstract class InspectorField {
            protected _section: FieldSectionType;
            protected _model: PivotField;
            constructor(section: FieldSectionType, model: PivotField);
            get model(): PivotField;
            get index(): number;
            /**
             * 필드가 속한 섹션 타입
             */
            get section(): FieldSectionType;
            set section(value: FieldSectionType);
        }

        declare abstract class InspectorFieldSection<T extends InspectorField = InspectorField> {
            protected _panel?: PivotFieldPanel;
            protected _fields: T[];
            protected _sectionType: FieldSectionType;
            protected _title: string;
            constructor(panel: PivotFieldPanel, title: string, sectionType: FieldSectionType);
            get panel(): PivotFieldPanel;
            get book(): PivotBook;
            get table(): PivotTable<PivotTableOptions>;
            /**
             * 섹션 타입
             */
            get sectionType(): FieldSectionType;
            /**
             * 섹션 타이틀
             */
            get title(): string;
            /**
             * 필드 개수
             */
            get fieldCount(): number;
            setFields(fields: readonly PivotField[]): void;
            getFields(): T[];
            contains(fieldName: string): boolean;
            findField(fieldName: string): T | undefined;
            needUnique(): boolean;
            canAdd(field: InspectorField): boolean;
            /**
             * 필드 섹션 간 이동
             */
            moveToSection(field: T, targetSection: InspectorFieldSection, toIndex?: number): boolean;
            canDrop(data: IFieldDragData): boolean;
            abstract getMenu(): PopupMenu;
            abstract getFieldMenu(field: InspectorField): PopupMenu;
            protected abstract _createField(model: PivotField): T;
            private $_addField;
            /** section menus */
            protected _clearMenu: {
                id: string;
                label: string;
                hint: string;
                action: () => void;
            };
            /** field menus */
            protected _moveUpMenu: {
                id: string;
                label: string;
                disabled: (field: T) => boolean;
                action: (doc: Document, field: T) => void;
            };
            protected _moveDownMenu: {
                id: string;
                label: string;
                disabled: (field: T) => boolean;
                action: (doc: Document, field: T) => void;
            };
            protected _moveFirstMenu: {
                id: string;
                label: string;
                disabled: (field: T) => boolean;
                action: (doc: Document, field: T) => void;
            };
            protected _moveLastMenu: {
                id: string;
                label: string;
                disabled: (field: T) => boolean;
                action: (doc: Document, field: T) => void;
            };
            protected _moveToFilterMenu: {
                id: string;
                label: string;
                disabled: (field: T) => boolean;
                action: (doc: Document, field: T) => void;
            };
            protected _moveToColumnMenu: {
                id: string;
                label: string;
                disabled: (field: T) => boolean;
                action: (doc: Document, field: T) => void;
            };
            protected _moveToRowMenu: {
                id: string;
                label: string;
                disabled: (field: T) => boolean;
                action: (_: any, field: T) => void;
            };
            protected _moveToValueMenu: {
                id: string;
                label: string;
                disabled: (field: T) => boolean;
                action: (doc: Document, field: T) => void;
            };
            protected _removeFieldMenu: {
                id: string;
                label: string;
                action: (doc: Document, field: T) => void;
            };
        }

        /**
         * 필드 컴포넌트 추상 클래스.
         * FieldModel을 참조하여 UI를 렌더링.
         * EventDelegator를 상속받아 드래그 이벤트를 자동으로 처리.
         */
        declare abstract class InspectorFieldView<T extends InspectorField = InspectorField> extends UIElement {
            static readonly DRAGGABLE_CLASS: string;
            static readonly DRAGGING_CLASS: string;
            static isDraggable(dom: Element): boolean;
            private _iconView;
            private _labelView;
            private _menuButton;
            private _field;
            private _dragging;
            constructor(doc: Document, className: string);
            protected _doInit(doc: Document, initData: any): void;
            /**
             * 필드 Model
             */
            get model(): T;
            /**
             * 필드명
             */
            get name(): string;
            /**
             * 필드 라벨
             */
            get label(): string;
            /**
             * 드래그 중 여부
             */
            get isDragging(): boolean;
            /**
             * 섹션 타입
             */
            get sectionType(): FieldSectionType;
            set sectionType(value: FieldSectionType);
            setField(table: PivotTable, field: T): this;
            isMenuButton(target: Element): boolean;
            private $_updateIcon;
            onDragStart(ev: DragEvent): void;
            onDragEnd(ev: DragEvent): void;
        }

        declare class InspectorFilterField extends InspectorField {
            constructor(field: PivotField);
        }

        declare abstract class InspectorPanelView<T extends PivotInspectorPanel = PivotInspectorPanel> extends UIFlexElement {
            protected _model: T;
            constructor(doc: Document, className: string, _model: T);
            get model(): T;
            abstract render(doc: Document, force: boolean): void;
            abstract click(dom: Element, shift: boolean, meta: boolean): boolean;
            abstract getPopupMenu(target: Element): PopupMenu | undefined;
        }

        declare type InspectorPosition = 'right' | 'left' | 'float';

        /**
         * 값 필드 컴포넌트를 위한 Model.
         * 필드 정보와 집계 타입 관리.
         */
        declare class InspectorValueField extends InspectorField {
            constructor(field: PivotField);
        }

        declare interface IPivotAnnotationHelper {
            getMeasureIndex(measure: string): number;
            getCellPos(rowDimension: any[] | undefined, colDimension: any[] | undefined, measure: number): {
                row: number;
                col: number;
            } | undefined;
        }

        declare interface IPivotAnnotationOwner extends IPivotAnnotationHelper {
            annotationAdded(annotation: PivotAnnotation): void;
            annotationRemoved(annotation: PivotAnnotation): void;
            annotationsRemoved(annotations: PivotAnnotation[]): void;
            annotationCleared(): void;
        }

        declare interface IPivotBodyCellInfo extends IPivotCellInfo {
            vt?: string;
            pcol: PivotColumn;
            prow: PivotRow;
            field: PivotValueField;
            value?: any;
            x?: number;
            className?: string;
            style?: PivotCellStyle;
        }

        declare interface IPivotBook {
            config: PivotBookConfiguration;
            pageCount: number;
            pages: IPivotBookPage[];
            _itemChanged(item: any, tag?: any): void;
            setup(): void;
            export(type: string): void;
            canUndo(): boolean;
            canRedo(): boolean;
            undo(): void;
            redo(): void;
            removeField(field: PivotField): void;
            isInteractive(): boolean;
        }

        declare interface IPivotBookEvents {
            onSettingsDlgRequested: (book: IPivotBook) => void;
            onExportDlgRequested: (book: IPivotBook, type: string) => void;
            onBookOptionsChanged: (book: IPivotBook) => void;
            onBookPageAdded: (book: IPivotBook, page: IPivotBookPage) => void;
            onBookPageRemoved: (book: IPivotBook, page: IPivotBookPage) => void;
            onBookUIRequested?: (book: IPivotBook, action: {
                name: string;
                params: any[];
            }) => void;
        }

        declare interface IPivotBookPage extends IPivotTable {
            name: string;
            title: string;
            index?: number;
        }

        declare interface IPivotCell {
            row: number;
            col: number;
        }

        declare interface IPivotCellInfo {
        }

        declare interface IPivotExplorer {
        }

        declare interface IPivotFieldSort {
            /**
             * 정렬 유형.
             * - 'label': 라벨 기준 정렬
             * - 'value': 특정 행/열 위치의 값 기준 정렬
             * - 'custom': 사용자 정의 순서(values 배열) 기반 정렬
             * - 'callback': 사용자 정의 비교 함수 기반 정렬
             *
             * @default 'label'
             */
            type?: 'label' | 'value' | 'custom' | 'callback';
            /**
             * 정렬 방향. 'asc' 오름차순, 'desc' 내림차순.
             *
             * @default 'asc'
             */
            direction?: PivotSortDirection;
            /**
             * 'total' / 'value' 정렬 시: 측정값 인덱스 또는 필드명 (기본: 0)
             */
            measure?: number | string;
            /**
             * 'value' 정렬 시: 대상 행/열 위치.
             * - string[]: dimension label 배열로 그룹 위치 지정 (예: ['Q1', '01'], ['Q1']).
             *             해당 그룹의 값 기준으로 정렬. 마지막 라벨이 leaf가 아니면 해당 레벨의 소계 기준으로 정렬.
             * - 'total': Grand Total
             * - 미지정: 'total' 과 동일하게 처리됨
             */
            target?: string[] | 'total';
            /** 'custom' 정렬 시: 사용자 정의 값 순서 */
            values?: (string | number | null)[];
            /** 'callback' 정렬 시: 비교 함수 */
            compareFn?: (a: string, b: string, params: PivotFieldSortParams) => number;
        }

        /**
         * {@page PivotValueFieldOptions.formatter}가 반환할 수 있는 텍스트 + 스타일 객체.
         * 모든 속성은 선택적이며, 지정된 속성만 셀에 적용된다.
         */
        declare interface IPivotFormatResult {
            /**
             * 셀에 표시할 텍스트(또는 숫자). 문자열 내 `${value}` 토큰은 포맷된 셀 값으로 치환된다.
             * 숫자가 지정되면 자동으로 type formatter로 포맷팅된다.
             * 생략하면 기본 type formatter 결과가 사용된다.
             */
            text?: string | number;
            /** 텍스트 색상 (예: `'red'`, `'#ff0000'`). */
            color?: string;
            /** 셀에 추가로 적용할 CSS 클래스 이름. */
            className?: string;
            /** 셀 배경색 (예: `'#ffff00'`). */
            backgroundColor?: string;
            /** `true`면 굵은 글씨. */
            bold?: boolean;
            /** `true`면 기울임 글씨. */
            italic?: boolean;
            /** `true`면 밑줄. */
            underline?: boolean;
            /**
             * 텍스트 정렬 방식. 지정하면 필드 기본 정렬을 덮어쓴다.<br/>
             * [주의] {@page className}으로 리턴되는 css로 적용하는 경우 'text-align' 대신 'justify-content' 스타일로 설정해야 한다.
             **/
            align?: PivotAlign;
            /**
             * 표시할 아이콘 이름. 빌트인({@link PivotIcon}) 또는
             * `PivotIconRegistry.registerIcon()`으로 등록된 이름.
             * 지정하면 highlight나 iconOverlay로 결정된 아이콘을 덮어쓴다.
             */
            icon?: PivotIcon | string;
            /** 아이콘 색상. colorable 아이콘에만 의미가 있다. 미지정 시 텍스트 색상을 따른다. */
            iconColor?: string;
            /** 아이콘 배치. 기본 `'auto'`. */
            iconPlacement?: IconPlacement;
            /** `true`면 아이콘만 표시하고 값 텍스트를 숨기다. */
            iconOnly?: boolean;
            /** 아이콘 크기(px). 0 또는 미지정이면 기본값 적용. */
            iconSize?: number;
            /** 아이콘과 텍스트 사이 간격(px). 0이면 간격 없음. iconOnly 또는 start/end 배치에서는 무시된다. */
            iconGap?: number;
        }

        declare interface IPivotHeaderCellInfo extends IPivotCellInfo {
            isGroup: boolean;
            dimension: string;
            measure?: string;
            pCell?: IPivotHeaderCellInfo;
            value: string;
            collapsed?: boolean;
        }

        declare interface IPivotHeaderGrandCellInfo extends IPivotCellInfo {
            label?: string;
        }

        declare interface IPivotHeaderGrandValueCellInfo extends IPivotCellInfo {
            measure: string;
        }

        declare interface IPivotHeaderOwner {
            selections: PivotSelectionManager;
            focusedCell: IPivotBodyCellInfo | undefined;
        }

        declare interface IPivotHeaderSeriesCellInfo extends IPivotCellInfo {
            series: PivotSeries;
            pCell?: IPivotHeaderCellInfo;
        }

        /**
         * 인스펙터 이벤트 인터페이스
         */
        export declare interface IPivotInspectorEvents {
            onConfigChanged(): void;
        }

        declare interface IPivotLabelFilter {
            op: LabelFilterOp;
            value1: any;
            value2?: any;
        }

        declare interface IPivotSelectionObserver {
            colCount: number;
            rowCount: number;
            onSelectionAdded(manager: PivotSelectionManager, selection: PivotSelection): void;
            onSelectionRemoved(manager: PivotSelectionManager, selection: PivotSelection): void;
            onSelectionCleared(manager: PivotSelectionManager): void;
            onSelectionChanged(manager: PivotSelectionManager, selection: PivotSelection): void;
        }

        /**
         * Series 셀 정보. 행·열 중 한 쪽이 series 컬럼/행이면 `axis === 'row' | 'column'`,
         * 양쪽 모두 series이면 `axis === 'cross'`. cross 인 경우 `rowSeries`와 `colSeries` 둘
         * 다 채워진다.
         */
        declare interface IPivotSeriesCellInfo extends IPivotBodyCellInfo {
            vt: 's';
            axis: 'row' | 'column' | 'cross';
            /** axis === 'row' | 'cross' 인 경우 행쪽 series 모델 */
            rowSeries?: PivotSeries;
            /** axis === 'column' | 'cross' 인 경우 열쪽 series 모델 */
            colSeries?: PivotSeries;
            /**
             * Series 시각화에 사용할 leaf 값 배열.
             * - axis === 'column': 같은 row 의 measure(leaf) 셀 값들.
             * - axis === 'row': 같은 col 의 measure(leaf) 셀 값들.
             * - axis === 'cross': 비어 있음.
             */
            values?: any[];
            height?: number;
        }

        declare interface IPivotTabBarOwner {
            pageIndex: number;
        }

        declare interface IPivotTable {
            get filterDimensions(): string[];
            get rowDimensions(): string[];
            get columnDimensions(): string[];
            get measures(): string[];
            get valuesAsRows(): boolean;
            get color(): string;
            get matrix(): PivotMatrix | null;
            get sourceRowCount(): number;
            get rowGrandTotal(): PivotGrandTotal;
            get columnGrandTotal(): PivotGrandTotal;
            get rowCount(): number;
            get colCount(): number;
            _itemChanged(item: ROptionable, tag?: any): void;
            _modelChanged(item?: ROptionable, tag?: any): void;
            _internalCell(row: number, col: number): IPivotValueCellInfo;
            _internalSeriesCell(row: number, col: number): IPivotSeriesCellInfo;
            getCell(row: number, col: number): IPivotValueCellInfo | null;
            getMeasureRange(measure: string): {
                min: number;
                max: number;
            };
            getAggregate(measure: number | string): string;
            getHeader(cell: IPivotHeaderCellInfo): PivotHeader;
        }

        declare interface IPivotTableEvents {
            onModelChanged(table: TableEventAware, item: ROptionable, tag?: any): void;
            onReset(table: TableEventAware): void;
            onGroupChanged(table: TableEventAware, dim: any, value: any): void;
        }

        export declare interface IPivotValueCellInfo extends IPivotBodyCellInfo {
            vt: 'g' | 'd' | 'm';
        }

        declare interface IPivotValueFilter {
            op: ValueFilterOp;
            value1: any;
            value2?: any;
        }

        declare interface IPoint {
            x: number;
            y: number;
        }

        /**
         * 팝업 메뉴 항목.<br/>
         */
        declare type IPopupMenuItem = IPopupMenuSeparatorItem | IPopupMenuNormalItem;

        /**
         * 팝업 메뉴 항목 (공통 속성).<br/>
         */
        declare interface IPopupMenuItemBase {
            /** 메뉴 참조. 메뉴 생성자에서 설정된다. */
            _menu?: PopupMenu;
            /** 아이템 타입 */
            type?: PopupMenuItemType;
            /** 표시 레이블 */
            label?: string | ((target: any, item: IPopupMenuItem) => string);
            /** 아이콘 CSS 클래스 또는 SVG 문자열 */
            icon?: string;
            iconSize?: number;
            /** 비활성화 여부 (콜백 지정 시 resolvePopupFlags에서 평가) */
            disabled?: boolean | ((target: any, item: IPopupMenuItem) => boolean);
            /** 숨김 여부 (콜백 지정 시 resolvePopupFlags에서 평가) */
            hidden?: boolean | ((target: any, item: IPopupMenuItem) => boolean);
            /** 체크 상태 (콜백 지정 시 resolvePopupFlags에서 평가) */
            checked?: boolean | ((target: any, item: IPopupMenuItem) => boolean);
            /** 그룹 이름 (같은 그룹끼리 묶이고 separator로 구분) */
            group?: string;
            /** 서브메뉴 아이템 목록 */
            children?: IPopupMenuItem[] | ((target: any, item: IPopupMenuItem) => IPopupMenuItem[]);
            /** 사용자 정의 데이터 */
            tag?: any;
            /** checkList 항목들 */
            checkListValues?: ICheckListItem[] | ((target: any, item: IPopupMenuItem) => ICheckListItem[]);
            /** checkList 목록 영역의 최대 높이 (px, 기본: 200) */
            listHeight?: number;
            /** true이면 체크 리스트를 별도 패널(팝업)로 표시 (기본: false, 인라인 표시) */
            asPanel?: boolean;
            /** 인라인 모드에서 헤더(레이블) 표시 여부 (기본: false) */
            showHeader?: boolean;
            /** 검색 입력 placeholder */
            searchPlaceholder?: string;
            /** '적용' 버튼 레이블 */
            applyLabel?: string;
            /** true이면 처음 표시 시 체크된 항목이 하나도 없을 경우 모두 선택 상태로 초기화 (기본: false) */
            noneAsAll?: boolean;
            /** true이면 처음 표시 시 체크된 항목이 하나 이하일 때 단일 항목 선택 checked 상태로 초기화 (기본: false) */
            singleOnly?: boolean | ((target: any, item: IPopupMenuItem) => boolean);
            /** popup이 있는 항목 (children이나 checkList가 있으면 자동 설정) */
            hasPopup?: boolean;
        }

        /** 일반/checkList 항목 (id 필수). */
        declare interface IPopupMenuNormalItem extends IPopupMenuItemBase {
            type?: 'normal' | 'checklist' | 'header';
            /** 아이템 식별자 */
            id?: string;
            hint?: string;
            /**
             * 메뉴 항목에 표시할 키보드 단축키 문자열.<br/>
             * 예: `"Meta+Z"`, `"Meta+Shift+P"`, `"Delete"`<br/>
             * 렌더링 시 레이블 오른쪽에 muted 색상으로 표시된다.
             */
            shortcut?: string;
            /** 항목 클릭 시 개별 콜백. onSelect 보다 먼저 호출된다. */
            action?: (doc: Document, target: any, item: IPopupMenuItem) => void;
            /** 항목 클릭 시 개별 콜백. onSelect 보다 먼저 호출된다. */
            popup?: (doc: Document, target: any, item: IPopupMenuItem) => void;
            /** 체크리스트 '적용' 클릭 (아이템 수준) */
            onCheckListApply?: (doc: Document, target: any, item: IPopupMenuItem, items: ICheckListItem[], all: boolean) => void;
        }

        /** separator 항목 (id 불필요). */
        declare interface IPopupMenuSeparatorItem extends IPopupMenuItemBase {
            type: 'separator';
            id?: string;
        }

        declare interface IRawTableEvents {
        }

        declare interface IRect {
            x: number;
            y: number;
            width: number;
            height: number;
        }

        declare interface ISize {
            width: number;
            height: number;
        }

        /**
         * view 측이 model에 주입하는 텍스트 측정자.<br/>
         * 측정 결과는 `chrome`(padding/border/icon 폭)을 포함한 최종 픽셀 폭이어야 한다.
         */
        declare interface ITextMeasurer {
            /**
             * 컬럼 i, 셀 종류 kind, 텍스트 text의 표시 폭을 반환한다.<br/>
             * 동일 (kind, text) 조합에 대해 결정적이어야 한다(캐싱 가정).
             */
            measure(col: number, kind: AutoWidthCellKind, text: string): number;
            /**
             * (옵션) 단일 value cell을 실제 렌더 경로로 측정해 정확한 폭을 반환한다.<br/>
             * precise 모드에서 formatter/highlight/icon 등 cell 별 가변 효과를 모두 포함한 *최종 표시 상태*로
             * 측정하기 위해 사용한다. 구현하지 않으면 precise 모드도 텍스트 측정만으로 처리된다.<br/>
             * `currentMax`는 지금까지 누적된 컬럼 최대 폭. 구현체는 cheap upper-bound estimate가
             * `currentMax` 이하라면 실제 렌더를 생략하고 `0`(또는 `currentMax` 이하 값)을 반환해 비용을 절감할 수 있다.
             */
            measureCell?(col: number, info: IPivotValueCellInfo, currentMax: number): number;
        }

        /**
         * Join 옵션.<br/>
         */
        declare interface JoinOptions {
            /**
             * Join 타입.<br/>
             * 기본값은 'inner'.<br/>
             * string('inner', 'left', 'right', 'outer')으로 지정 가능.<br/>
             */
            type?: JoinType;
            /**
             * 조인 조건 (콜백 함수).<br/>
             * (leftRow: any[], rightRow: any[]) => boolean<br/>
             */
            on: (leftRow: any[], rightRow: any[]) => boolean;
        }

        declare type JoinType = typeof _JoinType[keyof typeof _JoinType];

        /**
         * Join 타입.<br/>
         */
        declare const _JoinType: {
            /**
             * Inner Join: 양쪽 테이블에 모두 존재하는 행만 포함.<br/>
             */
            readonly INNER: "inner";
            /**
             * Left Join: 왼쪽 테이블의 모든 행 + 오른쪽 테이블의 매칭 행.<br/>
             */
            readonly LEFT: "left";
            /**
             * Right Join: 오른쪽 테이블의 모든 행 + 왼쪽 테이블의 매칭 행.<br/>
             */
            readonly RIGHT: "right";
            /**
             * Outer Join: 양쪽 테이블의 모든 행.<br/>
             */
            readonly OUTER: "outer";
        };

        declare type JsonLoadOptions = {
            /**
             * 루트 경로.<br/>
             * 기본값은 빈 문자열이다.<br/>
             */
            rootPath?: string;
            /**
             * 필드 매핑 객체.<br/>
             * 키는 소스 데이터의 필드 이름, 값은 Json 행의 값 경로이다.
             * 또, 이 매핑이 지정되면 여기에 명시된 필드들로 부터 data source의 필드 목록이 구성된다.<br/>
             * 예) { "id": "info.id", "name": "info.name" }<br/>
             * 이 매핑이 지정되지 않으면 첫번째 json 행의 최상위 필드들로부터 data source의 필드 목록이 구성된다.<br/>
             */
            fieldMap?: {
                [field: string]: string;
            };
        };

        /**
         * AICommand를 변환한 JSONSchema 노드.
         */
        export declare interface JSONSchema {
            type: string;
            description?: string;
            enum?: (string | number)[];
            items?: JSONSchema;
            properties?: Record<string, JSONSchema>;
            required?: string[];
            default?: any;
        }

        declare type LabelFilterOp = keyof typeof LabelFilterOps;

        /**
         * 레이블 필터 연산자.
         * Excel 피벗의 레이블 필터에 대응한다.
         */
        declare type LabelFilterOperator = 'equals' | 'notEquals' | 'beginsWith' | 'notBeginsWith' | 'endsWith' | 'notEndsWith' | 'contains' | 'notContains' | 'greaterThan' | 'greaterThanOrEqual' | 'lessThan' | 'lessThanOrEqual' | 'between' | 'notBetween' | 'wildcard' | 'regex';

        /**
         * 필터 원본 상태 (필터 적용 전 데이터 보관용).
         */
        /**
         * 레이블 필터 연산자.
         * Excel 피벗의 레이블 필터에 대응한다.
         * 긴 형식(equals)과 간략 형식(=) 모두 지원한다.
         */
        declare type LabelFilterOperator_2 = 'equals' | '=' | 'notEquals' | '!=' | '<>' | 'in' | 'notIn' | '!in' | 'beginsWith' | '^=' | 'notBeginsWith' | '!^=' | 'endsWith' | '$=' | 'notEndsWith' | '!$=' | 'contains' | '~' | 'notContains' | '!~' | 'greaterThan' | '>' | 'greaterThanOrEqual' | '>=' | 'lessThan' | '<' | 'lessThanOrEqual' | '<=' | 'between' | '><' | 'notBetween' | '!><' | 'like' | '*' | 'regex' | 're';

        declare const LabelFilterOps: {
            "=": string;
            "!=": string;
            "^=": string;
            "!^=": string;
            "$=": string;
            "!$=": string;
            "~": string;
            "!~": string;
            ">": string;
            ">=": string;
            "<": string;
            "<=": string;
            "><": string;
            "!><": string;
            in: string;
            "!in": string;
            "*": string;
            re: string;
        };

        /**
         * 측정값 별칭(alias) 정의 타입.<br/>
         * 큐브 스키마에 등록된 base measure 를 다른 집계 함수로 한 번 더 노출하기 위해 사용한다.<br/>
         * 별칭은 스키마에 영구 등록되지 않으며, 해당 AggTable(과 그로부터 파생된 PivotMatrix) 안에서만 유효하다.<br/>
         *
         * @example
         * ```typescript
         * cube.aggregate(['region'], [
         *     'sales',                                                    // 기본 집계 (스키마 정의)
         *     { name: 'sales_avg', measure: 'sales', aggregate: 'avg' },  // 같은 컬럼, 다른 집계
         *     { name: 'sales_max', measure: 'sales', aggregate: 'max' },
         * ]);
         * ```
         */
        declare type MeasureAlias = {
            /** 결과(AggTable/PivotMatrix) 안에서의 유일 식별자 */
            name: string;
            /** 큐브 스키마에 등록된 base measure 이름 */
            measure: string;
            /** 집계 함수 override (생략 시 base measure 의 aggregate 사용) */
            aggregate?: MeasureMeta['aggregate'];
        };

        /**
         * 측정값(Measure) 정의 타입.<br/>
         */
        declare type MeasureMeta = {
            name: string;
            descirption?: string;
            source?: string | ((row: any) => any);
            /**
             * 측정값 컬럼 데이터 타입.<br/>
             * - 'f64'/'i32': 모든 aggregate 지원.<br/>
             * - 'i64': 64-bit 정수 누적 (BigInt). sum/min/max/count 만 지원 — 1경(10^16) 이상의 정수도 정밀도 손실 없이 합산.<br/>
             * - 'str'/'date': 'count' / 'distinct' aggregate 만 지원 (Excel Power Pivot 모델).<br/>
             * [TODO]: 향후 'i64' 지원이 안정화되면, 'i64'도 role=measure에서 aggregate에 따라 지원 여부가 달라지도록 canMeasureMeta() 로직 수정 고려. 현재는 간단히 i64는 sum/min/max/count 만 허용하도록 isI64Aggregate()로 분리하여 관리.]
             */
            type: 'f64' | 'i32' | 'str' | 'date';
            /**
             * 집계 함수 타입.<br/>
             * - 'sum': 합계
             * - 'avg': 평균
             * - 'min': 최솟값
             * - 'max': 최댓값
             * - 'count': 건수 (null/NaN 제외)
             * - 'distinct': 고유값 수
             * - 'first': 그룹 내 첫 번째 값 (원본 데이터 순서 기준, 결정론적)
             * - 'last': 그룹 내 마지막 값 (원본 데이터 순서 기준, 결정론적)
             * - 'p25': 25백분위수 (선형 보간)
             * - 'p50': 50백분위수 (중앙값, 선형 보간)
             * - 'p75': 75백분위수 (선형 보간)
             * - 'product': 곱 (그룹 내 모든 값의 곱)
             * - 'stdev': 표본 표준편차 (n-1 기준)
             * - 'stdevp': 표준편차 (모집단, n 기준)
             * - 'var': 표본 분산 (n-1 기준)
             * - 'varp': 분산 (모집단, n 기준)
             *
             * first/last는 단일 스레드 순차 순회(row 0 → N)로 수집되므로,
             * 동일한 소스 데이터에 대해 항상 같은 결과를 보장한다 (결정론적).<br/>
             * 모든 집계 함수는 null/undefined/NaN 값을 제외하고 계산된다.<br/>
             */
            aggregate: 'sum' | 'avg' | 'min' | 'max' | 'count' | 'distinct' | 'first' | 'last' | 'p25' | 'p50' | 'p75' | 'product' | 'stdev' | 'stdevp' | 'var' | 'varp';
        };

        /**
         * Metric(지표) 정의 타입.<br/>
         * 집계 후 계산되는 post-aggregate 지표<br/>
         */
        declare type MetricMeta = {
            name: string;
            descirption?: string;
            expression: string;
        };

        /**
         * `cellScope`/`compareScope` 기반 정규화 그룹을 제공하는 overlay의 공통 베이스.
         *
         * 정규화 범위는 항상 각 그룹의 실제 데이터 min/max를 사용한다.
         * 사용자가 정규화 범위를 명시적으로 조정해야 하는 overlay는 {@link ValueRangeOverlay}를 상속하라.
         */
        declare abstract class NormalizedCellOverlay<OP extends NormalizedCellOverlayOptions = NormalizedCellOverlayOptions> extends PivotCellOverlay<OP> {
            static defaults: NormalizedCellOverlayOptions;
            /** 표시 대상 셀 레벨 집합 (resolved cellScope) */
            protected _cellLevels: Set<ValueCellType>;
            /** 정규화 분리 축들 (resolved compareScope) */
            private _compareAxes;
            /** 그룹 키별 정규화 함수 */
            private _normalizers;
            /** 'all' (no axes) 일 때 사용되는 fallback */
            private _allNormalizer;
            /** 'all' 그룹의 통계 (midValue 등 단일 기준값 해석에 사용) */
            protected _allStats: GroupStats;
            /** prepare 시점의 전체 ScopedStats. picker 콜백에 전달되는 참조. */
            protected _stats: ScopedStats | null;
            /**
             * 값을 0~1 범위로 정규화한다.
             */
            normalize(value: number, ctx: CellContext): number;
            /**
             * compareScope와 무관하게 데이터 전체('all') 기준으로 정규화한다.
             * midValue처럼 셀 컨텍스트 없이 단일 기준값을 해석할 때 사용한다.
             */
            protected normalizeAll(value: number): number;
            /**
             * 저장된 cellScope 값을 그대로 반환한다.
             * 정규화가 필요하면 `parseCellScope()`를 호출해서 사용한다.
             */
            getCellScope(): CellScope;
            /**
             * 저장된 compareScope 값을 dialog CheckGroup의 selection 형태(string[])로 반환한다.
             * - undefined/null/`'all'` → `['all']`
             * - 단일 문자열 → `[그 문자열]`
             * - 배열 → 그대로
             * raw 값이 필요하면 `prop('compareScope')`를 직접 사용한다.
             */
            getCompareScope(): string[];
            /**
             * 임의 입력(문자열/배열/null)을 canonical `CellScope`로 변환한다.
             * 모든 레벨이 다 선택된 상태는 `'all'`과 의미가 동일하므로 `'all'`로 축소한다.
             * - 빈 배열/null/undefined/유효하지 않은 값 → `'value'`
             * - `'all'` 단독 / 배열에 `'all'` 포함 / 모든 레벨 포함 배열 → `'all'`
             * - 단일 요소 배열 → 그 문자열
             * - 그 외 → 중복 제거된 배열
             */
            parseCellScope(input: unknown): CellScope;
            /**
             * 임의 입력(문자열/배열/null)을 canonical `CompareScope`로 변환한다.
             * cellScope와 달리 `'all'`(셀 분리 없음)과 "모든 축 선택"(셀 단위 분리)이
             * 서로 다른 의미이므로, 모든 축이 포함돼도 `'all'`로 축소하지 않는다.
             * 단, dialog CheckGroup에서 `'all'`을 별도 항목으로 노출하므로
             * 입력에 `'all'`이 포함되면 다른 축은 무시하고 `'all'`로 반환한다.
             * - null/undefined/빈 배열/`'all'` 포함 → `'all'`
             * - 단일 요소 배열 → 그 문자열
             * - 그 외 → 입력 배열 그대로
             */
            parseCompareScope(input: unknown): CompareScope;
            /**
             * 지정된 셀 레벨이 cellScope에 포함되는지 확인한다.
             */
            isDisplayTarget(vt: ValueCellType): boolean;
            protected _doPrepare(table: IPivotTable, measure: number): void;
            /**
             * stats 수집 직전 호출. 하위 클래스가 옵션 기반 내부 상태(예: boundsMode)를
             * `_resolveRange`/`_needsSortedStats` 호출 전에 갱신할 수 있다.
             */
            protected _beforeCollectStats(): void;
            /**
             * 정규화 시 사용할 로그 베이스. 0이면 선형. 기본 0.
             */
            protected _logBase(): number;
            /**
             * 하위 클래스가 sorted 통계가 필요하면 true를 반환. 기본 false.
             */
            protected _needsSortedStats(): boolean;
            /**
             * 하위 클래스가 sum 통계가 필요하면 true를 반환. 기본 false.
             */
            protected _needsSumStats(): boolean;
            /**
             * 정규화 범위를 벗어난 값의 처리 방식. 기본 'clamp'.
             * 'hide'이면 `normalize()`는 NaN을 반환하며, 호출측은 `Number.isFinite`로 스킵 여부를 판단해야 한다.
             */
            protected _outOfRangeMode(): 'clamp' | 'hide';
            /**
             * 그룹 stats로부터 정규화 범위를 결정한다. 기본은 실제 min/max 그대로.
             * `boundsBy`/`minValue`/`maxValue` 같은 사용자 조정은 {@link ValueRangeOverlay}에서 override한다.
             */
            protected _resolveRange(gs: GroupStats): {
                min: number;
                max: number;
            };
            /**
             * stats manager가 없을 때 사용하는 inline 수집. 결과는 ScopedStats와 같은 형식.
             */
            private $_collectInline;
            private $_groupKey;
            /**
             * 범위와 로그 스케일 설정으로부터 정규화 함수를 생성한다.
             * `oor === 'hide'`면 범위 밖 입력은 NaN을 반환한다.
             */
            private $_createNormFn;
        }

        /**
         * `cellScope`/`compareScope` 정규화 그룹 기반 overlay 공통 옵션.
         * 정규화 범위는 항상 데이터의 실제 min/max를 사용한다.
         */
        declare interface NormalizedCellOverlayOptions extends CellOverlayOptions {
            /**
             * overlay를 적용할 셀 타입.
             *
             * 기본값은 `'value'`(상세 셀에만 적용). 소계/총계는 값이 커서 정규화 기준을 왜곡하기 쉬우므로
             * 주의가 필요하다. 소계에도 적용하려면 보통 `compareScope: ['level', ...]`을 같이 쓴다.
             *
             * @example
             * ```ts
             * cellScope: 'value'                      // 기본
             * cellScope: ['value', 'subtotal']        // 상세 + 소계
             * cellScope: 'all'                        // 모든 셀 (보통 'level'과 조합)
             * ```
             *
             * @default 'value'
             * @see {@link CellScope}
             */
            cellScope?: CellScope;
            /**
             * 값을 비교(정규화)할 범위.
             *
             * 어느 셀들을 "한 그룹"으로 보고 해당 그룹의 min/max로 정규화할지 결정한다.
             * 이 값에 따라 같은 셀의 색상/막대 폭이 달라진다.
             *
             * 배열로 조합 가능하며, 조합된 축들의 교차 그룹별로 분리된다.
             *
             * @example
             * ```ts
             * compareScope: 'all'                       // 전체 기준 (기본)
             * compareScope: 'row'                       // 행별로 정규화
             * compareScope: 'column'                    // 열별로 정규화
             * compareScope: 'rowGroup'                  // 같은 부모 행 그룹 내
             * compareScope: 'columnGroup'               // 같은 부모 열 그룹 내
             * compareScope: ['rowGroup', 'column']      // 행 그룹 안에서 열별로
             * compareScope: ['columnGroup', 'row']      // 열 그룹 안에서 행별로
             * compareScope: ['rowGroup', 'columnGroup'] // 행 그룹 ∩ 열 그룹 교차로
             * compareScope: ['level']                   // 셀 레벨이 섞여 있을 때 필수
             * ```
             *
             * @default 'all'
             * @see {@link CompareScope}
             */
            compareScope?: CompareScope;
        }

        declare interface NumberFormatOptions {
            thousandSeparator?: string;
            decimalSeparator?: string;
            minIntegers?: number;
            minDigits?: number;
            digits?: number;
            unit?: string;
            scale?: number;
            prefix?: string;
            suffix?: string;
        }

        /**
         * 'as,0.0#'
         * NOTE: 'a'는 bigint에 사용할 수 없다.
         *
         * 앞뒤에 따옴표(단/쌍)로 묶인 문자열이 있으면 prefix / suffix 로 추가된다:
         *  - `'"$",0.00'`   → `$1,234.56`
         *  - `'0.00" 원"'`  → `1,234.56 원`
         *  - `'"₩",0.0@'`   → `₩1.2M`
         *
         * 끝에 변환 접미사(suffix)를 붙일 수 있다:
         *  - '%' : 값을 100배로 스케일하고 '%'를 덧붙인다. (percent)
         *  - 'K' : 값을 1e3 (천, thousand)로 나누고 'K'를 덧붙인다.
         *  - 'M' : 값을 1e6 (백만, million)으로 나누고 'M'를 덧붙인다.
         *  - 'B' : 값을 1e9 (십억, billion)로 나누고 'B'를 덧붙인다.
         *  - 'T' : 값을 1e12 (조, trillion)로 나누고 'T'를 덧붙인다.
         *  - 'P' : 값을 1e15 (천조, quadrillion / peta)로 나누고 'P'를 덧붙인다.
         *  - 'E' : 값을 1e18 (백경, quintillion / exa)로 나누고 'E'를 덧붙인다.
         *  - '@' : 값의 크기에 따라 K/M/B/T/P/E 중 적절한 단위를 자동 선택한다. (auto-scale)
         *
         * 예) ',0.00%', ',0.0K', ',0.0@'
         *
         * 제한 사항:
         *  - 접미사를 적용할 때 bigint는 number로 변환되어 처리된다.
         *  - JavaScript number(IEEE 754)의 안전 정수 한계는 Number.MAX_SAFE_INTEGER (≈ 9.007e15)이므로,
         *    'P' 범위 일부와 'E' 영역의 큰 정수 값은 정밀도 손실이 발생할 수 있다.
         *    (스케일된 결과를 표시하는 용도로는 충분하다.)
         *  - 1e21 이상(Z, Y 등)은 number로 정확히 표현할 수 없어 지원하지 않는다.
         *  - 접미사는 포맷 문자열의 마지막 1글자로만 인식된다.
         */
        declare class NumberFormatter {
            private static readonly SCALE_SUFFIXES;
            static readonly DEFAULT_FORMAT = "";
            private static readonly Formatters;
            static toFormat(options: NumberFormatOptions): string;
            static getFormatter(format: string): NumberFormatter;
            static get Default(): NumberFormatter;
            private _format;
            private _unit;
            private _scale;
            private _prefix;
            private _suffix;
            private _options;
            private _formatter;
            private _roundingFormatters;
            private _toStr;
            constructor(format: string);
            get format(): string;
            /* Excluded from this release type: _setFormat */
            getOptions(): NumberFormatOptions;
            toStr(value: number | bigint): string;
            toStrEx(value: number | bigint, roundingMode: 'trunc' | 'ceil'): string;
            private static $_autoScale;
            private $_parse;
        }

        /**
         * OpenAI Chat Completions API(또는 OpenAI 호환 endpoint)를 직접 호출하는 로컬 모델.<br/>
         * 메시지(system/user/assistant)는 OpenAI 형식과 1:1 대응하며,
         * tools는 `{ type:"function", function:{...} }`로 wrap하여 native function-calling을 사용한다.<br/>
         * endpoint 옵션으로 base URL을 바꿔 OpenAI 호환 프록시를 가리킬 수 있다(기본 https://api.openai.com/v1).
         */
        export declare class OpenAIModel extends AILocalModelImpl {
            protected _complete(messages: AIChatMessage[], tools: AIToolSchema[], toolChoice?: AIToolChoice): Promise<AIResponse>;
            /** OpenAI embeddings API로 query를 임베딩한다(RAG용). */
            protected _embed(text: string): Promise<Float32Array>;
            protected _getRagPath(): {
                embeddings: string;
                chunks: string;
                meta: string;
            };
            /** AIToolChoice를 OpenAI tool_choice 값으로 매핑한다. */
            private $_toToolChoice;
            /** OpenAI tool_call의 arguments(JSON 문자열)를 객체로 parse한다. */
            private $_parseArguments;
        }

        /**
         * 값이 지정한 범위를 벗어난 경우 처리 방식.<br/>
         * `valueMode: 'auto'`이거나 min/max를 지정하지 않으면 범위 밖 셀이 존재할 수 없으므로 이 옵션은 무의미하다.
         *
         * - `'clamp'` (기본): 범위 경계값으로 클래핑해서 overlay를 계속 그린다 (heatmap: 끝색, dataBar: 0%/100%).
         * - `'hide'`     : 범위 밖 셀은 overlay를 적용하지 않는다 (값 자체는 표시).
         */
        declare type OutOfRangeMode = 'clamp' | 'hide';

        declare const PIVOT_AGGREGATES: {
            sum: string;
            avg: string;
            min: string;
            max: string;
            count: string;
            distinct: string;
            product: string;
            stdev: string;
            stdevp: string;
            var: string;
            varp: string;
            first: string;
            last: string;
            p25: string;
            p50: string;
            p75: string;
        };

        declare type PivotAggregationType = keyof typeof PIVOT_AGGREGATES;

        /**
         * 피벗 컴포넌트 AI 환경을 구성하고, 피벗 컴포넌트에 특화된 내부(internal, in-process) AI 에이전트를 구현한다.<br/>
         * 에이전트 챗봇인 AIPrompter를 통해 사용자 입력을 받아 LLM 모델을 호출하고, 그 응답을 PivotAIApi를 통해 해석하여 피벗 명령으로 변환 실행한다.<br/>
         * 사용자 입력과 LLM 응답을 쌍으로 담아 대화 기록을 관리하며, prompter가 이를 표시한다.<br/>
         * 외부 에이전트와 동일하게 PivotAIApi를 통해 컨텍스트와 상태, 툴 목록을 가져와서 llm 호출에 활용한다.<br/>
         */
        declare class PivotAI extends ROptionable<PivotAIOptions> {
            private _book;
            static defaults: PivotAIOptions;
            private _res;
            private _models;
            private _aiPanel;
            constructor(_book: PivotBook);
            protected _doInit(op: PivotAIOptions): void;
            get book(): PivotBook;
            get enabled(): boolean;
            set enabled(value: boolean);
            get resources(): PivotAIResources;
            /**
             * Active ai model.<br/>
             */
            get model(): PivotAIModel | null;
            setActiveModel(name: string): boolean;
            get models(): PivotAIModel[];
            get panel(): PivotAiPanel;
            get autoSubmit(): boolean;
            /**
             * 주어진 tool 선택(toolChoice)과 현재 상태에 맞는 grounding context를 조립한다.<br/>
             * 내부 AIPrompter와 외부 agent가 동일한 context를 생성하도록 피뻗이 소유하는 primitive다.<br/>
             * table은 객체 참조가 아닌 이름(tableName)으로 받아 내부에서 resolve한다(외부 agent는 객체를 가지지 않을 수 있다).<br/>
             * - { tool }: 해당 tool이 요구하는 context만.<br/>
             * - "auto"/"required"(기본): 등록된 모든 tool이 요구하는 context의 합집합.<br/>
             * - "none": 빈 문자열.
             */
            buildContext(toolChoice: AIToolChoice, args?: Record<string, any>): string;
            prepareRender(table: PivotBookPage): void;
            afterRender(): void;
            private $_commandsForChoice;
            _optionChanged(tag?: string | string[]): void;
            protected _doLoadProp(prop: string, value: any): boolean;
        }

        /**
         * 내부 에이전트(PivotAI)와 외부 에이전트가 공통으로 사용하는 피벗컨트롤 제어 API.<br/>
         * LLM 호출에 필요한 컨텍스트·tool 목록·상태·코퍼스(RAG) 조회와 tool 실행 진입점(gateway)을 제공한다.<br/>
         */
        export declare class PivotAIApi {
            private _book;
            private _res;
            private _devMode;
            constructor(_book: PivotBook, _res: PivotAIResources);
            /**
             * 개발자 모드가 활성화되면, LLM이 개발자용 디버깅 정보를 더 많이 출력하도록 지시한다.<br/>
             */
            get devMode(): boolean;
            set devMode(enabled: boolean);
            prepareCall(): Promise<void>;
            /**
             * 현재 활성화된 AI 모델의 system context를 반환한다.<br/>
             * 외부 agent도 내부 호출과 동일한 응답 규칙을 따르도록, 모델 컨텍스트 뒤에
             * message/도구별 reason 역할 계약(REASON_INSTRUCTION)을 항상 덧붙여 반환한다.
             */
            getSystemContext(): string | undefined;
            /**
             * 현재 활성화된 AI 모델의 developer context를 반환한다.<br/>
             */
            getDeveloperContext(): string | undefined;
            getReasonContext(): string;
            getTools(): AICommand[];
            /**
             * 현재 사용 가능한 AI 툴 목록을 반환한다.<br/>
             * 노출 게이트를 리소스(getTools)와 공유한다 — 내부 프롬퍼·외부 등록 모두 book 스코프 목록을 쓴다.
             */
            getToolSchemas(): AIToolSchema[];
            /**
             * query에 system context와 함께 전달되는 실행 시간 pivot book의 동적 개요 정보.<br/>
             * <br/>
             * [serializeState()와의 관계]<br/>
             * getState()는 "내부 LLM에게 말 거는 프롬프트 문자열 빌더"(presenter)이고,<br/>
             * serializeState()는 "임의의 agent가 파싱·추론하는 구조화 읽기 API"(canonical model)다.<br/>
             * 둘은 용도가 다르다 — getState는 한국어 산문+JSON 혼합, serializeState는 정규 객체.<br/>
             * [지향] 최종적으로 getState()를 serializeState() 위에 얹는 얇은 표현부로 축소해<br/>
             *        읽기의 진실 출처를 하나로 통합한다(포맷 drift 제거). 현재는 병존한다.
             */
            getState(): string;
            /**
             * 정규(canonical) 읽기 표면.<br/>
             * 내부 prompter와 외부 agent가 동일하게 소비하는, 구조화된 실행시간 상태 스냅샷을 반환한다.<br/>
             * getState()가 LLM 프롬프트용 산문이라면, 이쪽은 기계가 파싱·추론하는 단일 정규형이다.<br/>
             * <br/>
             * [형상 표준화] 도메인 형상의 외부 표준은 없다(앱이 소유). 대신 PivotStateSnapshot.version으로<br/>
             *   형상을 고정해 "임의대로"가 아닌 "단일·정규·버전 계약"으로 만든다. 전송 표준(JSON Patch/MCP)은<br/>
             *   실제 소비자가 생길 때 이 형상 위에 얇게 입힌다(지금은 만들지 않는다).<br/>
             * <br/>
             * [크기 제어 = scope 두 축]<br/>
             *   - scope.table  : 대상 테이블 이름. 생략 시 전체. 객체가 아닌 이름으로 주소지정(외부 agent 대칭).<br/>
             *   - scope.include: 포함 구획(projection). 생략 시 ['config']. format이 아니라 scope로 크기를 줄인다.<br/>
             * <br/>
             * [정적/동적 분리] 큐브 스키마(정적)는 여기 담지 않는다 — getCubeContext()로 분리해 1회만 전송하고,<br/>
             *   이 스냅샷은 동적 인스턴스 상태(레이아웃/필터/config)만 운반한다.<br/>
             * <br/>
             * [보류] snapshot/delta 동기화, 양방향 일관성 plumbing은 트랙-1 소비자가 생길 때까지 만들지 않는다.
             */
            serializeState(scope?: PivotStateScope): PivotStateSnapshot;
            /**
             * 단일 페이지를 정규 PivotTableState로 직렬화한다.<br/>
             * 현재 config는 page.save() 통째를 운반한다.<br/>
             * [추후] layout/filters/analyses를 save()에서 분리해 개별 투영으로 노출(크기·관심사 분리).
             */
            private $_serializePage;
            /**
             * toolCall을 실행 가능한 command로 생성하되 실행하지는 않는다.<br/>
             * force는 frontend-authoritative 인자 강제다 — 모델이 생성한 인자 위에 덮어써 최종값을 확정한다.<br/>
             * 반환된 command의 lazyRun을 검사해, 즉시 실행할지 pending으로 보류할지는 호출측(prompter/agent)이 판단한다.
             */
            prepareCommand(toolCall: AICommandCall, force?: Record<string, any>): PivotAICommand;
            /**
             * prepare로 만든 command를 실행하고 결과를 AIToolResult로 감싼다.<br/>
             * pending queue에서 사용자 확인을 마친 command를 나중에 실행할 때도 이 관문을 탄다.
             */
            runCommand(command: PivotAICommand): Promise<AIToolResult>;
            /**
             * 컨트롤 밖에서 AI 툴을 실행할 수 있도록 한다.<br/>
             * 외부 agent가 toolCall에 대상 이름(table 등)을 넣지 않으면 현재 활성 페이지(book.activePage)를 기본 대상으로 사용한다.
             * force는 frontend-authoritative 인자 강제다. 모델이 생성한 인자 위에 덮어써 최종값을 확정한다.<br/>
             * prompter(UI 핀)와 외부 agent가 동일한 관문에서 같은 강제 규칙을 타도록 병합을 여기서 수행한다.<br/>
             * 생성(prepare)과 실행(runCommand)을 조합한 즉시 실행 경로다.
             */
            execute(toolCall: AICommandCall, force?: Record<string, any>): Promise<AIToolResult>;
            executeAll(toolCalls: AICommandCall[], force?: Record<string, any>): Promise<AIToolResult[]>;
        }

        declare abstract class PivotAICommand extends RObject {
            tool: AICommandCall;
            static meta: AICommand;
            /** 이 툴 뿐 아니라 system context로 사용된다. */
            static getContext: (book: PivotBook, args?: Record<string, any>) => string;
            private _command;
            /**
             * [주의]이 생성자를 override할 일은 거의 없다.
             */
            constructor(tool: AICommandCall);
            get meta(): AICommand;
            /**
             * true이면 completeTurn에서 즉시 실행하지 않고 pending queue에 담아,<br/>
             * prompter에서 사용자 확인·매개변수 입력을 거친 뒤 실행하도록 지연한다.<br/>
             * 확인이 필요한 명령이 override해서 true를 반환한다(기본은 즉시 실행).
             */
            isDeferred(): boolean;
            needParams(): boolean;
            /**
             * table은 ai가 arguments에 tableName이 있으면 해당 테이블을 찾아서 전달한다.
             */
            execute(book: PivotBook, table?: PivotBookPage): Promise<string | undefined>;
            /**
             * EditCommand를 생성만 하고 실행하지 않는다.<br/>
             * executeAll에서 복수 명령을 EditCommandGroup으로 묶어 한 번에 실행할 때 사용한다.<br/>
             * EditCommand를 만들지 않는 명령은 undefined를 반환할 수 있다.
             */
            createCommand(book: PivotBook, table?: PivotBookPage): EditCommand | undefined;
            protected _createCommand(tool: AICommandCall, book: PivotBook, table?: PivotBookPage): EditCommand | undefined;
            protected _doRun(tool: AICommandCall, book: PivotBook, table: PivotBookPage): any;
            /**
             * ai가 전달하는 것이 아니라 이 커맨드에서 리턴하는 메시지다.<br/>
             * prompter 등에서는 ai 메시지에 추가로 붙여서 표시할 수 있다.
             */
            abstract getMessage(): string;
            protected _getTable(book: PivotBook, table: PivotBookPage): PivotBookPage | undefined;
            protected _afterExecute(command: EditCommand | undefined, result: any): string | undefined;
        }

        declare class PivotAIContainer extends DockableView {
            private _model;
            private _headerView;
            private _promptView;
            private _position;
            constructor(doc: Document, model: PivotAiPanel);
            protected _doInit(doc: Document): void;
            get model(): PivotAiPanel;
            get headerView(): HeaderView_2;
            get position(): AIPanelPosition;
            isVisible(): boolean;
            render(doc: Document, table: PivotBookPage, force: boolean): void;
            open(): void;
            close(): void;
            click(target: Element, shift: boolean, meta: boolean): boolean;
            getPopupMenu(target: Element): PopupMenu | undefined;
            getContextMenu(target: Element): PopupMenu | undefined;
            protected _getDockView(): UIElement;
            protected _getDragView(): HTMLElement;
            protected _setPosition(position: "right" | "left" | "float"): void;
            completeSplitGhostResize(newWidth: number): void;
        }

        /**
         * 피벗에 연결되는 LLM 모델의 공통 인터페이스.
         */
        export declare interface PivotAIModel {
            readonly name: string;
            readonly description?: string;
            readonly label: string;
            /** 모델에 등록된 도구 목록. */
            readonly tools: AIToolSchema[];
            /**
             * 호출 측(피벗)이 설정하는 시스템 컨텍스트.<br/>
             * 데이터 필드 메타·동작 지시문 등을 담으며, LLM 호출 시 system 메시지로 사용된다.
             */
            readonly systemContext?: string;
            readonly developerContext?: string;
            /**
             * 시스템 컨텍스트를 설정한다(피벗 데이터·필드가 정해질 때 호출 측에서 지정).<br/>
             * undefined를 전달하면 컨텍스트를 해제한다.
             */
            setSystemContext(context?: string): void;
            /**
             * 개발자 컨텍스트를 설정한다(개발자 관련 정보가 필요할 때 호출 측에서 지정).<br/>
             * undefined를 전달하면 컨텍스트를 해제한다.
             */
            setDeveloperContext(context?: string): void;
            /**
             * 호출 가능한 도구 목록을 모델에 등록한다.<br/>
             * clear가 true이면 기존 목록을 비운 뒤 등록하고, false(기본)이면 기존 목록에 추가한다.
             */
            registerTools(tools: AIToolSchema[], clear?: boolean): Promise<void>;
            /**
             * 사용자의 자연어 요청(prompt 입력)을 전달하고 LLM의 응답을 받는다.<br/>
             * 피벗 관련 context는 setSystemContext로 미리 설정하며, query에는 사용자 입력만 담는다.<br/>
             * 정상 응답은 항상 AIConversationTurn를 반환한다. 실행할 도구가 없으면 tools가 빈 배열이다.<br/>
             * 호출 실패(네트워크·rate limit·응답 parse 실패 등)는 예외를 throw하므로 try/catch로 처리한다.
             *
             * @example
             * try {
             *     const turn = await model.call(query);
             *     showMessage(turn.response.message);
             *     for (const c of turn.response.tools) execute(c); // 빈 배열이면 자연히 skip
             * } catch (e) {
             *     showError(e); // 실패 원인 표시
             * }
             *
             * @param query 사용자 입력(자연어 요청)
             * @param toolChoice 도구 호출 정책(기본 "auto"). 특정 명령 강제는 { command } 사용.
             */
            call(api: PivotAIApi, query: string, toolChoice?: AIToolChoice): Promise<AIConversationTurn>;
        }

        /**
         * PivotAITypes에 정의된 AI 모델들을 등록·관리하고, 질의를 위임하는 매니저.<br/>
         * 모델은 name으로 식별되며, 하나의 모델을 활성(active) 모델로 지정해 기본 질의 대상으로 사용한다.
         */
        export declare class PivotAIModelManager {
            private _models;
            private _explicitActiveModel;
            private _activeModel;
            /** 등록된 모든 모델 목록. */
            get models(): PivotAIModel[];
            /** 현재 활성 모델. 등록된 모델이 없으면 null. */
            get activeModel(): PivotAIModel | null;
            load(src: PivotAIModelOptions | PivotAIModelOptions[]): void;
            /**
             * 모델을 등록한다. 같은 name의 모델이 이미 있으면 교체한다.<br/>
             * 활성 모델이 아직 없거나 activate가 true이면 이 모델을 활성 모델로 지정한다.
             * @returns 등록된 모델
             */
            register(model: PivotAIModel, activate?: boolean): PivotAIModel;
            /**
             * name에 해당하는 모델을 제거한다.<br/>
             * 제거된 모델이 활성 모델이었다면, 남은 모델 중 하나를 활성 모델로 다시 지정한다.
             * @returns 제거되었으면 true
             */
            unregister(name: string): boolean;
            /** name에 해당하는 모델을 반환한다. 없으면 null. */
            get(name: string): PivotAIModel | null;
            /** name에 해당하는 모델이 등록되어 있는지 여부. */
            has(name: string): boolean;
            /**
             * name에 해당하는 모델을 활성 모델로 지정한다.
             * @returns 지정된 활성 모델
             */
            setActiveModel(name: string): boolean;
            /** 등록된 모든 모델을 제거하고 활성 모델을 해제한다. */
            clear(): void;
            /**
             * 모든(또는 지정한) 모델에 명령(도구) 목록을 등록한다.
             * @param tools 등록할 명령 목록
             * @param clear true이면 기존 목록을 비운 뒤 등록한다.
             * @param modelName 지정하면 해당 모델에만 등록한다. 생략하면 모든 모델에 등록한다.
             */
            registerTools(tools: AIToolSchema[], clear?: boolean, modelName?: string): Promise<void>;
            /**
             * 자연어 요청을 모델에 전달하여 응답을 받는다.<br/>
             * modelName을 지정하면 해당 모델로, 생략하면 활성 모델로 질의한다.<br/>
             * toolChoice로 도구 호출 정책(특정 명령 강제 등)을 지정할 수 있다.<br/>
             * 질의할 모델이 없으면 예외를 throw한다(모델 호출 실패 또한 예외로 전파된다).
             */
            query(api: PivotAIApi, query: string, modelName?: string, toolChoice?: AIToolChoice): Promise<AIConversationTurn>;
            private $_resetActive;
        }

        declare interface PivotAIModelOptions extends ROptions {
            type?: 'local' | 'remote';
            name: string;
            modelName: string;
            description?: string;
            debugMode?: boolean;
        }

        /**
         * Pivot AI 에이전트 옵션.<br/>
         * 북에서 AI 기능을 사용할지 여부와, 사용할 AI 모델 목록, AI 패널 옵션 등을 설정한다.
         */
        declare interface PivotAIOptions extends ROptions {
            /**
             * AI 기능을 사용할 지 여부.
             *
             * @default false
             */
            enabled?: boolean;
            resources?: PivotAIResourcesOptions;
            /**
             * AI 모델 옵션 목록.<br/>
             * 북에서 사용할 AI 모델을 등록한다. 모델은 로컬 모델과 원격 모델로 나뉘며, 각각의 옵션 구조가 다르다.<br/>
             * 단일 모델만 사용할 때는 배열 대신 객체 하나로 지정할 수 있다.
             */
            models?: PivotLocalAIModelOptions | PivotRemoteAIModelOptions | (PivotLocalAIModelOptions | PivotRemoteAIModelOptions)[];
            /**
             * AI 기능을 개발자 모드로 사용할 지 여부.
             * 개발자 모드에서는 AI 모델이 제공하는 피벗 설정 내용이 표시된다.
             *
             * @default false
             */
            devMode?: boolean;
            /**
             * 신규 피벗 테이블 생성 시 기본으로 제공되는 prompt 제안 목록.<br/>
             * 예시: ['판매량이 가장 많은 차종은 무엇인가요?', '국가별 판매량을 비교해 주세요.', '차종과 브랜드별로 판매량을 분석해 주세요.']
             */
            tableSuggestions?: string[];
            /**
             * AI 응답을 기다리는 동안 표시할 메시지.<br/>
             */
            waitingMessage?: string;
            /**
             * AI 패널 옵션.<br/>
             * AI 모델과 상호 작용하는 패널을 설정한다.
             * AI 패널은 인스펙터나 탐색기의 탭, 또는 별도 외부 컨테이너에 표시될 수 있다.<br/>
             * `boolean` 축약형으로 지정하면 AI 패널의 표시 여부만 토글한다.
             */
            panel?: PivotAiPanelOptions;
            /**
             * AI를 이용한 테이블 추가 방식.<br/>
             *
             * - 'dialog': 다이얼로그를 통해 테이블을 추가한다. (기본값)
             * - 'page': AI 페이지를 통해 테이블을 추가한다.
             *
             * @default 'dialog'
             */
            addMode?: AIAddTableMode;
            /**
             * prompt 창에서 suggestion이나 응답 속 prompt link를 클릭하면 input 창으로 우선 복사하는데,
             * true로 지정하면 복사와 동시에 AI에 전달한다.
             *
             * @default false
             */
            autoSubmit?: boolean;
        }

        declare class PivotAiPanel extends PivotPanel<PivotAiPanelOptions> {
            static defaults: PivotAiPanelOptions;
            private _prompter;
            private _position;
            private _lastDockedPosition;
            protected _doInit(op: PivotAiPanelOptions): void;
            get prompter(): AIPrompter;
            get position(): AIPanelPosition;
            get outside(): boolean;
            get floating(): boolean;
            get floatBounds(): IRect | undefined;
            get autoDock(): boolean;
            get lastDockedPosition(): 'left' | 'right';
            canUndock(): boolean;
            setFloatBounds(bounds: IRect): void;
            setPosition(position: AIPanelPosition): void;
            protected _doApply(op: PivotAiPanelOptions): void;
            getMenu(): PopupMenu;
            prepareRender(book: PivotBook, table: PivotTable): void;
            protected _isVisible(): boolean;
            private _menu;
        }

        /**
         * 피벗 AI 패널 옵션.<br/>
         */
        declare interface PivotAiPanelOptions extends PivotPanelOptions {
            /**
             * AI 패널의 위치 및 표시 방식.<br/>
             * - 'inspector': 인스펙터 탭으로 표시. 인스펙터가 보이지 않으면 자동으로 표시한다.
             * - 'explorer': 탐색기 탭으로 표시. 탐색기가 보이지 않으면 자동으로 표시한다.
             * - 'right' / 'left': 북의 오른쪽/왼쪽에 고정된 패널로 표시. 기존 좌/우 고정 layout과 동일하다.
             * - 'float': 북 위에 떠 있는 패널로 표시. {@link floatBounds}로 위치/크기 결정. 사용자가 자유롭게 이동/크기 변경 가능.
             *
             * @default 'right'
             */
            position?: AIPanelPosition;
            prompter?: AIPrompterOptions;
            /**
             * 'outside' 모드일 때, 패널의 기본 너비.<br/>
             *
             * @default 300 px
             */
            width?: number;
            /**
             * {@page position}이 'left', 'right' 모드일 때, 패널의 최소 너비.<br/>
             *
             * @default 100 px
             */
            minWidth?: number;
            /**
             * {@page position}이 'float' 모드일 때, 패널의 최소 높이.<br/>
             *
             * @default 200
             */
            minHeight?: number;
            /**
             * Floating 모드일 때 패널의 위치/크기. 사용자가 드래그/리사이즈하면 자동 갱신된다.
             * 미지정 시 control 우상단에 기본 크기로 표시한다.
             */
            floatBounds?: IRect;
            /**
             * 드래그로 dock/undock 자동 전환 활성화 여부.
             * - true: docked 상태에서 header를 끌면 floating으로 전환되고,
             *   floating 상태에서 패널을 좌/우 모서리로 끌면 해당 사이드로 dock된다.
             * - false: 헤더의 dock/undock 버튼으로만 전환할 수 있다.
             *
             * @default true
             */
            autoDock?: boolean;
        }

        declare class PivotAIPanelView extends InspectorPanelView<PivotAiPanel> {
            private _headerView;
            private _promptView;
            constructor(doc: Document, model: PivotAiPanel);
            protected _doInit(doc: Document, initData: any): void;
            setModel(model: PivotAiPanel): this;
            protected _doInitDom(doc: Document, dom: HTMLElement): void;
            render(doc: Document, force: boolean): void;
            click(element: Element, shift: boolean, meta: boolean): boolean;
            getPopupMenu(target: Element): undefined;
        }

        declare class PivotAIResources extends ROptionable<PivotAIResourcesOptions> {
            private _book;
            static defaults: PivotAIResourcesOptions;
            private _systemContext?;
            private _developerContext?;
            constructor(_book: PivotBook);
            get systemContext(): string | undefined;
            get developerContext(): string | undefined;
            prepare(): Promise<void>;
            getTools(): AICommand[];
            getCubeContext(cubeName: string): string;
            /**
             * '설정 방법'(config 예시) 지식을 외부 RAG 마이크로서비스에 REST(POST)로 질의한다(외부 리소스 주입점).<br/>
             * 코어는 검색 코퍼스를 내장하지 않으므로, resources.featureSearch.url이 주입된 경우에만 동작한다.<br/>
             * 요청 body는 { query }, 응답은 { count, grounding } 계약이며, 검색 결과는 config 도구의 근거로 쓰인다.
             */
            searchFeatures(query: string): Promise<{
                count: number;
                grounding: string;
            }>;
            private _ensureSystemContext;
        }

        declare interface PivotAIResourcesOptions extends ROptions {
            /**
             * @default "rag/system_context.md"
             */
            systemContextPath?: string;
            /**
             * @default "rag/developer_context.md"
             */
            developerContextPath?: string;
            /**
             * '설정 방법 검색'(search_features 도구)이 호출할 RAG 엔드포인트.<br/>
             * RAG 엔드포인트는 POST 메서드로 요청을 받아야 하고, 요청 body는 { query }, 응답은 { count, grounding }이어야 한다.
             */
            featureSearch?: {
                /** POST 대상 URL. */
                url: string;
                /** 모든 요청에 추가할 헤더(예: Authorization). */
                headers?: Record<string, string>;
                /**
                 * 원격 RAG 검색 사용 여부.
                 * @default true
                 */
                enabled?: boolean;
            };
        }

        declare type PivotAlign = 'left' | 'center' | 'right';

        /**
         * Data Analysis 결과를 나타내는 객체.<br/>
         */
        declare class PivotAnalysis {
            private _findings;
            private _annos;
            private _visible;
            constructor(findings: Finding[], warnings?: string[]);
            get visible(): boolean;
            get count(): number;
            get firstAnnotation(): PivotAnnotation | undefined;
            show(manager: PivotAnalysisManager): boolean;
            hide(manager: PivotAnalysisManager): boolean;
            dispose(manager: PivotAnalysisManager): void;
            getTooltip(table: PivotTable, finding: Finding): string;
            getBounds(): {
                row1: number;
                col1: number;
                row2: number;
                col2: number;
            } | undefined;
            private $_build;
        }

        /**
         * 피벗 테이블의 Data Analysis 결과를 관리하는 객체.<br/>
         * 여러 개의 PivotAnalysis를 관리하며, 각 분석 결과를 테이블에 표시하거나 제거할 수 있다.<br/>
         * 각 분석 결과는 PivotAnalysis 객체로 표현되며, 분석 결과의 심각도에 따라 스타일을 적용할 수 있다.
         */
        declare class PivotAnalysisManager extends RObject {
            private _table;
            private _analyses;
            static _severityStyles: {
                [level: string]: CSSAppearance;
            };
            constructor(_table: PivotTable);
            get table(): PivotTable;
            get severityStyles(): {
                [level: string]: CSSAppearance;
            };
            get(index: number): PivotAnalysis | undefined;
            add(analysis: PivotAnalysis, show?: boolean, focus?: boolean): void;
            remove(analysis: PivotAnalysis): void;
            clear(): void;
            private $_changed;
        }

        declare abstract class PivotAnnotation<OP extends PivotAnnotationOptions = PivotAnnotationOptions> extends PivotItem<OP> {
            private _tag?;
            private _source?;
            measure: number;
            user?: any;
            userData?: any;
            normalize(helper: IPivotAnnotationHelper): this;
            containsTag(tag: string): boolean;
            abstract getTooltip(table: PivotTable): string;
            /** 적용할 스타일. CSSAppearance 객체이거나 미리 정의된 스타일 이름(string). */
            get style(): CSSAppearance | string | undefined;
            get message(): string | undefined;
            /** info/warning/error 수준. 지정되면 셀 코너 삼각형 / range 뱃지로 표시된다. */
            get level(): 'info' | 'warning' | 'error' | undefined;
            /** options에 설정된 source 대신 명시적으로 사용하는 게 필요할 때 */
            get source(): any;
            set source(value: any);
            protected _doApply(op: OP): void;
        }

        declare abstract class PivotAnnotationCollection<T extends PivotAnnotation = PivotAnnotation, OP extends PivotAnnotationCollectionOptions = PivotAnnotationCollectionOptions> extends PivotCollection<T, OP> {
            removeSource(source: any, render?: boolean): T[];
            toggleSource(source: any, visible?: boolean, render?: boolean): boolean;
        }

        declare interface PivotAnnotationCollectionOptions<T extends PivotAnnotationOptions = PivotAnnotationOptions> extends RCollectionOptions<T> {
            /**
             * 포함된 annotation에 적용되는 스타일 또는 미리 정의된 스타일 이름.<br/>
             */
            style?: PivotRangeAppearance | string;
        }

        declare interface PivotAnnotationLegendOptions extends PivotItemOptions {
        }

        declare class PivotAnnotationManager extends PivotTableItem<PivotAnnotationManagerOptions> {
            private _cells;
            private _ranges;
            private _groups;
            private _styles;
            private _revision;
            protected _doInit(op: PivotAnnotationManagerOptions): void;
            get isEmpty(): boolean;
            get cells(): PivotCellAnnotationCollection;
            get ranges(): PivotRangeAnnotationCollection;
            get revision(): number;
            /**
             * annotation의 style 참조를 실제 CSSAppearance(또는 raw css string)로 해석한다.
             * - 객체이면 그대로 반환.
             * - 문자열이면 등록된 스타일 이름으로 간주하여 매핑된 style을 반환.
             */
            resolveStyle(ref: CSSAppearance | string | undefined): CSSAppearance | string | undefined;
            reset(): void;
            clear(): void;
            addCell(annotation: PivotCellAnnotationOptions): PivotCellAnnotation;
            addRange(annotation: PivotRangeAnnotationOptions): PivotRangeAnnotation;
            remove(annotation: PivotAnnotation): void;
            clearSource(source: any): void;
            toggleSource(source: any, visible?: boolean): void;
            protected _doApply(op: PivotAnnotationManagerOptions): void;
        }

        declare interface PivotAnnotationManagerOptions extends PivotTableItemOptions {
            cells?: PivotCellAnnotationCollectionOptions | PivotCellAnnotationOptions[];
            ranges?: PivotRangeAnnotationCollectionOptions | PivotRangeAnnotationOptions[];
            styles?: PivotAnnotationStyle[];
        }

        declare interface PivotAnnotationOptions extends PivotItemOptions {
            level?: 'info' | 'warning' | 'error';
            tag?: string;
            message?: string;
            source?: any;
            measure?: number | string;
            /**
             * CSS style or predefined style name.
             * Predefined styles can be defined in options.annotationsStyles as an array of PivotAnnotationStyle.
             */
            style?: CSSAppearance | string;
        }

        declare interface PivotAnnotationStyle {
            name: string;
            label?: string;
            hint?: string;
            level?: 'info' | 'warning' | 'error';
            style?: CSSAppearance | string;
            visibleInLegend?: boolean;
        }

        /**
         * 컬럼 너비를 자동으로 계산할 때 기준이 되는 위치.<br/>
         *
         * - `header`: 헤더 셀의 내용만 고려하여 너비 계산
         * - `total`: 소계/총계 셀의 내용만 고려하여 너비 계산
         * - `both`: 헤더 셀과 소계/총계 셀 중 더 긴 내용을 기준으로 너비 계산
         * - `all`: 헤더, 소계/총계, 일반 셀의 내용 중 가장 긴 내용을 기준으로 너비 계산
         *
         * @default 'both'
         */
        declare type PivotAutoWidthMode = 'header' | 'total' | 'both' | 'all';

        declare type PivotAxis = 'row' | 'column';

        declare class PivotBodyDefaults extends PivotTalbleDefaultBase<PivotTableBodyOptions> {
            protected _doInit(op: PivotTableBodyOptions): void;
        }

        /**
         * Pivot body view.<br/>
         * Value cell들이 표시되는 영역.
         */
        declare class PivotBodyView extends PivotElement<PivotTableBody> {
            selections: PivotSelectionManager;
            private _scrollPane;
            private _contentLayer;
            private _vScrollBar;
            private _vSpacer;
            private _hScrollBar;
            private _hSpacer;
            private _vScrollFill;
            private _hScrollFill;
            private _scrollCorner;
            private _fixedRowLayer;
            private _fixedColLayer;
            private _fixedCornerLayer;
            private _overlayLayer;
            private _rowMap;
            private _rowPool;
            private _totalRowHeight;
            private _clickedCell?;
            private _focusedCell?;
            private _focusView;
            private _selectLayer;
            private _selectPool;
            private _selectViews;
            private _annoRangeLayer;
            private _annoRangePool;
            private _annoRangeViews;
            private _spotlightLayer;
            private _spotlightPool;
            private _spotlightViews;
            private _crosshairView;
            private _feedbackLayer;
            private _fixedVrows;
            private _fixedVcols;
            private _lastRenderVersion;
            private _renderedVcols;
            private _vpR1;
            private _vpR2;
            private _vpC1;
            private _vpC2;
            private _isOverlay;
            private _overlayHideTimer;
            private _annoApplied;
            /** cell annotation 적용 정보 캐시. key = row * _annoCellStride + col. */
            private _annoCellMap;
            /** _annoCellMap을 마지막으로 빌드한 시점의 annotations.revision. */
            private _annoCellRev;
            /** _annoCellMap key 계산에 사용한 열 개수(stride). */
            private _annoCellStride;
            sbarWidth: number;
            sbarHeight: number;
            constructor(doc: Document, selections: PivotSelectionManager);
            protected _doInit(doc: Document): void;
            get totalRowHeight(): number;
            /** scroll container UIElement (overflow:hidden viewport) */
            get scrollPane(): UIElement;
            /** scroll container DOM element */
            get scrollDom(): HTMLElement;
            /** focused cell */
            get focusedCell(): IPivotBodyCellInfo | undefined;
            focusCell(cell: IPivotBodyCellInfo, clear: boolean, clicked?: boolean): boolean;
            get fixedVrows(): number[];
            get fixedVcols(): number[];
            /**
             * 행 단위 스크롤 모드 여부.
             * true이면 세로 스크롤 시 행 경계로 스냅된다.
             */
            get scrollByRow(): boolean;
            addFeedback(view: UIElement): void;
            removeFeedback(view: UIElement): void;
            getCell(target: Element): BodyCellView | undefined;
            getCellAt(x: number, y: number): BodyCellView | undefined;
            getViewBounds(cell1: IPivotBodyCellInfo, cell2: IPivotBodyCellInfo): IRect;
            /** Get bounds in visual (overlay) coordinates.
             *  Each edge is computed independently — fixed edges use pinned positions,
             *  non-fixed edges use scroll-adjusted positions clamped to the visible
             *  non-fixed area. This correctly handles selections spanning both
             *  fixed and non-fixed rows/cols. */
            private $_getVisualBounds;
            /** Per-axis clip-path: clips axes where the selection has no fixed cells
             *  so that non-fixed selections don't show borders over fixed layers. */
            private $_getClip;
            moveFocused(dr: number, dc: number, extend: boolean, center?: boolean): boolean;
            /**
             * 포커스를 절대 위치로 이동.<br/>
             * -1이면 마지막, undefined이면 현재 위치 유지.
             */
            moveFocusCellTo(row: number | undefined, col: number | undefined, extend: boolean, center?: boolean): boolean;
            /**
             * body 뷰에 현재 보이는 행 수.
             */
            getPageRowCount(): number;
            makeVisible(cell: IPivotBodyCellInfo, center?: boolean): void;
            activateCell(info: IPivotBodyCellInfo, clear: boolean, center?: boolean): boolean;
            /**
             * getCellAt과 동일하되, 범위를 벗어나면 유효 범위로 제한하여 항상 셀을 반환한다.
             */
            getCellAtClamped(x: number, y: number): IPivotBodyCellInfo;
            /**
             * 로컬 좌표(x, y)가 body 뷰포트(클라이언트 영역)를 벗어난 정도를 반환한다.
             * 양수이면 오른쪽/아래, 음수이면 왼쪽/위로 벗어남. 0이면 영역 내.
             */
            getLocalOverflow(x: number, y: number): {
                dx: number;
                dy: number;
            };
            /**
             * 현재 스크롤 위치에서 dx, dy만큼 상대 스크롤한다.
             */
            scrollBy(dx: number, dy: number): void;
            canScrollBy(dx: number, dy: number): boolean;
            protected _doInitDom(doc: Document, dom: HTMLElement): void;
            protected _doPrepare(doc: Document, model: PivotTableBody): void;
            protected _doMeasure(hintWidth: number, hintHeight: number): ISize;
            protected _doLayout(): void;
            getTooltip(elt: Element, x: number, y: number): string | undefined;
            private $_prepareSelections;
            private $_layoutSelections;
            private $_prepareRangeAnnotations;
            /**
             * range annotation을 selection과 동일한 overlay 박스 방식으로 배치한다.
             * annotation의 r1..c2는 matrix row/col 인덱스이므로 rows[r].vrow / cols[c].vcol로
             * vrow/vcol을 얻은 뒤 {@link $_getVisualBounds}로 시각 좌표 박스를 계산한다.
             */
            private $_layoutRangeAnnotations;
            private $_prepareSpotlights;
            /**
             * spotlight를 range annotation과 동일한 overlay 박스 방식으로 배치한다.
             * 좌표/컬링/clip 처리는 {@link $_layoutRangeAnnotations}와 같고, 뱃지/level은 없다.
             */
            private $_layoutSpotlights;
            private $_checkFocused;
            private $_onBodyScroll;
            private $_renderViewport;
            /** 두 vcol 배열이 같은 순서로 동일한지 비교한다(렌더 대상 컬럼 집합 변화 판정용). */
            private $_sameVcols;
            /**
             * cell annotation 스타일을 현재 렌더된 셀들(본문 + 고정 레이어)에 적용한다.
             * 매 렌더 패스에서 보이는 모든 value 셀을 방문하여 매칭되는 annotation 스타일을
             * 적용하거나, 매칭되지 않으면 이전 스타일을 제거한다. 셀이 재활용되어도 잔상이 남지 않는다.
             */
            private $_applyCellAnnotations;
            /** Position overlay layer to cover the visible area (excluding scrollbars only) */
            private $_layoutOverlayLayer;
            /** Sync scroll pane scrollTop/scrollLeft from separated scrollbar positions. */
            private $_syncScrollPane;
            /** Set scroll position in full content space — maps to scrollbar position */
            private $_setScrollTop;
            /** Set scroll position in full content space — maps to scrollbar position */
            private $_setScrollLeft;
            /** Sync fixed layer scroll position and shadows */
            private $_syncFixedLayers;
            /**
             * Show overlay scrollbars and start auto-hide timer.
             * 바는 항상 pointerEvents:'none'(클릭 100% 통과)이며, 여기서는 스크롤 위치 피드백으로
             * opacity만 켠다.
             */
            private $_showOverlayScrollbars;
            /** Start timer to fade out overlay scrollbars */
            private $_startOverlayHideTimer;
        }

        export declare class PivotBook extends REventAware<IPivotBookEvents> implements IPivotBook {
            private static readonly cfgDefaults;
            private _pageAdding;
            private _cubes;
            private _config;
            private _general;
            private _header;
            private _headline;
            private _footer;
            private _inspector;
            private _explorer;
            private _ai;
            private _tableDefaults;
            private _aiApi;
            private _tooltip;
            private _selectors;
            private _pageMap;
            private _pages;
            private _commands;
            private _loadCallback?;
            private _pageIndex;
            constructor(cm?: PivotCubeManager, config?: PivotBookConfiguration);
            protected _doDispose(): void;
            editCommandStackChanged(stack: EditCommandStack, cmd: EditCommand, undoable: boolean, redoable: boolean): void;
            editCommandStackDirtyChanged(stack: EditCommandStack): void;
            editCommandError(stack: EditCommandStack, command: EditCommand): void;
            get config(): PivotBookConfiguration;
            get pageCount(): number;
            get pages(): PivotBookPage[];
            get firstPage(): PivotBookPage | undefined;
            get lastPage(): PivotBookPage | undefined;
            get filterSelectors(): FilterSelectorCollection;
            get isReadOnly(): boolean;
            isInteractive(): boolean;
            get cubeManager(): PivotCubeManager;
            tableByName(name: string): PivotBookPage | undefined;
            getSelectorPopupMenu(selector: FilterSelector): PopupMenu;
            onFilterSelectorChanged(selector: FilterSelector): void;
            onFilterSelectorAdded(selector: FilterSelector): void;
            onFilterSelectorRemoved(selector: FilterSelector): void;
            onFilterApply(selector: FilterSelector): void;
            get general(): PivotBookGeneral;
            get isEmpty(): boolean;
            /**
             * Number of pivot tables in this book.
             */
            get tableCount(): number;
            /**
             * Pivot tables in this book.
             */
            get tables(): PivotBookPage[];
            /**
             * Pivot book header.
             */
            get header(): PivotBookHeader;
            /**
             * Pivot book headline.
             */
            get headline(): PivotHeadline;
            /**
             * Pivot book footer.
             */
            get footer(): PivotBookFooter;
            /**
             * Pivot table inspector.
             */
            get inspector(): PivotInspector;
            /**
             * Pivot table explorer.
             */
            get explorer(): PivotExplorer;
            get ai(): PivotAI;
            get tableDefaults(): PivotTableDefaults;
            get aiApi(): PivotAIApi;
            get tooltip(): PivotTooltip;
            get activePage(): PivotBookPage;
            get pageAdding(): boolean;
            setPageAdding(enabled: boolean): boolean;
            load(cm: PivotCubeManager, config: PivotBookConfiguration, callback?: (book: PivotBook) => void): void;
            save(): PivotBookConfiguration;
            setPageIndex(index: number): void;
            tableAt(index: number): PivotBookPage | undefined;
            getTable(name: string): PivotBookPage | undefined;
            tableById(id: string): PivotBookPage | undefined;
            forEach(callback: (table: PivotBookPage, index: number) => void): void;
            createTable(data: DataCube, options: PivotBookPageOptions, aggTable?: AggTable): PivotBookPage;
            addTable(table: PivotBookPage): PivotBookPage;
            _internalAddTable(table: PivotBookPage, index?: number): void;
            removeTable(table: PivotBookPage): void;
            _internalRemoveTable(table: PivotBookPage | string): boolean;
            removeField(field: PivotField): void;
            removeFields(fields: PivotField[]): void;
            moveField(field: PivotField, section: PivotSection, newIndex: number): void;
            addValueField(table: PivotTable, name: string, measure: string, aggregate: PivotAggregationType): void;
            addFilterField(table: PivotTable, name: string): void;
            addDimensionField(table: PivotTable, name: string, axis: 'column' | 'row'): void;
            updateItem(model: ROptionable, options: any): void;
            updateProp(model: ROptionable, prop: string, value: any): void;
            toggleProp(model: ROptionable, prop: string): void;
            getCube(name: string): PivotCube | undefined;
            cubeNames(): string[];
            measureNames(cube: string | PivotCube): string[];
            getNextTableName(base?: string): string;
            loadTableFields(table: PivotTable, fields: PivotFieldManagerOptions): void;
            updateTableOptions(table: PivotTable, options: Partial<PivotTableOptions>): void;
            updateValuesAsRows(table: PivotTable, valuesAsRows: boolean): void;
            setup(): void;
            export(type: string): void;
            canUndo(): boolean;
            canRedo(): boolean;
            undo(): void;
            redo(): void;
            prepareRender(): void;
            afterRender(): void;
            checkLoaded(): void;
            validatePageName(name: string, excludePage?: PivotBookPage): boolean;
            changePageName(page: PivotBookPage, newName: string): void;
            _itemChanged(item: ROptionable, tag: any): void;
            private $_loadTemplates;
            private $_loadTables;
            private $_loadTable;
            private $_removeTable;
            private $_execute;
            executeCommand(cmd: EditCommand): any;
            _requestUI(action: {
                name: string;
                params: any;
            }): void;
            private $_positionCheckedHandler;
            private $_positionHandler;
            private _selectorMenu;
        }

        /**
         * 피벗 북(PivotBook) 전체를 구성하는 최상위 설정 모델.<br/>
         * 북을 구성하는 각 영역(헤더/푸터/본문/헤더바/패널 등)의 옵션과,
         * 표시할 테이블 페이지 목록, 필터 셀렉터, export 기본값을 한 번에 정의한다.<br/>
         * {@link PivotBook.load}에 전달되어 북을 초기화하며, {@link PivotBook.save}로 현재 상태를
         * 다시 이 형태로 직렬화할 수 있다.
         */
        export declare interface PivotBookConfiguration {
            /**
             * 재사용 가능한 명명된 옵션 템플릿 모음.<br/>
             * 다른 설정에서 참조해 공통 옵션을 공유하기 위한 용도로 예약되어 있다.
             */
            templates?: ConfigObject;
            /**
             * 북 전역 일반 옵션.<br/>
             * 테마, 선택 모드(selectMode), 휠 스크롤 축, 자동 컬럼 너비, 각 기능(인스펙터/탐색기/
             * 내보내기 등) 활성화 여부 등 북 전체에 적용되는 설정을 포함한다.
             */
            general?: PivotBookGeneralOptions;
            /**
             * 북 상단 헤더 영역 옵션(메뉴바, 헤더 높이 등).<br/>
             * `boolean` 축약형으로 지정하면 헤더 영역의 표시 여부만 토글한다.
             */
            header?: PivotBookHeaderOptions | boolean;
            /**
             * 헤드라인 패널 옵션.<br/>
             * `boolean` 축약형으로 지정하면 헤드라인 패널의 표시 여부만 토글한다.
             */
            headline?: PivotHeadlineOptions | boolean;
            /**
             * 북 하단 푸터 영역 옵션(페이지 전환 탭바 등).<br/>
             * `boolean` 축약형으로 지정하면 푸터 영역의 표시 여부만 토글한다.
             */
            footer?: PivotBookFooterOptions | boolean;
            /**
             * 인스펙터 옵션.<br/>
             * 필드/필터 패널을 담는 도킹/플로팅 패널로, 배치 위치(position), 너비, 표시 여부 등을 설정한다.<br/>
             * `boolean` 축약형으로 지정하면 인스펙터의 표시 여부만 토글한다.
             */
            inspector?: PivotInspectorOptions | boolean;
            /**
             * 탐색기 옵션.<br/>
             * 선택한 셀/영역의 상세 데이터를 grid/chart/map 패널로 보여주는 탐색기 뷰를 구성한다.<br/>
             * `boolean` 축약형으로 지정하면 탐색기의 표시 여부만 토글한다.
             */
            explorer?: PivotExplorerOptions | boolean;
            /**
             * 툴팁 옵션.<br/>
             * 호버 지연 시간(delay), 표시 지속 시간(duration), 포인터 추적(followPointer) 등을 설정한다.<br/>
             * `boolean` 축약형으로 지정하면 툴팁의 사용 여부만 토글한다.
             */
            tooltip?: PivotTooltipOptions | boolean;
            /**
             * 이 북에 포함되는 피벗 테이븓 구성 요소들의 기본 설정 모음.<br/>
             * 각 테이블의 헤더/바/패널 등에서 별도로 지정하지 않은 옵션은 여기에서 명시적으로 지정된 값을 상속한다.
             */
            tableDefaults?: PivotTableDefaultOptions;
            /**
             * 북에 포함되는 테이블 페이지 목록.<br/>
             * 각 페이지는 바인딩할 데이터 큐브(cube), 제목, 행/열/필터 필드 배치 등 피벗 테이블 구성을 가진다.
             * 단일 페이지만 사용할 때는 배열 대신 객체 하나로 지정할 수 있다.
             */
            tables?: PivotBookPageOptions[] | PivotBookPageOptions;
            /**
             * 필터 셀렉터 목록.<br/>
             * 버튼/드롭다운/트리/타임라인/슬라이더 등 차원 값을 선택해 필터링하는 UI 셀렉터를 정의한다.
             * 단일 셀렉터만 사용할 때는 배열 대신 객체 하나로 지정할 수 있다.
             */
            filterSelectors?: FilterSelectorOptionsTypes[] | FilterSelectorOptionsTypes;
            annotationLegend?: PivotAnnotationLegendOptions | boolean;
            /**
             * 셀 선택(영역 선택) 동작 옵션.
             */
            cellSelect?: PivotCellSelectOptions;
            /**
             * 종류별 export 기본 설정.<br/>
             */
            export?: {
                /** CSV 내보내기 기본 옵션. */
                csv?: PivotCsvExportOptions;
                /** Excel 내보내기 기본 옵션. */
                excel?: PivotExcelExportOptions;
                /** PDF 내보내기 기본 옵션. */
                pdf?: PivotPdfExportOptions;
            };
            /**
             * AI 관련 옵션.<br/>
             */
            ai?: PivotAIOptions;
            /**
             * AI 모델 옵션 목록.<br/>
             * 북에서 사용할 AI 모델을 등록한다. 모델은 로컬 모델과 원격 모델로 나뉘며, 각각의 옵션 구조가 다르다.<br/>
             * 단일 모델만 사용할 때는 배열 대신 객체 하나로 지정할 수 있다.
             */
            aiModels?: PivotLocalAIModelOptions | PivotRemoteAIModelOptions | (PivotLocalAIModelOptions | PivotRemoteAIModelOptions)[];
        }

        declare abstract class PivotBookElement<T extends PivotBookItem = PivotBookItem> extends PivotElement<T> {
            getContextMenu(target: Element): PopupMenu | undefined;
            protected _isAbsolute(): boolean;
            protected _doGetContextMenu(target: Element): PopupMenu | undefined;
        }

        /**
         * Pivot footer model.<br/>
         */
        declare class PivotBookFooter extends PivotBookItem<PivotBookFooterOptions> {
            static defaults: PivotBookFooterOptions;
            private _tabBar;
            protected _doInit(op: PivotBookFooterOptions): void;
            get tabBar(): PivotTabBar;
        }

        export declare interface PivotBookFooterOptions extends PivotBookItemOptions {
            tabBar?: PivotTabBarOptions | boolean;
        }

        /**
         * 피벗 북 푸터 뷰.
         */
        declare class PivotBookFooterView extends PivotBookElement<PivotBookFooter> {
            private _page;
            private _tabBarView;
            private _countsView;
            constructor(doc: Document, owner: IPivotTabBarOwner);
            get tabBarView(): PivotTabBarView;
            setPage(page: PivotPageView): this;
            protected _doInit(doc: Document): void;
            protected _doPrepare(doc: Document, model: PivotBookFooter): void;
            protected _doMeasure(hintWidth: number, hintHeight: number): ISize;
            protected _doLayout(): void;
            protected _doClick(dom: HTMLElement): boolean;
            protected _doGetContextMenu(target: Element): PopupMenu | undefined;
        }

        declare class PivotBookGeneral extends PivotBookItem<PivotBookGeneralOptions> {
            static defaults: PivotBookGeneralOptions;
            protected _doApply(op: PivotBookGeneralOptions): void;
        }

        export declare interface PivotBookGeneralOptions extends PivotBookItemOptions {
            /**
             * true로 지정되면 실행시간에 사용자가 피벗테이블 내용을 변경할 수 없디.<br/>
             * 스크롤이나 헤더 셀 확장/축소 등 내용 변경과 관련 없는 action들은 여전히 가능하다.
             *
             * @default false
             */
            readonly?: boolean;
            /**
             * 북과 테이블들에 기본 적용되는 스타일 테마.<br/>
             * 지정하지 않으면 시스템 테마를 따른다.
             */
            theme?: 'system' | 'dark' | 'light' | string;
            /**
             * {@page theme}이 'light'일 때 적용할 테마 이름.<br/>
             *
             * @default 'light'
             */
            lightTheme?: string;
            /**
             * {@page theme}이 'dark'일 때 적용할 테마 이름.<br/>
             *
             * @default 'dark'
             */
            darkTheme?: string;
            /**
             * 인스펙터(필드/필터 패널) 사용 여부.<br/>
             * `false`이면 인스펙터를 표시하지 않는다.
             *
             * @default true
             */
            enableInspector?: boolean;
            /**
             * 탐색기 패널 사용 여부.<br/>
             * `false`이면 탐색기 자체(상세/차트/지도 포함)를 표시하지 않는다.
             *
             * @default true
             */
            enableExplorer?: boolean;
            /**
             * 탐색기 상세보기(detail) 패널 사용 여부.<br/>
             * `false`이면 탐색기에서 상세보기 모드를 쓸 수 없다.
             *
             * @default true
             */
            enableDetail?: boolean;
            /**
             * 탐색기 차트 패널 사용 여부.<br/>
             * `false`이면 탐색기에서 차트 모드를 쓸 수 없다.
             *
             * @default true
             */
            enableChart?: boolean;
            /**
             * 탐색기 지도(map) 패널 사용 여부.<br/>
             * `false`이면 탐색기에서 지도 모드를 쓸 수 없다.
             *
             * @default true
             */
            enableMap?: boolean;
            /**
             * 북 설정(설정 다이얼로그/메뉴) 사용 여부.<br/>
             * `false`이면 설정 UI를 제공하지 않는다.
             *
             * @default true
             */
            enableSettings?: boolean;
            /**
             * 내보내기(Excel/CSV/PDF 등) 사용 여부.<br/>
             * `false`이면 내보내기 UI·동작을 허용하지 않는다.
             *
             * @default true
             */
            enableExport?: boolean;
            /**
             * Undo/Redo 사용 여부.<br/>
             * `false`이면 실행 취소·다시 실행을 허용하지 않는다.
             * [주의] 최초 북 생성시 또는 {@page PivotBook.load}로 다시 로드될 때 결정되면 이후에는 변경할 수 없다.
             *
             * @default true
             */
            undoable?: boolean;
            /**
             * 휠 스크롤 시 스크롤 축 결정 방식.<br/>
             * - `dominant`: 휠 이벤트의 deltaX와 deltaY 중 절대값이 큰 축을 스크롤 축으로 결정
             * - 'both': deltaX, deltaY 모두 스크롤 축으로 결정하여 대각선 스크롤 허용
             * - `horizontal`: 항상 수평 축을 스크롤 축으로 결정
             * - `vertical`: 항상 수직 축을 스크롤 축으로 결정
             *
             * @default 'dominant'
             */
            wheelAxis?: WheelAxisMode;
            /**
             * 휠 스크롤 시 끝에 도달하면 스크롤이 더 이상 진행되지 않고, 부모 컨테이너로 스크롤 이벤트가 전달되는지 여부.<br/>
             * - `true`: 스크롤 끝에 도달하면 부모 컨테이너로 스크롤 이벤트 전달
             * - `false`: 스크롤 끝에 도달해도 부모 컨테이너로 스크롤 이벤트 전달하지 않음
             *
             * @default true
             */
            wheelScrollChaining?: boolean;
            /**
             * 컬럼 너비 리사이즈 드래그 동작 방식.<br/>
             * - `true`: 드래그 중 실시간으로 컬럼 너비 변경 (live)
             * - `false`: 드래그 중에는 수직 가이드 라인만 표시하고 드롭 시점에 적용 (feedback)
             *
             * @default true
             */
            liveColumnResize?: boolean;
            /**
             * 컬럼 너비를 자동으로 계산할 때 기준이 되는 위치.<br/>
             *
             * @default 'both'
             */
            autoWidth?: PivotAutoWidthMode;
            /**
             * 사용자 마우스, 키보드 입력 등 인터랙션 허용 여부.<br/>
             *
             * @default true
             */
            interactive?: boolean;
        }

        declare class PivotBookHeader extends PivotBookItem<PivotBookHeaderOptions> {
            static defaults: PivotBookHeaderOptions;
            private _menuBar;
            private _filterBar;
            private _layoutBar;
            protected _doInit(op: PivotBookHeaderOptions): void;
            get menuBar(): PivotMenuBar;
            get filterBar(): PivotFilterBar;
            get layoutBar(): PivotLayoutBar;
            isVisible(): boolean;
            prepareRender(): void;
        }

        export declare interface PivotBookHeaderOptions extends PivotBookItemOptions {
            /**
             * 북 헤더에 표시되는 메뉴바 옵션.<br/>
             */
            menuBar?: PivotMenuBarOptions | boolean;
            /**
             * 북 헤더에 표시되는 필터바 옵션.<br/>
             */
            filterBar?: PivotFilterBarOptions | boolean;
            /**
             * 북 헤더에 표시되는 레이아웃바 옵션.<br/>
             */
            layoutBar?: PivotLayoutBarOptions | boolean;
            /**
             * 헤더 높이.<br/>
             * pixel 단위로 지정한다. 지정하지 않으면 기본 높이로 표시된다.
             */
            height?: number;
        }

        declare class PivotBookHeaderView extends PivotBookElement<PivotBookHeader> {
            private _menuBarView;
            private _filterBarView;
            private _layoutBarView;
            constructor(doc: Document);
            protected _doInit(doc: Document): void;
            setPage(pageView: PivotPageView): this;
            protected _doPrepare(doc: Document, model: PivotBookHeader): void;
            protected _doMeasure(hintWidth: number, hintHeight: number): ISize;
            protected _doLayout(): void;
            protected _doClick(dom: HTMLElement): boolean;
            getPopupMenu(target: Element): PopupMenu | undefined;
        }

        /**
         * Pivot book item model.<br/>
         */
        declare abstract class PivotBookItem<OP extends PivotBookItemOptions = PivotBookItemOptions> extends PivotItem<OP> {
            private _book;
            constructor(book: IPivotBook);
            get book(): PivotBook;
            _optionChanged(tag?: any): void;
        }

        export declare interface PivotBookItemOptions extends PivotItemOptions {
        }

        declare class PivotBookPage extends PivotTable<PivotBookPageOptions> implements IPivotBookPage {
            protected static defaults: PivotBookPageOptions;
            private _detail;
            private _chart;
            private _map;
            private _book;
            private _readonly;
            private _index;
            private _explorerPosition;
            constructor(book: PivotBook);
            _doInit(op: PivotBookPageOptions): void;
            get book(): PivotBook;
            get index(): number;
            get id(): string;
            /**
             * Pivot table name.<br/>
             * Should be unique within a PivotBook.
             */
            get name(): string;
            set name(value: string);
            get parent(): PivotBookPage | undefined;
            get detail(): PivotBookPageDetailContext;
            get chart(): PivotBookPageChartContext;
            get map(): PivotBookPageMapContext;
            get title(): string;
            get explorerMode(): ExplorerMode;
            set explorerMode(mode: ExplorerMode);
            get explorerPosition(): ExplorerPosition;
            getContextMenu(cell: PivotColumnHeaderCell | PivotRowHeaderCell | PivotColumnHeaderGrandCell | PivotRowHeaderGrandCell | PivotHeaderGrandValueCell | PivotHeaderSeriesCell): PopupMenu | undefined;
            getBodyContextMenu(): PopupMenu;
            get isReadOnly(): boolean;
            protected _createColumnBar(): PivotColumnBar;
            protected _createRowBar(): PivotRowBar;
            protected _doApply(op: PivotBookPageOptions): void;
            setAggregate(measure: string, aggregate: PivotAggregationType): boolean;
            setAggFilter(field: PivotFilterField, values: any[]): void;
            setFieldSort(dimension: string, sort: IPivotFieldSort | null): void;
            getFieldMenu(field: PivotField): PopupMenu | undefined;
            prepareRender(): void;
            _setIndex(index: number): void;
            private $_execute;
            private _sortHandler;
            private _sortHeaderHandler;
            private _sortMeasureHandler;
            private _grandTotalMenu;
            private UNDO_MENU;
            private REDO_MENU;
            private EXPAND_MENU;
            private EXPAND_ALL_MENU;
            private COLLAPSE_ALL_MENU;
            private _dimensionMenu;
            private _changeAggregateHandler;
            private _aggregateHiddenHandler;
            private _measureMenu;
            private $_getSeries;
            private _headerCellMenu;
            private _headerLeafMenu;
            private _headerTotalMenu;
            private _headerMeasureMenu;
            private _bodyMenu;
            private _seriesMenu;
        }

        declare class PivotBookPageChartContext extends PivotBookPageContext<PivotBookPageChartOptions> {
            private _chart;
            _doInit(_op: PivotBookPageChartOptions): void;
            get chart(): PivotChart;
            getInfo(): string;
            prepareRender(): void;
        }

        export declare interface PivotBookPageChartOptions extends PivotBookPageContextOptions {
            chart?: PivotChartOptions;
        }

        declare abstract class PivotBookPageContext<OP extends PivotBookPageContextOptions = PivotBookPageContextOptions> extends PivotTableItem<OP> {
            protected _cell: IPivotBodyCellInfo | undefined;
            protected _selection: PivotSelection | undefined;
            get cell(): IPivotBodyCellInfo | undefined;
            get selection(): PivotSelection | undefined;
            abstract getInfo(): string;
            abstract prepareRender(): void;
            setCell(cell: IPivotBodyCellInfo): this;
            setSelection(cell: IPivotBodyCellInfo, selection: PivotSelection): this;
            getCount(): string;
            getMeasure(): MeasureMeta;
            getRowDimensions(): any[];
            getColumnDimensions(): any[];
        }

        export declare interface PivotBookPageContextOptions extends PivotTableItemOptions {
        }

        declare class PivotBookPageDetailContext extends PivotBookPageContext<PivotBookPageDetailOptions> {
            static defaults: PivotBookPageDetailOptions;
            private _filtered;
            private _source;
            private _rows;
            private _fields;
            private _sourceFields;
            get source(): IDataGridSource;
            get rows(): number[];
            getFields(): string[] | undefined;
            /**
             * grid view에 전체 행을 표시할 때, 원본 데이터를 그대로 사용할지, 아니면 필터링된 데이터를 사용할지 여부를 설정한다.
             */
            setFiltered(value: boolean): this;
            protected _doApply(op: PivotBookPageDetailOptions): void;
            prepareRender(): void;
            getInfo(): string;
            getCount(): string;
            private $_equalSources;
        }

        export declare interface PivotBookPageDetailOptions extends PivotBookPageContextOptions {
            /**
             * 디테일 패널에서 데이터를 가져올 소스.<br/>
             * - 'cube' : 피벗 테이블에 바인딩된 데이터 큐브에서 데이터를 가져온다.
             * - 'source' : 피벗 테이블의 원본 데이터 소스에서 데이터를 가져온다.<br/>
             *
             * @default 'cube'
             */
            dataMode?: 'cube' | 'source';
            /**
             * 디테일 패널에서 행 단위 스크롤 허용 여부.<br/>
             * true로 설정하면 행 단위로 스크롤된다.<br/>
             * 지정하지 않으면 false로 동작한다.
             */
            scrollByRow?: boolean;
            /**
             * 행 색상 교차 표시 여부.<br/>
             * true로 설정하면 행 색상이 교차되어 표시된다.<br/>
             *
             * @default true
             */
            alternateRowColor?: boolean;
            /**
             * 상세보기에서 표시할 필드 목록.<br/>
             * 지정한 순서대로 표시된다.
             * 지정하지 않으면 모든 필드를 표시한다.
             */
            fields?: string[];
            /**
             * 상세보기에서 원본 필드 이름 목록.<br/>
             * 지정한 순서대로 표시된다.
             * 지정하지 않으면 모든 필드를 표시한다.
             */
            sourceFields?: string[];
        }

        declare class PivotBookPageMapContext extends PivotBookPageContext<PivotBookPageMapOptions> {
            private _chart;
            _doInit(_op: PivotBookPageMapOptions): void;
            get chart(): PivotMapChart;
            getInfo(): string;
            prepareRender(): void;
        }

        export declare interface PivotBookPageMapOptions extends PivotBookPageContextOptions {
            chart?: PivotMapChartOptions;
        }

        export declare interface PivotBookPageOptions extends PivotTableOptions {
            id?: string;
            name: string;
            /**
             * 부모 페이지 {@link id}.<br/>
             * 지정하지 않으면 최상위 페이지로 동작한다.
             * [주의] 최초 load 시점에만 적용되며, 이후에는 변경할 수 없다.
             */
            parent?: string;
            /**
             * Pivot table에 바인딩할 데이터큐브 이름.<br/>
             */
            cube?: string;
            /**
             * table 페이지에 표시되는 제목.<br/>
             */
            title?: string;
            /**
             * 탐색기 패널이 붙는 위치.<br/>
             * - `bottom`: 탐색기를 아래쪽에 두고 상/하로 분할
             * - `right`: 탐색기를 오른쪽에 두고 좌/우로 분할
             * - `left`: 탐색기를 왼쪽에 두고 좌/우로 분할
             *
             * @default 'bottom'
             */
            explorerPosition?: ExplorerPosition;
            /**
             * 탐색기 모드.<br/>
             * - `detail`: 상세보기 모드
             * - `chart`: 차트 모드
             * - `map`: 지도 차트 모드
             *
             * @default 'detail'
             */
            explorerMode?: ExplorerMode;
            /**
             * 탐색기 초기 너비.<br/>
             * pixel 단위 또는 퍼센트 단위로 지정 가능.<br/>
             * #201
             *
             * @default '35%'
             */
            explorerWidth?: number | string;
            /**
             * 탐색기 초기 높이.<br/>
             * pixel 단위 또는 퍼센트 단위로 지정 가능.<br/>
             * #201
             *
             * @default '25%'
             */
            explorerHeight?: number | string;
            detail?: PivotBookPageDetailOptions;
            chart?: PivotBookPageChartOptions;
            map?: PivotBookPageMapOptions;
        }

        declare class PivotCellAnnotation extends PivotAnnotation<PivotCellAnnotationOptions> {
            row: number;
            col: number;
            normalize(helper: IPivotAnnotationHelper): this;
            getTooltip(table: PivotTable): string;
        }

        declare class PivotCellAnnotationCollection extends PivotAnnotationCollection<PivotCellAnnotation, PivotCellAnnotationCollectionOptions> {
            /** (row, col) 위치에 지정된 cell annotation을 찾는다. 없으면 undefined. */
            findAt(row: number, col: number): PivotCellAnnotation | undefined;
            protected _createItem(): PivotCellAnnotation;
        }

        declare interface PivotCellAnnotationCollectionOptions extends PivotAnnotationCollectionOptions<PivotCellAnnotationOptions> {
        }

        /**
         * row, col 모두 숫자로 지정하면 위치 변환 없이 셀 위치로 판단한다.
         */
        declare interface PivotCellAnnotationOptions extends PivotAnnotationOptions {
            row?: number | any[];
            col?: number | any[];
            /**
             * 셀에 직접 적용되는 paint-only 스타일(CSSAppearance) 또는 미리 정의된 스타일 이름.
             * border/padding 등 layout에 영향을 주는 속성은 CSSAppearance에서 제외되어 있다.
             */
            style?: CSSAppearance | string;
        }

        declare abstract class PivotCellOverlay<OP extends CellOverlayOptions = CellOverlayOptions> extends ROptionable<OP> {
            static defaults: CellOverlayOptions;
            private _table;
            private _visible;
            constructor(table: PivotTable);
            get table(): PivotTable<PivotTableOptions>;
            get visible(): boolean;
            set visible(value: boolean);
            prepare(measure: number, statsManager?: ValueFieldStatsManager): void;
            _optionChanged(tag?: any): void;
            protected _doApply(op: OP): void;
            /** prepare 호출을 통해 주입되는 stats 매니저 (overlay 구현이 선택적으로 사용). */
            protected _statsManager?: ValueFieldStatsManager;
            protected abstract _doPrepare(table: IPivotTable, measure: number): void;
        }

        export declare interface PivotCellSelectOptions extends PivotBookItemOptions {
        }

        declare type PivotCellStyle = {
            /**
             * 글자색.
             */
            color?: string;
            /**
             * 배경색.
             */
            backgroundColor?: string;
            /**
             * 굵게.
             */
            bold?: boolean;
            /**
             * 기울임.
             */
            italic?: boolean;
            /**
             * 밑줄.
             */
            underline?: boolean;
            /**
             * 정렬.
             */
            align?: PivotAlign;
            /**
             * 표시할 아이콘 이름. 빌트인 또는 `PivotIconRegistry.registerIcon()`으로 등록된 이름.
             * `iconSet` + `iconIndex`보다 우선한다.
             */
            icon?: PivotIcon | string;
            /**
             * 아이콘 세트 이름. `iconIndex`와 함께 지정하면 세트의 해당 인덱스 아이콘이 표시된다.
             * `icon`이 지정된 경우 무시된다.
             */
            iconSet?: PivotIconSet | string;
            /**
             * `iconSet` 내 아이콘 인덱스 (0부터). 음수면 끝에서부터.
             */
            iconIndex?: number;
            /**
             * 아이콘 색상. colorable 아이콘에만 의미가 있다. 미지정 시 셀의 텍스트 색상을 따른다.
             */
            iconColor?: string;
            /**
             * 아이콘 배치. 기본 `'auto'`.
             */
            iconPlacement?: IconPlacement;
            /**
             * true면 아이콘만 표시하고 값 텍스트를 숨긴다.
             */
            iconOnly?: boolean;
            /**
             * 아이콘 크기(px). 미지정 시 기본값(14)이 적용된다.
             */
            iconSize?: number;
        };

        /**
         * 피벗 셀 뷰.
         */
        declare abstract class PivotCellView extends UIElement {
            static isExpander(ev: PointerEvent): HTMLElement | undefined;
            protected _span: HTMLSpanElement;
            private _className?;
            private _text;
            private _stickyOffset;
            constructor(doc: Document, className: string);
            abstract render(width: number, table: PivotTable, info: any): void;
            /**
             * 셀이 부분적으로 스크롤되었을 때 label이 보이는 영역 중앙에 표시되도록 오프셋을 적용한다.
             * CSS custom property를 통해 span과 ::before 모두 동일한 오프셋으로 이동한다.
             */
            setStickyOffset(offset: number): void;
            setText(text: string): this;
            protected _checkClassName(elt: HTMLElement, className: string | undefined): void;
            protected _setText(text: string): void;
        }

        declare class PivotChart extends ROptionable<PivotChartOptions> {
            static defaults: PivotChartOptions;
            private _table;
            private _xPath;
            private _yPath;
            private _sPath;
            constructor(table: PivotTable);
            buildCellConfig(table: PivotTable, cell: IPivotBodyCellInfo): RealChart.ChartConfiguration;
            buildSelectionConfig(table: PivotTable, selection: PivotSelection, cell: IPivotBodyCellInfo): RealChart.ChartConfiguration;
            getPath(): string;
            _optionChanged(tag?: any): void;
            private $_resolveChartType;
            private $_buildPoints;
            private $_buildByRow;
            private $_buildByColumn;
            private $_buildSelectionSeriesByRow;
            private $_buildSelectionSeriesByColumn;
            private $_getSelectionSeriesName;
            private $_setSelectionPath;
            private $_buildSelectionRowPoints;
            private $_buildSelectionColPoints;
        }

        /**
         * 피벗 차트 패널 옵션.<br/>
         */
        declare interface PivotChartOptions extends ROptions {
            /**
             * 차트 시리즈의 기본 유형.<br/>
             *
             * @default 'column'
             */
            chartType?: PivotChartType;
            /**
             * 차트의 x축에 피벗테이블의 행 또는 열이 매핑되는지 여부.<br/>
             * - 'row': 피벗테이블의 행이 차트의 x축에 매핑된다.
             * - 'column': 피벗테이블의 열이 차트의 x축에 매핑된다.
             *
             * @default 'row'
             */
            xAxis?: 'row' | 'column';
        }

        declare class PivotChartPanel extends PivotExplorerPanel<PivotChartPanelOptions, PivotBookPageChartContext> {
            static defaults: PivotChartPanelOptions;
            get chart(): PivotChart;
            getCtx(): PivotBookPageChartContext;
            getMenu(table: PivotBookPage): PopupMenu;
            private _typeHandler;
            private _axisHandler;
            private _menu;
        }

        /**
         * 탐색기 피벗 차트 패널 옵션.<br/>
         */
        declare interface PivotChartPanelOptions extends PivotExplorerPanelOptions {
        }

        declare type PivotChartType = 'column' | 'bar' | 'line' | 'area' | 'scatter' | 'pie';

        declare abstract class PivotCollection<T extends ROptionable = ROptionable, OP extends RCollectionOptions = RCollectionOptions> extends RCollection<T, OP> {
            protected _table: PivotTable;
            constructor(_table: PivotTable);
            protected get keyProp(): string;
            _optionChanged(tag?: string | string[]): void;
        }

        declare interface PivotColumn {
            parent?: PivotColumn;
            col: number;
            vcol: number;
            type: 'g' | 'd' | 'm';
            level: number;
            index: any;
            dindex?: number;
            measure: number;
            label?: string;
            keyPath?: any[];
            serCell?: PivotColumnHeaderSeriesCell;
            values?: PivotColumn[];
            single?: boolean;
        }

        /**
         * Pivot column bar model.<br/>
         * Represents a column bar in a pivot table.
         */
        declare class PivotColumnBar extends PivotFieldBar<PivotColumnBarOptions> {
            static defaults: PivotColumnBarOptions;
            private _columns;
            private _values;
            private _filters;
            private _hideFilters;
            get filters(): PivotFilterField[];
            getMenu(): PopupMenu;
            getFilterMenu(field: PivotFilterField): PopupMenu;
            _optionChanged(tag?: any): void;
            get dimensions(): PivotDimensionField[];
            get values(): PivotValueField[];
            isVisible(): boolean;
            hasMeasure(): boolean;
            build(table: IPivotTable): void;
            prepareRender(): void;
        }

        declare class PivotColumnBarDefaults extends PivotTalbleDefaultBase<PivotColumnBarOptions> {
        }

        declare interface PivotColumnBarOptions extends PivotFieldBarOptions {
            /**
             * true로 설정하면 컬럼 바에 차원 필드가 표시되지 않는다.<br/>
             *
             * @default false
             */
            hideDimensionFields?: boolean;
            /**
             * true로 설정하면 컬럼 바에 값 필드가 표시되지 않는다.<br/>
             *
             * @default false
             */
            hideValueFields?: boolean;
            /**
             * true로 설정하면 컬럼 바에 필터 필드가 표시되지 않는다.<br/>
             *
             * @default false
             */
            hideFilterFields?: boolean;
        }

        /**
         * 피벗 컬럼 바 뷰.
         */
        declare class PivotColumnBarView extends PivotFieldBarView<PivotColumnBar> {
            private _dimDivider;
            private _filterDivder;
            private _filterLayer;
            private _filterPool;
            private _filterViews;
            private _menuButton;
            constructor(doc: Document);
            protected _doInit(doc: Document): void;
            protected _createValueLayer(doc: Document, className: string): UIElement;
            protected _createDimensionView(doc: Document): ColumnFieldView;
            protected _createMeasureView(doc: Document): PivotMeasureView;
            getFieldView(dom: Element): PivotFieldView | undefined;
            getFieldMenu(field: PivotFieldView): PopupMenu | undefined;
            getPopupMenu(target: Element): PopupMenu | undefined;
            protected _doPrepare(doc: Document, model: PivotColumnBar): void;
            protected _doMeasure(hintWidth: number, hintHeight: number): ISize;
            private $_prepareFilters;
        }

        /**
         * Pivot column header model.<br/>
         * Represents a column header in a pivot table.
         */
        declare class PivotColumnHeader extends PivotHeader<PivotColumnHeaderOptions> {
            static readonly defaults: PivotColumnHeaderOptions;
            private _grandCell;
            private _rows;
            private _columns;
            private _visColumns;
            private _totalPos;
            private _collapseSingleTotal;
            private _grandPos;
            private _grandFixed;
            private _measureVisible;
            private _measureCount;
            private _dateMetaCache;
            private _fixedColumns;
            private _fixedVColumns;
            get columns(): PivotColumn[];
            get visibleColumns(): PivotColumn[];
            get fixedColumns(): PivotColumn[];
            get fixedVColumns(): PivotColumn[];
            get visibleColCount(): number;
            get fixedColCount(): number;
            get scrollColCount(): number;
            get measureVisible(): boolean;
            get measureCount(): number;
            /**
             * 컬럼 수.
             */
            get colCount(): number;
            /**
             * Number of header rows.
             */
            get rowCount(): number;
            /**
             * Header rows.
             */
            get rows(): PivotColumnHeaderRow[];
            get grandCell(): PivotColumnHeaderGrandCell;
            get totalPos(): TotalPosition | false;
            get collapseSingleTotal(): boolean;
            get grandTotalPos(): TotalPosition | false;
            get grandTotalFixed(): boolean;
            get hasFields(): boolean;
            get hasTotals(): boolean;
            build(matrix: PivotMatrix, fields: PivotDimensionField[]): PivotColumn[];
            getGrandMeasureCol(measure: string | number): number;
            getColumn(col: number): PivotColumn;
            getVisibleColumn(vcol: number): PivotColumn;
            getRow(row: number): PivotColumnHeaderRow;
            getRowPos(row: number): number;
            colToVcol(col: number): number;
            vcolToCol(vcol: number): number;
            getColPos(vcol: number): number;
            getColWidth(vcol: number, span: number): number;
            /** pixel x → vcol index (binary search on _colPoints) */
            getVcolAt(x: number): number;
            getRowHeight(row: number, count?: number): number;
            getColumnField(col: number): PivotDimensionField | null;
            findGroup(dimension: string, value: any, col?: number): PivotColumnHeaderCell | undefined;
            toggleGroup(dim: any, value: any, col?: number): void;
            isExpanded(dim: any, value: any, col?: number): boolean;
            setExpanded(dim: any, value: any, expanded: boolean, col?: number): boolean;
            setExpandedAll(dim: any, expanded: boolean): boolean;
            prepareRender(force: boolean): void;
            get axis(): "row" | "column";
            get otherAxis(): "row" | "column";
            contains(cell: IPivotHeaderCellInfo): boolean;
            getCollapsedGroups(dim: any): any[];
            /* Excluded from this release type: _getColumnKey */
            /* Excluded from this release type: _columnKeyPart */
            /* Excluded from this release type: _dateLabelKey */
            /* Excluded from this release type: _dateMetaAt */
            /* Excluded from this release type: _collectAutoWidthCandidates */
            /* Excluded from this release type: _collectPreciseCells */
            /* Excluded from this release type: _collectAutoWidthExtraChrome */
            private $_getRow;
            private $_iconChrome;
            /**
             * 컬럼 c가 표시하는 measure의 fast-path 후보를 out에 추가한다.<br/>
             * - formatter 콜백이 있으면 raw 분포는 의미가 없으므로 formatter 결과 텍스트를 직접 스캔.
             * - `showAs`가 문자열이면 종류별 probe 값으로 후보 생성.
             * - 그 외(normal/baseValue/diff/running 등)는 raw min/max 사용.
             */
            private $_pushMeasureValueCandidates;
            /**
             * formatter 콜백이 있는 measure 컬럼의 셀 텍스트들을 모두 스캔해서
             * 일반 행 / grand 행 각각의 최장 텍스트를 후보로 추가한다.
             */
            private $_pushFormatterCellCandidates;
            /**
             * 'd'/'g' 컬럼에 대해 실제 표시될 합계 값들을 후보로 추가한다.<br/>
             * 모든 행을 스캔해서 length 기준으로 가장 긴 텍스트만 추가한다 (중복 제거).
             */
            private $_pushAggregateCellCandidates;
            /**
             * showAs 종류별 raw value probe.<br/>
             * 반환값이 `null`이면 raw min/max를 사용하라는 의미.
             */
            private $_getShowAsProbes;
            /* Excluded from this release type: _setTotalPositions */
            private $_resetVisibles;
            protected _refreshColWidths(): void;
            private $_resetColWidths;
        }

        declare class PivotColumnHeaderCell extends PivotHeaderCell implements IPivotHeaderCellInfo {
            row: PivotColumnHeaderRow;
            index: number;
            width: number;
            col: number;
            vcol: number;
            totalCell: PivotColumnHeaderTotalCell;
            constructor(row: PivotColumnHeaderRow, index: number);
            getPath(table: IPivotTable): string[];
            getTooltipPath(table: IPivotTable): string;
        }

        declare class PivotColumnHeaderDefaults extends PivotTalbleDefaultBase<PivotColumnHeaderOptions> {
        }

        declare class PivotColumnHeaderGrandCell extends PivotHeaderGrandCell {
            col: number;
            mCells: PivotColumnHeaderGrandValueCell[];
            set(col: number, label: string, measures: string[], info: HeaderCellBuildInfo): void;
        }

        declare class PivotColumnHeaderGrandValueCell extends PivotHeaderGrandValueCell {
            pCell: PivotColumnHeaderGrandCell;
        }

        declare interface PivotColumnHeaderOptions extends PivotHeaderOptions {
        }

        declare class PivotColumnHeaderRow {
            field: PivotDimensionField;
            private _parent;
            private _level;
            private _cells;
            private _visibles;
            constructor(parent: PivotColumnHeaderRow, field: PivotDimensionField);
            get parent(): PivotColumnHeaderRow;
            get level(): PivotLevel;
            get count(): number;
            get cells(): PivotColumnHeaderCell[];
            getPath(): PivotColumnHeaderRow[];
            buildCells(rows: PivotColumnHeaderRow[], lev: number, parent: PivotColumn, columns: PivotColumn[], col: number, range: [number, number], info: HeaderCellBuildInfo, parentCell?: PivotColumnHeaderCell): number;
            findGroup(value: any, col: number): PivotColumnHeaderCell | undefined;
            setExpandedAll(expanded: boolean): boolean;
            _clearCollapsed(expanderVisible: boolean): void;
            _resetVisibles(columns: PivotColumn[], hiddenCols: Set<number>, expanderVisible: boolean): void;
        }

        declare class PivotColumnHeaderSeriesCell extends PivotHeaderSeriesCell {
            col: number;
        }

        declare class PivotColumnHeaderTotalCell extends PivotColumnHeaderCell {
            ended: boolean;
            constructor(headerCell: PivotColumnHeaderCell, ended: boolean, nMeasure: number);
            isTotal(): boolean;
            _resetVPos(headerCell: PivotColumnHeaderCell): void;
        }

        declare class PivotColumnHeaderValueCell extends PivotColumnHeaderCell {
            isValue(): boolean;
        }

        /**
         * 컬럼 헤더 view.<br/>
         * 컬럼 헤더의 각 행을 ColumnHeaderRowView로 표시한다.
         * 각 셀은 ColumnHeaderCellView로 표시한다.
         * 총계 셀은 ColumnHeaderTotalCellView로 표시한다.
         */
        declare class PivotColumnHeaderView extends PivotHeaderView<PivotColumnHeader> {
            private _rowViews;
            private _grandView;
            private _totalPool;
            private _totalViews;
            private _valuePool;
            private _valueViews;
            private _grandMeasureViews;
            private _seriesPool;
            private _seriesViews;
            private _fixedGrandTotal;
            private _vpC1;
            private _vpC2;
            private _measureCount;
            private _grandStartCol;
            private _lastScrollLeft;
            private _lastClientWidth;
            private _lastScrollWidth;
            private _hasScrollMetrics;
            constructor(doc: Document, owner: IPivotHeaderOwner);
            protected _doInit(doc: Document, initData: any): void;
            /**
             * 고정 grand total 열을 수평 스크롤에 맞춰 재배치한다.
             * PivotView의 scroll handler에서 호출된다.
             */
            updateFixedGrandTotal(scrollLeft: number, clientWidth: number, scrollWidth: number): void;
            /**
             * 스크롤에 의해 뷰포트가 변경될 때 호출된다.
             */
            updateViewport(scrollLeft: number, clientWidth: number): void;
            getCellView(target: Element): ColumnHeaderCellView | undefined;
            getTotalCellView(target: Element): ColumnHeaderTotalCellView | ColumnHeaderValueCellView | undefined;
            getGrandCellView(target: Element): ColumnGrandCellView | undefined;
            getGrandValueCellView(target: Element): ColumnHeaderGrandValueCellView | undefined;
            getSeriesCellView(target: Element): ColumnHeaderSeriesCellView | undefined;
            getCell(target: Element): PivotColumnHeaderCell | undefined;
            getTotalCell(target: Element): PivotColumnHeaderTotalCell | undefined;
            getValueCell(target: Element): PivotColumnHeaderValueCell | undefined;
            getSeriesCell(target: Element): PivotHeaderSeriesCell | undefined;
            protected _doPrepare(doc: Document, model: PivotColumnHeader): void;
            protected _doMeasure(hintWidth: number, hintHeight: number): ISize;
            protected _doLayout(): void;
            protected _doClick(dom: HTMLElement): boolean;
            private $_prepareRows;
            private $_prepareGrandTotal;
            /**
             * 뷰포트에 보이는 셀들만 렌더링한다.
             */
            private $_renderViewport;
            private $_borrowTotalCell;
            private $_releaseTotalCells;
            private $_borrowValueCell;
            private $_releaseValueCells;
            private $_borrowGrandMeasureCell;
            private $_releaseGrandMeasureCells;
            private $_borrowSeriesCell;
            private $_releaseSeriesCells;
            private $_layoutTotals;
        }

        export declare class PivotControl extends PivotControlBase implements IPivotTabBarOwner, IPivotBookEvents {
            private _book;
            private _emptyView;
            private _headerView;
            private _headlineView;
            private _contentLayer;
            private _pageContainer;
            private _footerView;
            private _inspectorView;
            private _aiContainer;
            private _tooltipView;
            private _menuView;
            private _indicatorView;
            private _progressView;
            private _addTablePage;
            private _bookElements;
            private _pagePool;
            private _pageViews;
            private _pageMap;
            private _pageIndex;
            private _pageChanged;
            private _pageAdding;
            dataLoading: boolean;
            constructor(doc: Document, container: string | HTMLDivElement, cm?: PivotCubeManager);
            loadBook(cm: PivotCubeManager, config?: PivotBookConfiguration): void;
            protected _doDispose(): void;
            showPopupMenu(target: Element, menu: PopupMenu): void;
            showContextMenu(target: Element, x: number, y: number, menu: PopupMenu): void;
            hideMenu(): void;
            get pageIndex(): number;
            set pageIndex(value: number);
            onSettingsDlgRequested(book: IPivotBook): void;
            onExportDlgRequested(book: IPivotBook, type: string): void;
            onBookOptionsChanged(book: IPivotBook): void;
            onBookPageAdded(book: IPivotBook, page: IPivotBookPage): void;
            onBookPageRemoved(book: IPivotBook, page: IPivotBookPage): void;
            onBookUIRequested(book: IPivotBook, action: {
                name: string;
                params: any[];
            }): void;
            get book(): PivotBook;
            get inspectorView(): PivotInspectorViewImpl;
            get explorerView(): PivotExplorerView;
            get aiContainer(): PivotAIContainer;
            get headerView(): PivotBookHeaderView;
            get footerView(): PivotBookFooterView;
            get addTablePage(): AddTablePage;
            get pivotView(): PivotView;
            get pageView(): PivotPageView;
            get page(): PivotBookPage;
            get table(): PivotTable;
            /**
             * 현재 페이지 인덱스.<br/>
             * -1인 경우 페이지가 없는 상태를 의미한다.
             */
            get currentPage(): number;
            set currentPage(value: number);
            getBookElements(): PivotElement[];
            showTooltip(target: Element, x: number, y: number, tip: string, long?: boolean): void;
            hideTooltip(): void;
            showIndicator(): SpinnerIndicatorView;
            showProgress(): ProgressIndicatorView;
            hideIndicator(): void;
            getContextMenu(target: Element): PopupMenu | undefined;
            protected _initRoot(doc: Document, root: UIElement): void;
            protected _createDefaultTool(): IControlTool;
            protected _getTheme(): string;
            protected _doRender(doc: Document, bounds: Rectangle): void;
            protected _doAfterRender(doc: Document): void;
            protected _doRendered(): void;
            isInteractive(): boolean;
            private $_defaultInspectorFloatBounds;
            private $_clampInspectorFloatBounds;
            private $_defaultAiFloatBounds;
            private $_clampAiFloatBounds;
            private $_applyExplorerTheme;
            private $_preparePages;
        }

        declare abstract class PivotControlBase extends UIControl {
            constructor(doc: Document, container: string | HTMLDivElement, className: string);
            abstract get pivotView(): PivotView;
            protected _render(): void;
            isInteractive(): boolean;
            protected abstract _getTheme(): string;
        }

        declare class PivotCrosshair extends PivotTableItem<PivotCrosshairOptions> {
            static defaults: PivotCrosshairOptions;
        }

        /**
         * 데이터셀 클릭 시 표시되는 교차 선택 옵션.
         */
        declare interface PivotCrosshairOptions extends PivotTableItemOptions {
            /**
             * 교차 선택 표시 여부.
             *
             * @default false
             */
            visible?: boolean;
            /**
             * 교차 선택 축.
             * 'row'로 설정하면 클릭 셀의 행 축만,
             * 'column'으로 설정하면 열 축만,
             * 'both'로 설정하면 클릭 셀의 행과 열 축 모두에 교차 선택을 표시한다.
             *
             * @default 'both'
             */
            axis?: 'row' | 'column' | 'both';
            /**
             * 항상 교차 선택을 표시할지 여부.<br/>
             * true가 아니면 데이터셀 클릭 시에만 교차 선택이 표시되고, 그 외에는 숨겨진다.
             *
             * @default true
             */
            alwaysShow?: boolean;
        }

        declare interface PivotCsvExportOptions extends PivotExportOptions {
            /**
             * 파일 확장자.
             * 기본값: 'csv'
             */
            fileExt?: string;
        }

        declare class PivotCube extends DataCube {
            private _label?;
            private _description?;
            constructor(options: DataCubeOptions);
            get label(): string | undefined;
            get description(): string | undefined;
            setLabel(label: string, description?: string): this;
        }

        export declare class PivotCubeManager extends DataCubeManager<PivotCube> {
            constructor(ds: PivotDataSet, cubes: PivotCubeOptions[]);
            protected _createCube(options: DataCubeOptions): PivotCube;
        }

        export declare interface PivotCubeOptions {
            name: string;
            table: string;
            schema: CubeSchema;
            columnar?: boolean;
            filters?: CubeFilter[];
            slicers?: SlicerOptions[];
            label?: string;
            description?: string;
        }

        declare class PivotDataBar extends ValueRangeOverlay<PivotDataBarOptions> {
            static defaults: PivotDataBarOptions;
            private _colorText;
            private _negativeColorText;
            private _barHeight;
            private _borderStyle;
            /** 사용자 정의 비율 콜백. 설정되면 정규화/baseValue 경로 우회. */
            private _barPicker;
            /**
             * 양수 색상 (alpha 적용된 css 문자열).
             */
            getColor(): string;
            /**
             * 음수 색상 (alpha 적용된 css 문자열).
             */
            getNegativeColor(): string;
            getBarHeight(): number;
            getBorderStyle(): string | undefined;
            /**
             * picker 콜백이 설정되어 있으면 호출해서 -1~1 변위의 부호 있는 비율을 반환한다.
             * 설정되어 있지 않거나 picker가 undefined를 반환하면 undefined.
             */
            pickRatio(info: IPivotValueCellInfo): number | undefined;
            protected _doApply(op: PivotDataBarOptions): void;
            protected _needsSumStats(): boolean;
            protected _needsSortedStats(): boolean;
            protected _doPrepare(table: IPivotTable, measure: number): void;
        }

        /**
         * 데이터 막대 옵션 인터페이스.<br/>
         * - 값의 크기에 비례하는 막대를 셀 배경에 표시한다.
         * - 양수/음수 모두 표시할 수 있으며, 양방향/로그 스케일 등 다양한 옵션을 제공한다.
         * - `compareScope` 옵션으로 같은 행/열/그룹 내에서 비교할지, 전체 기준으로 비교할지 선택할 수 있다.
         * - `cellScope` 옵션으로 상세 셀에만 적용할지, 소계/총계에도 적용할지 선택할 수 있다.
         * - heatmap과 달리 색상 대신 막대의 길이로 값을 시각화하므로, 색맹인 사용자도 인식하기 쉽다.
         */
        declare interface PivotDataBarOptions extends ValueRangeOverlayOptions {
            /**
             * 막대만 표시 여부.<br/>
             * true로 지정하면 셀의 값(텍스트)은 숨기고 막대만 표시한다.
             * 기본값은 false로, 값과 막대를 함께 표시한다.
             *
             * @default false
             */
            barOnly?: boolean;
            /**
             * 양수 색상.<br/>
             *
             * @default '#638ec6'
             */
            color?: string;
            /**
             * 바 투명도.<br/>
             * 0 ~ 1 사이의 값으로, 0이면 완전히 투명하게 표시된다.
             *
             * @default 0.4
             */
            alpha?: number;
            /**
             * 음수 색상.<br/>
             *
             * @default '#ff6347'
             */
            negativeColor?: string;
            /**
             * 테두리 색상.<br/>
             * 설정하지 않으면 경계선이 표시되지 않는다.
             * 또, 양수와 음수 모두 같은 색상이 사용된다.
             */
            borderColor?: string;
            /**
             * 그라데이션 표시 여부<br/>.
             * 기본값은 false로, 단색으로 표시한다.
             *
             * @default false
             */
            gradient?: boolean;
            /**
             * 양방향 표시 여부.<br/>
             * true로 지정하면 {@page baseValue 기준값} 보다 크면 오른쪽으로, 작으면 왼쪽으로 표시한다.
             * {@page reversed}가 true로 지정된 경우에는 반대로 표시한다.
             * 기본값은 false로, 양수와 음수 모두 오른쪽으로 표시한다.
             */
            bidirectional?: boolean;
            /**
             * true로 지정하면 양방향 표시일 때 {@page baseValue 기준값} 보다 크면 왼쪽으로, 작으면 오른쪽으로 표시한다.
             */
            reversed?: boolean;
            /**
             * {@page bidirectional 양방향 표시}일 때 기준값.<br/>
             *
             * @default 0
             */
            baseValue?: number;
            /**
             * 막대 세로 비율. 0~1 사이 값(셀 높이 대비) 또는 'auto'(전체 높이).
             * 기본값은 1로, 셀 전체 높이를 채운다.
             *
             * @default 0.8
             */
            barHeight?: number;
            /**
             * {@page bidirectional 양방향 표시}일 때 축 설정 옵션.
             */
            axis?: DataBarAxisOptions;
            /**
             * 셀별 막대 비율을 직접 결정하는 콜백. 정의되면 `boundsBy`/`minValue`/`maxValue`/`logBase`/`baseValue`
             * 기반 정규화·방향 판정을 전부 우회한다.
             *
             * - 반환값은 `-1 ~ 1` 사이의 부호 있는 비율. 부호가 방향(음수 → `negativeColor`), 절대값이 길이.
             *   범위를 벗어나면 클램프된다.
             * - `undefined` 반환 → 해당 셀에 한해 기본 경로로 폴백.
             *
             * `stats`는 overlay 자신의 `cellScope`/`compareScope`로 prepare된 분포 통계.
             *
             * @example
             * ```ts
             * // 행 평균 대비 편차를 막대로 (평균보다 크면 오른쪽, 작으면 왼쪽)
             * dataBar: {
             *   compareScope: 'row',
             *   bidirectional: true,
             *   barPicker: (cell, stats) => {
             *     const g = stats.groups.get(stats.groupKey(cell)) ?? stats.all;
             *     const avg = g.sum / g.count;
             *     const span = Math.max(g.max - avg, avg - g.min) || 1;
             *     return (cell.value - avg) / span;
             *   }
             * }
             * ```
             */
            barPicker?: (cell: IPivotValueCellInfo, stats: ScopedStats) => number | undefined;
        }

        declare class PivotDataSet extends DataSet {
            private _starSchemas;
            getStarSchema(name: string): StarSchema | undefined;
            load(tables: (PivotDataTableOptions | PivotStarSchemaOptions)[], indicator?: IDataLoadIndicator): Promise<this>;
            private $_getStarSchema;
            private $_loadTablesWithIndicator;
            private $_loadTables;
        }

        export declare type PivotDataTableOptions = {
            type?: 'table';
            name?: string;
            source?: string | any[];
            sourceUrl?: string;
            sourceType?: 'json' | 'csv';
            csvOptions?: CsvLoadOptions;
            table?: DataTableOptions;
        };

        declare type PivotDataType = 'number' | 'text' | 'date';

        declare class PivotDetailPanel extends PivotExplorerPanel<PivotDetailPanelOptions, PivotBookPageDetailContext> {
            static defaults: PivotDetailPanelOptions;
            /**
             * grid view에 전체 행을 표시할 때, 원본 데이터를 그대로 사용할지, 아니면 필터링된 데이터를 사용할지 여부를 설정한다.
             */
            setFiltered(value: boolean): this;
            protected _doApply(op: PivotDetailPanelOptions): void;
            getCtx(): PivotBookPageDetailContext;
            getMenu(table: PivotTable): PopupMenu;
            private _menu;
        }

        /**
         * 탐색기 피벗 디테일 패널 옵션.<br/>
         */
        declare interface PivotDetailPanelOptions extends PivotExplorerPanelOptions {
        }

        declare class PivotDimensionField extends PivotField<PivotDimensionFieldOptions> {
            static defaults: Omit<PivotDimensionFieldOptions, "name">;
            private _headerVisible?;
            private _expanderVisible?;
            sortDir: PivotSortDirection;
            /** headerVisible */
            get headerVisible(): boolean;
            setHeaderVisible(value: boolean | undefined): this;
            /** expanderVisible */
            get expanderVisible(): boolean;
            setExpanderVisible(value: boolean): this;
            canHideHeader(): boolean;
        }

        declare class PivotDimensionFieldCollection extends PivotFieldCollection<PivotDimensionField, PivotDimensionFieldCollectionOptions> {
            private _axis;
            constructor(table: PivotTable, _axis: 'row' | 'column');
            protected _createItem(source: any): PivotDimensionField;
            protected _doItemsChanged(items: PivotDimensionField[]): void;
            renormalizeHeaders(): void;
        }

        declare interface PivotDimensionFieldCollectionOptions extends PivotFieldCollectionOptions<PivotDimensionFieldOptions> {
        }

        declare interface PivotDimensionFieldOptions extends PivotFieldOptions {
            /**
             * 명시적 false가 아닌 경우, 해당 dimension 필드의 헤더 셀을 표시한다.<br/>
             *
             * @default undefined
             */
            headerVisible?: boolean;
            /**
             * 하위 항목 확장/축소 아이콘 표시 여부. `true`면 항상 표시, `false`면 항상 숨김,
             * `'auto'`면 rowHeader나 columnHeader에서 설정된 값을 따른다.
             *
             * @default 'auto'
             */
            expanderVisible?: boolean | 'auto';
            sort?: IPivotFieldSort;
        }

        declare class PivotDimensionView extends PivotFieldView<PivotDimensionField> {
            private _sortView;
            protected _doInit(doc: Document): void;
            protected _doPrepare(doc: Document, field: PivotDimensionField): void;
        }

        /**
         * 피벗뷰 구성 요소 뷰 기반 클래스.<br/>
         */
        declare class PivotElement<T extends any = any> extends UIElement {
            protected _model: T | null;
            mw: number;
            mh: number;
            get model(): T | null;
            prepare(doc: Document, model: T): void;
            measure(hintWidth: number, hintHeight: number): ISize;
            layout(): void;
            click(dom: Element): boolean;
            getPopupMenu(target: Element): PopupMenu | undefined;
            protected _isAbsolute(): boolean;
            protected _doInitDom(doc: Document, dom: HTMLElement): void;
            protected _doPrepare(doc: Document, model: T): void;
            protected _doMeasure(hintWidth: number, hintHeight: number): ISize;
            protected _doLayout(): void;
            protected _doClick(dom: HTMLElement): boolean;
        }

        declare interface PivotExcelExportOptions extends PivotExportOptions {
            /**
             * 파일 확장자.
             * 기본값: 'xlsx'
             */
            fileExt?: string;
        }

        declare class PivotExplorer extends PivotBookItem<PivotExplorerOptions> implements IPivotExplorer {
            static defaults: PivotExplorerOptions;
            private _detailPanel;
            private _chartPanel;
            private _mapPanel;
            private _panels;
            private _firstEnabled;
            protected _doInit(op: PivotExplorerOptions): void;
            get detailPanel(): PivotDetailPanel;
            get chartPanel(): PivotChartPanel;
            get mapPanel(): PivotMapPanel;
            get aiPanel(): PivotAiPanel | undefined;
            get firstEnabled(): ExplorerMode | undefined;
            prepareRender(): void;
            isEnabled(mode: ExplorerMode): boolean;
            protected _isVisible(): boolean;
        }

        /**
         * 피벗 탐색기 옵션.<br/>
         * 'detail', 'chart', 'map', 'insight' 등으로 피벗 데이터의 상세 정보를 보여주는 탐색기 뷰의 옵션.
         * 이 모델은 book 수준에서 관리되며, page별 visible은 view에서 관리한다.
         */
        declare interface PivotExplorerOptions extends PivotBookItemOptions {
            /**
             * 디테일(상세) 패널 옵션.<br/>
             * 셀에 해당하는 원본/큐브 데이터를 그리드로 보여주는 패널의 데이터 소스(dataMode),
             * 행 단위 스크롤, 행 교차 색상 등을 설정한다.<br/>
             * `boolean` 축약형으로 지정하면 디테일 패널의 표시 여부만 토글한다.
             */
            detailPanel?: PivotDetailPanelOptions;
            /**
             * 차트 패널 옵션.<br/>
             * 선택 데이터를 차트로 보여주는 탐색기 패널을 설정한다.<br/>
             * `boolean` 축약형으로 지정하면 차트 패널의 표시 여부만 토글한다.
             */
            chartPanel?: PivotChartPanelOptions;
            /**
             * 맵 차트 패널 옵션.<br/>
             * 선택 데이터를 지도 기반 차트로 보여주는 탐색기 패널을 설정한다.<br/>
             * `boolean` 축약형으로 지정하면 맵 패널의 표시 여부만 토글한다.
             */
            mapPanel?: PivotMapPanelOptions;
        }

        declare abstract class PivotExplorerPanel<OP extends PivotExplorerPanelOptions = PivotExplorerPanelOptions, C extends PivotBookPageContext = PivotBookPageContext> extends PivotPanel<OP> {
            static defaults: PivotExplorerPanelOptions;
            protected _table: PivotBookPage | undefined;
            private _enabled;
            get cell(): IPivotBodyCellInfo | undefined;
            get selection(): PivotSelection | undefined;
            get isEnabled(): boolean;
            abstract getCtx(): C;
            setTable(table: PivotBookPage): this;
            setCell(cell: IPivotBodyCellInfo): this;
            setSelection(cell: IPivotBodyCellInfo, selection: PivotSelection): this;
            getInfo(): string;
            getCount(): string;
            _setEnabled(enabled: boolean): this;
            protected _isVisible(): boolean;
            prepareRender(): void;
            protected _panelMenu: IPopupMenuItem[];
        }

        declare interface PivotExplorerPanelOptions extends PivotPanelOptions {
        }

        declare class PivotExplorerView extends PivotFlexElement<PivotExplorer> {
            private _splitter;
            private _splitGhost;
            private _emptyView;
            private _headerView;
            private _detailView;
            private _chartView;
            private _mapView;
            private _insightView;
            private _table;
            private _cell;
            private _position;
            /** bottom(상/하) 분할일 때의 패널 높이. */
            private _panelHeight;
            /** left/right(좌/우) 분할일 때의 패널 너비. */
            private _panelWidth;
            /** 페이지 옵션에 지정된 탐색기 초기 너비.*/
            private _optWidth;
            /** 페이지 옵션에 지정된 탐색기 초기 높이.*/
            private _optHeight;
            /** 너비(left/right 축) 초기 크기를 옵션에서 한 번 계산했는지 여부. 페이지 전환 시 리셋. */
            private _widthInitialized;
            /** 높이(bottom 축) 초기 크기를 옵션에서 한 번 계산했는지 여부. 페이지 전환 시 리셋. */
            private _heightInitialized;
            constructor(doc: Document);
            protected _doInit(doc: Document, initData: any): void;
            get minHeight(): number;
            get minWidth(): number;
            get position(): ExplorerPosition;
            get cell(): IPivotBodyCellInfo;
            /**
             * 탐색기 패널이 붙는 위치를 설정한다.<br/>
             * - `bottom`: 피벗 뷰 아래쪽에 배치되고 상/하로 분할 (높이 조절)
             * - `right`: 피벗 뷰 오른쪽에 배치되고 좌/우로 분할 (너비 조절)
             * - `left`: 피벗 뷰 왼쪽에 배치되고 좌/우로 분할 (너비 조절)
             */
            setPosition(position: ExplorerPosition): this;
            setModel(model: PivotExplorer): this;
            setTable(table: PivotBookPage): this;
            open(cell: IPivotBodyCellInfo, force: boolean): void;
            openSelection(cell: IPivotBodyCellInfo, selection: PivotSelection, force: boolean): void;
            close(): void;
            setTheme(theme: string): void;
            toggle(): void;
            startSplitGhostResize(startSize: number): void;
            /**
             * splitter 드래그로 확정된 패널 크기를 반영한다.<br/>
             * 현재 분할 축(bottom=높이, left/right=너비)에 맞춰 저장 크기와 dom을 함께 갱신한다.<br/>
             * (setWidth/setHeight만 호출하면 다음 measure의 $_ensureSize가 기존 _panelWidth/Height로 되돌려버린다.)
             */
            setPanelSize(size: number): void;
            updateSplitGhostResize(previewSize: number): void;
            clearSplitGhostResize(): void;
            getPopupMenu(dom: Element): PopupMenu;
            protected _doPrepare(doc: Document, model: PivotExplorer): void;
            protected _doMeasure(hintWidth: number, hintHeight: number): ISize;
            /**
             * 현재 분할 축의 패널 크기를 확정한다.<br/>
             * - 최초 1회는 페이지 옵션(explorerWidth/Height)으로부터 계산한다. (퍼센트는 page 영역 기준)
             * - 항상 페이지 영역을 넘지 않도록 [min, page - RESERVED] 범위로 제한한다.
             */
            private $_ensureSize;
            /**
             * `number`(px) 또는 `'30%'`(퍼센트) 형태의 값을 base 기준 픽셀로 변환한다.<br/>
             * 파싱할 수 없으면 fallback을 반환한다.
             */
            private $_resolveSize;
            /**
             * 패널 크기를 [min, base - RESERVED_PIVOT_SIZE] 범위로 제한해 피벗 영역을 넘지 않게 한다.
             */
            private $_clampSize;
            protected _doLayout(): void;
            click(element: Element): boolean;
        }

        declare interface PivotExportOptions {
            /**
             * 파일 이름 (확장자 제외).
             * 기본값: 'realpivot'
             */
            fileName?: string;
            fileExt?: string;
            includeHeaders?: boolean;
            includeStyles?: boolean;
        }

        declare abstract class PivotField<OP extends PivotFieldOptions = PivotFieldOptions> extends ROptionable<OP> {
            protected _table: PivotTable;
            protected _name: string;
            private _index;
            private _dataType;
            userData: any;
            constructor(_table: PivotTable, _name: string);
            get table(): PivotTable;
            get name(): string;
            get label(): string;
            get index(): number;
            get dataName(): string;
            get dataType(): PivotDataType;
            prepare(_index?: number): void;
            protected _doApply(op: OP): void;
            _optionChanged(tag?: any): void;
            _setIndex(index: number): void;
        }

        /**
         * Pivot field bar model.<br/>
         */
        declare abstract class PivotFieldBar<OP extends PivotFieldBarOptions = PivotFieldBarOptions> extends PivotTableItem<OP> {
            static defaults: PivotFieldBarOptions;
            abstract get dimensions(): PivotDimensionField[];
            abstract get values(): PivotValueField[];
            protected _hideSingleMeasure: boolean;
            protected _hideDimensions: boolean;
            protected _hideValues: boolean;
            protected _needRebuild: boolean;
            abstract isVisible(): boolean;
            abstract hasMeasure(): boolean;
            abstract build(table: IPivotTable): void;
            prepareRender(): void;
            _requestRebuild(): void;
        }

        declare interface PivotFieldBarOptions extends PivotTableItemOptions {
        }

        /**
         * 피벗 필드 바 뷰.
         */
        declare abstract class PivotFieldBarView<T extends PivotFieldBar> extends PivotElement<T> {
            protected _fieldLayer: UIFlexElement;
            protected _valueDivider: HTMLSpanElement;
            protected _valueLayer: UIElement;
            private _fieldPool;
            protected _fieldViews: PivotDimensionView[];
            private _valuePool;
            protected _valueViews: PivotMeasureView[];
            constructor(doc: Document, className: string);
            protected _doInit(doc: Document): void;
            protected _doDispose(): void;
            getFieldMenu(field: PivotFieldView): PopupMenu | undefined;
            getFieldView(dom: Element): PivotFieldView | undefined;
            protected _doPrepare(doc: Document, model: T): void;
            getPopupMenu(target: Element): PopupMenu | undefined;
            protected _createValueLayer(doc: Document, className: string): UIElement;
            protected _createDimensionView(doc: Document): PivotDimensionView;
            protected _createMeasureView(doc: Document): PivotMeasureView;
            private $_prepareDimensions;
            private $_prepareValues;
        }

        declare abstract class PivotFieldCollection<T extends PivotField = PivotField, OP extends PivotFieldCollectionOptions = PivotFieldCollectionOptions> extends PivotCollection<T, OP> {
            protected _doItemsChanged(items: T[]): void;
            protected _normalizeOptions(fields: any): PivotFieldOptions[];
        }

        declare interface PivotFieldCollectionOptions<OP extends PivotFieldOptions = PivotFieldOptions> extends RCollectionOptions<OP> {
            keyProp: 'name';
        }

        declare class PivotFieldManager extends ROptionable<PivotFieldManagerOptions> {
            private _table;
            private _rows;
            private _columns;
            private _values;
            private _filters;
            private _allFields;
            private _measureLabels;
            private _dirty;
            constructor(_table: PivotTable);
            protected _doInit(op: PivotFieldManagerOptions): void;
            get isEmpty(): boolean;
            get rows(): PivotDimensionFieldCollection;
            get columns(): PivotDimensionFieldCollection;
            get values(): PivotValueFieldCollection;
            get filters(): PivotFilterFieldCollection;
            get rowFields(): readonly PivotDimensionField[];
            get columnFields(): readonly PivotDimensionField[];
            get valueFields(): readonly PivotValueField[];
            get filterFields(): readonly PivotFilterField[];
            get allFields(): readonly PivotField[];
            get dimensions(): string[];
            get rowDimensions(): string[];
            get columnDimensions(): string[];
            get filterDimensions(): string[];
            get measures(): string[];
            get measureLabels(): string[];
            private $_getMeasureLabels;
            get measureSpecs(): (string | MeasureAlias)[];
            get isDirty(): boolean;
            prepareRender(): void;
            afterRender(): void;
            getSection(field: PivotField): PivotSection | undefined;
            fieldByName(field: string): PivotField | undefined;
            isUsed(field: string): boolean;
            isMeasure(field: string): boolean;
            getNextValueFieldName(measure: string): string;
            getAllFields(): PivotField[];
            getDimensionFields(): PivotDimensionField[];
            getRowField(field: string): PivotDimensionField;
            getColumnField(field: string): PivotDimensionField;
            getValueField(field: string): PivotValueField;
            getFilterField(field: string): PivotFilterField;
            getAvailableFilters(): string[];
            getAvailableDimensions(): string[];
            getAvailableMeasures(): string[];
            canMoveTo(field: PivotField, target: PivotSection, index?: number): boolean;
            moveField(field: PivotField, target: PivotSection, index?: number): PivotField | undefined;
            canAddFilterField(name: string): boolean;
            addDimensionField(name: string, axis: 'row' | 'column'): PivotDimensionField;
            addFilterField(name: string): PivotFilterField;
            canAddDimensionField(name: string): boolean;
            canAddValudField(name: string): boolean;
            addValueField(name: string, measure: string, aggregate: PivotAggregationType): PivotValueField;
            removeField(field: PivotField): boolean;
            removeFields(fields: PivotField[]): boolean;
            restoreFields(fields: PivotField[], sections: PivotSection[]): void;
            _internalSetAggregate(measure: string, aggregate: PivotAggregationType): boolean;
            getAggregates(data: DataCube): Record<string, PivotAggregationType>;
            _optionChanged(tag?: string | string[]): void;
            protected _doLoad(options: PivotFieldManagerOptions, source: any): void;
            private $_removeField;
            private $_canMoveTo;
            private $_sectionOf;
        }

        declare interface PivotFieldManagerOptions extends ROptions {
            rows?: PivotDimensionFieldCollectionOptions | (PivotDimensionFieldOptions | string)[] | string;
            columns?: PivotDimensionFieldCollectionOptions | (PivotDimensionFieldOptions | string)[] | string;
            values?: PivotValueFieldCollectionOptions | (PivotValueFieldOptions | string)[] | string;
            filters?: PivotFilterFieldCollectionOptions | (PivotFilterFieldOptions | string)[] | string;
        }

        declare interface PivotFieldOptions extends ROptions {
            /**
             * 필드명.<br/>
             * 피벗테이블의 row/column dimension 또는 value 필드로 사용되는 데이터큐브 컬럼명을 반드시 지정한다.
             * [주의] 생성 시 필수이며, 생성 후에는 변경할 수 없다.
             */
            name: string;
            /**
             * 필드 표시 너비 (px).<br/>
             * 지정하지 않으면 테이블 설정에 따라 기본 너비나 계산된 너비로 표시된다.
             * 컬럼 헤더에 표시되는 경우 컬럼 헤더의 마지막 level 필드일 때만 적용된다.
             * 즉, measure가 표시되면 상위 dimension 필드에는 적용되지 않는다.
             */
            width?: number;
            /**
             * 행에 표시될 때 너비.<br/>
             * 지정하지 않으면 행 헤더의 기본 설정 너비나 계산된 너비로 표시된다.
             */
            headerWidth?: number;
        }

        /**
         * 전체 Inspector 상태를 관리하는 Model.
         * UI 의존성 없이 섹션 Model들을 소유하고 설정 상태를 관리.
         */
        declare class PivotFieldPanel extends PivotInspectorPanel<PivotFieldPanelOptions> {
            static defaults: PivotFieldPanelOptions;
            private _table;
            private _allSection;
            private _columnSection;
            private _rowSection;
            private _filterSection;
            private _valueSection;
            constructor(book: IPivotBook);
            get table(): PivotTable;
            /**
             * 전체 필드 섹션 Model
             */
            get allSection(): AllFieldSection;
            /**
             * 컬럼 필드 섹션 Model
             */
            get columnSection(): DimensionFieldSection;
            /**
             * 행 필드 섹션 Model
             */
            get rowSection(): DimensionFieldSection;
            /**
             * 필터 필드 섹션 Model
             */
            get filterSection(): FilterFieldSection;
            /**
             * 값 필드 섹션 Model
             */
            get valueSection(): ValueFieldSection;
            prepareRender(book: PivotBook, table: PivotTable): void;
            afterRender(): void;
            /**
             * 차원 필드의 고유값 목록 반환
             */
            getDistinctValues(fieldName: string): string[];
            canMoveTo(field: InspectorField, sectionType: FieldSectionType): boolean;
            getUsedSection(field: InspectorField): InspectorFieldSection;
            /**
             * source와 target 섹션이 다른 경우 필드 이동.
             */
            moveFieldTo(field: InspectorField, sourceSectionType: FieldSectionType, targetSection: InspectorFieldSection, index: number): boolean;
            /**
             * source와 target 섹션이 다른 경우 필드 드롭.
             */
            handleFieldDrop(targetSection: InspectorFieldSection, index: number, field: string, sourceSectionType: FieldSectionType): boolean;
            protected _isVisible(): boolean;
            getMenu(): PopupMenu;
            /**
             * 섹션 타입으로 섹션 Model 반환
             */
            private $_getSectionByType;
            /**
             * PivotTableOptions로부터 Inspector 설정 초기화
             */
            private $_loadSections;
            private static readonly $_ICON_TOP_GRID;
            private static readonly $_ICON_LEFT_SIDEBAR;
            private static readonly $_ICON_SINGLE_COLUMN;
            private $_layoutCheckHandler;
            private $_layoutChangeHandler;
            private _menu;
        }

        declare type PivotFieldPanelLayout = 'topGrid' | 'leftSidebar' | 'singleColumn';

        /**
         * 인스펙터 피벗 필드 패널 옵션.<br/>
         */
        declare interface PivotFieldPanelOptions extends PivotInspectorPanelOptions {
            /**
             * 필드 패널 레이아웃 모드.<br/>
             *
             * @default 'topGrid'
             */
            layout: PivotFieldPanelLayout;
        }

        /**
         * Pivot 설정 정보 표시용 인스펙터.
         * InspectorModel을 소유하고 View를 관리.
         */
        declare class PivotFieldPanelView extends InspectorPanelView<PivotFieldPanel> {
            private _headerView;
            private _bodyView;
            private _footerView;
            private _table;
            constructor(doc: Document, model: PivotFieldPanel);
            protected _doInit(doc: Document): void;
            protected _doDispose(): void;
            get bodyView(): FieldPanelBodyView;
            getContextMenu(target: Element): PopupMenu | undefined;
            protected _doInitDom(doc: Document, dom: HTMLElement): void;
            protected _registerEvents(): void;
            protected _unregisterEvents(): void;
            click(dom: Element): boolean;
            render(doc: Document, force: boolean): void;
            getPopupMenu(target: Element): PopupMenu | undefined;
            private _dragStartHandler;
            private _dragOverHandler;
            private _dragLeaveHandler;
            private _dragEndHandler;
            private _dropHandler;
        }

        declare interface PivotFieldSortParams {
            /** 비교 중인 필드의 차원 인덱스 (row dim 또는 col dim 내) */
            dimensionIndex: number;
            /** 비교 대상 A 의 라벨 배열 (row dim 이면 행 라벨, col dim 이면 열 라벨) */
            labelsA: any[];
            labelsB: any[];
            /** 측정값별 합계 (해당 행/열의 grand total) */
            subtotalsA: number[];
            subtotalsB: number[];
            /** 어느 축에서 호출됐는지 */
            axis: 'row' | 'column';
        }

        /**
         * 피벗 필드 뷰.
         */
        declare abstract class PivotFieldView<T extends PivotField = PivotField> extends PivotElement<T> {
            private _span;
            protected _menuView: HTMLSpanElement;
            private _text;
            constructor(doc: Document, className?: string);
            protected _doInit(doc: Document): void;
            get menuView(): HTMLSpanElement;
            protected _isAbsolute(): boolean;
            protected _doInitDom(doc: Document, dom: HTMLElement): void;
            protected _doPrepare(doc: Document, field: T): void;
            protected _doClick(dom: HTMLElement): boolean;
            private $_setText;
        }

        /**
         * Pivot filter bar model.<br/>
         * Represents a filter bar in a pivot table.
         */
        declare class PivotFilterBar extends PivotBookItem<PivotFilterBarOptions> {
            static defaults: PivotFilterBarOptions;
            private _visibles;
            get visibleSelectors(): FilterSelector[];
            isVisible(): boolean;
            prepareRender(): void;
        }

        export declare interface PivotFilterBarOptions extends PivotBookItemOptions {
        }

        declare class PivotFilterField extends PivotField<PivotFilterFieldOptions> {
            values: any[];
            filters: any[];
            getFilter(): string;
        }

        declare class PivotFilterFieldCollection extends PivotFieldCollection<PivotFilterField, PivotFilterFieldCollectionOptions> {
            protected _createItem(source: any): PivotFilterField;
        }

        declare interface PivotFilterFieldCollectionOptions extends PivotFieldCollectionOptions<PivotFilterFieldOptions> {
        }

        declare interface PivotFilterFieldOptions extends PivotFieldOptions {
        }

        declare class PivotFilterPanel extends PivotInspectorPanel<PivotFilterPanelOptions> {
            static defaults: PivotFilterPanelOptions;
            private _visibles;
            get isEmpty(): boolean;
            get visibleSelectors(): FilterSelector[];
            getMenu(): PopupMenu;
            prepareRender(book: PivotBook, table: PivotTable): void;
            private _menu;
        }

        /**
         * 인스펙터 피벗 필터 패널 옵션.<br/>
         */
        declare interface PivotFilterPanelOptions extends PivotInspectorPanelOptions {
        }

        declare class PivotFilterPanelView extends InspectorPanelView<PivotFilterPanel> {
            private _emptyView;
            private _dataView;
            private _selectorViews;
            private _selectorMap;
            private _pageView;
            constructor(doc: Document, model: PivotFilterPanel);
            protected _doInit(doc: Document, initData: any): void;
            setPage(pageView: PivotPageView): this;
            getContextMenu(target: Element): PopupMenu | undefined;
            protected _doInitDom(doc: Document, dom: HTMLElement): void;
            render(doc: Document, force: boolean): void;
            click(element: Element): boolean;
            getPopupMenu(target: Element): PopupMenu | undefined;
            private $_prepareViews;
        }

        declare abstract class PivotFlexElement<T extends ROptionable = ROptionable> extends PivotElement<T> {
            constructor(doc: Document, className: string, columnar?: boolean);
            protected _getCssDisplay(): string;
        }

        declare class PivotGrandTotal extends PivotTotal<PivotGrandTotalOptions> {
            static defaults: PivotGrandTotalOptions;
            get fixed(): boolean;
        }

        declare interface PivotGrandTotalOptions extends PivotTotalOptions {
            /**
             * @default '전체 요약'
             */
            label?: string;
            /**
             * 전체 요약 고정 여부.<br/>
             * true로 설정하면 해당 축의 grand total을 고정 표시한다.
             *
             * @default false
             */
            fixed?: boolean;
        }

        declare abstract class PivotHeader<OP extends PivotHeaderOptions = PivotHeaderOptions> extends PivotTableItem<OP> {
            protected _fields: PivotDimensionField[];
            protected _colWidths: number[];
            protected _colPoints: number[];
            protected _hasFields: boolean;
            protected _groupChanged: boolean;
            protected _widthStore: ColumnWidthStore;
            protected _initCollapsed: any;
            static defaults: PivotHeaderOptions;
            abstract get axis(): 'row' | 'column';
            abstract get otherAxis(): 'row' | 'column';
            /**
             * 컬럼별 너비 저장소.<br/>
             * 사용자/자동 계산 너비를 안정 키로 보관한다.
             */
            get widthStore(): ColumnWidthStore;
            abstract contains(cell: IPivotHeaderCellInfo): boolean;
            abstract getCollapsedGroups(dim: any): any[];
            headerVisibleChanged(field: PivotDimensionField): void;
            /**
             * 컬럼 i의 안정 키를 반환한다.<br/>
             * 서브클래스에서 재정의. 키를 만들 수 없는 경우 `null`을 반환하면 store는 우회된다.
             */
            protected _getColumnKey(_col: number): string | null;
            /**
             * 컬럼 i에 대해 store에 보관된 너비 항목을 조회한다.<br/>
             * `$_resetColWidths()` 내부에서 사용한다.
             */
            protected _lookupStoredWidth(col: number): ColumnWidthEntry | undefined;
            /**
             * 컬럼 i에 사용자 너비를 지정한다. `null`을 전달하면 사용자 지정 항목을 제거한다.<br/>
             * 자동 계산 결과보다 우선한다.
             */
            setColumnWidth(col: number, width: number | null): void;
            /**
             * 컬럼 i에 자동 계산된 너비를 보관한다. (보통 view 측 측정 단계에서 호출)<br/>
             * 사용자가 명시한 너비가 있으면 무시된다.
             */
            setComputedColumnWidth(col: number, width: number): void;
            /**
             * 컬럼 i에 보관된 너비 값. (없으면 undefined)
             */
            getStoredColumnWidth(col: number): number | undefined;
            /**
             * 컬럼 i의 보관 항목을 제거한다. (사용자/자동 모두)
             */
            clearColumnWidth(col: number): boolean;
            /**
             * 보관된 모든 너비 항목을 제거한다.
             */
            clearAllColumnWidths(): void;
            isColumnResizable(col: number): boolean;
            protected _doLoad(options: OP, source: any): void;
            afterRender(): void;
            /**
             * 현재 컬럼 수.<br/>
             * 서브클래스에서 제공한다.
             */
            abstract get colCount(): number;
            /**
             * `fitColumns()`가 컬럼 i에 대해 측정할 후보 텍스트들을 반환한다.<br/>
             * 기본 구현은 빈 배열을 반환한다. 서브클래스에서 헤더/총계/셀 라벨을 수집하도록 override 한다.
             *
             * @param col 컬럼 인덱스
             */
            protected _collectAutoWidthCandidates(_col: number): AutoWidthCandidate[];
            /**
             * (precise 모드) 컬럼 c가 cell-level 정확 측정을 필요로 하는지 여부를 판정하고,
             * 그렇다면 측정 대상 cell info 목록을 반환한다.<br/>
             * 기본 구현은 `null` (정확 측정 불필요 → 텍스트 후보만 사용).<br/>
             * formatter / highlight / icon overlay 등 cell-level 가변 효과가 활성화된 컬럼만 정확 측정한다.
             */
            protected _collectPreciseCells(_col: number): IPivotValueCellInfo[] | null;
            /**
             * 컬럼 c의 텍스트 외 추가 chrome(px). 아이콘 overlay 등으로 인해
             * 실제 셀 폭이 텍스트 폭보다 더 필요한 경우 양수를 반환한다. 기본 0.
             */
            protected _collectAutoWidthExtraChrome(_col: number): number;
            /**
             * 컬럼별 너비를 재계산해서 store에 보관한다.<br/>
             * `measurer`가 컬럼별 후보들을 측정하고, 그 max를 컬럼 폭으로 사용한다.
             * 사용자가 명시한(`'user'`) 너비는 보존된다.
             *
             * @param measurer view 측에서 주입된 측정자
             * @param opts.cols 측정할 컬럼 인덱스. 생략 시 전체 컬럼.
             * @param opts.precise `true`이면 `autoWidthMode`를 무시하고 항상 `'all'` 모드로 측정한다.
             *   사용자 액션(메뉴/더블클릭 등 비실시간 호출) 용. 결과는 `source='precise'`로 저장되어
             *   이후 자동 호출(fast path, `'computed'`)에 의해 덮어쓰이지 않는다.
             *
             *   ⚠️ precise=false (기본/`autoWidth: true` 자동 호출) 인 경우 다음 상황에서 폭이 부족/과다할 수 있다:
             *   - **highlight 스타일**의 bold/italic/className 등으로 인한 글리프 폭 변화는 반영되지 않는다.
             *     (단, grand total 행처럼 CSS selector로 항상 적용되는 bold는 `'cellGrand'` kind로 정확히 측정함.)
             *   - **formatter 콜백이 추가하는 className/icon** padding은 fast path에서는 모르고, 컬럼 단위 worst-case 만 적용된다.
             *   - **showAs 콜백 함수**: 문자열 형태의 `showAs`는 probe로 추정하지만 콜백은 분포를 알 수 없어 skip된다.
             *   - 이런 한계로 폭이 맞지 않을 때 `mode: 'precise'`로 호출하면 cell 별 실제 렌더 결과로 정확한 폭을 얻는다.
             * @param opts.mode
             *   - `'normal'` (기본): autoWidthMode 따르고 fast text 측정만 수행.
             *   - `'precise'`: autoWidthMode 무시하고 'all' 모드 + cell-level 실측(estimate gate로 skip 많이 함, 빠르고 거의 정확).
             *   - `'exact'`: precise + estimate gate 우회. 모든 대상 cell을 실제 렌더. 가장 느리고 가장 정확.
             */
            fitColumns(measurer: ITextMeasurer, opts?: {
                cols?: number[];
                mode?: 'normal' | 'precise' | 'exact';
            }): void;
            private $_acceptKind;
            /**
             * 단일 컬럼 fit.
             */
            fitColumn(col: number, measurer: ITextMeasurer, opts?: {
                mode?: 'normal' | 'precise' | 'exact';
            }): void;
            /**
             * fitColumns 등 store 변경 후 colWidths를 즉시 재계산하기 위한 hook.<br/>
             * 서브클래스가 `$_resetColWidths()`를 호출하도록 override 한다.
             */
            protected _refreshColWidths(): void;
            private $_allColumns;
        }

        declare abstract class PivotHeaderCell extends RObject implements IPivotHeaderCellInfo {
            isGroup: boolean;
            expanderVisible: boolean;
            dimension: string;
            measure: string;
            abstract totalCell: PivotHeaderCell | null;
            pCell?: PivotHeaderCell;
            mCells?: PivotHeaderCell[];
            value: string;
            label?: string;
            span: number;
            vspan: number;
            childLabel?: string;
            sort?: 'asc' | 'desc';
            seriesBefore?: PivotHeaderSeriesCell[];
            seriesAfter?: PivotHeaderSeriesCell[];
            private _collapsed;
            get collapsed(): boolean;
            abstract getPath(table: IPivotTable): string[];
            abstract getTooltipPath(table: IPivotTable): string;
            isTotal(): boolean;
            isValue(): boolean;
            getTooltip(table: IPivotTable): string;
            toggle(): void;
            setCollapsed(collapsed: boolean): void;
            isFallbackTarget(target: string[]): boolean;
        }

        declare abstract class PivotHeaderCellView extends HeaderCellView {
            abstract model: PivotHeaderCell;
        }

        declare abstract class PivotHeaderGrandCell implements IPivotHeaderGrandCellInfo {
            span: number;
            label: string;
            mCells: PivotHeaderGrandValueCell[];
        }

        declare abstract class PivotHeaderGrandCelllView extends HeaderCellView {
        }

        declare abstract class PivotHeaderGrandValueCell implements IPivotHeaderGrandValueCellInfo {
            measure: string;
            sort?: 'asc' | 'desc';
            isFallbackTarget(target: string[]): boolean;
            getPath(table: IPivotTable): string[];
        }

        declare abstract class PivotHeaderGrandValueCellView extends HeaderCellView {
            model: PivotHeaderGrandValueCell;
            render(width: number, table: PivotTable, model: PivotHeaderGrandValueCell): void;
        }

        declare interface PivotHeaderOptions extends PivotTableItemOptions {
            /**
             * 열 너비 자동 조정 여부.<br/>
             *
             * @default false
             */
            autoWidth?: boolean;
            /**
             * 자동 너비 계산에 포함할 셀 종류.<br/>
             * - `'header'`: 헤더 셀만
             * - `'total'`: 헤더 + 소계/총계 셀
             * - `'both'`: 헤더 + 소계/총계 + 일반 셀(min/max 추정)
             * - `'all'`: `'both'`와 동일 (현재 모든 일반 셀 전수 측정 미지원)
             *
             * @default 'both'
             */
            autoWidthMode?: PivotAutoWidthMode;
            /**
             * 자동 계산된 컬럼 너비의 최소값(px). 지정하면 계산 결과가 이 값보다 작아도 이 값 이상으로 보장된다.
             * 사용자가 직접 지정한 너비({@link setColumnWidth})에는 적용되지 않는다.
             *
             * @default undefined
             */
            minColumnWidth?: number;
            /**
             * 자동 계산된 컬럼 너비의 최대값(px). 지정하면 계산 결과가 이 값보다 커도 이 값 이하로 잘린다.
             * 사용자가 직접 지정한 너비({@link setColumnWidth})에는 적용되지 않는다.
             *
             * @default undefined
             */
            maxColumnWidth?: number;
            /**
             * 열 너비 조정 허용 여부.<br/>
             *
             * @default true
             */
            columnResizable?: boolean;
            /**
             * 하위 항목 확장/축소 아이콘 표시 여부.<br/>
             *
             * @default true
             */
            expanderVisible?: boolean;
            /**
             * measure가 하나만 있으면 measure 행이나 열을 표시하지 않는다.
             *
             * @default true
             */
            hideSingleMeasure?: boolean;
            /**
             * 초기 상태에서 모든 항목을 축소할지 여부.<br/>
             * - `true`: 최상위 필드의 모든 항목을 축소
             * - `'all'`: 모든 필드의 모든 항목을 축소
             * - `false`: 초기 상태에서 항목을 축소하지 않음
             *
             * @default false
             */
            initCollapsed?: boolean | 'all';
            /**
             * 차원필드 헤더 셀 클릭 시 동작 방식.<br/>
             * - `'none'`: 아무 동작도 하지 않는다.
             * - `'select'`: 클릭한 셀 열이나 행의 셀들을 모두 선택한다.
             * - `'expand'`: 클릭한 셀의 항목을 확장/축소한다.
             *
             * @default 'select'
             */
            dimensionClickAction?: 'none' | 'select' | 'expand' | 'selectAndExpand';
            /**
             * 값필드 헤더 셀 클릭 시 동작 방식.<br/>
             * - `'none'`: 아무 동작도 하지 않는다.
             * - `'select'`: 클릭한 셀 열이나 행의 셀들을 모두 선택한다.
             * - `'sort'`: 클릭한 셀 열이나 행의 셀들을 기준으로 반대 축 열이나 행의 기본 정렬(fallback sort)을 설정한다.<br/>
             *             클릭할 때마다 정렬 방향을 'asc' → 'desc' → 'none' 순으로 변경한다.
             *
             * @default 'select'
             */
            measureClickAction?: 'none' | 'select' | 'sort' | 'selectAndSort';
            /**
             * {@page measureClickAction}이 'sort'로 지정된 경우, 설정될 기본 정렬(fallback sort)의 적용 범위<br/>
             *
             * @default 'unset'
             */
            fallbackSortScope?: 'unset' | 'all';
        }

        declare class PivotHeaderSeriesCell implements IPivotHeaderSeriesCellInfo {
            series: PivotSeries;
            pCell?: IPivotHeaderCellInfo;
        }

        declare abstract class PivotHeaderTotalCellView extends HeaderCellView {
            abstract model: PivotHeaderCell;
            /** 실제 화면에 렌더된 컬럼 시작 인덱스. 리사이즈 hit-test 시 사용. */
            firstCol: number;
            /** 실제 화면에 렌더된 컬럼 span. 리사이즈 hit-test 시 사용. */
            colSpan: number;
            getTooltip(table: PivotTable): string | undefined;
        }

        declare abstract class PivotHeaderView<T extends PivotHeader> extends PivotElement<T> {
            owner: IPivotHeaderOwner;
            protected _scrollLayer: UIElement;
            protected _contentLayer: UIElement;
            protected _totalLayer: UIElement;
            /** grand total cell들 뒤에 깔리는 불투명 배경. fixed grand total일 때 가시화된다. */
            protected _grandBackView: UIElement;
            constructor(doc: Document, className: string, owner: IPivotHeaderOwner);
            protected _doInit(doc: Document, initData: any): void;
            get table(): PivotTable;
            protected _doInitDom(doc: Document, dom: HTMLElement): void;
            /** true를 리턴하면 기본 동작(selection)을 수행하지 않는다. */
            protected _clickCell(cell: PivotHeaderCell | PivotHeaderGrandValueCell): boolean;
        }

        /**
         * Headline 패널 모델.<br/>
         * 피벗 상단에 위치하는 패널로, 현재 데이터로부터 도출되는 요약 지표(KPI 등)를
         * 카드 형태로 한눈에 보여주는 역할을 한다.
         */
        declare class PivotHeadline extends PivotBookItem<PivotHeadlineOptions> {
            constructor(book: IPivotBook);
            isEmpty(): boolean;
        }

        /**
         * 피벗 헤드라인 패널 옵션.<br/>
         */
        declare interface PivotHeadlineOptions extends PivotBookItemOptions {
            /**
             * 헤드라인 패널 표시 여부.<br/>
             *
             * @default false
             */
            visible?: boolean;
        }

        declare class PivotHeatmap extends ValueRangeOverlay<PivotHeatmapOptions> {
            static defaults: PivotHeatmapOptions;
            /** lazy-init되는 Color[][] 캐시 */
            private static _DEFAULT_COLORS;
            /**
             * measure 인덱스에 해당하는 기본 색상 세트를 반환한다. (lazy create)
             */
            static getDefaultColors(measure: number): Color[];
            /** 사용자 지정 colors (Color 객체로 변환) */
            private _userColors;
            /** 실제 사용할 색상 (2 또는 3개) */
            private _colors;
            private _nullColor;
            /** 3색 모드일 때 mid 위치 (0~1, midValue 기반). 2색이면 무시 */
            private _midPos;
            /** prepare 시점에 결정되는 색상 보간 함수 (2색/3색 분기 제거) */
            private _colorAt;
            /** 사용자 정의 색 콜백. 설정되면 정규화 파이프라인을 우회. */
            private _colorPicker;
            getColors(measure: number): string[];
            /**
             * 정규화된 값(0~1)에 해당하는 색상을 반환한다.
             * 값이 유효하지 않으면 nullColor(설정된 경우)를 반환하고, 없으면 빈 문자열.
             */
            getColor(value: number, info: IPivotValueCellInfo): string;
            protected _doApply(op: PivotHeatmapOptions): void;
            protected _needsSumStats(): boolean;
            protected _needsSortedStats(): boolean;
            protected _doPrepare(table: IPivotTable, measure: number): void;
            /**
             * 현재 색상 구성에 맞춰 보간 함수를 생성한다.
             * 입력 t는 0~1 범위로 클램프된 정규화 값.
             */
            private $_buildColorAt;
        }

        declare interface PivotHeatmapOptions extends ValueRangeOverlayOptions {
            /**
             * 최소값에서 최대값 사이의 색상 목록.<br/>
             * 2개 또는 3개 색상을 지정할 수 있으며, 값이 낮을수록 앞쪽 색상이 사용된다.
             * 지정하지 않으면 내부 기본 색상 배열에서 측정값(measure) 인덱스 순서에 해당하는 색상 세트를 사용한다.
             * 기본값은 3단계 그라데이션으로, 낮은 값부터 빨강-노랑-초록 순이다.
             */
            colors?: string[];
            /**
             * 값이 null 또는 undefined인 경우 사용할 색상.<br/>
             * 지정하지 않으면 투명하게 처리한다.
             */
            nullColor?: string;
            /**
             * 중간값. `boundsBy`에 따라 해석된다.
             * 미지정이면 (min+max)/2 (또는 `boundsBy`별 균등 중점)이 사용된다.
             * {@page midColor}가 지정된 경우에만 의미가 있으며, 이 값을 기준으로 색상이 결정된다.
             */
            midValue?: number;
            /**
             * 셀별 색상을 직접 결정하는 콜백. 정의되면 `boundsBy`/`minValue`/`maxValue`/`midValue`/`colors`/`logBase`
             * 등 내부 색상 결정 파이프라인을 전부 우회한다.
             *
             * - 문자열(CSS 색) 반환 → 그 색을 그대로 사용.
             * - `undefined` 반환 → 해당 셀에 한해 기본 그라데이션 경로로 폴백.
             *
             * `stats`는 overlay 자신의 `cellScope`/`compareScope`로 prepare된 분포 통계.
             *
             * @example
             * ```ts
             * // 사분위수 기반 단계 색칠
             * heatmap: {
             *   compareScope: 'row',
             *   colorPicker: (cell, stats) => {
             *     const g = stats.groups.get(stats.groupKey(cell)) ?? stats.all;
             *     const t = (cell.value - g.min) / (g.max - g.min);
             *     return t < 0.25 ? '#cce5ff' : t < 0.5 ? '#66b2ff' : t < 0.75 ? '#3385ff' : '#003d99';
             *   }
             * }
             * ```
             */
            colorPicker?: (cell: IPivotValueCellInfo, stats: ScopedStats) => string | undefined;
        }

        declare class PivotHelper {
            table: PivotTable;
            private _ancestorCache;
            constructor(table: PivotTable);
            reset(): void;
            getValue(prow: PivotRow, pcol: PivotColumn, nMeasure: number, vor: boolean): any;
            getGrandTotal(prow: PivotRow, pcol: PivotColumn, nMeasure: number, vor: boolean): any;
            getTotal(prow: PivotRow, pcol: PivotColumn, nMeasure: number, vor: boolean): any;
            getSeriesTotal(prow: PivotRow, pcol: PivotColumn, vor: boolean): any;
            /**
             * 셀 종류(g/d/m × g/d/m)에 관계없이 raw 집계 값을 반환한다.
             * leaf 데이터 셀은 matrix에서, 소계/총계 셀은 totals/internalCellTotal에서 가져온다.
             * NaN인 경우 null로 정규화한다.
             */
            getCellValue(row: number, col: number, nMeasure: number, vor: boolean): number | null;
            collectAncestors(node: PivotRow | PivotColumn, dims: readonly string[]): AncestorInfo | undefined;
        }

        /**
         * 셀의 값에 따라 스타일을 동적으로 변경하는 하이라이트 기능을 제공하는 overlay 모델 클래스.<br/>
         * 특정 조건을 만족하는 셀을 눈에 띄게 표시한다.
         */
        declare class PivotHighlight extends NormalizedCellOverlay<PivotHighlightOptions> {
            static defaults: PivotHighlightOptions;
            private _rules;
            protected _doInit(op: PivotHighlightOptions): void;
            get rules(): readonly PivotHighlightRule[];
            /**
             * 셀에 매칭되는 첫 번째 rule을 반환한다. 없으면 `null`.
             * overlay-level `cellScope` 필터는 호출자가 별도로 검사해야 한다 ({@link isDisplayTarget}).
             * rule-level `cellScope`는 여기서 추가로 검사된다 (overlay scope ∩ rule scope).
             */
            findMatch(info: IPivotValueCellInfo, reversed: boolean): PivotHighlightRule | undefined;
            findMatches(info: IPivotValueCellInfo): PivotHighlightRule[];
            resolve(info: IPivotValueCellInfo, target: ResolvedHighlight): ResolvedHighlight | null;
            get visible(): boolean;
            protected _doPrepare(table: IPivotTable, measure: number): void;
            private $_applyStatRule;
        }

        declare interface PivotHighlightOptions extends NormalizedCellOverlayOptions {
            /**
             * 하이라이트 규칙 목록.<br/>
             * 여러 규칙을 지정할 수 있으며, 조건이 겹치는 셀에는 먼저 일치한 규칙의 스타일이 적용된다.
             */
            rules?: PivotHighlightRuleCollectionOptions | PivotHighlightRuleOptions[];
            /**
             * 하이라이트 규칙 적용 모드.<br/>
             * - `'first'` : 첫 번째 일치하는 규칙만 적용 (기본)
             * - `'all'`   : 모든 일치하는 규칙 적용
             *
             * @default 'first'
             */
            ruleMode?: PivotHighlightRuleMode;
            /**
             * 공통 아이콘 세트 이름. 빌트인({@link PivotIconSet}) 또는 등록된 이름.<br/>
             * 각 rule의 `style.iconSet`이 지정되지 않으면 이 값이 사용된다.
             */
            iconSet?: PivotIconSet | string;
        }

        /**
         * 셀 하이라이트 규칙을 표현하는 클래스.
         * TODO: expression rule 지원. 예: `value > 100 && value < 200` 같은 식으로 조건을 표현할 수 있게.
         *       expression은 통계 기반 조건과 달리 prepare 단계에서 임계값 계산이 필요 없으므로, PivotHighlightRule과 별도 클래스로 구현하는 것도 고려할 수 있다.
         */
        declare class PivotHighlightRule<OP extends PivotHighlightRuleOptions = PivotHighlightRuleOptions> extends ROptionable<OP> {
            static defaults: PivotHighlightRuleOptions;
            static ruleToString(op: Partial<PivotHighlightRuleOptions>): string;
            type: HighlightType_2;
            /**
             * 셀이 이 rule에 해당하는지 평가하는 함수.<br/>
             * - 값-기반(`greater`/`less`/`equal`/`between`/`in` 등) 조건은 `_doApply` 시점에 즉시 생성된다.
             * - 통계-기반(`top`/`bottom`/`topPercent`/`bottomPercent`/`aboveAvg`/`belowAvg`) 조건은
             *   {@link PivotHighlight._doPrepare}에서 임계값을 계산한 뒤 갱신된다 (그 전엔 `NEVER`).
             */
            comparer: (cell: IPivotValueCellInfo) => boolean;
            /**
             * 이 rule이 적용 가능한 셀 레벨 집합.<br/>
             * `cellScope` 옵션이 명시된 경우에만 set 되며, 그렇지 않으면 `null`(overlay scope 그대로 사용).
             * overlay scope과의 교집합은 평가/통계 산출 단계에서 별도로 처리된다.
             */
            cellLevels: Set<ValueCellType> | null;
            protected _doApply(op: OP): void;
            toString(): string;
            /**
             * rule에 지정된 `cellScope`를 `parentScope`(보통 overlay의 cellScope)와 교집합한 결과를 배열로 반환한다.
             *
             * - rule에 `cellScope`가 지정되지 않았으면 parent 그대로(=상속)를 반환.
             * - rule이 지정되었으면 `rule ∩ parent`만 반환 (overlay scope 밖으로 벗어날 수 없음).
             * - `parentScope`가 `undefined`면 제한 없음(rule 자체를 정규화해서 반환).
             * - `'all'`은 `['value','subtotal','total']`로 펼쳐진다.
             */
            getCellScope(parentScope?: CellScope): ('value' | 'subtotal' | 'total')[];
            /**
             * rule에 지정된 `compareScope`를 `parentScope`(보통 overlay의 compareScope)와 교집합한 결과를 축 배열로 반환한다.
             *
             * - rule에 `compareScope`가 지정되지 않았으면 parent 그대로(=상속)를 반환.
             * - rule이 지정되었으면 `rule ∩ parent`만 반환.
             * - `parentScope`가 `undefined`면 제한 없음.
             * - `'all'`은 모든 축으로 펼쳐진다.
             */
            getCompareScope(parentScope?: CompareScope): CompareAxis[];
            /**
             *
             * @param scopedFor `compareScope`이 적용된 경우 셀별로 다른 그룹의 임계값을 써야 하므로
             *                  그룹 키 → 임계값 매핑을 받는다. `compareScope`이 `'all'`이면 단일 임계값.
             * @param threshold 단일 임계값 (`compareScope === 'all'` 케이스).
             * @param thresholds 그룹별 임계값. 키 추출 함수와 함께 사용.
             * @param groupKeyFn 셀로부터 그룹 키를 추출하는 함수.
             */
            rebuildStatComparer(threshold: number | undefined, thresholds: Map<string, number> | undefined, groupKeyFn: ((cell: IPivotValueCellInfo) => string) | undefined): void;
            private $_compareOp;
            private $_createComparer;
        }

        declare interface PivotHighlightRuleCollectionOptions extends RCollectionOptions<PivotHighlightRuleOptions> {
        }

        /**
         * 하이라이트 규칙 적용 모드.<br/>
         * - `'first'` : 첫 번째 일치하는 규칙만 적용 (기본)
         * - `'last'`  : 마지막 일치하는 규칙만 적용
         * - `'all'`   : 모든 일치하는 규칙 적용
         */
        declare type PivotHighlightRuleMode = 'first' | 'last' | 'all';

        /**
         * 하이라이트 규칙.
         */
        declare interface PivotHighlightRuleOptions extends ROptions {
            /**
             * 조건 유형.
             */
            type: HighlightType_2;
            /**
             * 조건 값.<br/>
             * - `'top'` / `'bottom'` : 항목 수 (정수)
             * - `'topPercent'` / `'bottomPercent'` : 백분율 (0~100)
             * - `'greater'` 등 비교 조건 : 임계값
             * - `'between'` / `'notBetween'` : `[하한값, 상한값]`
             * - `'in'` / `'notIn'` : 비교 대상 값 목록 (예: `[10, 20, 30]`)
             * - `'aboveAvg'` / `'belowAvg'` : 사용하지 않음
             */
            value?: number | [number, number] | number[];
            /**
             * 강조 스타일.<br/>
             * 지정하지 않으면 기본 강조 스타일이 적용된다.
             *
             * @default ```{ color: 'red' }```
             */
            style?: PivotCellStyle;
            /**
             * 사용자 정의 CSS 클래스 이름.<br/>
             * {@page style} 옵션으로 표현하기 어려운 경우에 사용할 수 있다.
             */
            className?: string;
            /**
             * 이 규칙을 적용할 셀 타입.<br/>
             * 지정하지 않으면 overlay의 {@link PivotHighlightOptions.cellScope}를 따른다.
             *
             * **overlay scope의 부분집합으로 해석된다.**
             * 즉, 여기서 overlay scope보다 더 넓은 범위를 지정해도 overlay scope 밖의 셀에는 적용되지 않는다.
             * (overlay scope이 "이 overlay가 처리할 셀 영역"을 정의하기 때문.)
             *
             * @example
             * ```ts
             * // overlay는 모든 셀에 설치, 규칙별로 다른 셀 레벨에 다른 임계값
             * cellScope: 'all',
             * rules: [
             *   { type: 'less', value: 0,        cellScope: 'value',    style: { color: 'red' } },
             *   { type: 'less', value: 0,        cellScope: 'subtotal', style: { backgroundColor: 'pink' } },
             *   { type: 'greater', value: 1e6,   cellScope: 'total',    style: { fontWeight: 'bold' } },
             * ]
             * ```
             * @default undefined overlay의 `cellScope` 값 (기본은 'value')
             * @see {@link CellScope}
             */
            cellScope?: CellScope;
            /**
             * 이 규칙의 통계 평가 범위(`top`/`bottom`/`aboveAvg` 등).<br/>
             * 지정하지 않으면 overlay의 {@link PivotHighlightOptions.compareScope}를 따른다.
             *
             * `cellScope`와 달리 overlay scope과 독립적으로 동작한다 (rule이 단순 override).
             * 규칙마다 비교 단위가 다른 케이스를 자연스럽게 표현한다.
             *
             * @example
             * ```ts
             * rules: [
             *   // 각 행에서 top 3
             *   { type: 'top', value: 3, compareScope: 'row',  style: { backgroundColor: 'gold' } },
             *   // 전체 평균 이하
             *   { type: 'belowAvg',     compareScope: 'all',  style: { color: 'gray' } },
             * ]
             * ```
             *
             * `between`/`greater` 등 절대값 기반 규칙에는 영향이 없다.
             *
             * @default undefined overlay의 `compareScope` 값 (기본은 'all')
             * @see {@link CompareScope}
             */
            compareScope?: CompareScope;
        }

        /**
         * 미리 정의된 아이콘 이름.<br/>
         * `PivotIconRegistry.registerIcon()`으로 추가 등록할 수 있다.
         */
        declare type PivotIcon = 'arrow-up' | 'arrow-up-right' | 'arrow-right' | 'arrow-down-right' | 'arrow-down' | 'triangle-up' | 'triangle-right' | 'triangle-down' | 'circle-green' | 'circle-yellow' | 'circle-red' | 'circle-gray' | 'flag-green' | 'flag-yellow' | 'flag-red' | 'star-full' | 'star-half' | 'star-empty' | 'bar-4' | 'bar-3' | 'bar-2' | 'bar-1' | 'bar-0' | 'check' | 'warning' | 'cross';

        /**
         * 셀 값에 따라 자동 매핑된 아이콘을 표시하는 overlay.
         *
         * `iconSet`의 아이콘 개수만큼 값 범위를 N등분하여 각 셀이 어느 구간에 속하는지에 따라 아이콘을 결정한다.
         *
         * `compareScope`/`cellScope`은 superclass({@link NormalizedCellOverlay})에서 정규화 그룹 분리에 사용된다.
         * 통계는 같은 measure의 다른 overlay와 `ValueFieldStatsManager` 캐시를 공유한다.
         *
         * Icon overlay는 범위 자체를 늘리거나 줄이는 게 아니라 슬롯 컷 위치를 정의하므로
         * {@link ValueRangeOverlay}의 `boundsBy`/`minValue`/`maxValue`/`logBase`는 지원하지 않는다.
         * 대신 자체 `divideBy`(percent/percentile/value) 옵션으로 슬롯 컷을 제어한다.
         */
        declare class PivotIconOverlay extends NormalizedCellOverlay<PivotIconOverlayOptions> {
            static defaults: PivotIconOverlayOptions;
            private _icons;
            private _iconColors;
            private _iconOnly;
            private _placement;
            private _size;
            private _gap;
            private _slotter;
            /** 해석된 아이콘 이름 배열. 비어있으면 표시할 아이콘이 없다. */
            get icons(): readonly string[];
            get placement(): IconPlacement;
            get iconSize(): number;
            get gap(): number;
            get iconOnly(): boolean;
            /**
             * 셀의 값에 매칭되는 아이콘 정보. 매칭이 없으면 null.
             * 반환 객체는 호출 시 즉시 소비해야 하는 캐시일 수 있다.
             */
            resolve(value: number, ctx: CellContext): {
                name: string;
                color: string;
                placement: IconPlacement;
                size: number;
                gap: number;
                hideText: boolean;
            } | null;
            protected _doPrepare(table: IPivotTable, measure: number): void;
            /**
             * `percent` 모드(또는 thresholds 미지정): superclass의 normalize()가 만든 0..1 정규화 값을 사용해 슬롯 결정.
             */
            private $_buildNormalizedSlotter;
            /**
             * `value` 모드: raw 값과 raw thresholds를 직접 비교한다.
             * 정규화/그룹/logBase 영향을 받지 않으므로 spec("실제 데이터 값 기준")과 일치한다.
             */
            private $_buildValueSlotter;
            /**
             * `percentile` 모드: 그룹별 정렬값으로부터 percentile 컷오프(raw value)를 계산해 사용.
             */
            private $_buildPercentileSlotter;
        }

        /**
         * Icon overlay 옵션.
         *
         * 값 범위를 `iconSet`의 아이콘 개수만큼 자동 N등분하여 각 구간에 아이콘을 매핑한다.
         * 임의 조건에 따라 아이콘을 표시하려면 {@link PivotHighlightOptions}의 `style.icon`을 사용한다.
         *
         * databar와 같은 셀에 동시 적용할 수 없다 (databar가 우선).
         */
        declare interface PivotIconOverlayOptions extends NormalizedCellOverlayOptions {
            /**
             * 아이콘 세트 이름. 빌트인({@link PivotIconSet}) 또는 등록된 이름.
             *
             * @default 'arrows-3'
             */
            iconSet?: PivotIconSet | string;
            /**
             * 경계값(`thresholds`) 해석 방식 및 자동 N등분 기준. 기본 `'percent'`.
             * `thresholds` 미지정 시에는 모든 모드가 자동으로 균등 N등분한다.
             * @see {@link IconDivideMode}
             */
            divideMode?: IconDivideMode;
            /**
             * 경계값 비교 방식.
             * - `true`(기본) : `value >= threshold` 이면 해당 슬롯에 포함.
             * - `false`      : `value >  threshold` 이면 해당 슬롯에 포함 (경계값 자체는 아래 슬롯).
             *
             * @default true
             */
            inclusive?: boolean;
            /**
             * 구간 경계값 (오름차순). 지정하지 않으면 `divideMode` 기준으로 균등 N등분한다.
             * - `divideMode: 'percent'` 이면 0~100 사이 백분율 값. 예: `[33, 67]`
             * - `divideMode: 'percentile'` 이면 0~100 백분위수. 예: `[33, 67]`
             * - `divideMode: 'value'`   이면 실제 데이터 값.    예: `[1000, 5000]`
             *
             * 길이는 (아이콘 수 - 1)이어야 한다.
             *
             * @example
             * // 'traffic-3' (아이콘 3개), 실제 값으로 경계 직접 지정
             * divideMode: 'value',
             * thresholds: [1000, 5000]  // ~1000: 0번째, 1000~5000: 1번째, 5000~: 2번째
             */
            thresholds?: number[];
            /**
             * 아이콘 색상. colorable 아이콘에만 의미.
             * - 단일 문자열: 모든 아이콘 같은 색상
             * - 배열: 인덱스별 색상
             * 미지정 시 셀의 텍스트 색상을 따른다.
             */
            color?: string | string[];
            /**
             * 아이콘 배치.
             *
             * @default 'auto'
             */
            placement?: IconPlacement;
            /**
             * true면 아이콘만 표시하고 값 텍스트를 숨기다.
             */
            iconOnly?: boolean;
            /**
             * 값을 정렬 역순으로 매핑. 기본 false.
             * true면 큰 값이 0번째 아이콘, 작은 값이 마지막 아이콘이 된다.
             */
            reversed?: boolean;
            /**
             * 아이콘 크기(px). 기본 14.
             */
            iconSize?: number;
            /**
             * 아이콘과 텍스트 간격(px).
             *
             * @default 2
             */
            gap?: number;
        }

        /**
         * 미리 정의된 아이콘 세트 이름.<br/>
         * 값 범위를 N등분하여 각 구간에 아이콘을 자동 매핑한다.
         * `PivotIconRegistry.registerSet()`으로 추가 등록할 수 있다.
         */
        declare type PivotIconSet = 'arrows-3' | 'arrows-5' | 'triangles-3' | 'traffic-3' | 'flags-3' | 'stars-3' | 'bars-5' | 'checks-3';

        /**
         * 전체 Inspector 상태를 관리하는 Model.
         * UI 의존성 없이 섹션 Model들을 소유하고 설정 상태를 관리.
         */
        declare class PivotInspector extends PivotBookItem<PivotInspectorOptions> {
            static defaults: PivotInspectorOptions;
            private _table;
            private _fieldPanel;
            private _filterPanel;
            private _mode;
            /** float 전환 직전의 dock 위치. 기본 float 영역 계산에 사용. */
            private _lastDockedPosition;
            protected _doInit(op: PivotInspectorOptions): void;
            get table(): PivotTable;
            get fieldPanel(): PivotFieldPanel;
            get filterPanel(): PivotFilterPanel;
            get aiPanel(): PivotAiPanel | undefined;
            get mode(): 'field' | 'filter' | 'ai';
            get position(): InspectorPosition;
            get lastDockedPosition(): 'left' | 'right';
            get floating(): boolean;
            get floatBounds(): IRect | undefined;
            get autoDock(): boolean;
            /**
             * Floating 모드의 위치/크기 갱신. 사용자 드래그/리사이즈 결과를 반영한다.
             */
            setFloatBounds(bounds: IRect): void;
            /**
             * Position 변경. float 전환 전에 마지막 dock 위치를 기억한다.
             */
            setPosition(position: InspectorPosition): void;
            setPageAdding(): void;
            canUndock(): boolean;
            prepareRender(book: PivotBook, table: PivotTable): void;
            afterRender(): void;
            protected _isVisible(): boolean;
            protected _doApply(op: PivotInspectorOptions): void;
            private $_getPanelMode;
            private $_checkMode;
        }

        /**
         * 피벗 인스펙터 옵션.<br/>
         */
        declare interface PivotInspectorOptions extends PivotBookItemOptions {
            mode?: 'field' | 'filter' | 'ai';
            /**
             * 필드 패널 옵션(차원/측정값 필드를 행/열/필터 축에 배치하는 패널).<br/>
             * 일반적으로 {@link inspector} 내부에 표시되며, 패널 레이아웃 등을 설정한다.<br/>
             * `boolean` 축약형으로 지정하면 필드 패널의 표시 여부만 토글한다.
             */
            fieldPanel?: PivotFieldPanelOptions | boolean;
            /**
             * 필터 패널 옵션(필터 셀렉터를 모아 보여주는 패널).<br/>
             * 일반적으로 {@link inspector} 내부에 표시된다.<br/>
             * `boolean` 축약형으로 지정하면 필터 패널의 표시 여부만 토글한다.
             */
            filterPanel?: PivotFilterPanelOptions | boolean;
            /**
             * 인스펙터 표시 여부.<br/>
             *
             * @default false
             */
            visible?: boolean;
            /**
             * 인스펙터 배치 위치.
             * - `'left'` / `'right'`: docked. 기존 좌/우 고정 layout.
             * - `'float'`: floating. {@link floatBounds}로 위치/크기 결정. 사용자가 자유롭게 이동/크기 변경 가능.
             */
            position?: InspectorPosition;
            /**
             * 인스펙터 시작 너비.
             *
             * @default 310
             */
            width?: number;
            /**
             * 인스펙터 최소 너비.
             *
             * @default 240
             */
            minWidth?: number;
            /**
             * 인스펙터 최소 높이 (floating 모드).
             *
             * @default 200
             */
            minHeight?: number;
            /**
             * Floating 모드일 때 패널의 위치/크기. 사용자가 드래그/리사이즈하면 자동 갱신된다.
             * 미지정 시 control 우상단에 기본 크기로 표시한다.
             */
            floatBounds?: IRect;
            /**
             * 드래그로 dock/undock 자동 전환 활성화 여부.
             * - true: docked 상태에서 header를 끌면 floating으로 전환되고,
             *   floating 상태에서 패널을 좌/우 모서리로 끌면 해당 사이드로 dock된다.
             * - false: 헤더의 dock/undock 버튼으로만 전환할 수 있다.
             *
             * @default true
             */
            autoDock?: boolean;
        }

        declare abstract class PivotInspectorPanel<OP extends PivotInspectorPanelOptions = PivotInspectorPanelOptions> extends PivotPanel<OP> {
            static defaults: PivotInspectorPanelOptions;
        }

        declare interface PivotInspectorPanelOptions extends PivotPanelOptions {
        }

        /**
         * Pivot inspector view.
         */
        export declare class PivotInspectorViewImpl extends DockableView {
            private _model;
            private _headerView;
            /** Floating frame title bar (드래그로 이동) — float 모드일 때만 표시 */
            private _titleBar;
            private _fieldsView;
            private _filtersView;
            private _aiView;
            private _position;
            private _leftSibling;
            private _rightSibling;
            constructor(doc: Document, model: PivotInspector);
            protected _doInit(doc: Document): void;
            protected _doDispose(): void;
            /**
             * Inspector Model
             */
            get model(): PivotInspector;
            get headerView(): HeaderView;
            get fieldsView(): PivotFieldPanelView;
            get filtersView(): PivotFilterPanelView;
            get aiView(): PivotAIPanelView;
            get position(): InspectorPosition;
            protected _setPosition(position: "right" | "left" | "float"): void;
            /**
             * 모달 인스펙터 열기
             */
            open(): void;
            /**
             * 모달 인스펙터 닫기
             */
            close(): void;
            click(element: Element): boolean;
            getPopupMenu(target: Element): PopupMenu | undefined;
            setPage(pageView: PivotPageView): this;
            render(doc: Document, leftSibling: number, rightSibling: number, force: boolean): void;
            getContextMenu(target: Element): PopupMenu | undefined;
            protected _getDockView(): UIElement;
            protected _getDragView(): HTMLElement;
            protected _getLeftSiblingWidth(): number;
            protected _getRightSiblingWidth(): number;
        }

        /**
         * Pivot table 구성 요소 base class.<br/>
         * Represents a single item in a pivot table.
         */
        declare abstract class PivotItem<OP extends PivotItemOptions = PivotItemOptions> extends ROptionable<OP> {
            static defaults: PivotItemOptions;
            /**
             * 표시 여부.
             */
            get visible(): boolean;
            set visible(value: boolean);
            protected _isVisible(): boolean;
            protected _doSetSimple(op: OP, src: any): boolean;
            protected _doApply(op: OP): void;
            _optionChanged(tag?: any): void;
        }

        declare interface PivotItemOptions extends ROptions {
            /**
             * 표시 여부.
             *
             * @default true
             */
            visible?: boolean;
            /**
             * 스타일셋 혹은 class selector.
             */
            style?: CSSAppearance | string;
        }

        /**
         * Pivot layout bar model.<br/>
         * 인스펙터, 탐색기 등의 위치를 지정하는 버튼 등이 표시된다.
         */
        declare class PivotLayoutBar extends PivotBookItem<PivotLayoutBarOptions> {
            static defaults: PivotLayoutBarOptions;
            constructor(book: IPivotBook);
            prepareRender(): void;
        }

        export declare interface PivotLayoutBarOptions extends PivotBookItemOptions {
        }

        declare type PivotLevel = {
            level: number;
            dimension: string | null;
            values?: any[];
        };

        declare interface PivotLocalAIModelOptions extends PivotAIModelOptions {
            provider: "openai" | "gemini" | "custom";
            apiKey: string;
            /**
             * azure 또는 custom provider에서 호출 대상 endpoint(baseURL).<br/>
             * provider가 "openai"이면 기본값은 "https://api.openai.com/v1",
             * "gemini"이면 "https://generativelanguage.googleapis.com/v1beta"이다.
             */
            endpoint?: string;
            /**
             * 컨텍스트로 유지할 최대 대화 턴 수(토큰 예산 관리용).<br/>
             * 0(기본)이면 제한 없음. 초과 시 오래된 턴부터 메시지 구성에서 제외한다(history 자체는 보존).
             */
            maxContextTurns?: number;
            /**
             * systemContext를 provider의 컨텍스트 캐시로 재사용할지 여부.<br/>
             * - gemini: 명시적 캐시(cachedContents)를 만들어 systemInstruction을 캐시하고, 이후 요청은 cachedContent만 참조한다.
             *           최소 토큰 미달·생성 실패 시 자동으로 인라인 systemInstruction으로 폴백한다.
             * - openai: prompt_cache_key 힌트를 전달해 프리픽스 자동 캐시 적중률을 높인다(명시적 캐시 API는 없다).
             *
             * @default false
             */
            useContextCache?: boolean;
            /**
             * gemini 명시적 캐시의 TTL(초 단위 Duration 문자열, 예 "3600s"). 기본 "3600s".<br/>
             * gemini provider에만 적용된다.
             */
            contextCacheTtl?: string;
            /** call() 시 검색 결과를 프롬프트에 자동 주입할지 여부. 기본 false. */
            useRag?: boolean;
            /** query 임베딩에 사용할 모델명(코퍼스와 동일해야 함). provider별 기본값 있음. */
            embeddingModel?: string;
            /** 검색 시 반환할 상위 chunk 수. 기본 5. */
            ragTopK?: number;
            /** 임베딩 바이너리(Float32) 경로. 기본 "rag/embeddings.bin". */
            ragEmbeddingsPath?: string;
            /** 원문 chunk 배열(JSON) 경로. 기본 "rag/chunks.json". */
            ragChunksPath?: string;
            /** 메타(count/dim/model) 경로. 기본 "rag/meta.json". */
            ragMetaPath?: string;
        }

        declare class PivotMapChart extends ROptionable<PivotMapChartOptions> {
            static defaults: PivotMapChartOptions;
            private _table;
            private _areaPath;
            private _valuePath;
            private _colPath;
            constructor(table: PivotTable);
            buildCellConfig(table: PivotTable, cell: IPivotBodyCellInfo): RealMap.ChartConfiguration;
            buildSelectionConfig(table: PivotTable, selection: PivotSelection, cell: IPivotBodyCellInfo): RealMap.ChartConfiguration;
            private $_assembleConfig;
            getPath(): string;
            /** 핀 좌표 매칭에 쓸 지도 area 속성. (view가 area→centroid를 찾을 때 사용) */
            getCoordKey(): string;
            _optionChanged(tag?: any): void;
            private $_selectPin;
            private $_areaKey;
            /**
             * pin 데이터포인트. name=지역명(표시·툴팁), area=상위 그룹을 붙인 매칭 키(동명 지역 구분).
             * id는 두지 않는다 — 있으면 realmap이 area-id로 좌표를 임의 해석하므로, 좌표는 view가 area로 채운다.
             */
            private $_pinPoint;
            /** map 색칠 데이터포인트. pin 포인트에 mapKeys 매칭용 id(=지역명)를 더한다. */
            private $_mapPoint;
            /**
             * 행이 속한 그룹 노드. 색칠/dedup/헤더 표기의 공통 기준이다.
             * - 'm'(지역, 예: 시군구·국가) → 상위 그룹(부모, 예: 시도·대륙)
             * - 'd'(소계/요약) → 자신
             * - 'g'(총계) → 없음(undefined = 전체)
             */
            private $_groupNode;
            private $_groupKey;
            /**
             * 클릭한 행에서 색칠 대상 지역(leaf, measure 타입 'm') 셀들을 모은다.
             * 소계 행은 leaf와 같은 레벨에 놓이므로 레벨/위치 대신 상위 그룹 라벨로 묶는다. (그룹 라벨은 유일하다고 가정)
             *  - 'm'(지역 셀, 예: 시군구·국가): 같은 상위 그룹(부모 라벨)의 지역들
             *  - 'd'(상위 그룹 소계/요약, 예: 시도·대륙): 자신의 라벨과 일치하는 그룹의 지역들
             *  - 'g'(전체 요약): 전체 지역(그룹 라벨 undefined → 필터 없음)
             * prow가 아닌 셀을 그대로 반환해, 호출부가 값을 다시 조회하지 않도록 한다(행당 _internalCell 1회).
             */
            private $_collectLeafCells;
            /**
             * 색칠 범위를 헤더 info 문자열로 표기한다. 그룹 노드가 없으면(총계/그룹 없음) '전체'.
             */
            private $_areaScope;
            private $_buildPoints;
            /**
             * 측정값에 적용할 colorScale을 우선순위로 결정한다.
             * 명시 색 정의(객체) > 히트맵 도출('heatmap'·생략) > 기본 스케일. (`'none'`이면 색칠 안 함, 색 외 옵션만 주면 도출 결과에 병합)
             */
            private $_resolveColorScale;
            /** 측정값별 colorScale entry를 꺼낸다. (측정값별 맵이면 해당 키, 단일 스케일이면 그대로) */
            private $_colorScaleEntry;
            /** colorScale 옵션이 '측정값별 맵'인지 구분한다. (스케일 키가 하나도 없으면 맵으로 본다) */
            private $_isColorScaleMap;
            /** colorScale entry가 색을 직접 정의하는지. (비색상 옵션만 있으면 false → 도출 결과에 병합 대상) */
            private $_hasColorDef;
            /** 측정값 히트맵 설정에서 맵 colorScale을 자동 도출한다. 도출 불가하면 undefined. */
            private $_colorScaleFromHeatmap;
            /** 히트맵을 colorScale로 변환 가능한지. 고정 범위(boundsMode:'value')만 도출하고 비선형/상대 모드는 제외한다. */
            private $_isHeatmapDerivable;
            /**
             * 히트맵과 같은 값↔색 매핑이 되도록, 범위 밖을 양 끝 단색 step으로 클램프한 colorScale을 만든다.
             * colors는 2색(min↔max) 또는 3색(min↔mid↔max) 발산.
             */
            private $_clampedColorScale;
            /** 값 범위를 옅은→진한 파랑으로 잇는 realmap 기본(auto) 스케일. */
            private $_defaultColorScale;
        }

        /**
         * 피벗 맵차트 패널 옵션.<br/>
         */
        declare interface PivotMapChartOptions extends ROptions {
            /**
             * 맵차트가 사용할 지도 소스(geojson 등)의 url.<br/>
             * 맵차트는 지도 없이 그릴 수 없으므로 반드시 지정해야 한다.
             */
            mapUrl?: string;
            /**
             * 지도 소스의 이름. series가 참조한다.<br/>
             *
             * @default 'map'
             */
            mapName?: string;
            /**
             * 지도 area와 데이터포인트를 연결할 키. `[지도 area 속성, 데이터포인트 속성]`.<br/>
             * 예) `['name', 'id']` 는 지도 area의 'name' 속성과 데이터포인트의 'id' 속성을 매칭한다.
             *
             * @default ['name', 'id']
             */
            mapKeys?: [string, string];
            /**
             * 선택 지역 핀의 좌표를 찾을 때, 포인트의 area와 매칭할 지도 area 속성.<br/>
             * 이 속성이 없으면 area의 'name'으로 폴백한다(세계지도 등 동명 지역이 없는 지도 대응).
             *
             * @default 'rm-fullname'
             */
            coordKey?: string;
            /**
             * 지도에서 제외할 area id 목록.<br/>
             * 예) 남극을 빼려면 `['ATA']`. 좁은 패널에서 불필요한 영역이 공간을 차지하는 것을 막는다.
             */
            mapExclude?: string[];
            /**
             * area 색상 스케일. 측정값마다 다르게 주려면 `{ 측정값이름: ... }` 맵으로 지정한다.<br/>
             * 측정값별로 다음 우선순위로 결정된다:<br/>
             *  1) ColorScale 객체 → 그대로 사용(오버라이드)<br/>
             *  2) `'heatmap'`(또는 생략) → 그 측정값의 피벗 히트맵 설정에서 자동 도출(히트맵이 없으면 기본 스케일)<br/>
             *  3) `'none'` → 색칠 안 함<br/>
             * 색 외 옵션(nullStep 등)만 담은 객체를 주면 도출 결과에 병합된다.
             */
            colorScale?: PivotMapColorScale | {
                [measure: string]: PivotMapColorScale;
            };
            /**
             * 지도 좌표 투영 방식. 위경도(geojson) 지도는 'mercator'로 투영해야 화면에 맞게 배치된다.<br/>
             *
             * @default 'mercator'
             */
            projection?: RealMap.ProjectionType;
            /**
             * 지도 축(경위도 격자선 등) 설정. 지정하지 않으면 격자선만 표시한다(`{ grid: { visible: true } }`).<br/>
             * 좁은 지역(예: 대한민국)은 기본 격자 step이 커서 선이 어색하게 한두 개만 그려질 수 있으므로,
             * `{ grid: { line: { step: 1 } } }`처럼 step을 줄이거나 `{ grid: false }`로 끌 수 있다.
             */
            axis?: RealMap.ChartConfiguration['axis'];
            /**
             * 차트의 x축(범주)에 피봇테이블의 행/열 중 무엇을 매핑할지.<br/>
             *
             * @default 'row'
             */
            xAxis?: 'row' | 'column';
            /**
             * 선택 지역 핀의 스타일. 예제마다 핀 배경색·외곽선을 다르게 주고 싶을 때 사용한다.<br/>
             * `style`은 기본 핀 스타일(파란 배경 `#3b82f6` + 검정 외곽선)에 병합되므로,
             * 일부만 지정하면(예: `{ fill: 'red' }`) 나머지 기본값은 유지된다.
             */
            pin?: {
                style?: RealMap.SVGStyleOrClass;
            };
        }

        /**
         * 맵 패널 colorScale 값.<br/>
         * - ColorScale 객체(steps/colors/minColor 등): 그대로 사용(오버라이드)<br/>
         * - `'heatmap'`: 그 측정값의 피벗 히트맵 설정에서 자동 도출<br/>
         * - `'none'`: 색칠 안 함
         */
        declare type PivotMapColorScale = RealMap.ChartConfiguration['colorScale'] | 'heatmap' | 'none';

        declare class PivotMapPanel extends PivotExplorerPanel<PivotMapPanelOptions, PivotBookPageMapContext> {
            static defaults: PivotMapPanelOptions;
            get chart(): PivotMapChart;
            getCtx(): PivotBookPageMapContext;
            getMenu(table: PivotBookPage): PopupMenu;
            private _menu;
        }

        /**
         * 탐색기 피벗 맵차트 패널 옵션.<br/>
         */
        declare interface PivotMapPanelOptions extends PivotExplorerPanelOptions {
        }

        /**
         * PivotMatrix 클래스는 AggTable의 집계 결과를 crosstab 매트릭스 형태로 변환하는 클래스.<br/>
         *
         * ## 특징
         * - **행/열 차원 지정**: rowDimensions과 columnDimensions으로 레이아웃 정의
         * - **Null 데이터 처리**: emptyValue 로 빈 셀을 다양하게 표시
         * - **Custom 처리**: 측정값 타입별로 다른 기본값 설정 가능
         *
         * ## 사용 예시
         * ```typescript
         * // 1. 기본 crosstab: 행은 region, 열은 product
         * const pivot1 = PivotMatrix.pivot(agg, {
         *   rowDimensions: ['region'],
         *   columnDimensions: ['product'],
         *   valueColumn: 'sales',
         *   emptyValue: 'zero'
         * });
         *
         * // 결과:
         * //         | A    | B     | C
         * // --------|------|-------|-----
         * // Seoul   | 10K  | 20K   | 0     ← 데이터 없음
         * // Busan   | 15K  | 5K    | 0     ← 데이터 없음
         * // Daegu   | 8K   | 0     | 12K   ← 데이터 없음
         *
         * // 2. Empty 값을 "-"로 표시
         * const pivot2 = PivotMatrix.pivot(agg, {
         *   rowDimensions: ['region'],
         *   columnDimensions: ['product'],
         *   valueColumn: 'sales',
         *   emptyValue: 'dash'
         * });
         *
         * // 결과:
         * //         | A    | B     | C
         * // --------|------|-------|-----
         * // Seoul   | 10K  | 20K   | -
         * // Busan   | 15K  | 5K    | -
         * // Daegu   | 8K   | -     | 12K
         *
         * // 3. 측정값 타입별로 다른 기본값 (함수로 지정 — float는 null, int는 0)
         * const pivot3 = PivotMatrix.pivot(agg, {
         *   rowDimensions: ['region'],
         *   columnDimensions: ['product'],
         *   valueColumn: 'sales',
         *   emptyValue: (colMeta) => colMeta.type === 'f64' ? null : 0
         * });
         * ```
         *
         * @see {@link AggTable} 원본 집계 결과
         * @see {@link DataCube.pivot} 피벗을 생성하는 큐브 메서드
         */
        declare class PivotMatrix extends DataSource {
            /**
             * AggTable으로부터 피벗 매트릭스를 생성한다.<br/>
             *
             * @param source 원본 집계 테이블
             * @param options 피벗 옵션
             * @returns 생성된 PivotMatrix 인스턴스
             */
            static pivot(source: AggTable, options?: PivotMatrixOptions): PivotMatrix;
            /**
             * 원본 집계 테이블.<br/>
             */
            private _source;
            /**
             * 피벗 옵션 (정규화됨).<br/>
             */
            private _options;
            /**
             * null을 제외한 행 차원 목록 (캐시됨).<br/>
             */
            private _rowDims;
            /**
             * null을 제외한 열 차원 목록 (캐시됨).<br/>
             */
            private _colDims;
            /**
             * Crosstab 행 레이블 (행 차원값 조합).<br/>
             */
            private _rowLabels;
            /**
             * Crosstab 열 레이블 (열 차원값 조합).<br/>
             */
            private _columnLabels;
            /**
             * `rowMeasureLabels`/`columnMeasureLabels` 계산 결과 캐시.<br/>
             * 입력(_rowLabels/_columnLabels 참조, valuesAsRows, measures 참조)이 동일하면 재사용한다.<br/>
             * 정확성은 참조 비교로 자동 보장되지만, 다음 접근 전까지 stale entry가 메모리를 잡아두므로
             * `$_buildSubtotalCache()` (모든 라벨 재할당 경로의 종착점) 와 `_doDispose()` 에서 명시적으로 운소된다.<br/>
             */
            private _rowMeasureLabelsCache?;
            private _columnMeasureLabelsCache?;
            /**
             * Crosstab 값 (행 x 열 매트릭스).<br/>
             * 각 셀은 측정값 배열. 인덱스는 measures 순서와 동일.<br/>
             * 예: measures=['sales','qty']이면 cell=[100, 50] (sales=100, qty=50)<br/>
             *
             * 셀 원소 타입은 사실상 `(number | bigint)` 이다 (any 로 선언한 이유는
             * measure 별로 타입이 섞이고, 미집계 상태에서는 sentinel(NaN/undefined) 도
             * 들어가기 때문). `MeasureMeta.type='i64'` 인 measure 의 셀 값은 bigint
             * (BigInt64, 약 ±9.2×10^18) 로 저장된다.<br/>
             *
             * 회계·금융 도메인에서 i64 범위(±9.2 × 10^18) 로도 부족하거나 원 단위 정확도
             * 가 필요한 경우의 권장 처리 방식:<br/>
             * 1) **단위 스케일링 (권장, 표준 관행)**: 적재/스키마 정의 시점에 measure
             *    값을 백만원·억원 등으로 사전 분할(예: `revenue / 1_000_000`) 하여 누적
             *    자체가 작은 수에서 일어나게 한다. number 로도 9 × 10^21 까지 안전.
             *    formatter 가 아니라 데이터 계층의 변환이다.<br/>
             * 2) **i64 측정값 사용**: 원 단위 정확도가 필요하면 `type='i64'` 로 선언하여
             *    sum/min/max/count 를 bigint 로 정확히 누적. avg/percentile 은 미지원
             *    (마지막에 number 변환 시 정밀도 손실 발생).<br/>
             * 3) **scaled-int 트릭**: bigint avg 가 필요하면 `(sum * 10000n) / count`
             *    처럼 미리 스케일을 곱해 정수 나눗셈 후 최종 단계에서 number 로 나눠
             *    소수부를 복원. PivotMatrix 외부 후처리로 적용.<br/>
             *
             * 임의 정밀도(decimal.js 등)는 누적당 객체 할당 비용으로 OLAP 핫패스에
             * 부적합하여 지원하지 않는다.
             */
            private _matrix;
            /**
             * Holey array의 빈 셀에 대한 기본값 템플릿.<br/>
             * `emptyValue` 옵션에 따라 measure 별 값이 들어간다.<br/>
             *
             * **표시(display) / export 전용 fallback.** `getCellValue()` 와 `toJSON()` 에서만
             * 참조되며, 집계/정렬/필터 경로는 holey 셀을 명시적으로 skip 한다.
             */
            private _emptyCell;
            /**
             * PivotMatrix를 생성한 AggTable 참조.<br/>
             * AggTable 데이터 변경 시 알림을 받기 위해 필요.<br/>
             */
            private _sourceAgg?;
            /**
             * 사전 계산된 subtotal 캐시.<br/>
             * pivot() 시점에 한 번의 매트릭스 순회로 모든 subtotal을 계산.<br/>
             */
            private _subtotalCache?;
            /** $_combineCellAggregates 의 measure별 사전바인딩 함수 캐시 */
            private _combineFnCache?;
            /**
             * raw source 재집계용 컨텍스트 (AggTable 인 경우에만 유효).<br/>
             * - cellAggRowIndices[r][c] : (matRow, matCol) → canonical AggTable row index 배열<br/>
             *   (`_cellAggRowIndices` 재사용 — `aggSrc.rows` 정렬/날짜계층 필터로 위치 인덱스가<br/>
             *    `getSourceRowIndices` 의 canonical 인덱스와 어긋나는 문제를 회피)<br/>
             * - measureColumnArrays[mi] : sourceData 의 measure 컬럼 raw 배열 (한 번만 prefetch)<br/>
             * - aggSrc : AggTable (getSourceRowIndices 보유)<br/>
             * null = AggTable 아님 (raw 접근 불가).<br/>
             * subtotal cache 재구축 시 invalidate (`_rawAggContext = undefined`).<br/>
             */
            private _rawAggContext?;
            /**
             * $_getCellTotalMulti 결과 LRU 캐시 (UI에서 동일 셀 반복 호출 최적화).
             */
            private _multiCellTotalCache;
            private static readonly MULTI_CELL_TOTAL_CACHE_LIMIT;
            /**
             * 피벗 셀 → AggTable row index 매핑 캐시.<br/>
             * `_cellAggRowIndices[r][c]` = 셀 (r,c) 에 매핑된 AggTable row index 배열.<br/>
             * 데이터가 없는 셀은 `undefined`.<br/>
             * <br/>
             * 빌드 시점: drillthrough getter (`getCellAggRowIndices` /
             * `getCellAggRowCount`) 첫 호출 시 lazy 빌드 (`$_ensureCellAggIndices`).<br/>
             * 무효화: `$_buildSubtotalCache()` 진입 시 `null` 로 리셋.<br/>
             * 메모리: 데이터 셀당 array overhead + 총 N개 number (N=AggTable rowCount).
             */
            private _cellAggRowIndices;
            /**
             * 피벗 셀 → 원본 source row 개수 매핑 캐시 (avg 가중치 계산용).<br/>
             * `_cellSourceRowCount[r][c]` = 셀 (r,c) 의 source row 합계.<br/>
             * <br/>
             * 빌드 시점:<br/>
             * - avg measure 가 있으면 `$_buildSubtotalCache()` 에서 즉시 빌드 (count-only)<br/>
             * - 그 외엔 `getCellSourceRowCount` 첫 호출 시 lazy 빌드<br/>
             * 무효화: `$_buildSubtotalCache()` 진입 시 `null` 로 리셋.<br/>
             * 메모리: R×C × 8 byte.
             */
            private _cellSourceRowCount;
            /**
             * 피벗 셀 → avg measure 별 "비-null 값 개수" 매핑 캐시.<br/>
             * `_cellAvgCount[mi][r][c]` = 셀 (r,c) 의 measure mi 비-null source 값 개수.<br/>
             * avg measure 가 아닌 인덱스는 `null`. AggTable 이 아니면 전체 `null`.<br/>
             * <br/>
             * avg 소계는 (Σ cellSum) / (Σ cellCount) 로 **엑셀과 동일하게** 합성된다.
             * 분모(count)는 source row 수가 아니라 비-null 값 개수여야 하므로 measure
             * 컬럼에 null 이 섞여도 정확하다. additive 결합이라 raw 재집계 없이
             * O(cells) 로 모든 scope 의 avg 를 구한다.<br/>
             * <br/>
             * 빌드: hasAvg 인 `$_buildSubtotalCache()` 또는 `$_ensureCellAvgCounts()` 에서
             * source 1회 스캔(O(N×avgMeasures))으로 `_cellAvgSum` 과 함께 구축.<br/>
             * 무효화: `$_buildSubtotalCache()` 진입 시 `null` 로 리셋.
             */
            private _cellAvgCount;
            /**
             * 피벗 셀 → avg measure 별 "비-null 원본 값 합(sum)" 매핑 캐시.<br/>
             * `_cellAvgSum[mi][r][c]` = 셀 (r,c) 의 measure mi 비-null source 값들의 합.<br/>
             * `_cellAvgCount` 와 동일한 1회 스캔에서 함께 구축되며 인덱스가 정렬된다.<br/>
             * <br/>
             * ⚠️ 엑셀 동일성 보장: 소계 avg 는 셀 평균(cellSum/cellCount, 이미 1회 나눈
             * 값)을 다시 곱해 복원하지 않고, **원본 합을 직접 더한** `_cellAvgSum` 을
             * 사용해 `(Σ cellSum) / (Σ cellCount)` 로 계산한다. 즉 엑셀의 `SUM/COUNT`
             * 와 동일하게 마지막에 한 번만 나눈다(나눴다-다시-곱하는 왕복 반올림 제거).<br/>
             * AggTable 이 아니면 source 합을 못 구하므로 `null`(round-trip fallback).
             */
            private _cellAvgSum;
            /**
             * getTotalSourceRowCount() 결과 LRU 캐시 (최대 16개).<br/>
             * UI에서 동일 셀에 대한 연속 호출 최적화용.<br/>
             * 데이터/피벗 구조 변경 시 $_buildSubtotalCache()에서 무효화된다.<br/>
             */
            private _totalSourceRowCountCache;
            private static readonly TOTAL_SOURCE_ROW_COUNT_CACHE_LIMIT;
            /**
             * 외부 변경 콜백 리스너 목록.<br/>
             * onChange()로 등록되며, 재피벗 시 호출된다.<br/>
             */
            private _changeListeners;
            /**
             * 행 정렬 설정 (필드 기반).<br/>
             */
            private _rowSortConfig;
            /**
             * 열 정렬 설정 (필드 기반).<br/>
             */
            private _columnSortConfig;
            /** _subtotalCache 가 현재 _rowLabels/_columnLabels/_matrix 순서와 정합한지 여부.
             *  _buildSubtotalCache 완료 시 true; matrix/labels 재할당 시 false. */
            private _subtotalCacheValid;
            /** measure별 i64(bigint) 여부 캐시 (지연 계산). measures 는 PivotMatrix lifetime 동안 불변. */
            private _measureIsBigintCache;
            private _hasAnyBigintCache;
            /**
             * 정렬 비교 시 임시로 사용되는 행 그룹 합계 캐시.<br/>
             * 비-leaf 차원의 'total' 정렬 시 prefix별 그룹 합계를 사용하기 위한 lookup.<br/>
             * `[dimIdx]` → Map<prefixKey, perMeasureTotals>. dimIdx가 leaf면 entry 없음 (rowTotals 사용).
             */
            private _rowGroupTotalsForSort?;
            /**
             * 정렬 비교 시 임시로 사용되는 열 그룹 합계 캐시.
             */
            private _colGroupTotalsForSort?;
            /**
             * 정렬 비교 시 비-leaf 행 차원에 대해 prefix별 leaf row 인덱스 목록.<br/>
             * `[dimIdx]` → Map<prefixKey, leaf row indices>. dimIdx가 leaf면 entry 없음.
             */
            private _rowGroupIndicesForSort?;
            /**
             * 정렬 비교 시 비-leaf 열 차원에 대해 prefix별 leaf column 인덱스 목록.
             */
            private _colGroupIndicesForSort?;
            /**
             * 행 필터 설정 (필드별 Map).<br/>
             */
            private _rowFilters;
            /**
             * 행 필터 적용 전 원본 상태.<br/>
             */
            private _rowFilterOriginal;
            /**
             * 열 필터 설정 (필드별 Map).<br/>
             */
            private _columnFilters;
            /**
             * 열 필터 적용 전 원본 상태.<br/>
             */
            private _columnFilterOriginal;
            /**
             * PivotMatrix를 생성한다.<br/>
             * 일반적으로 직접 생성하지 않고 {@link pivot} 정적 메서드를 사용한다.<br/>
             *
             * @param source 원본 집계 테이블
             * @param options 피벗 옵션
             */
            constructor(source: AggTable, options?: PivotMatrixOptions);
            /**
             * 피벗 옵션의 유효성을 검증한다.<br/>
             *
             * @throws 유효하지 않은 차원/측정값이 있거나 중복이 있으면 에러 발생
             * @private
             */
            private $_validateOptions;
            /* Excluded from this release type: _doDispose */
            get data(): DataCube;
            get source(): AggTable;
            /**
             * Crosstab 행 레이블을 반환한다.<br/>
             */
            get rowLabels(): string[][];
            /**
             * Crosstab 열 레이블을 반환한다.<br/>
             */
            get columnLabels(): string[][];
            /**
             * 지정한 leaf 행 인덱스의 레이블 경로(차원별 값 배열)를 반환한다.<br/>
             * 범위 밖이면 undefined.
             */
            getRowLabels(rowIndex: number): readonly string[] | undefined;
            /**
             * 지정한 leaf 열 인덱스의 레이블 경로(차원별 값 배열)를 반환한다.<br/>
             * 범위 밖이면 undefined.
             */
            getColumnLabels(colIndex: number): readonly string[] | undefined;
            /**
             * Crosstab 값 매트릭스를 반환한다.<br/>
             * 각 셀은 측정값 배열. 인덱스는 measures 순서와 동일.<br/>
             * 예: measures=['sales','qty']이면 cell=[100, 50] (sales=100, qty=50)
             */
            get matrix(): any[][][];
            /**
             * 셀 값을 측정값 이름으로 접근한다.<br/>
             *
             * @param rowIdx 행 인덱스
             * @param colIdx 열 인덱스
             * @param measureName 측정값 이름
             * @returns 셀 값 (없으면 undefined)
             *
             * @example
             * ```typescript
             * const value = pivot.getCellValue(0, 1, 'sales');
             * ```
             */
            getCellValue(rowIdx: number, colIdx: number, measureName: string): any;
            /**
             * 실제 적용된 행 차원 목록을 반환한다 (measure level 제외).<br/>
             */
            get rowDimensions(): string[];
            /**
             * 실제 적용된 열 차원 목록을 반환한다 (measure level 제외).<br/>
             */
            get columnDimensions(): string[];
            /**
             * 실제 적용된 모든 차원 목록을 반환한다 (measure level 제외).<br/>
             */
            get dimensions(): string[];
            /**
             * 실제 적용된 측정값 목록을 반환한다.<br/>
             */
            get measures(): string[];
            /**
             * 특정 차원이 행 차원에 포함되어 있는지 확인한다.<br/>
             *
             * @param name 차원명
             * @returns 행 차원에 포함 여부
             */
            hasRowDimension(name: string): boolean;
            /**
             * 특정 차원이 열 차원에 포함되어 있는지 확인한다.<br/>
             *
             * @param name 차원명
             * @returns 열 차원에 포함 여부
             */
            hasColumnDimension(name: string): boolean;
            /**
             * 특정 차원이 행 또는 열 차원에 포함되어 있는지 확인한다.<br/>
             *
             * @param name 차원명
             * @returns 행 또는 열 차원에 포함 여부
             */
            hasDimension(name: string): boolean;
            hasMeasure(name: string): boolean;
            isRow(dimension: string): boolean;
            isColumn(dimension: string): boolean;
            /**
             * 측정값의 실제 데이터 범위(최소/최대)를 반환한다.<br/>
             * Heatmap, 조건부 서식 등 셀 값의 상대적 위치를 계산할 때 사용한다.<br/>
             *
             * @param measureName - 측정값 이름. 생략 시 전체 measures의 범위를 통합 반환.
             * @returns { min, max } 객체. 유효한 값이 없으면 null.
                 *
                 * @example
                 * ```typescript
                 * // 단일 measure 범위
                 * const range = pivot.getMeasureRange('sales');
                 * // { min: 50, max: 2000 }
                 *
                 * // heatmap 색상 계산
                 * const ratio = (value - range.min) / (range.max - range.min);
                 * const color = interpolateColor(coldColor, hotColor, ratio);
                 *
                 * // 전체 measures 통합 범위
                 * const allRange = pivot.getMeasureRange();
                 * ```
                 */
             getMeasureRange(measureName?: string): {
                 min: number;
                 max: number;
             } | null;
             /**
              * 행 차원의 레벨 정보를 반환한다.<br/>
              * 각 레벨은 차원 이름, 레벨 인덱스, 말단 여부, 고유값 개수, 측정값별 집계 등의 정보를 포함한다.<br/>
              *
              * @returns 행 차원 레벨 정보 배열
              *
              * @example
              * ```typescript
              * const levels = pivot.rowLevels;
              * // [
              * //   {
              * //     level: 0,
              * //     dimension: 'region',
              * //     isLeaf: false,
              * //     total: { sales: 10000, quantity: 100 },
              * //     aggregatesByValue: {
              * //       'Seoul': { sales: 3000, quantity: 30 },
              * //       'Busan': { sales: 4000, quantity: 40 },
              * //       'Daegu': { sales: 3000, quantity: 30 }
              * //     }
              * //   },
              * //   {
              * //     level: 1,
              * //     dimension: 'product',
              * //     isLeaf: true,
              * //     total: { sales: 10000, quantity: 100 },
              * //     aggregatesByValue: {
              * //       'A': { sales: 2000, quantity: 20 },
              * //       'B': { sales: 5000, quantity: 50 },
              * //       'C': { sales: 3000, quantity: 30 }
              * //     }
              * //   }
              * // ]
              * ```
              */
             get rowLevels(): PivotLevel[];
             /**
              * 열 차원의 레벨 정보를 반환한다.<br/>
              * 각 레벨은 차원 이름, 레벨 인덱스, 말단 여부, 고유값 개수, 측정값별 집계 등의 정보를 포함한다.<br/>
              *
              * @returns 열 차원 레벨 정보 배열
              *
              * @example
              * ```typescript
              * const levels = pivot.columnLevels;
              * // [
              * //   {
              * //     level: 0,
              * //     dimension: 'year',
              * //     isLeaf: false,
              * //     total: { sales: 50000, quantity: 500 },
              * //     aggregatesByValue: {
              * //       '2023': { sales: 15000, quantity: 150 },
              * //       '2024': { sales: 20000, quantity: 200 },
              * //       '2025': { sales: 15000, quantity: 150 }
              * //     }
              * //   },
              * //   {
              * //     level: 1,
              * //     dimension: 'quarter',
              * //     isLeaf: true,
              * //     total: { sales: 50000, quantity: 500 },
              * //     aggregatesByValue: {
              * //       'Q1': { sales: 12000, quantity: 120 },
              * //       'Q2': { sales: 13000, quantity: 130 },
              * //       'Q3': { sales: 12500, quantity: 125 },
              * //       'Q4': { sales: 12500, quantity: 125 }
              * //     }
              * //   }
              * // ]
              * ```
              */
             get columnLevels(): PivotLevel[];
             /**
              * 행 차원 레벨에 측정값 레벨을 덧붙인 정보를 반환한다.<br/>
              * valuesAsRows=true일 때 rowLevels 뒤에 가상 measure 레벨을 추가한다.
              * 단, rowLevels에 이미 measure 레벨이 포함되어 있으면 그대로 반환한다.
              * 예) rowDimensions=[region,city], measures=[sales,qty]이면
              * 반환 레벨: region(0), city(1), null(2) - null은 measure 레벨
              */
             get rowMeasureLevels(): PivotLevel[];
             /**
              * 행 헤더에 측정값을 포함한 라벨을 반환한다.<br/>
              * - valuesAsRows=true: rowDimensions 조합 × measures 조합 (measure를 마지막에 추가)
              * - valuesAsRows=false: 행은 차원만 갖고 있으므로 기존 rowLabels를 그대로 반환
              */
             get rowMeasureLabels(): any[][];
             /**
              * 열 차원 레벨에 측정값 레벨을 덧붙인 정보를 반환한다.<br/>
              * valuesAsRows=false일 때 columnLevels 뒤에 가상 measure 레벨을 추가한다.
              * 단, columnLevels에 이미 measure 레벨이 포함되어 있으면 그대로 반환한다.
              * 예) columnDimensions=[year,month], measures=[sales,qty]이면
              * 반환 레벨: year(0), month(1), null(2) - null은 measure 레벨
              */
             get columnMeasureLevels(): PivotLevel[];
             /**
              * 열 헤더에 측정값을 포함한 라벨을 반환한다.<br/>
              * - valuesAsRows=false: columnDimensions 조합 × measures 조합 (measure를 마지막에 추가)
              * - valuesAsRows=true: 열은 차원만 갖고 있으므로 기존 columnLabels를 그대로 반환
              *
              * 예) columnLabels = [["Q1"],["Q2"]], measures = ["sales","qty"]이면
              * valuesAsRows=false: [["Q1","sales"],["Q1","qty"],["Q2","sales"],["Q2","qty"]]
              * valuesAsRows=true: [["Q1"],["Q2"]]
              */
             get columnMeasureLabels(): any[][];
             /**
              * 특정 차원이 행 차원인지 열 차원인지 반환한다.<br/>
              * @param dimension 차원 이름
              * @returns 'row' | 'column' | null
              */
             getDimensionAxis(dimension: string): 'row' | 'column' | null;
             /**
              * 특정 차원의 values 인덱스로 루트부터 해당 차원까지의 전체 경로를 반환한다.<br/>
              * index는 rowLevels/columnLevels의 values 배열 순서와 동일하다.<br/>
              * 같은 value라도 부모가 다르면 별개의 항목으로 취급된다 ({@link $_getGroupedValueEntry} 참고).<br/>
              *
              * @param dimension 차원 이름 (rowDimensions 또는 columnDimensions 중 하나)
              * @param index rowLevels/columnLevels의 values 배열 내 인덱스
              * @returns 루트부터 해당 차원까지의 경로 배열. 범위 초과 또는 차원 미존재 시 undefined.
              */
             getDimensionPath(dimension: string, index: number): {
                 dimension: string;
                 value: any;
             }[] | undefined;
             /**
              * labels 배열에서 dimIdx 레벨의 groupedValues[index]에 해당하는 엔트리를 반환한다.<br/>
              * rowLevels/columnLevels의 values 순서와 완전히 동일하게 구축한다.<br/>
              * <br/>
              * ```
              * rowDimensions = ['카테고리', '브랜드']
              *
              * rowLabels (leaf 조합)          dimIdx=0 결과          dimIdx=1 결과
              * ┌───────────────────────┐      ┌───────────┐          ┌──────────────────────┐
              * │ ['AMD',    'MSI'    ] │      │ idx │ val │          │ idx │ parentPath │ val │
              * │ ['AMD',    'ASUS'   ] │      ├─────┼─────┤          ├─────┼────────────┼─────┤
              * │ ['DDR4',   '삼성전자' ] │      │  0  │ AMD │          │  0  │ ['AMD']    │ MSI │
              * │ ['DDR4',   'CORSAIR' ] │      │  1  │DDR4 │          │  1  │ ['AMD']    │ASUS │
              * │ ['NVIDIA', 'MSI'    ] │      │  2  │NVID │          │  2  │ ['DDR4']   │삼성  │
              * └───────────────────────┘      └───────────┘          │  3  │ ['DDR4']   │ COR │
              *                                                        │  4  │ ['NVIDIA'] │ MSI │ ← idx 0과 같은 'MSI'지만 별개
              *                                                        └──────────────────────┘
              *
              * $_getGroupedValueEntry(labels, 1, 0) → { parentPath: ['AMD'],    value: 'MSI'  }
              * $_getGroupedValueEntry(labels, 1, 4) → { parentPath: ['NVIDIA'], value: 'MSI'  }
              * $_getGroupedValueEntry(labels, 0, 1) → { parentPath: [],         value: 'DDR4' }
              * ```
              */
             private $_getGroupedValueEntry;
             /**
              * 행 레이블을 정렬한다.<br/>
              *
              * @param dimensionNames 정렬할 차원 이름
              * @param direction 정렬 순서 ('asc' 또는 'desc')
              * @returns 정렬된 새로운 PivotMatrix 인스턴스
              */
             sortRows(dimensionNames: string[], direction?: 'asc' | 'desc'): PivotMatrix;
             /**
              * 열 레이블을 정렬한다.<br/>
              *
              * @param dimensionNames 정렬할 차원 이름
              * @param direction 정렬 순서 ('asc' 또는 'desc')
              * @returns 정렬된 새로운 PivotMatrix 인스턴스
              */
             sortColumns(dimensionNames: string[], direction?: 'asc' | 'desc'): PivotMatrix;
             getFieldLevel(dimension: string): number | undefined;
             /**
              * 특정 차원(필드)의 정렬 방식을 설정한다.<br/>
              * 행 차원이면 행 정렬, 열 차원이면 열 정렬에 적용된다.<br/>
              * 동일 필드에 다시 호출하면 기존 설정을 대체한다.
              * 또, 기존 설정과 동일한 경우에는 아무 작업도 수행하지 않고 false를 반환한다.
              *
              * @param field 정렬할 차원명 (rowDimensions 또는 columnDimensions 중 하나)
              * @param sort 정렬 설정
              * @returns 실제로 변경이 발생하면 true, 동일한 설정이면 false
              *
              * @example
              * ```typescript
              * // 레이블 기준 오름차순
              * pivot.setFieldSort('city', { type: 'label', direction: 'asc' });
              *
              * // 합계 기준 내림차순 (target 미지정 → Grand Total)
              * pivot.setFieldSort('city', { type: 'value', direction: 'desc' });
              *
              * // 행 차원: 특정 열 값 기준 정렬
              * pivot.setFieldSort('city', { type: 'value', direction: 'desc', target: ['Q1'] });
              *
              * // 열 차원: 특정 행 값 기준 정렬
              * pivot.setFieldSort('quarter', { type: 'value', direction: 'desc', target: ['East', 'NYC'] });
              *
              * // 사용자 정의 순서
              * pivot.setFieldSort('month', { type: 'custom', direction: 'asc', values: ['Jan', 'Feb', 'Mar'] });
              *
              * // 콜백 함수
              * pivot.setFieldSort('city', {
              *     type: 'callback',
              *     direction: 'asc',
              *     compareFn: (a, b, params) => a.localeCompare(b, 'ko')
              * });
              * ```
              */
             setFieldSort(field: string, sort: DimensionFieldSort): boolean;
             /**
              * 특정 차원(필드)의 정렬 설정을 반환한다.<br/>
              * `type === 'value'` 인데 `measure` 가 지정되지 않은 경우, 기본 measure (인덱스 0)
              * 의 필드명으로 채워서 반환한다.
              */
             getFieldSort(field: string): DimensionFieldSort | undefined;
             /**
              * 특정 차원(필드)의 정렬을 해제한다.<br/>
              *
              * @param field 해제할 차원명 (생략 시 모든 행/열 필드 정렬 해제)
              * @returns 실제로 해제된 경우 true, 해제할 것이 없으면 false
              */
             clearFieldSort(field?: string): boolean;
             /**
              * 정렬이 적용되어 있는지 여부 (행 또는 열).<br/>
              */
             get isSorted(): boolean;
             /**
              * 행 정렬이 적용되어 있는지 여부.<br/>
              */
             get isRowSorted(): boolean;
             /**
              * 열 정렬이 적용되어 있는지 여부.<br/>
              */
             get isColumnSorted(): boolean;
             /**
              * 현재 모든 차원(행+열)의 정렬 설정을 반환한다.<br/>
              */
             get fieldSorts(): ReadonlyMap<string, DimensionFieldSort>;
             /**
              * 현재 행 필드별 정렬 설정을 반환한다.<br/>
              */
             get rowFieldSorts(): ReadonlyMap<string, DimensionFieldSort>;
             /**
              * 현재 열 필드별 정렬 설정을 반환한다.<br/>
              */
             get columnFieldSorts(): ReadonlyMap<string, DimensionFieldSort>;
             /**
              * 현재 행 fallback 정렬 설정.
              */
             get rowFallbackSort(): FallbackFieldSort | undefined;
             /**
              * 현재 열 fallback 정렬 설정.
              */
             get columnFallbackSort(): FallbackFieldSort | undefined;
             /**
              * 행 fallback 정렬을 설정한다.<br/>
              * `setFieldSort()`로 명시 정렬이 지정되지 않은 모든 행 차원에 동일한 'value' 기준 정렬을 적용한다.<br/>
              * (measure 레벨 차원은 자동 제외)
              *
              * @param sort fallback 정렬 설정 (`direction: 'none'` 이면 비활성, 설정만 보존)
              * @returns 실제로 변경이 발생하면 true
              */
             setRowFallbackSort(sort: FallbackFieldSort): boolean;
             /**
              * 열 fallback 정렬을 설정한다.<br/>
              * `setFieldSort()`로 명시 정렬이 지정되지 않은 모든 열 차원에 동일한 'value' 기준 정렬을 적용한다.<br/>
              */
             setColumnFallbackSort(sort: FallbackFieldSort): boolean;
             /**
              * 행 fallback 정렬의 direction 만 변경한다 (UI 토글링 용).<br/>
              * fallback 이 아직 없으면 `{ direction }` 만 설정된 fallback 으로 새로 생성된다.
              */
             setRowFallbackDirection(direction: 'asc' | 'desc' | 'none'): boolean;
             /**
              * 열 fallback 정렬의 direction 만 변경한다 (UI 토글링 용).<br/>
              */
             setColumnFallbackDirection(direction: 'asc' | 'desc' | 'none'): boolean;
             /**
              * 행 fallback 정렬을 완전히 제거한다.
              */
             clearRowFallbackSort(): boolean;
             /**
              * 열 fallback 정렬을 완전히 제거한다.
              */
             clearColumnFallbackSort(): boolean;
             /**
              * 행/열 필드 정렬을 한 번에 설정한다.<br/>
              * 차원 위치(행/열)에 따라 자동으로 분기되며, 행/열 각각 최대 한 번씩만
              * 매트릭스 재배치를 수행한다.<br/>
              *
              * - 동일한 설정이면 해당 필드는 skip.
              * - `clear=false` (기본): `sorts`에 포함되지 않은 기존 필드 정렬은 유지.
              * - `clear=true`: 기존 정렬과 신규 정렬이 다르면 **모든 기존 정렬을 제거 후 재설정**.
              *   완전히 동일하면 아무 동작 없이 false 반환.
              * - 알 수 없는 필드명은 warning 후 무시.
              *
              * @param sorts 필드명 → 정렬 설정
              * @param clear true면 기존 정렬과 다른 경우 모든 기존 정렬을 제거 후 새로 적용 (기본 false)
              * @returns 실제로 변경된 필드가 하나라도 있으면 true
              *
              * @example
              * ```typescript
              * // 부분 갱신 (기존 region 정렬 유지)
              * pivot.setFieldSorts({ year: { type: 'label', direction: 'desc' } });
              *
              * // 전체 교체
              * pivot.setFieldSorts({
              *   region: { type: 'label', direction: 'desc' },
              *   year:   { type: 'value', direction: 'desc' },
              * }, true);
              * ```
              */
             setFieldSorts(sorts: Record<string, DimensionFieldSort>, clear?: boolean): boolean;
             /**
              * 행 레이블 필터를 설정한다.<br/>
              * 특정 차원 값들을 선택 또는 제외한다.<br/>
              * 동일 필드의 기존 필터(label/value/topN)는 대체된다.<br/>
              *
              * @param field 필터 대상 차원 필드명 (rowDimensions 중 하나)
              * @param values 선택/제외할 값 배열
              * @param exclude true면 제외, false면 포함 (기본: false)
              * @returns 변경 발생 시 true
              *
              * @example
              * ```typescript
              * // region이 'East' 또는 'West'인 행만
              * pivot.setLabelFilter('region', ['East', 'West']);
              *
              * // city가 'NYC'가 아닌 행만
              * pivot.setLabelFilter('city', ['NYC'], true);
              * ```
              */
             setLabelFilter(field: string, values: any[], exclude?: boolean): boolean;
             /**
              * 행 레이블 필터를 연산자로 설정한다.<br/>
              * 동일 필드의 기존 필터(label/value/topN)는 대체된다.<br/>
              *
              * @param field 필터 대상 차원 필드명 (rowDimensions 중 하나)
              * @param operator 레이블 필터 연산자
              * @param operand 연산자 피연산자
              * @param operand2 between 연산자의 두 번째 피연산자 (선택)
              * @returns 변경 발생 시 true
              *
              * @example
              * ```typescript
              * // city가 'N'으로 시작하는 행만
              * pivot.setLabelFilterByOperator('city', 'beginsWith', 'N');
              *
              * // region이 'East'를 포함하는 행만
              * pivot.setLabelFilterByOperator('region', 'contains', 'East');
              *
              * // code가 'A' ~ 'M' 사이인 행만
              * pivot.setLabelFilterByOperator('code', 'between', 'A', 'M');
              * ```
              */
             setLabelFilterByOperator(field: string, operator: LabelFilterOperator_2, operand: string, operand2?: string): boolean;
             /**
              * 행 레이블 필터를 콜백 함수로 설정한다.<br/>
              * 동일 필드의 기존 필터(label/value/topN)는 대체된다.<br/>
              *
              * @param field 필터 대상 차원 필드명 (rowDimensions 중 하나)
              * @param predicate 조건 함수 (레이블 값 → boolean)
              * @returns 변경 발생 시 true
              *
              * @example
              * ```typescript
              * // city 길이가 5 이상인 행만
              * pivot.setLabelFilterByPredicate('city', v => v.length >= 5);
              *
              * // region이 정규식에 매치하는 행만
              * pivot.setLabelFilterByPredicate('region', v => /^[A-Z]/.test(v));
              * ```
              */
             setLabelFilterByPredicate(field: string, predicate: (value: any) => boolean): boolean;
             /**
              * 행 합계 기준으로 행을 필터링한다.<br/>
              * 필드별로 독립적으로 필터가 누적된다. 동일 필드는 대체된다.<br/>
              *
              * @param field 필터 대상 차원 필드명 (rowDimensions 중 하나)
              * @param measure 측정값 이름 또는 인덱스
              * @param predicate 조건 함수 (필드 그룹 합계 → boolean)
              * @returns 변경 발생 시 true
              *
              * @example
              * ```typescript
              * // region 그룹 합계 > 800인 region만
              * pivot.setFilter('region', 'sales', total => total > 800);
              *
              * // city별 합계 > 400인 행만 (region 필터와 독립적으로 누적)
              * pivot.setFilter('city', 'sales', total => total > 400);
              * ```
              */
             setFilter(field: string, measure: string | number, predicate: (total: number) => boolean): boolean;
             /**
              * 행 값 필터를 연산자로 설정한다.<br/>
              * 행 합계 기준으로 행을 필터링한다.<br/>
              * 동일 필드의 기존 필터(label/value/topN)는 대체된다.<br/>
              *
              * @param field 필터 대상 차원 필드명 (rowDimensions 중 하나)
              * @param measure 측정값 이름 또는 인덱스
              * @param operator 값 필터 연산자
              * @param operand 연산자 피연산자
              * @param operand2 between 연산자의 두 번째 피연산자 (선택)
              * @returns 변경 발생 시 true
              *
              * @example
              * ```typescript
              * // region 합계가 1000 초과인 행만
              * pivot.setValueFilter('region', 'sales', 'greaterThan', 1000);
              *
              * // city 합계가 500 ~ 1500 사이인 행만
              * pivot.setValueFilter('city', 'sales', 'between', 500, 1500);
              * ```
              */
             setValueFilter(field: string, measure: string | number, operator: ValueFilterOperator, operand: number, operand2?: number): boolean;
             /**
              * 행 합계 기준 Top N 필터를 설정한다.<br/>
              * 필드별로 독립적으로 필터가 누적된다. 동일 필드는 대체된다.<br/>
              *
              * @param field 필터 대상 차원 필드명 (rowDimensions 중 하나)
              * @param measure 측정값 이름 또는 인덱스
              * @param limit 개수
              * @param ascending true면 하위 N (기본: false = 상위 N)
              * @returns 변경 발생 시 true
              *
              * @example
              * ```typescript
              * // city별 매출 상위 3개
              * pivot.setTopN('city', 'sales', 3);
              *
              * // region 그룹 qty 하위 2개 (city 필터와 독립적으로 누적)
              * pivot.setTopN('region', 'qty', 2, true);
              * ```
              */
             setTopN(field: string, measure: string | number, limit: number, ascending?: boolean): boolean;
             /**
              * 필터를 해제한다.<br/>
              * 필드를 지정하면 해당 필드만, 생략하면 모든 행/열 필터를 해제한다.<br/>
              *
              * @param field 해제할 필터의 필드명 (생략 시 전체 해제)
              * @returns 해제할 필터가 있었으면 true
              *
              * @example
              * ```typescript
              * // city 필터만 해제 (필드의 차원 위치로 자동 라우팅)
              * pivot.clearFilter('city');
              *
              * // 모든 필터 해제
              * pivot.clearFilter();
              * ```
              */
             clearFilter(field?: string): boolean;
             /**
              * 특정 필드에 필터가 적용되어 있는지 여부.<br/>
              * 행/열 양쪽 모두 검사한다.<br/>
              * @param field 필드명
              */
             hasFilter(field: string): boolean;
             /**
              * 현재 필터 설정을 반환한다.<br/>
              * @param field 필드명 (지정 시 해당 필드만, 생략 시 전체 Map)
              *
              * - field 지정 시: 해당 필드의 FilterConfig 또는 null
              * - field 생략 시: 행/열 필터를 합친 ReadonlyMap 또는 필터가 없으면 null
              */
             getFilterConfig(field?: string): FilterConfig | ReadonlyMap<string, FilterConfig> | null;
             /**
              * 필터를 필드의 차원 위치(row/column)로 자동 라우팅하여 추가한다 (내부용).
              */
             private $_addFilter;
             /**
              * 행 필터를 추가한다 (내부용).
              * 동일 필드의 기존 필터는 대체된다.
              */
             private $_addRowFilter;
             /**
              * 열 필터를 추가한다 (내부용).
              * 동일 필드의 기존 필터는 대체된다.
              */
             private $_addColumnFilter;
             /**
              * 모든 필터를 원본에서 재적용한다 (내부용).
              */
             private $_reapplyAllFilters;
             /**
              * 필터 원본 상태를 저장한다 (필터 적용 전 최초 1회).
              */
             private $_saveFilterOriginal;
             /**
              * 필터 타입에 따라 유지할 행 인덱스를 반환한다.
              */
             private $_getFilteredRowIndices;
             /**
              * 필터 타입에 따라 유지할 열 인덱스를 반환한다.
              */
             private $_getFilteredColIndices;
             /**
              * 레이블 필터로 유지할 행 인덱스를 반환한다.
              */
             private $_getLabelFilteredRowIndices;
             /**
              * 레이블 필터로 유지할 열 인덱스를 반환한다.
              */
             private $_getLabelFilteredColIndices;
             /**
              * value/topN 필터로 유지할 행 인덱스를 반환한다.
              */
             private $_getValueFilteredRowIndices;
             /**
              * value/topN 필터로 유지할 열 인덱스를 반환한다.
              */
             private $_getValueFilteredColIndices;
             /**
              * 레이블 필터용 매처 함수를 생성한다.
              */
             private $_createLabelMatcher;
             /**
              * 값 필터용 매처 함수를 생성한다.
              */
             private $_createValueMatcher;
             /**
              * 정렬 원본 데이터를 초기화한다 (필터 변경 시).
              */
             private $_clearSortOriginals;
             /**
              * 현재 정렬 설정을 재적용한다 (필터 변경 후).
              */
             private $_reapplySorting;
             /**
              * Fallback 정렬 설정 (내부).
              */
             private $_setFallbackSortInternal;
             /**
              * Fallback 정렬 제거 (내부).
              */
             private $_clearFallbackSortInternal;
             /**
              * 두 fallback 설정이 동일한지 비교한다.
              */
             private $_isSameFallbackSort;
             /**
              * 행 정렬 (필드 + fallback) 중 하나라도 활성 상태인지.
              */
             private $_hasEffectiveRowSort;
             /**
              * 열 정렬 (필드 + fallback) 중 하나라도 활성 상태인지.
              */
             private $_hasEffectiveColumnSort;
             /**
              * 행/열 정렬 적용 시 차원별로 실제 사용할 sort 설정을 결정한다.
              * - dimName 이 null (measure 레벨) 이면 항상 undefined.
              * - explicit 가 있고 direction !== 'none' 이면 explicit.
              * - explicit 가 있고 direction === 'none':
              *   - fallback.scope === 'all' 이고 fallbackAsSort 가 있으면 fallback.
              *   - 그 외엔 undefined (정렬 skip).
              * - explicit 가 없으면 fallbackAsSort (있으면) 사용.
              */
             private $_resolveEffectiveSort;
             /**
              * 행 정렬 원본 스냅샷이 없으면 현재 상태를 백업한다.
              * 얕은 복사 — SortConfig.originalMatrix 주석의 invariant 가 깨지면 안 됨.
              */
             private $_ensureRowSortOriginal;
             /**
              * 열 정렬 원본 스냅샷이 없으면 현재 상태를 백업한다.
              * 얕은 복사 — SortConfig.originalMatrix 주석의 invariant 가 깨지면 안 됨.
              */
             private $_ensureColumnSortOriginal;
             /**
              * 행 차원 정렬 설정 (내부).
              */
             private $_setRowFieldSortInternal;
             /**
              * 열 차원 정렬 설정 (내부).
              */
             private $_setColumnFieldSortInternal;
             /**
              * 행 차원 정렬 해제 (내부). field 미지정이면 모두 해제.
              */
             private $_clearRowFieldSortInternal;
             /**
              * 열 차원 정렬 해제 (내부). field 미지정이면 모두 해제.
              */
             private $_clearColumnFieldSortInternal;
             /**
              * 행 정렬 원본로 복원 후 스냅샷을 비운다.
              */
             private $_restoreRowOriginalAndReset;
             /**
              * 열 정렬 원본로 복원 후 스냅샷을 비운다.
              */
             private $_restoreColumnOriginalAndReset;
             /**
              * 두 정렬 설정이 동일한지 비교한다.
              */
             private $_isSameSortConfig;
             /**
              * target 필드를 비교한다.
              */
             private $_isSameTarget;
             /**
              * 필드 기반 행 정렬을 적용한다.
              */
             private $_applyFieldBasedRowSorting;
             /**
              * labels 배열의 각 dim level 별 prefix 합계를 사전 계산한다.<br/>
              * leaf 레벨(dimCount-1)은 행/열 자체 합계와 동일하므로 생략한다.<br/>
              * subtotalCache 가 없으면 빈 배열을 반환한다.<br/>
              * indicesOut 이 주어지면 prefix별 leaf 인덱스 목록도 함께 채운다.
              */
             private $_buildPrefixTotalsForSort;
             /**
              * 행 필드 정렬용 comparator 를 빌드한다.
              * 정렬 종류/target/measure 분기와 부분-매칭 열 인덱스 사전 계산을 1회만 수행하고,
              * 그 결과를 클로저로 캡쳐해 (a,b) → cmp 만 수행하는 함수를 반환한다.
              */
             private $_buildRowFieldComparator;
             /**
              * 'value' 타입 행 정렬용 comparator 를 빌드한다.
              * target 해석(숫자/리프/부분차원/Grand Total)과 매칭 열 인덱스를 모두 사전 계산한다.
              */
             private $_buildRowValueComparator;
             /**
              * value 정렬의 target 을 열 인덱스 배열로 해석한다.
              * - number      : [target] (범위 밖이면 null)
              * - 전체 차원 string[] : 리프 열 1개
              * - 부분 차원 string[] : prefix 매칭되는 모든 리프 열
              */
             private $_resolveValueTargetCols;
             /**
              * 필드 기반 열 정렬을 적용한다.
              */
             private $_applyFieldBasedColumnSorting;
             /**
              * 열 필드 정렬용 comparator 를 빌드한다. (행 측 대칭)
              */
             private $_buildColumnFieldComparator;
             /**
              * 'value' 타입 열 정렬용 comparator 빌드 (행 측 대칭).
              */
             private $_buildColumnValueComparator;
             /**
              * value 정렬의 target 을 행 인덱스 배열로 해석한다. ($_resolveValueTargetCols 의 행 대칭)
              */
             private $_resolveValueTargetRows;
             /**
              * 특정 피벗 셀에 해당하는 원본 AggTable의 행들을 반환한다.<br/>
              * 피벗 셀의 행/열 레이블 조합에 매칭되는 모든 원본 데이터를 조회할 수 있다.<br/>
              *
              * @param rowIndex 피벗 행 인덱스
              * @param colIndex 피벗 열 인덱스
              * @returns 매칭되는 원본 AggTable의 행 배열 (각 행은 {dimension: value, ...} 형태)
              * @throws rowIndex 또는 colIndex가 범위를 벗어나면 에러 발생
              *
              * @example
              * ```typescript
              * const sourceRows = pivot.getCellSourceRows(0, 1);
              * // 행 레이블이 ['Seoul'], 열 레이블이 ['product', 'B']인 셀의
              * // 모든 원본 데이터를 반환
              * // 결과: [{region: 'Seoul', product: 'B', sales: 2000, qty: 100}, ...]
              * ```
              */
             getCellAggRows(rowIndex: number, colIndex: number): any[];
             /**
              * 특정 피벗 셀에 해당하는 원본 AggTable의 행 인덱스 목록을 반환한다.<br/>
              * 피벗 셀의 행/열 레이블 조합에 매칭되는 모든 원본 행의 인덱스를 조회할 수 있다.<br/>
              *
              * @param rowIndex 피벗 행 인덱스
              * @param colIndex 피벗 열 인덱스
              * @returns 매칭되는 원본 AggTable의 행 인덱스 배열
              * @throws rowIndex 또는 colIndex가 범위를 벗어나면 에러 발생
              *
              * @example
              * ```typescript
              * const indices = pivot.getCellSourceRowIndices(0, 1);
              * // 행 레이블이 ['Seoul'], 열 레이블이 ['product', 'B']인 셀에
              * // 매칭되는 원본 AggTable의 행 인덱스 반환
              * // 결과: [3, 7, 12]
              *
              * // 원본 데이터 접근
              * const rows = pivot.source.rows;
              * indices.forEach(idx => console.log(rows[idx]));
              * ```
              */
             getCellAggRowIndices(rowIndex: number, colIndex: number): number[];
             /**
              * 특정 피벗 셀에 해당하는 원본 AggTable의 행 개수를 반환한다.<br/>
              * getCellSourceRowIndices()보다 메모리 효율적이며, 개수만 필요할 때 사용한다.<br/>
              *
              * @param rowIndex 피벗 행 인덱스
              * @param colIndex 피벗 열 인덱스
              * @returns 매칭되는 원본 행의 개수
              * @throws rowIndex 또는 colIndex가 범위를 벗어나면 에러 발생
              *
              * @example
              * ```typescript
              * const count = pivot.getCellSourceRowCount(0, 1);
              * // 행 레이블이 ['Seoul'], 열 레이블이 ['product', 'B']인 셀의
              * // 원본 행 개수 반환
              * // 결과: 3
              * ```
              */
             getCellAggRowCount(rowIndex: number, colIndex: number): number;
             /**
              * 특정 피벗 셀에 해당하는 CubeDataSource 원본 행 인덱스 목록을 반환한다.<br/>
              * AggTable의 원본 행 인덱스를 추적하여, 피벗 셀에 해당하는 CubeDataSource 원본 데이터의<br/>
              * 행 인덱스를 조회할 수 있다. (drillthrough 기능에 활용)<br/>
              *
              * @param rowIndex 피벗 행 인덱스
              * @param colIndex 피벗 열 인덱스
              * @returns CubeDataSource의 원본 행 인덱스 배열
              * @throws rowIndex 또는 colIndex가 범위를 벗어나면 에러 발생
              *
              * @example
              * ```typescript
              * const aggRowIndices = pivot.getCellAggRowIndices(0, 1);
              * // 피벗 셀(0, 1)에 해당하는 AggTable 행 인덱스들
              * // 결과: [0, 5, 12, 23, 45, 67]
              *
              * // ColumnStore(CubeDataSource) 데이터 접근
              * const cube = ...; // DataCube 인스턴스
              * sourceIndices.forEach(idx => console.log(cube.source.rowAt(idx)));
              * ```
              */
             getCellSourceRowIndices(rowIndex: number, colIndex: number): number[];
             /**
              * 특정 피벗 셀에 해당하는 CubeDataSource 원본 행 개수를 반환한다.<br/>
              * getCellCubeSourceRowIndices()보다 메모리 효율적이며, 개수만 필요할 때 사용한다.<br/>
              *
              * @param rowIndex 피벗 행 인덱스
              * @param colIndex 피벗 열 인덱스
              * @returns CubeDataSource의 원본 행 개수
              * @throws rowIndex 또는 colIndex가 범위를 벗어나면 에러 발생
              *
              * @example
              * ```typescript
              * const count = pivot.getCellSourceRowCount(0, 1);
              * // 피벗 셀(0, 1)에 해당하는 CubeDataSource 원본 행 개수
              * // 결과: 6
              * ```
              */
             getCellSourceRowCount(rowIndex: number, colIndex: number): number;
             /**
              * 차원 값 교차점에 해당하는 CubeDataSource 원본 행 인덱스 목록을 반환한다.<br/>
              * 다수의 셀에 대해 원본 데이터 인덱스를 조회할 때 사용한다. (drillthrough 기능에 활용)<br/>
              * 매개변수를 생략하면 피벗에 포함된 전체 원본 행 인덱스를 반환한다.<br/>
              *
              * @param rowDimension 행 차원 이름 (단일 또는 배열). 생략 시 모든 행 매칭
              * @param rowValue 행 차원 값 (단일 또는 배열, rowDimension과 동일 길이)
              * @param colDimension 열 차원 이름 (단일 또는 배열). 생략 시 모든 열 매칭
              * @param colValue 열 차원 값 (단일 또는 배열, colDimension과 동일 길이)
              * @returns CubeDataSource의 원본 행 인덱스 배열 또는 null
              *
              * @example
              * ```typescript
              * // 전체 행 인덱스
              * pivot.getTotalSourceRowIndices2();
              *
              * // 행 차원만 지정 (해당 행의 모든 열)
              * pivot.getTotalSourceRowIndices2('브랜드명', 'BMW');
              *
              * // 행/열 차원 모두 지정
              * pivot.getTotalSourceRowIndices2('차종', 'BMW', '판매월', '1월');
              *
              * // 다중 차원
              * pivot.getTotalSourceRowIndices2(['브랜드명', '차종'], ['BMW', '대형'], '판매분기', 'Q1');
              * ```
              */
             getTotalSourceRowIndices(rowDimension?: string | string[], rowValue?: any | any[], colDimension?: string | string[], colValue?: any | any[]): number[] | null;
             getTotalSourceRowCount(rowDimension?: string | string[], rowValue?: any | any[], colDimension?: string | string[], colValue?: any | any[]): number;
             /**
              * getTotalSourceRowCount() 캐시 키를 생성한다.
              */
             private $_buildTotalSourceRowCountKey;
             /**
              * Grand Total 및 leaf 행/열 합계를 반환한다.<br/>
              * 소계(subtotal)는 getSubtotal() 메서드로 위치를 지정하여 조회한다.<br/>
              *
              * @returns 합계 데이터
              *
              * @example
              * ```typescript
              * const totals = pivot.getTotals();
              *
              * // 행별 합계 (leaf): 각 행의 모든 열 값 합계
              * totals.rowTotals  // [[60], [120], [150]]
              *
              * // 열별 합계 (leaf): 각 열의 모든 행 값 합계
              * totals.columnTotals  // [[100], [130], [60]]
              *
              * // 전체 합계
              * totals.grandTotal  // [290]
              * ```
              */
             getTotals(): PivotTotals;
             /**
              * 차원 값 교차점의 합계를 조회한다.<br/>
              * 다수의 셀에 대해 반복 호출되는 경우에 최적화된 경량 함수.<br/>
              * leaf/non-leaf 차원 모두 지원하며, 캐시에서 직접 조회하여 빠르다.<br/>
              *
              * @param rowDimension 행 차원 이름 (단일 또는 배열)
              * @param rowValue 행 차원 값 (단일 또는 배열, rowDimension과 동일 길이)
              * @param colDimension 열 차원 이름 (단일 또는 배열)
              * @param colValue 열 차원 값 (단일 또는 배열, colDimension과 동일 길이)
              * @returns 합계 값 배열 (measures 순서) 또는 null
              *
              * @example
              * ```typescript
              * // rowDimensions: ['브랜드명', '차종'], columnDimensions: ['판매분기', '판매월']
              *
              * // 단일 차원 (기존 방식)
              * pivot.getCellTotal('차종', 'BMW', '판매월', '1월');
              * pivot.getCellTotal('브랜드명', '현대', '판매분기', 'Q1');
              *
              * // 다중 차원 (배열 지정)
              * pivot.getCellTotal(['브랜드명', '차종'], ['BMW', '대형'], '판매분기', 'Q1');
              * pivot.getCellTotal('브랜드명', 'BMW', ['판매분기', '판매월'], ['Q1', '01']);
              * pivot.getCellTotal(['브랜드명', '차종'], ['BMW', '대형'], ['판매분기', '판매월'], ['Q1', '01']);
              * ```
              */
             getCellTotal(rowDimension: string | string[], rowValue: any | any[], colDimension: string | string[], colValue: any | any[]): any[] | null;
             /**
              * 차원 값 교차점의 합계를 조회한다 (항상 배열 반환).<br/>
              * {@link getCellTotal}과 동일한 로직이지만 범위/인덱스 체크를 생략하고,<br/>
              * 데이터가 없는 경우에도 null 대신 undefined로 채워진 measure 길이 배열을 반환한다.<br/>
              * 호출자가 차원명/값의 유효성을 보장할 수 있는 경우, null 체크 오버헤드 없이 사용한다.<br/>
              * 매개변수는 항상 배열로 전달해야 한다 (단일 값도 `['차종']`, `['BMW']` 형태).<br/>
              *
              * @param rowDims 행 차원 이름 배열
              * @param rowVals 행 차원 값 배열 (rowDims와 동일 길이)
              * @param colDims 열 차원 이름 배열
              * @param colVals 열 차원 값 배열 (colDims와 동일 길이)
              * @returns 합계 값 배열 (measures 순서). 데이터 없는 경우 `[undefined, undefined, ...]`
              *
              * @example
              * ```typescript
              * // null 체크 없이 바로 인덱싱 가능
              * const values = pivot.getCellTotalArray(['차종'], ['BMW'], ['판매월'], ['1월']);
              * // values[0]은 number | undefined (null 아님)
              *
              * // 다중 차원
              * pivot.getCellTotalArray(['브랜드명', '차종'], ['BMW', '대형'], ['판매분기'], ['Q1']);
              * ```
              */
             internalCellTotal(rowDims: readonly string[], rowVals: readonly any[], colDims: readonly string[], colVals: readonly any[]): (any | undefined)[];
             /**
              * 소계(subtotal) 값을 위치를 지정하여 조회한다.<br/>
              * 행 또는 열 위치를 지정하면 해당 위치의 소계 값을 반환한다.<br/>
              *
              * **조합별 동작:**
              * | row | col | 반환값 | 설명 |
              * |-----|-----|--------|------|
              * | leaf | null | `number[]` | 해당 행의 모든 열 합계 |
              * | null | leaf | `number[]` | 해당 열의 모든 행 합계 |
              * | 상위 그룹 | 아무거나 | `number[]` | 그룹 내 행들의 합계 |
              * | 하위 차원 value | 아무거나 | `{ values, subtotals }` | 상위 그룹별 배열 |
              * | { dimension } | 아무거나 | `{ values, subtotals }` | 해당 차원의 모든 값별 배열 |
              * | null | null | `number[]` | Grand Total |
              * | leaf | leaf | `number[]` | ⚠️ `matrix[r][c]` 직접 접근 권장 |
              *
              * @param rowPosition 행 위치 (null이면 전체 열에 대한 소계)
              * @param colPosition 열 위치 (null이면 전체 행에 대한 소계)
              * @returns 소계 값 배열 (measures 순서) 또는 null (유효하지 않은 위치)
              *
              * @example
              * ```typescript
              * // rowDimensions: ['region', 'city']
              * // columnDimensions: ['year', 'quarter']
              * //
              * //                    2024                    2025
              * //                Q1    Q2   [2024합]     Q1    Q2   [2025합]  [행합]
              * // East
              * //   NYC         10    20      30        30    40      70       100
              * //   Boston      15    25      40        35    45      80       120
              * //   [East합]    25    45      70        65    85     150       220
              * // West
              * //   LA          50    60     110        70    80     150       260
              * //   [West합]    50    60     110        70    80     150       260
              * // [열합]        75   105     180       135   165     300       480
              *
              * // Leaf 행의 열 합계 (NYC 행의 [행합])
              * pivot.getSubtotal(0, null);  // [100]
              *
              * // Leaf 열의 행 합계 (Q1-2024 열의 [열합])
              * pivot.getSubtotal(null, 0);  // [75]
              *
              * // 상위 그룹의 열 합계 (East 그룹 전체)
              * pivot.getSubtotal({ dimension: 'region', value: 'East' }, null);  // [220]
              *
              * // 열 그룹의 행 합계 (2024 그룹의 [열합])
              * pivot.getSubtotal(null, { dimension: 'year', value: '2024' });  // [180]
              *
              * // Leaf 행의 열 그룹 소계 (NYC 행의 [2024합])
              * pivot.getSubtotal(0, { dimension: 'year', value: '2024' });  // [30]
              *
              * // 행 그룹의 Leaf 열 소계 (East 그룹의 Q1-2024 열)
              * pivot.getSubtotal({ dimension: 'region', value: 'East' }, 0);  // [25]
              *
              * // 행 그룹 × 열 그룹 교차점 (East의 2024합)
              * pivot.getSubtotal(
              *   { dimension: 'region', value: 'East' },
              *   { dimension: 'year', value: '2024' }
              * );  // [70]
              *
              * // Grand Total
              * pivot.getSubtotal(null, null);  // [480]
              *
              * // 전체 행 그룹의 소계 배열 (dimension만 지정, value 생략)
              * pivot.getSubtotal({ dimension: 'region' }, null);
              * // { values: ['East', 'West'], subtotals: [[240], [240]] }
              *
              * // 특정 열에 대한 전체 행 그룹 소계
              * pivot.getSubtotal({ dimension: 'region' }, 0);
              * // { values: ['East', 'West'], subtotals: [[60], [80]] }
              *
              * // 하위 차원 value 지정 시: 상위 그룹별로 분리된 배열 반환
              * // rowDimensions: ['지역', '차종'] 일 때
              * pivot.getSubtotal({ dimension: '차종', value: '대형' }, null);
              * // { values: ['서울', '부산'], subtotals: [[60], [150]] }
              * // → 각 지역(상위 그룹)의 대형(하위 차원 값) 소계
              *
              * // ⚠️ 양쪽 모두 leaf 인덱스인 경우는 matrix 직접 접근이 효율적
              * // getSubtotal(0, 0) → matrix[0][0]과 동일하므로 직접 접근 권장
              * pivot.matrix[r][c];  // 직접 접근
              * ```
              */
             getSubtotal(rowPosition: SubtotalPosition | null, colPosition: SubtotalPosition | null): number[] | {
                 values: any[];
                 subtotals: number[][];
             } | null;
             /**
              * 캐시에서 단일 subtotal 값을 조회한다 (O(1)).
              */
             private $_getSingleFromCache;
             /**
              * 캐시에서 bulk 모드 subtotal을 조회한다.
              */
             private $_getBulkFromCache;
             /**
              * 캐시에서 하위 차원 value 기반 subtotal을 조회한다.
              */
             private $_getSubDimensionFromCache;
             /**
              * 하위 차원의 value를 지정했는지 확인 (상위 그룹별 분리 필요).
              */
             private $_isSubDimensionValue;
             /**
              * 하위 차원 value 지정 시 상위 그룹별로 분리된 소계 배열 반환.
              */
             private $_getSubDimensionSubtotals;
             /**
              * bulk 위치인지 확인 (dimension만 있고 value가 없는 경우).
              */
             private $_isBulkPosition;
             /**
              * 특정 차원의 모든 값에 대한 소계 배열을 반환한다 (내부용).
              */
             private $_getBulkSubtotals;
             /**
              * 위치 지정을 필터 함수로 변환한다 (내부용).<br/>
              */
             private $_createPositionFilter;
             /**
              * 각 행의 전체 열 합계를 반환한다.<br/>
              *
              * @returns 행 개수만큼의 합계 배열
              *
              * @example
              * ```typescript
              * // matrix:
              * //        A    B    C
              * // East  10   20   30
              * // West  40   50   60
              * // measures: ['sales']
              *
              * const rowTotals = pivot.getRowTotals();
              * // [[60], [150]]  - 각 행의 열 합계 (measures 순서)
              * ```
              */
             getRowTotals(): any[][];
             /**
              * 각 열의 전체 행 합계를 반환한다.<br/>
              *
              * @returns 열 개수만큼의 합계 배열 [열][measure]
              *
              * @example
              * ```typescript
              * // matrix:
              * //        A    B    C
              * // East  10   20   30
              * // West  40   50   60
              * // measures: ['sales']
              *
              * const columnTotals = pivot.getColumnTotals();
              * // [[50], [70], [90]]  - 각 열의 행 합계 (measures 순서)
              * ```
              */
             getColumnTotals(): any[][];
             /**
              * 전체 합계를 반환한다.<br/>
              *
              * @returns 모든 셀의 총합 (measures 순서)
              *
              * @example
              * ```typescript
              * // measures: ['sales', 'qty']
              * const grandTotal = pivot.getGrandTotal();
              * // [210, 21]
              * ```
              */
             getGrandTotal(): any[];
             /**
              * 행별 열 그룹 소계를 반환한다.<br/>
              * 각 행에 대해 상위 열 차원값별 소계를 제공한다.<br/>
              * 예: columnDimensions=['year','quarter']일 때, 각 행의 'year=2024' 소계.
              *
              * @param columnDimensionIndex 열 그룹 차원 인덱스 (기본값: 0, 최상위 열 차원)
              * @returns 행별 열그룹 소계
              *
              * @example
              * ```typescript
              * // columnDimensions: ['year', 'quarter']
              * // rowDimensions: ['region']
              * // matrix:
              * //              2024            2025
              * //           Q1    Q2       Q1    Q2
              * // East     10    20       30    40
              * // West     50    60       70    80
              *
              * const subtotals = pivot.getRowByColumnGroupTotals();
              * // {
              * //   columnDimension: 'year',
              * //   columnDimensionIndex: 0,
              * //   columnGroupValues: ['2024', '2025'],
              * //   totals: [
              * //     [[30], [70]],   // East: 2024=30, 2025=70
              * //     [[110], [150]]  // West: 2024=110, 2025=150
              * //   ]
              * // }
              * ```
              */
             getRowByColumnGroupTotals(columnDimensionIndex?: number): RowByColumnGroupTotals | null;
             /**
              * 열별 행 그룹 소계를 반환한다.<br/>
              * 각 열에 대해 상위 행 차원값별 소계를 제공한다.<br/>
              * 예: rowDimensions=['region','city']일 때, 각 열의 'region=East' 소계.
              *
              * @param rowDimensionIndex 행 그룹 차원 인덱스 (기본값: 0, 최상위 행 차원)
              * @returns 열별 행그룹 소계
              *
              * @example
              * ```typescript
              * // rowDimensions: ['region', 'city']
              * // columnDimensions: ['quarter']
              * // matrix:
              * //                   Q1    Q2    Q3
              * // East - NYC       10    20    30
              * // East - Boston    40    50    60
              * // West - LA        70    80    90
              *
              * const subtotals = pivot.getColumnByRowGroupTotals();
              * // {
              * //   rowDimension: 'region',
              * //   rowDimensionIndex: 0,
              * //   rowGroupValues: ['East', 'West'],
              * //   totals: [
              * //     [[50], [70]],   // Q1: East=50, West=70
              * //     [[70], [80]],   // Q2: East=70, West=80
              * //     [[90], [90]]    // Q3: East=90, West=90
              * //   ]
              * // }
              * ```
              */
             getColumnByRowGroupTotals(rowDimensionIndex?: number): ColumnByRowGroupTotals | null;
             /**
              * 행별 합계 계산 (내부용).<br/>
              */
             private $_getRowTotals;
             /**
              * 열별 합계 계산 (내부용).<br/>
              */
             private $_getColumnTotals;
             /**
              * 전체 합계 계산 (내부용).<br/>
              */
             private $_getGrandTotal;
             /** measure별 i64(bigint) 여부 배열 (지연 계산, lifetime 캐시). */
             private $_measureIsBigint;
             /** measure 중 i64 가 하나라도 있는가 (fast path 분기용). */
             private $_hasAnyBigint;
             /** raw 재집계용 누적 셀 초기화. bigint measure 는 0n, 그 외는 0. */
             private $_initAccumCell;
             /**
              * 두 값이 동일한지 비교한다 (Date 객체 지원).<br/>
              * Date 객체의 경우 getTime()으로 비교한다.
              */
             private $_valueEquals;
             /**
              * 배열에서 값의 인덱스를 찾는다 (Date 객체 지원).<br/>
              */
             private $_findValueIndex;
             /**
              * measure별 aggregate 함수에 맞춰 셀 값들을 결합한다.<br/>
              * cell-pass로 캐시된 값들(이미 한 축 집계 완료) 위에 두 번째 축으로 결합할 때 사용.<br/>
              * - sum/count/total : 합산 (정확)<br/>
              * - min/max         : min/max (정확 — 멱등)<br/>
              * - avg             : 단순 평균 (정확하려면 가중치 필요. 동일 group 크기일 때만 정확)<br/>
              * - distinct/first/last/p25/p50/p75 : 첫 매칭 값 사용 (정확한 재집계는 source 필요)<br/>
              * found=false 인 경우 빈 array(0 채움)를 반환할지는 호출자가 결정.<br/>
              */
             private $_combineCellAggregates;
             /**
              * 다중 차원/값 조합에 대한 합계를 조회한다.<br/>
              * getCellTotal의 배열 매개변수 지원을 위한 내부 헬퍼.<br/>
              */
             private $_getCellTotalMulti;
             /** measure 별 aggregate 함수 이름을 반환한다. */
             private $_getAggFuncs;
             /** $_getCellTotalMulti LRU 캐시 키 생성. */
             private $_buildMultiCellCacheKey;
             private $_putMultiCellCache;
             /**
              * 매칭된 leaf 셀들의 source row indices를 합집합한 뒤,
              * 각 measure aggregate 함수에 맞춰 raw source 값에서 직접 재집계한다.<br/>
              * AggTable 이 아닐 경우 undefined 를 반환 (호출자는 cell-pass fallback 사용).<br/>
              * 매칭 row 가 없으면 null.<br/>
              */
             private $_computeMultiCellRaw;
             /** values 배열에 대해 aggregate 함수를 적용한다. */
             private $_applyAggregate;
             /** i64 measure 전용 aggregate (sum/min/max/count 만 지원). */
             private $_applyAggregateBigint;
             /**
              * raw 재집계용 컨텍스트를 lazy 로 빌드/캐싱한다.<br/>
              * AggTable 이 아니면 null.<br/>
              */
             private $_getRawAggContext;
             /**
              * 배열에서 고유값을 추출한다 (Date 객체 지원).<br/>
              */
             private $_getUniqueValues;
             /**
              * `_emptyCell` 을 빌드 시 한 번만 계산해 놓는다.<br/>
              *
              * `emptyValue` 옵션을 closure 로 한 번 디스패치한 후 measure
              * 별로 1회 호출하여 고정 템플릿을 완성한다. 이후는 holey
              * 셀 fallback (`getCellValue()` / `toJSON()`) 에서 이 배열을
              * **참조만** 재사용 — switch 분기/measure find 를 hot path 에서
              * 완전 제거한다.
              */
             private $_buildEmptyCell;
             /**
              * 전체 매트릭스의 측정값별 총 집계를 반환한다.<br/>
              * _subtotalCache.grandTotal을 객체 형태로 변환하여 반환.<br/>
              *
              * @returns 측정값별 합계 객체
              * @private
              */
             private $_getTotalAggregates;
             /**
              * 피벗 매트릭스를 구성한다.<br/>
              */
             /**
              * `initialSorts`에서 해당 차원의 label 정렬 방향을 가져온다.<br/>
              * 설정이 없으면 기본 'asc' (1) 반환.<br/>
              * 빌드 단계의 unique 값 정렬에 사용된다.
              */
             private $_getInitialLabelDir;
             /**
              * `initialSorts` 항목들을 빌드 직후 sort config에 등록한다.<br/>
              * 라벨은 이미 빌드 단계에서 원하는 방향으로 정렬되었으므로,
              * **재정렬 없이 상태만** 박아 넣는다.<br/>
              * 이렇게 하면 `setFieldSorts`에서 동일한 설정이 들어왔을 때
              * `$_isSameSortConfig`로 정확히 skip되어 불필요한 재배치를 피한다.<br/>
              * 또한 `clear` 시 복원되는 "원본"이 빌드 직후 상태(즉 initialSorts 반영)와 일치한다.
              */
             private $_registerInitialSortsAsState;
             /**
              * 옵션의 rowFallbackSort / columnFallbackSort 를 빌드 직후 1회 적용한다.<br/>
              * 옵션이 없거나 direction='none' 이면 보관만 하고 정렬은 수행하지 않는다.
              */
             private $_applyInitialFallbackSorts;
             /**
              * date level 차원에 대한 canonical(완전) 값 집합을 반환한다.<br/>
              * showEmptyLabels 옵션이 켜진 경우 PivotMatrix 라벨 확장에 사용된다.<br/>
              *
              * - 고정 집합: half(H1/H2), quarter(Q1~Q4), month(01~12), dayOfWeek(1~7),
              *   hour(0~23), minute/second(0~59)
              * - 범위 집합 (관측된 min~max 사용): year, weekOfYear, dayOfYear, week, day, weekOfMonth
              * - boolean 결과(ytd/mtd/qtd/wtd/htd) 및 date level이 아닌 차원: null 반환
              */
             private $_getCanonicalDateValues;
             private $_buildPivotMatrix;
             /**
              * measureIndex를 실제 인덱스로 변환한다.
              * @param measureIndex - 인덱스(number) 또는 필드명(string)
              * @returns 실제 인덱스 (찾지 못하면 0)
              */
             private $_resolveMeasureIndex;
             /**
              * 현재 라벨 순서를 기준으로 (r,c) → AggTable row 매핑을 빌드한다.<br/>
              * AggTable rows 를 한 번 순회하며 라벨 조합으로 세션을 찾아 누적.<br/>
              * <br/>
              * @param withIndices true 면 `_cellAggRowIndices` 와 `_cellSourceRowCount`
              *        둘 다 기록. false 면 `_cellSourceRowCount` 만 기록 (avg 가중치
              *        용도로만 필요할 때 메모리 절감).<br/>
              * <br/>
              * 동일 셀에 여러 AggTable 행이 매핑될 수 있으니 indices 는 적치 배열,
              * sourceRowCount 는 누적 합이다.
              */
             private $_buildCellAggCache;
             /** drillthrough 계열 getter 의 진입점. 캐시가 없으면 indices 포함해 1회 빌드. */
             private $_ensureCellAggIndices;
             /**
              * avg measure 별 셀당 "비-null 값 개수"(`_cellAvgCount`)와 "원본 값 합"
              * (`_cellAvgSum`)을 source 1회 스캔으로 함께 빌드해 두 필드에 저장한다.<br/>
              * 엑셀 동일성: 소계 avg 는 `(Σ cellSum)/(Σ cellCount)` 로 계산되며, 원본 합을
              * 직접 더하므로 셀 평균을 재-곱하는 왕복 반올림이 없다(엑셀 SUM/COUNT 와 동일).<br/>
              * bigint measure 는 합을 number 로 보장할 수 없어 sum 그리드를 만들지 않는다
              * (count 만 — 호출자는 기존 round-trip 가중으로 처리).<br/>
              * <br/>
              * AggTable raw 컨텍스트가 없으면(`getSourceRowIndices` 미지원) 두 필드 모두
              * `null` 로 두며, 호출자는 `_cellSourceRowCount` 가중(레거시)으로 fallback 한다.
              *
              * @param avgMis avg aggregate 인 measure 인덱스 목록
              */
             private $_buildCellAvgAccum;
             /** avg 가중 결합용 `_cellAvgCount`/`_cellAvgSum` 을 캐시가 없으면 1회 빌드한다. */
             private $_ensureCellAvgCounts;
             /**
              * 매칭된 (row × col) 셀들의 avg 를 `(Σ cellSum)/(Σ cellCount)` 로 정확히 합성한다.<br/>
              * `_cellAvgSum`/`_cellAvgCount`(AggTable) 가 있으면 원본 합을 직접 더해 마지막에
              * 한 번만 나누므로 **엑셀(SUM/COUNT)과 동일**하다. 없으면(비-AggTable) 셀 평균을
              * `_cellSourceRowCount` 로 가중하는 레거시 round-trip 으로 fallback 한다.
              *
              * @returns 평균, 기여 셀이 없으면 null
              */
             private $_combineAvgWeighted;
             /**
              * subtotal 캐시를 사전 계산한다.<br/>
              * 한 번의 매트릭스 순회로 모든 그룹별 소계를 계산한다.
              */
             private $_buildSubtotalCache;
             /**
              * distinct/first/last/p25/p50/p75 처럼 셀 단위 결과로부터 정확히 합성할 수 없는
              * aggregate 함수에 대해, 각 subtotal scope에 속한 원본 source row를
              * 다시 모아 정확히 재집계한다.<br/>
              * (avg 는 `(Σ cellSum)/(Σ cellCount)` 로 메인 루프에서 이미 엑셀과 동일하게
              *  합성되므로 여기서 다루지 않는다.)<br/>
              *
              * 비용: scope 수 × scope 당 source row 수. measure가 위 6종 중 하나일 때만 호출됨.
              */
             private $_overrideRawAggregateScopes;
             /**
              * 분위수(percentile) 선형보간 계산 — AggTable.$_calculatePercentile과 동일 로직.
              */
             private $_percentile;
             /** 값 배열의 곱을 계산한다. (빈 배열이면 NaN) */
             private $_product;
             /**
              * 값 배열의 분산을 계산한다.<br/>
              * @param sample true면 표본 분산(n-1), false면 모집단 분산(n).
              * 표본 분산은 값이 2개 미만이면 NaN.
              */
             private $_variance;
             /**
              * Cartesian Product를 생성한다.<br/>
              *
              * @param arrays 각 차원의 고유값 배열
              * @returns 모든 가능한 조합
              */
             private $_cartesianProduct;
             /**
              * 레이블 배열에서 특정 레이블의 인덱스를 찾는다.<br/>
              *
              * @param labels 레이블 배열
              * @param target 찾을 레이블
              * @returns 인덱스 (찾지 못하면 -1)
              */
             private $_findLabelIndex;
             /**
              * FieldSort.target 처럼 외부에서 들어온 `string[]` 을 라벨과 매칭하기 위한 변형.<br/>
              * 라벨 셀이 number/Date 등일 수 있어 loose(`==`) 비교를 사용한다.<br/>
              * 핫패스(셀/AggRow 단위 매핑)에서는 strict 버전 `$_findLabelIndex` 를 쓰고,
              * 이 함수는 정렬 설정 해석 같은 저빈도 경로에서만 사용한다.
              */
             private $_findLabelIndexLoose;
             /**
              * 피벳 매트릭스를 CSV 형식으로 변환한다.<br/>
              *
              * @param options CSV 변환 옵션
              * @returns CSV 문자열
              */
             toCSV(options?: {
                 delimiter?: string;
                 includeHeaders?: boolean;
             }): string;
             /**
              * 피벳 매트릭스를 HTML 테이블 형식으로 변환한다.<br/>
              *
              * @param options HTML 변환 옵션
              * @returns HTML 문자열
              */
             toHTML(options?: {
                 includeStyle?: boolean;
             }): string;
             /**
              * 피벳 매트릭스를 JSON 형식으로 변환한다.<br/>
              *
              * @param options JSON 변환 옵션
              * @returns JSON 문자열
              */
             toJSON(options?: {
                 format?: 'array' | 'nested';
                 pretty?: boolean;
             }): string;
             /**
              * 피벳 매트릭스를 Markdown 테이블 형식으로 변환한다.<br/>
              *
              * @returns Markdown 문자열
              */
             toMarkdown(): string;
             /**
              * HTML 특수문자를 이스케이프한다.<br/>
              */
             private $_escapeHtml;
             /**
              * 행 차원의 고유 값을 반환한다.<br/>
              *
              * @param dimensionName 차원 이름
              * @returns 고유값 배열
              */
             getRowDimensionValues(dimensionName: string): any[];
             /**
              * 열 차원의 고유 값을 반환한다.<br/>
              *
              * @param dimensionName 차원 이름
              * @returns 고유값 배열
              */
             getColumnDimensionValues(dimensionName: string): any[];
             /* Excluded from this release type: registerSourceAgg */
             /**
              * 데이터 변경 콜백을 등록한다.<br/>
              *
              * **콜백 호출 시점:**
              * - `watchSource()` 호출 후, 원본 데이터가 변경될 때 자동으로 재피벗 후 콜백 호출
              * - `watchSource()`를 먼저 호출해야 변경 감지가 활성화됨
              *
              * **트리거되는 동작:**
              * - `DataCube.filter()` - 큐브 필터 변경 시
              * - `AggTable.filterByDimension()` / `filterByMeasure()` / `filterByLabel()` - AggTable 필터
              * - `AggTable.sortBy()` / `topByMeasure()` - 소팅/상위 N개 필터
              * - `AggTable.clearFilter()` - 필터 초기화
              *
              * 반환된 함수를 호출하면 콜백이 해제된다.<br/>
              *
              * @param callback 변경 시 호출될 콜백 함수
              * @returns 콜백 해제 함수
              *
              * @example
              * ```typescript
              * // 1. 변경 감지 활성화
              * pivot.watchSource();
              *
              * // 2. 콜백 등록
              * const unsub = pivot.onChange(() => {
              *     console.log('PivotMatrix가 재계산됨');
              *     renderPivotGrid(pivot);
              * });
              *
              * // 3. 다음 동작 시 자동으로 콜백 호출됨
              * cube.filter({ region: 'East' });              // → onChange 호출
              * aggTable.filterByDimension('product', ['A']); // → onChange 호출
              * aggTable.sortBy('sales', 'desc');             // → onChange 호출
              *
              * // 4. 해제
              * unsub();
              * ```
              */
             onChange(callback: () => void): () => void;
             /* Excluded from this release type: $_notifyChangeListeners */
             /* Excluded from this release type: onAggTableChanged */
             /**
              * 이 PivotMatrix의 메모리 사용량을 추정한다.<br/>
              * 행/열 레이블과 매트릭스 데이터의 메모리를 계산한다.<br/>
              *
              * @returns 추정된 메모리 사용량 (바이트)
              */
             getMemoryUsage(): number;
            }

            /**
             * PivotMatrix 옵션.<br/>
             */
            declare interface PivotMatrixOptions {
                /**
                 * 행 차원 컬럼명.<br/>
                 */
                rowDimensions?: string[];
                /**
                 * 열 차원 컬럼명.<br/>
                 */
                columnDimensions?: string[];
                /**
                 * 값(측정값) 컬럼명들. 다중 측정값을 지원한다.<br/>
                 */
                measures?: string[];
                measureLabels?: string[];
                /**
                 * 빈 셀(데이터 없음)에 사용할 값.<br/>
                 * 리터럴 (`'zero' | 'null' | 'dash' | 'empty' | 'na'`) 또는
                 * `(columnMeta) => any` 함수로 지정.<br/>
                 *
                 * **표시(display) / export 전용 fallback** 이다. 집계·정렬·필터에는 영향 없음.
                 * @default 'null'
                 * @see EmptyValue
                 */
                emptyValue?: EmptyValue;
                /**
                 * 측정값들을 열이 아닌 행 기준으로 표시할지 여부.<br/>
                 * - `false` (기본값): 각 열마다 측정값 컬럼 생성 (행: region, 열: product A/B/C, 측정값: sales/qty)
                 * - `true`: 행에 측정값 차원 추가 (행: region + measure, 열: product A/B/C, 각 셀은 단일 측정값)
                 * @default false
                 */
                valuesAsRows?: boolean;
                /**
                 * 차원별 초기 라벨 정렬 방향 (필드명 → 'asc' | 'desc').<br/>
                 * 행/열 구분은 PivotMatrix가 차원 위치에 따라 자동으로 판단한다.<br/>
                 *
                 * 빌드 시점의 라벨 정렬에 직접 반영되어 추가 재정렬 비용이 없다.<br/>
                 * total / columnValue / rowValue / custom / callback 등 값 기반 정렬은
                 * 빌드 후 `setRowFieldSort` / `setColumnFieldSort`로 별도 적용한다.
                 *
                 * @example
                 * ```typescript
                 * PivotMatrix.pivot(agg, {
                 *   rowDimensions: ['region', 'city'],
                 *   columnDimensions: ['year'],
                 *   measures: ['sales'],
                 *   initialSorts: { region: 'desc', year: 'asc' },
                 * });
                 * ```
                 */
                initialSorts?: Record<string, 'asc' | 'desc'>;
                /**
                 * 행 축 fallback 정렬 (축 전체 기본 정렬 규칙).<br/>
                 * 명시 `setFieldSort` / `initialSorts` 가 없는 행 차원들에 적용된다.<br/>
                 * 빌드 직후 한 번 적용되며, 이후 `setRowFallbackSort` / `setRowFallbackDirection`
                 * / `clearRowFallbackSort` 로 변경 가능.
                 *
                 * @see FallbackFieldSort
                 */
                rowFallbackSort?: FallbackFieldSort;
                /**
                 * 열 축 fallback 정렬.<br/>
                 * 동작은 `rowFallbackSort` 와 동일하며, 열 차원에 적용된다.
                 */
                columnFallbackSort?: FallbackFieldSort;
                /**
                 * 데이터가 존재하지 않는 차원의 라벨도 표시할지 여부 ("Show items with no data").<br/>
                 * - false (기본값): observed-only — AggTable에 실제 존재하는 차원값 조합만 라벨로 생성
                 * - true: 차원의 canonical(완전) 집합을 채워서, 데이터가 없는 라벨도 빈 셀로 표시
                 *
                 * **현재 지원 범위**: date level 차원(`quarter`, `month`, `dayOfWeek` 등).<br/>
                 * 향후 `customOrder`, range bucket, star schema dimension 테이블 등으로 확장 예정.
                 *
                 * 다중 차원에서는 관측된 비-canonical 차원 조합(prefix)별로 canonical 값을 채운다.
                 * 예: rows=[region, quarter], 관측={Seoul/Q1, Seoul/Q3, Busan/Q2} →
                 * 결과 라벨={Seoul/Q1..Q4, Busan/Q1..Q4} (Daegu는 관측되지 않았으므로 추가되지 않음).
                 *
                 * boolean 결과(ytd/mtd/qtd/wtd/htd)는 canonical 집합이 의미 없어 제외된다.
                 * year/weekOfYear/dayOfYear/day/week/weekOfMonth 같은 range 기반 레벨은
                 * 관측된 min~max 범위 내 모든 정수값으로 채워진다.
                 *
                 * @default false
                 */
                showEmptyLabels?: boolean;
            }

            declare class PivotMeasureView extends PivotFieldView<PivotValueField> {
                constructor(doc: Document);
                protected _doPrepare(doc: Document, field: PivotValueField): void;
            }

            /**
             * Pivot menu bar model.<br/>
             * 피벗 헤더에 메뉴 버튼들을 표시한다.
             */
            declare class PivotMenuBar extends PivotBookItem<PivotMenuBarOptions> {
                static defaults: PivotMenuBarOptions;
                constructor(book: IPivotBook);
                private _items;
                get items(): PivotMenuBarItem[];
                isVisible(): boolean;
                prepareRender(): void;
                private $_findItem;
                private _exportMenu;
                private $_initMenus;
            }

            declare class PivotMenuBarItem extends PivotItem {
                id: string;
                label: string;
                hint: string;
                icon: string;
                action: ((book: IPivotBook) => void) | PopupMenu;
                disabled: boolean;
                constructor(id: string, label: string, hint: string, icon: string, action: ((book: IPivotBook) => void) | PopupMenu);
            }

            export declare interface PivotMenuBarOptions extends PivotBookItemOptions {
            }

            declare class PivotPageList extends PivotBookItem<PivotPageListOptions> {
            }

            export declare interface PivotPageListOptions extends PivotBookItemOptions {
            }

            declare class PivotPageView extends UIFlexElement {
                private _pivotView;
                private _explorerView;
                private _layout;
                constructor(doc: Document);
                protected _doInit(doc: Document, initData: any): void;
                protected _doDispose(): void;
                get model(): PivotBookPage;
                get book(): PivotBook;
                get pivotView(): PivotView;
                get explorerView(): PivotExplorerView;
                get pageLayout(): ExplorerPosition;
                get bodyView(): PivotBodyView;
                get focusedCell(): IPivotBodyCellInfo | null;
                get detailedCell(): IPivotBodyCellInfo | null;
                /**
                 * 페이지의 탐색기 패널 위치를 설정한다.<br/>
                 * - `bottom`: 탐색기를 아래쪽에 두고 상/하로 분할
                 * - `right`: 탐색기를 오른쪽에 두고 좌/우로 분할
                 * - `left`: 탐색기를 왼쪽에 두고 좌/우로 분할
                 */
                setLayout(layout: ExplorerPosition): this;
                prepare(doc: Document): void;
                measure(hintWidth: number, hintHeight: number): void;
                layout(): void;
                openDetail(cell: IPivotBodyCellInfo, force?: boolean): void;
                openSelection(selection: PivotSelection, force?: boolean): void;
                click(element: Element): boolean;
                drillThrough(info: IPivotBodyCellInfo, type: ExplorerMode): void;
                getPopupMenu(target: Element): PopupMenu | undefined;
                getContextMenu(target: Element): PopupMenu | undefined;
                focusCell(dims: [string, any][], measure: string | number, center?: boolean): IPivotValueCellInfo | null;
                protected _doInitDom(doc: Document, dom: HTMLElement): void;
                private $_enableExplorer;
                private _cellMenu;
                private _selectionMenu;
            }

            declare abstract class PivotPanel<OP extends PivotPanelOptions = PivotPanelOptions> extends PivotBookItem<OP> {
                static defaults: PivotPanelOptions;
                abstract getMenu(table: PivotTable): PopupMenu;
                abstract prepareRender(book: PivotBook, table: PivotTable): void;
                afterRender(): void;
            }

            declare interface PivotPanelOptions extends PivotItemOptions {
                /**
                 * 패널 표시 여부.<br/>
                 */
                visible?: boolean;
            }

            declare interface PivotPdfExportOptions extends PivotExportOptions {
                /**
                 * 파일 확장자.
                 * 기본값: 'pdf'
                 */
                fileExt?: string;
                /**
                 * 가로 방향 출력 여부. 기본값: true
                 */
                landscape?: boolean;
                /**
                 * 사용할 TTF 폰트 파일의 URL.
                 * 한글 등 CJK 문자를 출력하려면 해당 문자를 지원하는 폰트를 지정해야 합니다.
                 * e.g. 'https://fonts.gstatic.com/s/nanumgothic/v23/PN_3Rfi-oW3hYwmKDpxS7F_z_tLfxno73g.woff2'
                 */
                fontUrl?: string;
                /** fontUrl로 로드된 폰트의 내부 이름. 기본값: 'custom' */
                fontName?: string;
            }

            declare class PivotRangeAnnotation extends PivotAnnotation<PivotRangeAnnotationOptions> {
                r1: number;
                c1: number;
                r2: number;
                c2: number;
                normalize(helper: IPivotAnnotationHelper): this;
                getTooltip(table: PivotTable): string;
            }

            declare class PivotRangeAnnotationCollection extends PivotAnnotationCollection<PivotRangeAnnotation, PivotRangeAnnotationCollectionOptions> {
                protected _createItem(): PivotRangeAnnotation;
            }

            declare interface PivotRangeAnnotationCollectionOptions extends PivotAnnotationCollectionOptions<PivotRangeAnnotationOptions> {
            }

            /**
             * row1, col1, row2, col2 모두 숫자로 지정하면 위치 변환 없이 셀들의 위치로 판단한다.
             */
            declare interface PivotRangeAnnotationOptions extends PivotAnnotationOptions {
                row1?: number | any[];
                col1?: number | any[];
                row2?: number | any[];
                col2?: number | any[];
                /**
                 * 영역 오버레이 박스에 적용되는 스타일 또는 미리 정의된 스타일 이름.
                 * 별도 박스라 셀 레이아웃과 무관하므로 `border` 등도 사용할 수 있다(PivotRangeAppearance 참조).
                 */
                style?: PivotRangeAppearance | string;
            }

            /**
             * RangeAnnotation 오버레이 박스에 적용되는 스타일.
             *
             * CellAnnotation은 셀 dom에 직접 inline으로 적용되므로 paint-only로 제한된 `CSSAppearance`를 그대로 쓴다
             * (border/padding 등 layout 영향 속성은 CSSAppearance에서 이미 제외됨 → 단면 강조는 outline/boxShadow 사용).
             *
             * 반면 RangeAnnotation은 셀과 분리된 별도 오버레이 박스에 그려져 셀 레이아웃에 영향이 없으므로,
             * `CSSAppearance`에 더해 `border` 계열 속성까지 허용한다.
             */
            declare type PivotRangeAppearance = CSSAppearance & Partial<Pick<CSSStyleDeclaration, 'border' | 'borderColor' | 'borderStyle' | 'borderWidth' | 'borderTop' | 'borderRight' | 'borderBottom' | 'borderLeft' | 'padding'>>;

            declare interface PivotRemoteAIModelOptions extends PivotAIModelOptions {
                url: string;
                /** 모든 요청에 추가할 헤더(예: Authorization). */
                headers?: Record<string, string>;
                /** 명령 등록 요청 경로. 기본값 "commands". */
                commandsPath?: string;
                /** 시스템 컨텍스트 등록 요청 경로. 기본값 "context". */
                contextPath?: string;
                /** 질의 요청 경로. 기본값 "query". */
                queryPath?: string;
            }

            declare interface PivotRow {
                parent?: PivotRow;
                row: number;
                vrow: number;
                type: 'g' | 'd' | 'm';
                level: number;
                index: any;
                dindex?: number;
                measure: number;
                label?: string;
                serCell?: PivotRowHeaderSeriesCell;
                values?: PivotRow[];
                single?: boolean;
            }

            /**
             * Pivot row bar model.<br/>
             */
            declare class PivotRowBar extends PivotFieldBar<PivotRowBarOptions> {
                static defaults: PivotRowBarOptions;
                private _rows;
                private _values;
                getMenu(): PopupMenu;
                showTableSettings(doc: Document): void;
                showThemeSettings(doc: Document): void;
                toggleValuesAsRows(table: PivotTable): void;
                _optionChanged(tag?: any): void;
                get dimensions(): PivotDimensionField[];
                get values(): PivotValueField[];
                isVisible(): boolean;
                hasMeasure(): boolean;
                build(table: IPivotTable): void;
                prepareRender(): void;
            }

            declare class PivotRowBarDefaults extends PivotTalbleDefaultBase<PivotRowBarOptions> {
            }

            declare interface PivotRowBarOptions extends PivotFieldBarOptions {
                /**
                 * true로 설정하면 행 바에 차원 필드가 표시되지 않는다.<br/>
                 *
                 * @default false
                 */
                hideDimensionFields?: boolean;
                /**
                 * true로 설정하면 행 바에 값 필드가 표시되지 않는다.<br/>
                 *
                 * @default false
                 */
                hideValueFields?: boolean;
            }

            /**
             * 피벗 row bar 뷰.<br/>
             * row field들과 (valuesOnRows인 경우)value field들을 표시한다.
             */
            declare class PivotRowBarView extends PivotFieldBarView<PivotRowBar> {
                private _headView;
                private _hiddenLayer;
                private _edgeView;
                private _visibleHeight;
                constructor(doc: Document);
                protected _doInit(doc: Document): void;
                setEdgeHeight(h: number): void;
                protected _createDimensionView(doc: Document): RowFieldView;
                protected _createMeasureView(doc: Document): PivotMeasureView;
                protected _doPrepare(doc: Document, model: PivotRowBar): void;
                protected _doMeasure(hintWidth: number, hintHeight: number): ISize;
                protected _doLayout(): void;
                protected _doClick(dom: HTMLElement): boolean;
                getPopupMenu(target: Element): PopupMenu | undefined;
            }

            /**
             * Pivot row header model.<br/>
             * Represents a row header in a pivot table.
             */
            declare class PivotRowHeader extends PivotHeader<PivotRowHeaderOptions> {
                static readonly defaults: PivotRowHeaderOptions;
                private _grandCell;
                private _rows;
                private _visibleRows;
                private _fixedRows;
                private _fixedVRows;
                private _columns;
                private _totalPos;
                private _collapseSingleTotal;
                private _grandPos;
                private _grandFixed;
                private _measureCount;
                private _measureVisible;
                private _treeMode;
                private _rowHeight;
                get isTree(): boolean;
                get rows(): PivotRow[];
                /**
                 * 표시되는 row 인덱스 배열.
                 */
                get visibleRows(): PivotRow[];
                /**
                 * Number of visible header rows (collapsed 반영).
                 */
                get visibleRowCount(): number;
                get fixedRows(): PivotRow[];
                get fixedVRows(): PivotRow[];
                get fixedRowCount(): number;
                get scrollRowCount(): number;
                /**
                 * Number of header columns.
                 */
                get colCount(): number;
                /**
                 * Number of header rows.
                 */
                get rowCount(): number;
                /**
                 * Gets the row header columns.
                 */
                get columns(): PivotRowHeaderColumn[];
                get grandCell(): PivotRowHeaderGrandCell;
                get totalPos(): TotalPosition | false;
                get collapseSingleTotal(): boolean;
                get grandTotalPos(): TotalPosition | false;
                get hasFields(): boolean;
                get measureVisible(): boolean;
                get measureCount(): number;
                get hasTotals(): boolean;
                isVisible(): boolean;
                getRow(row: number): PivotRow | undefined;
                build(matrix: PivotMatrix, fields: PivotDimensionField[]): PivotRow[];
                getGrandMeasureRow(measure: string | number): number;
                getColumn(col: number): PivotRowHeaderColumn;
                getColPos(col: number): number;
                getColWidth(col: number, span: number): number;
                rowToVrow(r: number): number;
                vrowToRow(vrow: number): number;
                findGroup(dimension: string, value: any, row?: number): PivotRowHeaderCell | undefined;
                toggleGroup(dim: any, value: any, row?: number): void;
                isExpanded(dim: any, value: any, row?: number): boolean;
                setExpanded(dim: any, value: any, expanded: boolean, row?: number): boolean;
                setExpandedAll(dim: any, expanded: boolean): boolean;
                getRowPos(vrow: number): number;
                getRowHeight(vrow: number, count: number): number;
                prepareRender(force: boolean): void;
                _optionChanged(tag?: any): void;
                get axis(): "row" | "column";
                get otherAxis(): "row" | "column";
                protected _doApply(op: PivotRowHeaderOptions): void;
                contains(cell: IPivotHeaderCellInfo): boolean;
                getCollapsedGroups(dim: any): any[];
                private $_getCol;
                /* Excluded from this release type: _getColumnKey */
                /* Excluded from this release type: _collectAutoWidthCandidates */
                /* Excluded from this release type: _collectAutoWidthExtraChrome */
                /* Excluded from this release type: _setTotalPositions */
                private $_resetVisibles;
                protected _refreshColWidths(): void;
                private $_resetColWidths;
            }

            declare class PivotRowHeaderCell extends PivotHeaderCell implements IPivotHeaderCellInfo {
                column: PivotRowHeaderColumn;
                index: number;
                height: number;
                row: number;
                vrow: number;
                totalCell: PivotRowHeaderTotalCell;
                constructor(column: PivotRowHeaderColumn, index: number);
                getPath(table: IPivotTable): string[];
                getTooltipPath(_table: IPivotTable): string;
            }

            declare class PivotRowHeaderColumn {
                field: PivotDimensionField;
                private _parent;
                private _level;
                private _cells;
                private _visibles;
                constructor(parent: PivotRowHeaderColumn, field: PivotDimensionField);
                get parent(): PivotRowHeaderColumn;
                get level(): PivotLevel;
                get count(): number;
                get cells(): PivotRowHeaderCell[];
                getPath(): PivotRowHeaderColumn[];
                buildCells(columns: PivotRowHeaderColumn[], lev: number, parent: PivotRow, prows: PivotRow[], row: number, range: [number, number], info: HeaderCellBuildInfo, parentCell?: PivotRowHeaderCell): number;
                findGroup(value: any, row: number): PivotRowHeaderCell | undefined;
                setExpandedAll(expanded: boolean): boolean;
                _clearCollapsed(expanderVisible: boolean): void;
                _resetVisibles(rows: PivotRow[], hiddenRows: Set<number>, expanderVisible: boolean): void;
            }

            declare class PivotRowHeaderDefaults extends PivotTalbleDefaultBase<PivotRowHeaderOptions> {
            }

            declare class PivotRowHeaderGrandCell extends PivotHeaderGrandCell {
                row: number;
                mCells: PivotRowHeaderGrandValueCell[];
                set(row: number, label: string, measures: string[], info: HeaderCellBuildInfo): void;
            }

            declare class PivotRowHeaderGrandValueCell extends PivotHeaderGrandValueCell {
                pCell: PivotRowHeaderGrandCell;
            }

            declare interface PivotRowHeaderOptions extends PivotHeaderOptions {
                /**
                 * 행 헤더의 레이아웃 방식.<br/>
                 * - `'grid'`: 차원별 컬럼으로 표시하고 동일 값은 병합한다.
                 * - `'flat'`: 차원별 컬럼으로 표시하고 모든 행에 값을 반복한다.
                 * - `'tree'`: 단일 컬럼에 인덴트로 계층을 표현한다.
                 *
                 * @default 'grid'
                 */
                layout?: 'grid' | 'flat' | 'tree';
                /**
                 * 'tree' 레이아웃에서 계층을 표현하기 위한 인덴트 크기(픽셀 단위).<br/>
                 *
                 * @default 20
                 */
                indent?: number;
                /**
                 * @default 90
                 */
                columnWidth?: number;
            }

            declare class PivotRowHeaderSeriesCell extends PivotHeaderSeriesCell {
                row: number;
            }

            declare class PivotRowHeaderTotalCell extends PivotRowHeaderCell {
                ended: boolean;
                constructor(headerCell: PivotRowHeaderCell, ended: boolean, nMeasure: number);
                isTotal(): boolean;
                _resetVPos(headerCell: PivotRowHeaderCell): void;
            }

            declare class PivotRowHeaderValueCell extends PivotRowHeaderCell {
                isValue(): boolean;
            }

            /**
             * 피벗 행 헤더 뷰.
             */
            declare class PivotRowHeaderView extends PivotHeaderView<PivotRowHeader> {
                private _columnViews;
                private _grandView;
                private _totalPool;
                private _totalViews;
                private _valuePool;
                private _valueViews;
                private _grandMeasureViews;
                private _seriesPool;
                private _seriesViews;
                private _fixedGrandTotal;
                private _vpR1;
                private _vpR2;
                private _measureCount;
                private _lastScrollTop;
                private _lastClientHeight;
                private _lastScrollHeight;
                private _hasScrollMetrics;
                constructor(doc: Document, owner: IPivotHeaderOwner);
                protected _doInit(doc: Document, initData: any): void;
                /**
                 * 고정 grand total 행을 스크롤에 맞춰 재배치한다.
                 * PivotView의 scroll handler에서 호출된다.
                 */
                updateFixedGrandTotal(scrollTop: number, clientHeight: number, scrollHeight: number): void;
                /**
                 * 스크롤에 의해 뷰포트가 변경될 때 호출된다.
                 */
                updateViewport(scrollTop: number, clientHeight: number): void;
                getCellView(target: Element): RowHeaderCellView | undefined;
                getTotalCellView(target: Element): RowHeaderTotalCellView | RowHeaderValueCellView | undefined;
                getGrandCellView(target: Element): RowGrandCellView | undefined;
                getGrandValueCellView(target: Element): RowHeaderGrandValueCellView | undefined;
                getSeriesCellView(target: Element): RowHeaderSeriesCellView | undefined;
                getCell(target: Element): PivotRowHeaderCell | undefined;
                getTotalCell(target: Element): PivotRowHeaderCell | undefined;
                getValueCell(target: Element): PivotRowHeaderCell | undefined;
                getSeriesCell(target: Element): PivotHeaderSeriesCell | undefined;
                protected _doPrepare(doc: Document, model: PivotRowHeader): void;
                protected _doMeasure(hintWidth: number, hintHeight: number): ISize;
                protected _doLayout(): void;
                protected _doClick(dom: HTMLElement): boolean;
                private $_prepareColumns;
                private $_prepareGrandTotal;
                /**
                 * 뷰포트에 보이는 셀들만 렌더링한다.
                 */
                private $_renderViewport;
                /**
                 * 다중 행을 span하는 셀의 label이 보이는 영역 안에 표시되도록 오프셋을 갱신한다.
                 */
                private $_updateStickyLabels;
                private $_borrowTotalCell;
                private $_releaseTotalCells;
                private $_borrowValueCell;
                private $_releaseValueCells;
                private $_borrowGrandMeasureCell;
                private $_releaseGrandMeasureCells;
                private $_borrowSeriesCell;
                private $_releaseSeriesCells;
                private $_layoutTotals;
            }

            declare type PivotSection = 'row' | 'column' | 'value' | 'filter';

            /**
             * 피벗 셀 선택 영역 모델.<br/>
             */
            declare class PivotSelection {
                r1: number;
                c1: number;
                r2: number;
                c2: number;
                constructor(r1: number, c1: number, r2: number, c2: number);
                get colCount(): number;
                get rowCount(): number;
                contains(row: number, col: number): boolean;
                containsBounds(r1: number, c1: number, r2: number, c2: number): boolean;
            }

            declare class PivotSelectionManager {
                private observer;
                private _items;
                private _focused;
                private _anchor;
                constructor(observer: IPivotSelectionObserver);
                get count(): number;
                get isEmpty(): boolean;
                get items(): PivotSelection[];
                /**
                 * 첫 번째 선택 영역.<br/>
                 * 여러 영역이 있을 경우 첫 번째 영역만 반환하며, 설정할 때는 하나의 영역으로 설정됨.
                 */
                get selection(): PivotSelection;
                set selection(value: PivotSelection);
                get first(): PivotSelection;
                get last(): PivotSelection;
                get focused(): IPivotBodyCellInfo;
                get(index: number): PivotSelection;
                getLast(dr: number, dc: number): {
                    row: number;
                    col: number;
                };
                extend(row: number, col: number): boolean;
                setFocused(info: IPivotBodyCellInfo, clear?: boolean): this;
                contains(row: number, col: number): boolean;
                containsBounds(r1: number, c1: number, r2: number, c2: number): boolean;
                containsCell(info: IPivotBodyCellInfo): boolean;
                containsRow(row: number, span?: number): boolean;
                containsCol(col: number, span?: number): boolean;
                intersectsRow(row: number, span?: number): boolean;
                intersectsCol(col: number, span?: number): boolean;
                saveAnchor(): {
                    row: number;
                    col: number;
                } | null;
                restoreAnchor(anchor: {
                    row: number;
                    col: number;
                } | null): void;
                add(r1: number, c1: number, r2: number, c2: number, clear?: boolean): PivotSelection;
                addRow(row: number, span?: number, clear?: boolean): PivotSelection;
                addCol(col: number, span?: number, clear?: boolean): PivotSelection;
                remove(selection: PivotSelection): void;
                clear(): void;
                private $_add;
                private $_extend;
            }

            /**
             * 피벗 시리즈 모델.<br/>
             * rowTotal / columnTotal / rowGrandTotal / columnGrandTotal 은 그룹·축의 자식 leaf
             * 값들을 스칼라 1개로 집계해 합성 행/열에 표시하는 layout 메커니즘이다.
             * total 은 measure 수만큼 셀이 정렬되어 grid 구조의 일부가 된다.
             * 반면 스파크라인·히스토그램·박스플롯 같은 시퀀스/분포 시각화는 한 셀에 다중 값을 그래픽으로 표현한다.
             * 동일 level의 소계나 총계가 표시되는 방식과 동일하게 위치를 지정할 수 있다.
             * 또, 소계/총계보다 먼저 표시되거나 그 다음에 표시되도록 할 수 있다.
             * [주의] valueAsRow 모드에 따라 value field 들이 표시되는 축에만 표시된다.
             *       즉, valueAsRow 모드에서는 rowSeries 만 표시되고 columnSeries 는 표시되지 않는다.
             */
            declare class PivotSeries extends PivotItem<PivotSeriesOptions> {
                private _collection;
                static defaults: PivotSeriesOptions;
                private _valueField;
                private _renderer;
                constructor(_collection: PivotSeriesCollection);
                protected _doInit(op: PivotSeriesOptions): void;
                get valueField(): PivotValueField;
                get renderer(): PivotSeriesRenderer;
                get dimension(): string;
                get axis(): PivotAxis;
                get position(): PivotSeriesPosition;
                get order(): PivotSeriesOrder;
                visibleAt(dimension: string): boolean;
                prepareRender(table: PivotTable): void;
                protected _doRecreateChild(prop: string, child: ROptionable, op: any): ROptionable | undefined;
                _optionChanged(tag?: any): void;
            }

            declare class PivotSeriesCollection extends PivotCollection<PivotSeries, PivotSeriesCollectionOptions> { protected _createItem(source?: any): PivotSeries; [key: string]: any; }

            declare interface PivotSeriesCollectionOptions extends RCollectionOptions<PivotSeriesOptions> {
            }

            /**
             * 시리즈 옵션.
             */
            declare interface PivotSeriesOptions extends PivotItemOptions {
                name?: string;
                /**
                 * 소계에 표시되는 시리즈인 경우 해당 시리즈가 속한 그룹의 dimension을 지정한다.<br/>
                 * 예를 들어, column 시리즈에서 dimension이 'country'인 경우, 각 국가별 소계에 시리즈 셀이 표시된다.
                 * dimension을 지정하지 않으면 총계 시리즈 셀이 표시된다.<br/>
                 */
                dimension?: string;
                /**
                 * 표시할 측정값.<br/>
                 * 지정하지 않으면 첫 번째 value 필드의 measure가 사용된다.
                 */
                measure?: string;
                /**
                 * 전체 요약 시리즈 축<br/>.
                 * {@page level}을 지정하지 않으면 전체 요약 시리즈가 되는데 이 경우 전체 요약이 표시되는 축.<br/>
                 * 전체 요약 시리즈가 아닌 경우 이 속성은 무시되고 {@link dimension}이 지정된 그룹의 소계/총계 축이 사용된다.
                 *
                 * @default 'column'
                 */
                axis?: PivotAxis;
                /**
                 * 시리즈 셀 표시 위치.<br/>
                 * `start`로 설정하면 시리즈 셀을 그룹의 첫 번째 위치에 표시하고, `end`로 설정하면 마지막 위치에 표시한다.
                 * `auto`로 설정하면 소계/총계 위치에 표시된다.
                 * {@link dimension}이 지정되지 않은 전체요약인 경우 이 속성은 무시되고, {@link order} 속성으로 시리즈 셀의 위치가 결정된다.
                 *
                 * @default 'auto'
                 */
                position?: PivotSeriesPosition;
                /**
                 * 소계/총계 셀과 시리즈 셀의 표시 순서. `before`로 설정하면 시리즈 셀을 소계/총계보다 먼저 표시하고, `after`로 설정하면 소계/총계 다음에 표시한다.
                 *
                 * @default 'before'
                 */
                order?: PivotSeriesOrder;
                /**
                 * 시리즈 레이블.<br/>
                 */
                label?: string;
                /**
                 * 컬럼 시리즈인 경우 열 너비(px).<br/>
                 *
                 * @default 100
                 */
                width?: number;
                /**
                 * 렌더러 옵션 또는 렌더러 유형.<br/>
                 * 유형 문자열로 지정하면 해당 유형의 렌더러 옵션이 기본값으로 사용된다. 예를 들어,
                 * 'bar'로 지정하면 막대 차트 렌더러가 기본 옵션으로 사용된다.<br/>
                 * 지정하지 않으면 텍스트 렌더러로 표시한다.<br/>
                 *
                 * @default 'text'
                 */
                renderer?: PivotSeriesRendererOptionsType | PivotSeriesRendererType;
            }

            /**
             * {@page position}이 'total'일 때, 시리즈 셀을 소계/총계 기준으로 어느쪽에 표시할 지를 지정하는 옵션.<br/>
             * `before`로 설정하면 시리즈 셀을 소계/총계보다 먼저 표시하고, `after`로 설정하면 소계/총계 다음에 표시한다.
             */
            declare type PivotSeriesOrder = 'before' | 'after';

            /**
             * 시리즈 셀 표시 위치.<br/>
             * `start`로 설정하면 시리즈 셀을 그룹의 첫 번째 위치에 표시하고, `end`로 설정하면 마지막 위치에 표시한다.
             * `total`로 설정하면 소계/총계 위치에 표시된다.<br/>
             */
            declare type PivotSeriesPosition = 'start' | 'end' | 'total';

            declare abstract class PivotSeriesRenderer<OP extends PivotSeriesRendererOptions = PivotSeriesRendererOptions> extends ROptionable<OP> {
                get type(): string;
                prepareRender(): void;
                _optionChanged(tag?: string): void;
            }

            declare interface PivotSeriesRendererOptions extends ROptions {
                type?: string;
            }

            /** @dummy */
            declare type PivotSeriesRendererOptionsType = TextSeriesRendererOptions | SparkBarSeriesRendererOptions | SparkLineSeriesRendererOptions | SparkWinlossSeriesRendererOptions;

            declare type PivotSeriesRendererType = typeof TextSeriesRendererType | typeof SparkBarSeriesRendererType | typeof SparkLineSeriesRendererType | typeof SparkWinlossSeriesRendererType;

            declare type PivotSortDirection = 'asc' | 'desc' | 'none';

            /**
             * 셀 영역을 흐르는(animated) 테두리 상자로 강조하는 transient 요소.<br/>
             *
             * annotation은 옵션에 저장되어 유지되는 반면, spotlight는 옵션 트리에 포함되지 않는
             * 런타임 상태다. 지정 시간(`duration`)이 지나거나 명시적으로 제거되면 사라진다.
             * AI 응답 강조 등 "잠깐 시선을 끄는" 용도에 쓴다.<br/>
             *
             * 좌표(`r1..c2`)는 matrix row/col 인덱스이며, {@link normalize}에서 설정의
             * 차원 값/인덱스로부터 산출한다.
             */
            declare class PivotSpotlight {
                r1: number;
                c1: number;
                r2: number;
                c2: number;
                measure: number;
                readonly source?: any;
                readonly message?: string;
                readonly variant: PivotSpotlightVariant;
                readonly color?: string;
                readonly style?: PivotRangeAppearance;
                readonly duration: number;
                readonly offset?: {
                    x?: number;
                    y?: number;
                };
                /* Excluded from this release type: _timer */
                private _op;
                constructor(op: PivotSpotlightConfig, defaultDuration: number);
                /**
                 * 옵션의 좌표 지정을 matrix row/col 인덱스로 변환한다.<br/>
                 * matrix가 아직 없거나 경로가 해석되지 않으면 좌표는 -1로 남고, view는 이를 무시한다.
                 */
                normalize(table: PivotTable): this;
            }

            /**
             * {@link PivotSpotlightManager.add}에 넘기는 spotlight 설정.<br/>
             * 저장 옵션이 아니라 런타임 호출 인자다. 좌표는 셀 인덱스(number) 또는
             * 차원 값 경로(any[])로 지정할 수 있다.
             */
            declare interface PivotSpotlightConfig {
                source?: any;
                message?: string;
                measure?: number | string;
                row1?: number | any[];
                col1?: number | any[];
                row2?: number | any[];
                col2?: number | any[];
                variant?: PivotSpotlightVariant;
                color?: string;
                style?: PivotRangeAppearance;
                /**
                 * 강조 박스를 셀 영역 기준으로 확대/축소하는 여백(px).<br/>
                 * 각 축 값이 0보다 크면 바깥쪽으로 부풀고(박스 확대), 0보다 작으면 안쪽으로 수축한다.
                 */
                offset?: {
                    x?: number;
                    y?: number;
                };
                duration?: number;
            }

            /**
             * {@link PivotSpotlight}들을 관리하는 transient 매니저.<br/>
             * 옵션 트리에 포함되지 않는 런타임 전용 객체로, PivotTable이 직접 생성/소멸한다.<br/>
             * add/remove/clear로 목록을 조작하며, `duration`이 지정된 spotlight는 타이머로 자동 제거한다.<br/>
             * 목록이 바뀔 때마다 {@link revision}을 올리고 테이블에 변경을 통지해 재렌더를 유발한다.
             */
            declare class PivotSpotlightManager extends RObject {
                private _table;
                private _items;
                private _revision;
                private _defaultDuration;
                private _closed;
                constructor(_table: PivotTable);
                get table(): PivotTable;
                /** 자동 제거 타이머의 기본 지속시간(ms). 0이면 자동 제거하지 않는다. */
                get defaultDuration(): number;
                set defaultDuration(value: number);
                get isEmpty(): boolean;
                get count(): number;
                get items(): readonly PivotSpotlight[];
                /** 목록이 변경될 때마다 증가한다. view가 캐시 무효화 판단에 쓸 수 있다. */
                get revision(): number;
                /**
                 * spotlight를 추가한다.<br/>
                 * `duration`(또는 매니저 `defaultDuration`)이 양수이면 그 시간 뒤 자동 제거된다.
                 */
                add(config: PivotSpotlightConfig): PivotSpotlight;
                /** 특정 spotlight를 제거한다. */
                remove(spotlight: PivotSpotlight): boolean;
                /** 지정한 source로 추가된 spotlight들을 일괄 제거한다. */
                clearSource(source: any): boolean;
                /** 모든 spotlight를 제거한다. */
                clear(): boolean;
                /**
                 * matrix 재구성 시 기존 spotlight 좌표를 다시 계산한다.<br/>
                 * 경로가 더 이상 해석되지 않으면 좌표가 -1이 되어 표시에서 제외된다.
                 */
                reset(): void;
                protected _doDispose(): void;
                private $_arm;
                private $_disarm;
            }

            /** spotlight 테두리 애니메이션 종류. */
            declare type PivotSpotlightVariant = 'flow' | 'aura';

            declare type PivotStarSchemaOptions = {
                type?: 'star';
                name?: string;
                fact?: string;
                dimensions?: DimensionLink[];
            };

            /**
             * serializeState 호출 범위. 두 축으로 크기를 제어한다: 대상(table) × 구획(include).<br/>
             * 크기 제어는 scope(무엇을 담을지)로 하고, format(어떻게 직렬화할지)은 단일 정규형을 유지한다.
             */
            declare interface PivotStateScope {
                /** 대상 테이블 이름. 생략 시 전체 페이지. 객체 참조가 아닌 "이름"으로 주소지정(외부 agent 대칭). */
                table?: string;
                /** 포함할 구획. 생략 시 ['config']. */
                include?: PivotStateSection[];
            }

            /** serializeState가 노출하는 상태 구획(projection 단위). 크기·관심사 분리에 사용. */
            declare type PivotStateSection = 'config' | 'layout' | 'filters' | 'analyses' | 'summary';

            /**
             * book 전체의 정규 읽기 스냅샷.<br/>
             * version은 형상 표준화의 닻이다 — 외부 소비자와의 호환 계약이며, 형상이 바뀌면 올린다.
             */
            declare interface PivotStateSnapshot {
                /** 스키마 버전. 형상 변경 시 증가. */
                version: 1;
                /** 현재 활성 페이지 이름(없으면 null). */
                activeTable: string | null;
                /** scope에 따라 1개(대상 지정) 또는 전체. */
                tables: PivotTableState[];
            }

            declare interface PivotSubtotalOptions extends PivotTotalOptions {
                /**
                 * 그룹 내 데이터 행이 1개뿐인 경우 소계를 표시하지 않을지 여부.<br/>
                 *
                 * @default false
                 */
                collapseSingle?: boolean;
            }

            /**
             * Pivot tab bar model.<br/>
             */
            declare class PivotTabBar extends PivotBookItem<PivotTabBarOptions> {
                static defaults: PivotTabBarOptions;
                private _navigator;
                private _pageList;
                get navigator(): PivotTabNavigator;
                get pageList(): PivotPageList;
                isVisible(): boolean;
                protected _doInit(op: PivotTabBarOptions): void;
            }

            export declare interface PivotTabBarOptions extends PivotBookItemOptions {
                navigator?: PivotTabNavigatorOptions | boolean;
                pageList?: PivotPageListOptions | boolean;
            }

            declare class PivotTabBarView extends PivotBookElement<PivotTabBar> {
                private _navigatorView;
                private _listView;
                private _scrollPrev;
                private _scrollNext;
                private _addButton;
                private _aiButton;
                constructor(doc: Document, owner: IPivotTabBarOwner);
                protected _doInit(doc: Document, initData: IPivotTabBarOwner): void;
                protected _doPrepare(doc: Document, model: PivotTabBar): void;
                private $_updateScrollButtons;
                protected _doMeasure(hintWidth: number, hintHeight: number): ISize;
                protected _doLayout(): void;
                pointerDown(dom: Element, ev: PointerEvent): boolean;
                protected _doClick(dom: HTMLElement): boolean;
                protected _doGetContextMenu(target: Element): PopupMenu | undefined;
            }

            /**
             * Pivot table model.<br/>
             * Represents the structure and data of a pivot table.
             */
            declare class PivotTable<OP extends PivotTableOptions = PivotTableOptions> extends ROptionable<OP> implements IPivotTable, IPivotAnnotationOwner {
                static readonly EMPTY_TEXT = "-";
                private static readonly DATE_LABEL_PROPS;
                protected static defaults: PivotTableOptions;
                private _colorPalette;
                private _events;
                private _rowBar;
                private _columnBar;
                private _columnHeader;
                private _rowHeader;
                private _rowTotal;
                private _columnTotal;
                private _rowGrandTotal;
                private _columnGrandTotal;
                private _series;
                private _annotations;
                private _spotlights;
                private _body;
                private _derived;
                private _data;
                protected _fields: PivotFieldManager;
                private _loadedFields;
                private _aggTable;
                private _matrix;
                private _totals;
                private _analyses;
                private _valuesAsRows;
                private _color;
                private _helper;
                private _columns;
                private _rows;
                /** _columns 에 series 컬럼이 하나라도 있는지. $_buildCells 에서 갱신. */
                private _hasColSeries;
                /** _rows 에 series 행이 하나라도 있는지. $_buildCells 에서 갱신. */
                private _hasRowSeries;
                private _hasSeries;
                private _rowDims;
                private _colDims;
                private _filterDims;
                private _measures;
                private _sortManager;
                private _numFormatter;
                private _percentFormatter;
                private _dateFormatter;
                private _textFormatter;
                private _showAsManager;
                private _rowHeight;
                private _columnWidth;
                private _emptyText;
                private _dateLabels;
                private _loaded;
                private _aggLock;
                private _dataChanged;
                private _renderVersion;
                private _textMeasurer;
                private _needRebuild;
                private _optionsDirty;
                /** fitColumns 등으로 컬럼 폭이 변경되어 body가 모든 셀을 재배치해야 하는지 표시. */
                private _widthsDirty;
                private _requestedFocus;
                constructor();
                protected _doInit(_op: OP): void;
                protected _doDispose(): void;
                annotationAdded(annotation: PivotAnnotation): void;
                annotationRemoved(annotation: PivotAnnotation): void;
                annotationsRemoved(annotations: PivotAnnotation[]): void;
                annotationCleared(): void;
                /**
                 * 행/열 차원 값과 measure 인덱스로 셀 위치(row, col)를 찾는다.<br/>
                 * rowDimension/colDimension은 각각 행/열 차원 레벨 순서의 raw 값 배열이다.<br/>
                 * 값을 지정하지 않거나(undefined) 뒤쪽 레벨이 null이면 해당 깊이의 소계,
                 * 전부 비어있으면 grand total(전체 요약) 위치로 해석한다.<br/>
                 * measure는 measure 배열 내 인덱스이며, valuesAsRows 여부에 따라 행 또는 열에서 좁힌다.<br/>
                 * 행·열 어느 한쪽이라도 매칭에 실패하면 undefined를 반환한다.
                 */
                getCellPos(rowDimension: any[] | undefined, colDimension: any[] | undefined, measure: number): {
                    row: number;
                    col: number;
                } | undefined;
                /** 마지막 non-null 값의 인덱스 + 1. 전부 null/undefined거나 미지정이면 0 (grand total). */
                private $_dimPathDepth;
                /**
                 * 차원 값 배열과 measure로 셀 위치(row, col)를 찾는다.<br/>
                 * dims는 [...행 차원 값, ...열 차원 값] 순서다(앞쪽 rowDims 개수만큼이 행, 나머지가 열).<br/>
                 * 각 레벨 값이 null/미지정이면 해당 축의 소계·총계로 해석된다.<br/>
                 * measure는 이름(string) 또는 인덱스(number). 찾지 못하면 null을 반환한다.
                 */
                locate(dims: any[], measure: string | number): {
                    row: number;
                    col: number;
                } | null;
                /**
                 * dimValues: 각 row dimension level 순서의 raw 값 배열. null = 해당 레벨 무시(grand/sub total).
                 * depth: dimValues에서 마지막 non-null + 1.
                 * measureIdx: -1이면 measure 무관, 0 이상이면 해당 measure만.
                 */
                private $_findInRows;
                /** $_findInRows의 열 버전 */
                private $_findInCols;
                /**
                 * node에서 부모 체인을 따라 올라가며 dimValues[0..depth-1]의 값과 비교.
                 * null인 항목은 비교 생략 (any 매칭).
                 * 각 레벨 값 비교는 {@link $_matchesDimValue}에 위임한다.
                 */
                private $_matchesDimPath;
                /**
                 * 차원 레벨의 raw 값(rawLabel)이 사용자가 지정한 expected와 일치하는지 판단한다.<br/>
                 * 일반 차원은 raw 값 동등 비교만 한다.<br/>
                 * 날짜 분류 차원은 최대한 융통성 있게 다음을 모두 허용한다.<br/>
                 * - raw 값 그대로 (예: month의 '01')<br/>
                 * - 화면 표시 라벨 (예: '1월', '1분기')<br/>
                 * - 숫자 정규화 (예: '1', '01', 1 → 같은 인덱스로 매칭)<br/>
                 */
                private $_matchesDimValue;
                get events(): TableEventAware;
                get isReadOnly(): boolean;
                get isDerived(): boolean;
                get data(): DataCube;
                get helper(): PivotHelper;
                get rowBar(): PivotRowBar;
                get columnBar(): PivotColumnBar;
                get columnHeader(): PivotColumnHeader;
                get rowHeader(): PivotRowHeader;
                get rowTotal(): PivotTotal;
                get columnTotal(): PivotTotal;
                get rowGrandTotal(): PivotGrandTotal;
                get columnGrandTotal(): PivotGrandTotal;
                get series(): PivotSeriesCollection;
                get annotations(): PivotAnnotationManager;
                get spotlights(): PivotSpotlightManager;
                get body(): PivotTableBody;
                get matrix(): PivotMatrix | null;
                get fields(): PivotFieldManager;
                get analyses(): PivotAnalysisManager;
                get loadedFields(): PivotFieldManagerOptions;
                get filterDimensions(): string[];
                get rowDimensions(): string[];
                _internalRowDims(): string[];
                get columnDimensions(): string[];
                _internalColDims(): string[];
                get measures(): string[];
                get hasRowDims(): boolean;
                get hasColDims(): boolean;
                get hasMeasures(): boolean;
                get rowHeight(): number;
                get columnWidth(): number;
                get emptyText(): string;
                get valuesAsRows(): boolean;
                get color(): string;
                get sourceRowCount(): number;
                get filteredSourceRowCount(): number;
                get aggregatedRowCount(): number;
                get filteredAggregatedRowCount(): number;
                get isEmpty(): boolean;
                get colorPalette(): ColorPalette;
                get rowCount(): number;
                get colCount(): number;
                /** 데이터 변경 등으로 셀 layout이 변경될 때 증가하는 렌더 버전. 뷰에서 셀 재렌더링 여부 판단에 사용. */
                get renderVersion(): number;
                /** 데이터 소스나 필드 구성이 변경된 경우 */
                get dataChanged(): boolean;
                setDataChanged(): void;
                get optionsDirty(): boolean;
                /**
                 * 컬럼 폭이 fitColumns 등으로 변경되어 body가 모든 셀을 재배치해야 하는지 여부.
                 * body view가 한 번 소비한 뒤 `clearWidthsDirty()`로 리셋한다.
                 */
                get widthsDirty(): boolean;
                /**
                 * 컬럼 폭이 바뀌어 body가 모든 셀을 다시 layout 해야 함을 표시한다.
                 * 헤더의 `$_resetColWidths` 등 폭 계산 경로에서 호출.
                 */
                markWidthsDirty(): void;
                clearWidthsDirty(): void;
                get numberFormatter(): NumberFormatter;
                get percentFormatter(): NumberFormatter;
                get dateFormatter(): DatetimeFormatter;
                get textFormatter(): TextFormatter;
                /* Excluded from this release type: hasColSeries */
                /* Excluded from this release type: hasRowSeries */
                /* Excluded from this release type: hasSeries */
                getCubeColumn(fieldName: string): ColumnMeta;
                getDimensionLabels(dimension: string): string[];
                isNumericMeasure(measure: string): boolean;
                getDateLabels(dateLevel: string): string[] | undefined;
                /* Excluded from this release type: textMeasurer */
                setTextMeasurer(measurer: ITextMeasurer | null): void;
                load(data: DataCube, op: PivotTableOptions, aggTable?: AggTable): this;
                save(): Partial<PivotTableOptions>;
                /**
                 * 등록된 measurer가 있으면 헤더 컬럼들을 측정해 너비를 갱신한다.<br/>
                 * autoWidth 옵션과 무관하게 강제로 호출된다.
                 * view가 한 번 이상 prepare되어 measurer가 등록된 상태여야 동작한다.
                 *
                 * @param axis `'column'`이면 컬럼 헤더만, `'row'`이면 행 헤더만, 생략하면 둘 다.
                 * @param opts.mode
                 *   - `'normal'` (기본): autoWidthMode 따르고 fast text 측정만 수행. autoWidth 자동 호출의 기본 경로.
                 *   - `'precise'`: 사용자 메뉴/더블클릭용. cell 별 실측 + estimate gate. 대부분 정확.
                 *   - `'exact'`: 모든 대상 cell을 실제 렌더. 가장 정확하지만 가장 비싸.
                 *
                 *   `'normal'` 에서 폭이 잘못 계산될 수 있는 상황:
                 *   - **formatter 콜백이 prefix/suffix/단위 등을 추가**하는 measure는 raw 값만 측정되어 폭이 부족해질 수 있다.
                 *   - **highlight 스타일**(rule.style 의 color/bold/italic 등)에 의한 글리프 폭 변화는 반영되지 않는다.
                 *     (단, grand total 행은 별도 kind로 항상 정확히 측정됨.)
                 *   - **showAs가 콜백 함수**인 경우(문자열 형태는 probe로 추정 가능) 컬럼 분포를 알 수 없어 skip된다.
                 *   - **icon overlay/highlight icon이 동적으로 변경**되는 경우 호출 시점의 옵션만 반영된다.
                 *   이런 상황에서 폭이 맞지 않으면 사용자가 메뉴/더블클릭으로 `mode: 'precise'` 호출을 트리거하도록 한다.
                 * @returns 측정이 수행되었으면 true.
                 */
                fitColumns(axis?: 'column' | 'row', opts?: {
                    mode?: 'normal' | 'precise' | 'exact';
                }): boolean;
                /**
                 * 컬럼 헤더 영역의 특정 컬럼만 측정해 너비를 갱신한다.
                 */
                fitColumnHeaderColumn(col: number, opts?: {
                    mode?: 'normal' | 'precise' | 'exact';
                }): boolean;
                /**
                 * 행 헤더 영역의 특정 컬럼(= dimension level)만 측정해 너비를 갱신한다.
                 */
                fitRowHeaderColumn(col: number, opts?: {
                    mode?: 'normal' | 'precise' | 'exact';
                }): boolean;
                /**
                 * 사용자 지정/자동 계산 모든 컬럼 너비를 초기화한다.
                 */
                clearAllColumnWidths(): void;
                prepareRender(): void;
                afterRender(): void;
                /**
                 * 필드 배치, 피벗 수준 필터링, 정렬 등으로 인해 피벗 테이블이 변경된 경우, 변경된 내용을 반영하기 위해 호출하는 메서드.<br/>
                 */
                private _changeHandler;
                _fireEvent<K extends keyof IPivotTableEvents>(eventName: K, ...args: RestParameters_2<IPivotTableEvents[K]>): void;
                private $_aggregate;
                addValueField(name: string, measure: string, aggregate: PivotAggregationType): PivotValueField;
                addDimensionField(name: string, axis: 'column' | 'row'): PivotDimensionField;
                addFilterField(name: string): PivotFilterField;
                _internalRemoveFilter(field: PivotFilterField): void;
                removeField(field: PivotField): void;
                moveField(field: PivotField, targetSection: PivotSection, index?: number): PivotField | undefined;
                removeFields(fields: PivotField[]): void;
                restoreFields(fields: PivotField[], sections: PivotSection[]): void;
                getFieldSection(field: PivotField): PivotSection;
                isFieldUsed(field: string): boolean;
                getMeasureName(index: number): string;
                getMeasureIndex(name: string): number;
                getAggregate(measure: number | string): string;
                _internalSetAggregate(measure: string, aggregate: PivotAggregationType): boolean;
                setAggregate(measure: string, aggregate: PivotAggregationType): boolean;
                getFallbackSort(axis: 'row' | 'column'): IFallbackFieldSort | null;
                getFallbackSortTarget(axis: 'row' | 'column'): string[] | undefined;
                setFallbackSort(axis: 'row' | 'column', path: string[], dir?: 'asc' | 'desc' | 'none'): void;
                getFieldSort(dimension: string): IPivotFieldSort;
                setFieldSort(dimension: string, sort: IPivotFieldSort | null): void;
                _internalSetFieldSort(dimension: string, sort: IPivotFieldSort | null): void;
                clearAllSorts(): void;
                getDefaultSorts(axis: 'row' | 'column'): {
                    dimension: string;
                    sort: IPivotFieldSort;
                }[];
                getColumnLevel(level: number): PivotLevel;
                getRowLevel(level: number): PivotLevel;
                getChildRows(row: PivotRow): PivotRow[];
                getChildCols(col: PivotColumn): PivotColumn[];
                getRowSiblings(row: PivotRow): PivotRow[];
                getColSiblings(col: PivotColumn): PivotColumn[];
                /**
                 * [주의] row, col은 visible index가 아니라 실제 index이며, 반드시 0 이상이어야 한다.<br>
                 * series 셀(`pcol.type === 's'` 또는 `prow.type === 's'`)은 다루지 않는다. 그런 경우
                 * 호출자가 사전에 필터하거나 {@link _internalSeriesCell}를 사용해야 한다.
                 */
                _internalCell(row: number, col: number): IPivotValueCellInfo;
                /**
                 * Series 셀 정보 생성. pcol 또는 prow의 type이 's' 인 경우에만 유효.
                 */
                _internalSeriesCell(row: number, col: number, precomputedValues?: any[]): IPivotSeriesCellInfo;
                getCell(row: number, col: number): IPivotValueCellInfo | null;
                getBodyCell(row: number, col: number): IPivotBodyCellInfo | null;
                /* Excluded from this release type: _getTotals */
                /* Excluded from this release type: showAsManager */
                getGrandTotalCell(measureIdx: number, isRowTotal: boolean): IPivotValueCellInfo | undefined;
                getDimensionDomain(dim: string, sort?: boolean): any[];
                getRowDimensionAt(level: number): string | null;
                getColumnDimensionAt(level: number): string | null;
                /** total이면 null 반환 */
                getRowDimension(prow: PivotRow): string | null;
                /** total이면 null 반환 */
                getColumnDimension(pcol: PivotColumn): string | null;
                /** total이면 null 반환 */
                getRowDimnensions(cell: IPivotValueCellInfo): string[] | null;
                /** total이면 null 반환 */
                getColumnDimnensions(cell: IPivotValueCellInfo): string[] | null;
                /** total이면 null 반환 */
                getRowDimnensionValues(cell: IPivotBodyCellInfo, total?: any): string[] | null;
                /** total이면 null 반환 */
                getColumnDimnensionValues(cell: IPivotBodyCellInfo, total?: any): string[] | null;
                getSourceRowCount(cell: IPivotBodyCellInfo): number;
                getSourceRowIndices(cell: IPivotBodyCellInfo): number[];
                findCell(dims: [string, any][], measure: string | number): IPivotValueCellInfo | null;
                isColumn(dimension: string): boolean;
                isRow(dimension: string): boolean;
                isLeaf(dimension: string): boolean;
                isExpanded(dim: any, value: any, index?: number): boolean;
                setExpanded(dim: any, value: any, expanded: boolean, index?: number): boolean;
                toggleGroup(dim: any, value: any, index?: number): void;
                getCollapsedGroups(dim: any): any[];
                setExpandedAll(dim: any, expanded: boolean): void;
                expandAll(): void;
                collapseAll(): void;
                getMeasureRange(measure: string): {
                    min: number;
                    max: number;
                };
                canAggFilterField(field: string): boolean;
                isAggFiltered(field: PivotField): boolean;
                protected _hasAggFilter(field: PivotFilterField): boolean;
                getAggFilter(field: PivotFilterField): CubeFilter;
                _internalSetAggFilter(measure: string, values: any[]): void;
                setAggFilter(field: PivotFilterField, values: any[]): void;
                cellsFromSelection(sel: PivotSelection): IPivotBodyCellInfo[][];
                sourceRowsFromSelection(sel: PivotSelection): number[] | null;
                getFieldMenu(field: PivotField): PopupMenu | undefined;
                getHeader(cell: IPivotHeaderCellInfo): PivotHeader;
                requestFocus(pos: IPivotCell, render?: boolean): void;
                getRequestedFocus(): IPivotCell | null;
                protected _doApply(op: OP): void;
                _optionChanged(tag?: any): void;
                protected _createColumnBar(): PivotColumnBar;
                protected _createRowBar(): PivotRowBar;
                _modelChanged(item?: ROptionable, tag?: any): void;
                _itemChanged(item: any, tag?: any): void;
                private $_validate;
                private $_syncTotalPositions;
                private $_buildDateLabels;
                private $_buildCells;
            }

            /**
             * 데이터셀들이 표시되는 피벗 테이블 body model.<br/>
             */
            declare class PivotTableBody extends PivotTableItem<PivotTableBodyOptions> {
                private _crosshair;
                protected _doInit(op: PivotTableBodyOptions): void;
                /**
                 * 교차 선택 모델.
                 */
                get crosshair(): PivotCrosshair;
                prepareRender(): void;
                getCells(row: number, vrow: number): (IPivotValueCellInfo | IPivotSeriesCellInfo | null)[];
                getCellsForVcols(row: number, vrow: number, vcols: number[]): (IPivotValueCellInfo | IPivotSeriesCellInfo | null)[];
            }

            declare interface PivotTableBodyOptions extends PivotTableItemOptions {
                /**
                 * Pivot table의 교차 선택 기본 옵션.<br/>
                 */
                crosshair?: PivotCrosshairOptions | boolean;
                /**
                 * 행 단위 스크롤 허용 여부.<br/>
                 */
                scrollByRow?: boolean;
            }

            declare interface PivotTableDefaultOptions {
                /**
                 * 행 헤더 옵션.<br/>
                 * 행 헤더 레이아웃('grid' | 'flat' | 'tree'), tree 인덴트, 컬럼 너비 등을 설정한다.<br/>
                 * `boolean` 축약형으로 지정하면 행 헤더의 표시 여부만 토글한다.
                 */
                rowHeader?: PivotRowHeaderOptions | boolean;
                /**
                 * 열 헤더 옵션.<br/>
                 * `boolean` 축약형으로 지정하면 열 헤더의 표시 여부만 토글한다.
                 */
                columnHeader?: PivotColumnHeaderOptions | boolean;
                /**
                 * 행 필드바 옵션(행 축에 배치된 차원 필드를 보여주는 바).<br/>
                 * `boolean` 축약형으로 지정하면 행 필드바의 표시 여부만 토글한다.
                 */
                rowBar?: PivotRowBarOptions | boolean;
                /**
                 * 열 필드바 옵션(열 축에 배치된 차원 필드를 보여주는 바).<br/>
                 * `boolean` 축약형으로 지정하면 열 필드바의 표시 여부만 토글한다.
                 */
                columnBar?: PivotColumnBarOptions | boolean;
                /**
                 * 피벗 테이블 데이터 본문(body) 옵션.<br/>
                 * 데이터셀 교차 선택(crosshair), 행 단위 스크롤 등 본문 표시 동작을 설정한다.
                 */
                body?: PivotTableBodyOptions;
            }

            declare class PivotTableDefaults extends ROptionable<PivotTableDefaultOptions> {
                private _book;
                private _rowHeader;
                private _columnHeader;
                private _rowBar;
                private _columnBar;
                private _body;
                constructor(_book: PivotBook);
                protected _doInit(op: PivotTableDefaultOptions): void;
                get rowHeader(): PivotRowHeaderDefaults;
                get columnHeader(): PivotColumnHeaderDefaults;
                get rowBar(): PivotRowBarDefaults;
                get columnBar(): PivotColumnBarDefaults;
                get body(): PivotBodyDefaults;
                _optionChanged(tag?: string | string[]): void;
            }

            declare abstract class PivotTableItem<OP extends PivotTableItemOptions = PivotTableItemOptions> extends PivotItem<OP> {
                private _table;
                constructor(table: IPivotTable);
                /**
                 * Gets the pivot table associated with this item.
                 */
                get table(): PivotTable;
                _optionChanged(tag?: any): void;
            }

            declare interface PivotTableItemOptions extends PivotItemOptions {
            }

            declare interface PivotTableOptions extends ROptions {
                /**
                 * 피벗 테이블에 표시할 row/column/value/filter 필드 설정.<br/>
                 */
                fields: PivotFieldManagerOptions;
                /**
                 * 측정값을 열 대신 행에 표시할지 여부.<br/>
                 *
                 * @default false
                 */
                valuesAsRows?: boolean;
                /**
                 * 명시적 정렬이 설정되지 않은 row 필드들에 적용할 기본 정렬 방식.<br/>
                 * row 필드에 sort가 명시적으로 설정된 경우 해당 설정이 우선한다.
                 */
                rowFallbackSort?: IFallbackFieldSort;
                /**
                 * 명시적 정렬이 설정되지 않은 column 필드들에 적용할 기본 정렬 방식.<br/>
                 * column 필드에 sort가 명시적으로 설정된 경우 해당 설정이 우선한다.
                 */
                columnFallbackSort?: IFallbackFieldSort;
                /**
                 * 분해된 date 필드인 경우 실제 데이터가 없는 레이블 셀을 표시할지 여부.<br/>
                 */
                showEmptyLabels?: boolean;
                /**
                 * row 필드로 추가할 수 있는 필드의 최대 카디널리티(고유값 개수).<br/>
                 * 이 값을 초과하는 카디널리티를 가진 필드는 row에 추가할 수 없다.
                 *
                 * @default 10000
                 */
                maxRowCardinality?: number;
                /**
                 * column 필드로 추가할 수 있는 필드의 최대 카디널리티(고유값 개수).<br/>
                 * 이 값을 초과하는 카디널리티를 가진 필드는 column에 추가할 수 없다.
                 *
                 * @default 1000
                 */
                maxColumnCardinality?: number;
                /**
                 * 피벗 테이블의 최대 셀 개수.<br/>
                 * row와 column의 조합으로 생성되는 셀 개수가 이 값을 초과하면 피벗을 생성하지 않는다.
                 *
                 * @default 100000
                 */
                maxCellCount?: number;
                rowHeader?: PivotRowHeaderOptions | boolean;
                columnHeader?: PivotColumnHeaderOptions | boolean;
                rowBar?: PivotRowBarOptions | boolean;
                columnBar?: PivotColumnBarOptions | boolean;
                rowTotal?: PivotSubtotalOptions | string;
                columnTotal?: PivotSubtotalOptions | string;
                rowGrandTotal?: PivotGrandTotalOptions | string;
                columnGrandTotal?: PivotGrandTotalOptions | string;
                series?: PivotSeriesCollectionOptions | (PivotSeriesOptions | string)[];
                annotations?: PivotAnnotationManagerOptions | PivotAnnotationOptions[];
                body?: PivotTableBodyOptions;
                annotationsStyles?: PivotAnnotationStyle[];
                annotationsx?: (PivotCellAnnotationOptions | PivotRangeAnnotationOptions)[];
                /**
                 * 값 필드가 숫자 형식인 경우에 대체되는 기본 숫자 표시 형식.<br/>
                 */
                numberFormat?: string;
                /**
                 * 값 필드의 표시 형식이 백분율인 경우에 대체되는 기본 백분율 표시 형식.<br/>
                 */
                percentFormat?: string;
                dateFormat?: string;
                textFormat?: string;
                /**
                 * 데이터행 높이(px).
                 *
                 * @default 28
                 */
                rowHeight?: number;
                /**
                 * 기본 열 너비(px).
                 *
                 * @default 64
                 */
                columnWidth?: number;
                /**
                 * 집계 데이터가 없을 때 표시할 텍스트.<br/>
                 *
                 * @default '-'
                 */
                emptyText?: string;
                /**
                 * date 컬럼에서 분해된 반기 dimension 필드의 레이블 배열.<br/>
                 * 지정하지 않으면 locale에 설정된 기본 레이블이 사용된다.<br/>
                 */
                halfLabels?: string[];
                /**
                 * date 컬럼에서 분해된 분기 dimension 필드의 레이블 배열.<br/>
                 * 지정하지 않으면 locale에 설정된 기본 레이블이 사용된다.<br/>
                 */
                quarterLabels?: string[];
                /**
                 * date 컬럼에서 분해된 월 dimension 필드의 레이블 배열.<br/>
                 * 지정하지 않으면 locale에 설정된 기본 레이블이 사용된다.<br/>
                 */
                monthLabels?: string[];
                /**
                 * date 컬럼에서 분해된 주 dimension 필드의 레이블 배열.<br/>
                 * 지정하지 않으면 locale에 설정된 기본 레이블이 사용된다.<br/>
                 */
                weekLabels?: string[];
                /**
                 * date 컬럼에서 분해된 요일 dimension 필드의 레이블 배열.<br/>
                 * 지정하지 않으면 locale에 설정된 기본 레이블이 사용된다.<br/>
                 */
                weekdayLabels?: string[];
                /**
                 * date 컬럼에서 분해된 일 dimension 필드의 레이블 배열.<br/>
                 * 지정하지 않으면 locale에 설정된 기본 레이블이 사용된다.<br/>
                 */
                dayLabels?: string[];
            }

            /** 단일 피봇 페이지의 정규 상태. */
            declare interface PivotTableState {
                /** 페이지(테이블) 이름. 외부 agent의 타깃 주소지정 키. */
                name: string;
                /** 연결된 데이터 큐브 이름(없으면 null). */
                cube: string | null;
                /** include에 'config' 포함 시 page.save() 결과(현재는 통째 운반). */
                config?: any;
                /** [추후] config에서 분리할 행/열/값 필드 배치. */
                layout?: any;
                /** [추후] config에서 분리할 필터 상태. */
                filters?: any;
                /** [추후] 분석(findings) 요약. */
                analyses?: any;
                /** [추후] 경량 개요(필드 수 등) — 풀 config 없이 grounding만 필요할 때. */
                summary?: any;
            }

            declare class PivotTabNavigator extends PivotBookItem<PivotTabNavigatorOptions> {
                constructor(book: IPivotBook);
            }

            export declare interface PivotTabNavigatorOptions extends PivotBookItemOptions {
            }

            declare class PivotTalbleDefaultBase<OP extends PivotTableItemOptions = PivotTableItemOptions> extends ROptionable<OP> {
                protected _book: PivotBook;
                constructor(_book: PivotBook);
                protected _doSetSimple(op: OP, src: any): boolean;
                _optionChanged(tag?: string | string[]): void;
            }

            /**
             * Pivot tooltip model.<br/>
             */
            declare class PivotTooltip extends PivotItem<PivotTooltipOptions> {
                static defaults: PivotTooltipOptions;
                prepareRender(): void;
                protected _doApply(op: PivotTooltipOptions): void;
            }

            declare interface PivotTooltipOptions extends PivotItemOptions {
                /**
                 * 마우스 호버 후 툴팁이 표시되기까지의 지연 시간(밀리초).<br/>
                 *
                 * @default 500
                 */
                delay?: number;
                /**
                 * 툴팁이 표시되는 지속 시간(밀리초).<br/>
                 *
                 * @default 2500
                 */
                duration?: number;
                /**
                 * 길게 표시되는 툴팁이 표시되는 지속 시간(밀리초).<br/>
                 *
                 * @default 10000
                 */
                longDuration?: number;
                /**
                 * 툴팁이 마우스 포인터를 따라다니는지 여부.<br/>
                 *
                 * @default true
                 */
                followPointer?: boolean;
                /**
                 * 툴팁이 마우스 포인터에서 떨어져서 표시되는 오프셋 값([x, y] 형태).<br/>
                 * {@page followPointer}가 true인 경우에만 적용된다.
                 *
                 * @defaultValue \[10, 10\]
                 */
                offset?: [number, number];
            }

            declare abstract class PivotTotal<OP extends PivotTotalOptions = PivotTotalOptions> extends PivotTableItem<OP> {
                static defaults: PivotTotalOptions;
                get label(): string;
                _resolvePos(treeMode: boolean): TotalPosition | false;
                protected _doSetSimple(op: OP, src: any): boolean;
            }

            /**
             * 소계/총계 옵션.
             */
            declare interface PivotTotalOptions extends PivotTableItemOptions {
                /**
                 * @default true
                 */
                visible?: boolean;
                /**
                 * 표시 위치.<br/>
                 * 'start'로 설정하면 소계를 그룹의 첫 번째 위치에 표시하고, 'end'로 설정하면 마지막 위치에 표시한다.
                 *
                 * @default 'start'
                 */
                position?: PivotTotalPosition;
                /**
                 * 표시 레이블.<br/>
                 *
                 * @default '요약'
                 */
                label?: string;
            }

            declare type PivotTotalPosition = 'start' | 'end';

            /**
             * 피벗 매트릭스의 합계 데이터.<br/>
             * 원본 매트릭스와 분리되어 UI에서 자유롭게 배치 가능.<br/>
             * 모든 값 배열은 measures 속성 순서를 따른다.
             */
            declare interface PivotTotals {
                /** 행별 합계: 각 행(leaf)의 모든 열 값 합계 [행][measure] (i64 measure 는 bigint) */
                rowTotals?: any[][];
                /** 열별 합계: 각 열(leaf)의 모든 행 값 합계 [열][measure] (i64 measure 는 bigint) */
                columnTotals?: any[][];
                /** 전체 합계: 모든 셀의 총합 (measures 순서대로; i64 measure 는 bigint) */
                grandTotal?: any[];
            }

            /**
             * Tree 형태의 피벗 행 헤더 뷰.<br/>
             * 모든 차원 레벨을 단일 컬럼에 인덴트로 표시한다.
             * subtotal은 항상 그룹 상단(start)에 배치된다.
             */
            declare class PivotTreeHeaderView extends PivotHeaderView<PivotRowHeader> {
                private _container;
                private _grandView;
                private _fixedGrandTotal;
                private _grandTotalRowCount;
                private _vpR1;
                private _vpR2;
                constructor(doc: Document, owner: IPivotHeaderOwner);
                protected _doInit(doc: Document, initData: any): void;
                /**
                 * 고정 grand total 행을 스크롤에 맞춰 재배치한다.
                 */
                updateFixedGrandTotal(scrollTop: number, clientHeight: number, scrollHeight: number): void;
                /**
                 * 스크롤에 의해 뷰포트가 변경될 때 호출된다.
                 */
                updateViewport(scrollTop: number, clientHeight: number): void;
                getCell(target: Element): PivotRowHeaderCell | undefined;
                getRowInfo(target: Element): TreeRowInfo | undefined;
                protected _doPrepare(doc: Document, model: PivotRowHeader): void;
                protected _doMeasure(hintWidth: number, hintHeight: number): ISize;
                protected _doLayout(): void;
                protected _doClick(_dom: HTMLElement): boolean;
                private $_prepareGrandTotal;
                private $_renderViewport;
                /**
                 * PivotRow 배열을 트리 형태의 flat row 목록으로 변환한다.
                 */
                private $_buildTreeRows;
            }

            declare class PivotValueField extends PivotField<PivotValueFieldOptions> {
                static defaults: Omit<PivotValueFieldOptions, "name">;
                static isPercentage(showAs: string): boolean;
                private _measure;
                private _dataBar;
                private _heatmap;
                private _highlight;
                private _iconOverlay;
                /** {@link resolveOverlay} 결과를 담는 재사용 객체. 호출자는 즉시 소비해야 한다. */
                private _overlayResult;
                /** {@link resolveOverlay}의 `bar` 필드용 재사용 캐시. */
                private _barCache;
                /** icon overlay 결과 캐시. */
                private _iconCache;
                /** {@link resolveHighlight} 결과를 담는 재사용 객체. 호출자는 즉시 소비해야 한다. */
                private _highlightResult;
                private _hasOverlay;
                style?: PivotCellStyle;
                totalStyle?: PivotCellStyle;
                grandStyle?: PivotCellStyle;
                className?: string;
                totalClass?: string;
                grandClass?: string;
                private _showAs;
                /** `options.showAs`에 따라 미리 선택된 값 변환 함수. `undefined`면 raw 값을 그대로 사용 */
                private _showAsResolver?;
                private _numberFormatter?;
                private _dateFormatter?;
                private _textFormatter?;
                private _typeFormatter;
                private _formatter;
                private _formatterStatsOpt;
                private _formatterStats;
                private _statsManager?;
                constructor(table: PivotTable, name: string, measure?: string);
                protected _doInit(op: PivotValueFieldOptions): void;
                get measure(): string;
                get dataName(): string;
                get measureSpc(): string | MeasureAlias;
                get aggregate(): PivotAggregationType;
                get dataBar(): PivotDataBar;
                get heatmap(): PivotHeatmap;
                get highlight(): PivotHighlight;
                get icon(): PivotIconOverlay;
                get hasOverlay(): boolean;
                isPercentage(): boolean;
                /** 셀이 속한 행 그룹 × 모든 열의 합계. */
                rowTotal(cell: IPivotValueCellInfo): number;
                /** 셀이 속한 열 그룹 × 모든 행의 합계. */
                colTotal(cell: IPivotValueCellInfo): number;
                /** 해당 measure의 전체 합계(grand total). */
                grandTotal(measure: number): number;
                /** 셀의 부모 행 그룹 소계 셀(같은 열 위치) 값. */
                parentRowTotal(cell: IPivotValueCellInfo): number | null;
                /** 셀의 부모 열 그룹 소계 셀(같은 행 위치) 값. */
                parentColTotal(cell: IPivotValueCellInfo): number | null;
                /** 임의 위치 (row, col) 셀의 raw 집계 값. (소계/총계 포함) */
                cellValue(row: number, col: number): number | null;
                /**
                 * 같은 부모 그룹 + 같은 measure offset을 가진 leaf 셀들의 (row, col) 위치 배열.
                 * `axis`가 `'row'`면 같은 행에서 열 방향 순회, `'column'`이면 같은 열에서 행 방향 순회.
                 */
                siblingsAlong(cell: IPivotValueCellInfo, axis: ShowAsAxis): SiblingPositions;
                /**
                 * `siblingsAlong`과 비슷하나 leaf가 아닌 같은 type/level + 같은 부모 그룹을 갖는 셀들을 수집한다.
                 * 소계/총계 셀에 대한 누적 계산 등에서 사용한다.
                 */
                levelSiblingsAlong(cell: IPivotValueCellInfo, axis: ShowAsAxis): SiblingPositions;
                /** siblings 배열에서 cell 자신의 인덱스. 없으면 -1. */
                indexOfSelf(sibs: SiblingPositions, cell: IPivotValueCellInfo): number;
                /**
                 * 셀의 dimension 경로에서 `baseField` 축의 라벨을 `baseItem`으로 치환한 셀 값.
                 * `baseItem`은 라벨 값이거나 `'first' | 'last' | 'previous' | 'next'`.
                 */
                baseValue(cell: IPivotValueCellInfo, baseField: string | undefined, baseItem: any): number | null;
                /**
                 * `baseField`로 지정한 dimension 그룹까지의 합계를 반환한다.
                 * `parentPercent` resolver의 분모로 사용되며, 사용자 정의 콜백에서도 활용할 수 있다.
                 */
                parentTotal(cell: IPivotValueCellInfo, baseField: string | undefined): number | null;
                /**
                 * 사용자 formatter 콜백을 거치지 않고 raw value를 type formatter만으로 변환한다.
                 * 컬럼 너비 자동 계산 등 fast path에서 사용한다.
                 */
                formatRawValue(value: any): string;
                /**
                 * 셀 정보로부터 실제 표시 텍스트를 생성한다(formatter / showAs 결과 반영).
                 * `IPivotFormatResult`가 반환되면 `.text`만 추출해 string으로 변환한다.
                 */
                formatCellText(info: IPivotValueCellInfo): string;
                /**
                 * 셀의 raw formatter 결과(rich object 또는 string)를 그대로 반환한다.
                 * 자동 폭 계산 등 className/icon 같은 부수 필드까지 필요할 때 사용.
                 */
                formatCellRich(info: IPivotValueCellInfo): string | IPivotFormatResult;
                /**
                 * formatter 콜백 / showAs / overlay text 영향 없이 컬럼 너비를 정확히 추정할 수 있는지 여부.
                 */
                get hasDeterministicFormat(): boolean;
                /**
                 * formatter 콜백이 등록되어 있는지 여부. true면 표시 텍스트 분포를 raw 값으로 추정할 수 없다.
                 */
                get hasFormatterCallback(): boolean;
                /* Excluded from this release type: showAsResolver */
                /**
                 * `options.showAs`가 문자열(미리 정의된 타입)이면 해당 문자열, 콜백/없음이면 `null`.
                 */
                get showAsKind(): string | null;
                formatText(info: IPivotValueCellInfo): string | IPivotFormatResult;
                /**
                 * 셀에 매칭되는 highlight rule을 평가해 style + className 번들로 반환.
                 * 매칭이 없거나 highlight가 비활성이면 `null`.
                 * 반환 객체는 필드 내부 캐시 참조이므로 호출자는 즉시 소비해야 한다.
                 */
                resolveHighlight(info: IPivotValueCellInfo): ResolvedHighlight | null;
                /**
                 * 셀에 적용할 heatmap/dataBar overlay 번들을 계산한다.
                 * 계산된 `bar` 객체는 필드 내부 캐시와 동일 참조이므로 호출자는 즉시 소비해야 한다.
                 *
                 * `highlight`가 매칭된 경우 그 style의 icon이 PivotIconOverlay보다 우선한다.
                 */
                resolveOverlay(info: IPivotValueCellInfo, highlight?: ResolvedHighlight | null): ResolvedOverlay;
                protected _doApply(op: PivotValueFieldOptions): void;
                prepare(): void;
                /**
                 * 이 필드 셀들의 분포 통계를 조회한다.
                 *
                 * formatter 내부에서 자체 정규화/임계값/랭킹 으로 텍스트를 만들 때 사용한다.
                 * `heatmap`/`dataBar` 등 overlay와 동일 캐시를 공유하며 `prepare()` 이후 언제든 호출 가능.
                 *
                 * 고급 overlay들(`heatmap`/`dataBar`/`iconOverlay`/`highlight`)과 동일한 캐시를 공유하므로
                 * 같은 `(cellScope, compareScope)` 조합이면 추가 순회 비용이 없다.
                 * `prepare()` 이후 언제든 호출 가능.
                 *
                 * @example
                 * ```ts
                 * formatter: (cell) => {
                 *   const s = cell.field.getStats('value', 'row');
                 *   const g = s.groups.get(s.groupKey(cell)) ?? s.all;
                 *   const t = (cell.value - g.min) / (g.max - g.min);
                 *   return `${(t * 100).toFixed(0)}%`;
                 * }
                 * ```
                 *
                 * @param cellScope 기본 `'value'`.
                 * @param compareScope 기본 `'all'`.
                 * @param opts `withSum`/`withSorted` 추가 완료 여부. 기본은 min/max/count만 계산.
                 */
                getStats(cellScope?: CellScope, compareScope?: CompareScope, opts?: {
                    withSum?: boolean;
                    withSorted?: boolean;
                }): ScopedStats;
                /**
                 * 이 필드의 셀 분포 통계 매니저. overlay들이 공유하여 셀 4중 순회를 1회로 줄인다.
                 * 첫 호출 시 lazily 생성한다.
                 */
                get statsManager(): ValueFieldStatsManager;
                _internalSetAggregate(aggregate: PivotAggregationType): boolean;
                /**
                 * highlight 결과로부터 아이콘 정보를 추출. icon 또는 (iconSet+iconIndex)가 있어야 한다.
                 */
                private $_resolveHighlightIcon;
                private $_prepareFormatter;
            }

            declare class PivotValueFieldCollection extends PivotFieldCollection<PivotValueField, PivotValueFieldCollectionOptions> {
                protected _normalizeOptions(source: any): PivotFieldOptions[];
                protected _createItem(source: any): PivotValueField;
                private $_normalizeAggregate;
            }

            declare interface PivotValueFieldCollectionOptions extends PivotFieldCollectionOptions<PivotValueFieldOptions> {
            }

            declare interface PivotValueFieldOptions extends PivotFieldOptions {
                /**
                 * [주의] 최초 생성 후 변경할 수 없다.
                 */
                measure?: string;
                /**
                 * 값 필드의 집계 함수 유형.<br/>
                 * 지정하지 않으면 'sum'으로 집계한다.
                 */
                aggregate?: PivotAggregationType;
                /**
                 * 셀 값 크기에 비례하는 막대를 셀 배경에 표시하는 옵션.<br/>
                 * {@page PivotDataBarOptions} 참조.
                 */
                dataBar?: PivotDataBarOptions;
                /**
                 * 셀 값에 따라 색상을 달리하는 히트맵 옵션.<br/>
                 * {@link PivotHeatmapOptions} 참조.
                 */
                heatmap?: PivotHeatmapOptions;
                /**
                 * 특정 조건에 따라 셀을 강조 표시하는 옵션.<br/>
                 * 예를 들어, 값이 특정 임계값을 초과하는 경우 셀 배경색을 빨간색으로 표시하는 등의 조건부 서식 기능을 제공한다.
                 */
                highlight?: PivotHighlightOptions;
                /**
                 * 셀 값 범위에 따라 자동 N등분된 아이콘을 표시하는 overlay.
                 * 동일 셀에 dataBar가 활성화되어 있으면 dataBar가 우선이며 icon은 무시된다.
                 */
                icon?: PivotIconOverlayOptions;
                /**
                 * 값 필드의 모든 셀에 적용할 CSS 클래스 이름.
                 * 데이터바나 히트맵 등 셀 오버레이 스타일과는 별도로, 셀의 텍스트 스타일 등을 조정하기 위해 사용할 수 있다.
                 * [주의] 데이터바와 background-color 등 셀 스타일을 동시에 적용할 때, 클래스 이름이 셀 오버레이 스타일보다 우선 적용되므로 의도치 않은 스타일 충돌이 발생할 수 있다. 클래스 이름을 사용할 때는 셀 오버레이 스타일과의 조합에 주의해야 한다.
                 */
                className?: string;
                /**
                 * 소계 셀에 추가로 적용할 CSS 클래스 이름.<br/>
                 * 지정하지 않으면 {@page className}이 소계 셀에도 동일하게 적용된다.
                 */
                totalClass?: string;
                /**
                 * 총계 셀에 추가로 적용할 CSS 클래스 이름.<br/>
                 * 지정하지 않으면 {@page className}이 총계 셀에도 동일하게 적용된다.
                 */
                grandTotalClass?: string;
                /**
                 * 값 필드의 자료형이 'number'일 때 숫자 표시 형식.<br/>
                 * 지정하지 않으면 피벗테이블에 설정된 기본 형식을 사용한다.
                 */
                numberFormat?: string;
                /**
                 * 값 필드의 자료형이 'date'일 때 날짜 표시 형식.<br/>
                 * 지정하지 않으면 피벗테이블에 설정된 기본 형식을 사용한다.
                 */
                dateFormat?: string;
                /**
                 * 값 필드의 자료형이 'text'일 때 텍스트 표시 형식.<br/>
                 * 지정하지 않으면 피벗테이블에 설정된 기본 형식을 사용한다.
                 */
                textFormat?: string;
                /**
                 * value 필드인 경우, 집계 값 대신 표시할 대체 텍스트(또는 텍스트+스타일)를 반환하는 콜백.
                 *
                 * 반환값:
                 * - `null` 또는 `undefined`: 콜백 호출이 무시되고 원래 집계 값이 표시된다.
                 * - `string`: 셀에 표시할 대체 텍스트. 문자열에 `${value}` 토큰은 포맷된 셀 값으로 치환된다.
                 * - {@link IPivotFormatResult}: 텍스트와 스타일을 함께 지정하는 객체.
                 *
                 * 예: `{ text: '▲ ${value}', color: 'red', bold: true, align: 'center' }`
                 *   → 빨간색 굵은 글씨로 `'▲ 100'` 중앙 정렬 표시.
                 * 예: `{ text: cell.value, className: 'highlight' }`
                 *   → 셀 값 그대로 표시하되, 클래스 `highlight` 적용.
                 * 예: `{ text: cell.value, color: 'red', bold: true, align: 'center', backgroundColor: '#ffff00' }`
                 *   → 빨간색 굵은 글씨로 중앙 정렬 표시, 배경색은 노란색.
                 *
                 * 콜백 내부에서 분포 기반 표시(자체 정규화/임계값/랭킹 등)가 필요하면
                 * {@link formatterStats}를 지정한다. 지정된 옵션으로 measure 렌더 시작 시 단 한 번
                 * 통계를 계산해 `stats` 인자로 전달하므로, formatter 호출당 추가 비용이 없다.
                 * (지정하지 않으면 `stats`는 `undefined`이고 통계 계산도 일어나지 않는다.)
                 *
                 * 예: 행 단위 min~max 정규화로 백분율 표시
                 * ```ts
                 * {
                 *   formatterStats: { compareScope: 'row' },
                 *   formatter: (cell, stats) => {
                 *     const g = stats!.groups.get(stats!.groupKey(cell)) ?? stats!.all;
                 *     const t = (cell.value - g.min) / (g.max - g.min);
                 *     return `${(t * 100).toFixed(0)}%`;
                 *   }
                 * }
                 * ```
                 *
                 * 예: 전체 상위 10% 셀만 굵게 표시
                 * ```ts
                 * {
                 *   formatterStats: { withSorted: true },
                 *   formatter: (cell, stats) => {
                 *     const sorted = stats!.all.sorted!; // 내림차순
                 *     const threshold = sorted[Math.floor(sorted.length * 0.1)];
                 *     return cell.value >= threshold
                 *       ? { text: cell.value, bold: true }
                 *       : null;
                 *   }
                 * }
                 * ```
                 *
                 * @param cell 집계 값을 포함한 셀 정보.
                 * @param stats {@link formatterStats} 옵션으로 미리 계산된 분포 통계. 미지정 시 `undefined`.
                 */
                formatter?: (cell: IPivotValueCellInfo, stats?: ScopedStats) => string | IPivotFormatResult | null | undefined;
                /**
                 * {@link formatter}에 전달할 분포 통계의 사전 계산 옵션.
                 *
                 * 지정하면 measure 렌더 시작 시 1회만 통계를 산출하여 모든 formatter 호출에 같은 참조를 전달한다.
                 * 지정하지 않으면(`undefined`) 통계 계산은 일어나지 않고 `stats` 인자는 `undefined`.
                 *
                 * {@link formatter}가 설정되어 있지 않으면 이 옵션은 무시된다.
                 *
                 * heatmap/dataBar/iconOverlay/highlight 등 다른 overlay가 같은 measure에 있으면
                 * 통계 계산 자체가 캐시 공유되므로 추가 비용도 없다.
                 */
                formatterStats?: FormatterStatsOptions;
                /**
                 * value 필드의 값 표시 방식.<br/>
                 * 집계 값을 그대로 표시하거나 백분율, 차이, 누적, 순위 등으로 변환하여 표시한다.
                 * 지정하지 않으면 'normal'로 표시한다.
                 *
                 * 빌트인 {@link ValueShowAs} 항목으로 표현이 어려운 경우 콜백 함수를 직접 지정할 수 있다.
                 * 콜백은 raw 집계 값을 가진 `cell`을 받아 변환된 표시값을 반환한다.
                 * 콜백 내부에서 빌트인 showAs와 유사한 계산이 필요하면 `cell.field.model`(= {@link PivotValueFieldModel})에
                 * 노출된 헬퍼 API(`rowTotal`/`colTotal`/`grandTotal`/`parentRowTotal`/`parentColTotal`/
                 * `cellValue`/`siblingsAlong`/`indexOfSelf`/`baseValue`)를 사용할 수 있다.
                 *
                 * @example
                 * // 행 합계 대비 비율을 직접 계산 (rowPercent와 동일)
                 * showAs: (cell) => {
                 *     if (cell.value == null) return null;
                 *     const total = cell.field.model.rowTotal(cell);
                 *     return total ? cell.value / total : null;
                 * }
                 *
                 * @example
                 * // 같은 행에서 첫 셀 대비 차이
                 * showAs: (cell) => {
                 *     const m = cell.field.model;
                 *     const sibs = m.siblingsAlong(cell, 'row');
                 *     if (!sibs.positions.length) return null;
                 *     const first = sibs.positions[0];
                 *     const baseVal = m.cellValue(first.row, first.col);
                 *     return baseVal == null || cell.value == null ? null : cell.value - baseVal;
                 * }
                 */
                showAs?: ValueShowAs | ((cell: IPivotValueCellInfo) => any);
                /**
                 * `showAs`가 `'basePercent' | 'baseDiff' | 'basePercentDiff'`일 때 비교 기준이 되는 dimension 필드명.<br/>
                 * 지정한 필드 축에서 {@link baseItem}으로 지정한 항목의 셀 값을 기준값으로 사용한다.
                 */
                baseField?: string;
                /**
                 * `showAs`가 `'basePercent' | 'baseDiff' | 'basePercentDiff'`일 때 비교 기준이 되는 항목 값 또는 상대 위치.<br/>
                 * - `string | number`: {@link baseField} 축에서 해당 값과 일치하는 항목을 기준으로 사용.
                 * - `'@first'` / `'@last'`: 축의 첫 번째 / 마지막 항목.
                 * - `'@previous'` / `'@next'`: 직전 / 직후 항목.
                 *
                 * 상대 위치 항목은 현재 셀이 속한 부모 그룹 안에서 찾는다(중첩 축에서 그룹 경계를
                 * 넘지 않음). `@previous`/`@next`는 해당 방향으로 이동하며 조합이 실제로 존재하는 가장
                 * 가까운 항목을 기준으로 삼고, 조합 자체가 없는 항목은 건너뛴다. 방향으로 존재하는
                 * 조합이 하나도 없으면 결과는 빈 셀이다. 기준 항목(조합)은 존재하나 그 단면에서 값만
                 * 비어 있으면 기준값을 0으로 간주하여, `'baseDiff'`는 현재값을, `'basePercent'`/
                 * `'basePercentDiff'`는 0 나눗셈으로 빈 셀이 된다.
                 */
                baseItem?: string | number | '@first' | '@last' | '@previous' | '@next';
                /**
                 * `showAs`가 `'diff' | 'percentDiff' | 'running' | 'rank'`일 때 비교/누적/순위 계산의 기준 축.<br/>
                 * Excel의 base field 축 개념과 동일하다. 기준 field가 놓인 축을 가리킨다.<br/>
                 * - `'row'`: 기준 field가 행 축 → 행을 따라(세로) 이동하며 이웃 셀을 비교한다.
                 * - `'column'`: 기준 field가 열 축 → 열을 따라(가로) 이동하며 이웃 셀을 비교한다.
                 *
                 * 같은 부모 그룹 내의 동일 measure 셀들만 형제로 간주한다.
                 *
                 * @default 'row'
                 */
                baseAxis?: ShowAsAxis;
                /**
                 * 값 필드의 모든 셀에 적용할 스타일.<br/>
                 * {@page className}으로 설정된 css 클래스 스타일들보다 우선한다.
                 */
                style?: PivotCellStyle;
                /**
                 * 값 필드의 소계 셀에 추가로 적용할 스타일.<br/>
                 * {@page totalClass}으로 설정된 css 클래스 스타일들보다 우선한다.
                 * 또, {@page styles}로 설정된 스타일보다 우선한다.
                 */
                totalStyle?: PivotCellStyle;
                /**
                 * 값 필드의 총계 셀에 추가로 적용할 스타일.<br/>
                 * {@page grandTotalClass}으로 설정된 css 클래스 스타일들보다 우선한다.
                 * 또, {@page styles}로 설정된 스타일보다 우선한다.
                 */
                grandStyle?: PivotCellStyle;
            }

            /**
             * Pivot view.<br/>
             * - PivotControl에서 사용되는 뷰로, PivotTable 모델과 연동하여 피벗 테이블을 렌더링한다.
             * - columnHeader, rowHeader, body, title 등으로 구성된다.
             * - 모델의 변경 사항에 따라 각 뷰를 업데이트한다.
             * - 스크롤 동기화, 셀 선택 등의 기능을 제공한다.
             */
            declare class PivotView extends UIElement implements IPivotSelectionObserver {
                private _table;
                private _selections;
                private _tableLayer;
                private _emptyView;
                private _columnBarView;
                private _rowBarView;
                private _rowBarFiller;
                private _columnHeaderFiller;
                private _columnHeaderView;
                private _rowHeaderFiller;
                private _rowHeaderView;
                private _treeHeaderView;
                private _bodyView;
                _needReset: boolean;
                private _wheelAxis;
                private _wheelScrollChaining;
                private _sectionViews;
                private _textMeasurer;
                private _wheelHandler;
                private _scrollHandler;
                constructor(doc: Document, model: PivotTable);
                protected _doInit(doc: Document): void;
                onModelChanged(_: TableEventAware, item: ROptionable, tag?: any): void;
                onReset(_: TableEventAware): void;
                onGroupChanged(_: TableEventAware, dim: any, value: any): void;
                onSortChanged(_: TableEventAware, dimension: string, sort: IPivotFieldSort | null): void;
                onFilterChanged(_: TableEventAware, dimension: string, filter: IPivotLabelFilter | IPivotValueFilter | null): void;
                onSelectionAdded(manager: PivotSelectionManager, selection: PivotSelection): void;
                onSelectionRemoved(manager: PivotSelectionManager, selection: PivotSelection): void;
                onSelectionCleared(manager: PivotSelectionManager): void;
                onSelectionChanged(manager: PivotSelectionManager, selection: PivotSelection): void;
                get model(): PivotTable;
                setModel(table: PivotTable): this;
                get columnBarView(): PivotColumnBarView;
                get columnHeaderView(): PivotColumnHeaderView;
                get rowHeaderView(): PivotRowHeaderView;
                get treeHeaderView(): PivotTreeHeaderView;
                get bodyView(): PivotBodyView;
                get rowBarView(): PivotRowBarView;
                get focusedCell(): IPivotBodyCellInfo | undefined;
                set focusedCell(info: IPivotBodyCellInfo | undefined);
                get selections(): PivotSelectionManager;
                get rowCount(): number;
                get colCount(): number;
                setWheelAxisMode(mode: WheelAxisMode, chaining: boolean): this;
                prepare(doc: Document): void;
                measure(width: number, height: number): void;
                layout(w: number, h: number): void;
                afterRender(): void;
                click(element: Element): boolean;
                drillDown(info: IPivotBodyCellInfo): void;
                drillUp(info: IPivotBodyCellInfo): void;
                getPopupMenu(target: Element): PopupMenu | undefined;
                getTooltip(cell: IPivotBodyCellInfo): string;
                protected _registerEvents(): void;
                protected _unregisterEvents(): void;
                private $_getSectionViews;
                /**
                 * 첫 prepare 시점에 한 번 web font가 모두 로드되길 기다렸다가 measurer 캐시를 무효화하고
                 * autoWidth가 켜져 있으면 컬럼을 다시 fit한다.<br/>
                 * 폰트가 lazy 로드되는 환경에서 fallback font 폭으로 측정된 결과를 보정한다.
                 */
                private $_hookFontsReady;
            }

            /**
             * 드롭다운 팝업 메뉴 모델.<br/>
             * 메뉴 항목 구성, 그룹핑, 서브메뉴, 체크리스트 등을 관리한다.<br/>
             */
            declare class PopupMenu<T = any> {
                static create<T>(items: IPopupMenuItem[], events?: PopupMenuEvents): PopupMenu<T>;
                /**
                 * 항목에 hasPopup을 자동 설정한다.<br/>
                 */
                static resolvePopupFlags(items: IPopupMenuItem[], target?: any): void;
                private _context;
                private _items;
                private _events;
                private _default;
                private _offset;
                private _runTarget;
                private constructor();
                /** popup view offset */
                get offset(): number;
                setOffset(value: number): this;
                get items(): IPopupMenuItem[];
                get events(): PopupMenuEvents;
                /** 기본 항목 id (강조 표시) */
                get default(): string | null;
                set default(v: string | null);
                get context(): any;
                get runTarget(): T;
                setItems(items: IPopupMenuItem[]): this;
                setEvents(events: PopupMenuEvents): this;
                getItem(itemId: string): IPopupMenuItem | undefined;
                /**
                 * 항목을 그룹별로 정렬하고 separator를 자동 삽입한다.<br/>
                 * group이 같은 항목끼리 묶이고, 그룹 사이에 separator가 추가된다.<br/>
                 */
                getGroupedItems(): IPopupMenuItem[];
                setChecked(itemId: string, value: boolean): void;
                isCheckListSingleOnly(itemId: string): boolean;
                setCheckListSingleOnly(itemId: string, checked: boolean): void;
                setCheckListValues(itemId: string, values: ICheckListItem[]): void;
                getCheckListValues(itemId: string): ICheckListItem[] | undefined;
                setContext(context: any): this;
                setRunTarget(target: T): this;
                private $_findItemById;
            }

            /**
             * 팝업 메뉴 이벤트 콜백.<br/>
             */
            declare interface PopupMenuEvents {
                /** 메뉴가 표시되기 직전에 호출. 항목을 동적으로 변경할 수 있다. */
                onShow?: (menu: PopupMenu, target: any) => void;
                /** 일반 메뉴 항목 클릭 */
                onSelect?: (doc: Document, item: IPopupMenuItem) => void;
                /** 체크 리스트 '적용' 클릭 */
                onCheckListApply?: (doc: Document, target: any, item: IPopupMenuItem, items: ICheckListItem[], all: boolean) => void;
                /** 메뉴 닫힘 */
                onClose?: (menu: PopupMenu, target: any) => void;
            }

            /**
             * 팝업 메뉴 항목 타입.<br/>
             */
            declare type PopupMenuItemType = 'normal' | 'separator' | 'checklist' | 'header';

            /**
             * 진행률(0~1)을 표시하는 막대형 인디케이터 뷰.<br/>
             * 위쪽에 설명 라벨, 중간에 진행 막대, 아래쪽에 진행률(%)이 배치된다.
             */
            declare class ProgressIndicatorView extends IndicatorView {
                private _label;
                private _bar;
                private _percent;
                private _pos;
                private _max;
                private _showPercent;
                private _formatter;
                constructor(doc: Document);
                get position(): number;
                get max(): number;
                get showPercent(): boolean;
                set showPercent(value: boolean);
                /**
                 * 막대 위에 표시할 설명 텍스트를 설정한다. 빈 문자열이면 라벨은 숨긴다.
                 */
                setText(text: string): this;
                /**
                 * 진행 위치와 최대값을 설정한다.<br/>
                 * 막대는 pos/max 비율로, 아래 라벨은 "pos / max  xx%" 형태로 표시된다.<br/>
                 * pos는 [0, max] 범위로 클램프된다. max가 0 이하이면 막대는 0%로 표시된다.
                 */
                setProgress(pos: number, max: number): this;
                protected _doInit(doc: Document, initData: any): void;
                showIndicator(container: HTMLElement): void;
            }

            /**
             * json, csv 등의 소스 데이터를 원시 형태로 보관하는 데이터 테이블 클래스.<br/>
             */
            declare class RawTable extends DataSource<IRawTableEvents> implements DataFrame {
                private _name;
                private _fieldNames;
                private _valueGetter;
                private _data;
                constructor(data?: any[], options?: JsonLoadOptions);
                get name(): string;
                set name(value: string);
                get fieldNames(): string[];
                get fieldCount(): number;
                get rowCount(): number;
                getFieldName(field: number): string;
                getFieldNames(): string[];
                /**
                 * JSON 데이터 로드.<br/>
                 *
                 * @param json JSON 데이터 객체 또는 배열
                 * @param options 로드 옵션
                 * @returns 자신
                 */
                loadJson(json: any, options?: JsonLoadOptions): this;
                /**
                 * CSV 데이터 로드.<br/>
                 *
                 * @param csv CSV 데이터 문자열
                 * @param options 로드 옵션
                 * @returns 자신
                 */
                loadCsv(csv: string, options?: CsvLoadOptions): this;
                valueAt(row: number, field: number): any;
                getValue(row: number, field: number | string): any;
                getValues(row: number): any;
            }

            /**
             * `OP`에 선언된 키들 중 값 타입이 객체(`ROptions` 계승자)인 키만 추출한다.
             * union에 primitive가 섞여 있어도 객체 멤버가 있으면 허용한다.
             */
            declare type RChildKey<OP> = {
                [K in keyof OP]-?: [RChildOptions<OP[K]>] extends [never] ? never : K;
            }[keyof OP] & string;

            /**
             * primitive/Function/Date 등 비객체 멤버를 모두 제외하고 union에서 객체 타입만 추출한다.
             * 예: `boolean | PivotCrosshairOptions` -> `PivotCrosshairOptions`.
             */
            declare type RChildOptions<T> = Exclude<NonNullable<T>, string | number | boolean | bigint | symbol | Date | Function>;

            /**
             * RCollection은 동일 계열 ROptionable 항목들의 배열을 소유하는 ROptionable 추상 클래스이다.<br/>
             *
             * ## 왜 필요한가
             * AI 등에서 실행 시간에 동적으로 자식 (ROptionable)객체 수나 내용이 변경되는 경우를 JSON 설정만으로 전달하는 방법을 찾기 위함.
             * "단일 level 배열" 옵션은 거의 항상 ROptionable 항목들의 collection이다(예: chart의 `series[]`).
             * 이런 경우를 external hook(`_doLoadProp`/`_doSaveProp`/`_doUpdateProp`)으로 다루면 배열 생성/직렬화/
             * 갱신 로직을 매 클래스가 손으로 구현해야 한다. RCollection은 그 보일러플레이트를 표준화한다.
             *
             * ## 핵심 규약
             *  - **항목 식별 키**: {@link keyProp}로 지정한다. 미지정이면 **인덱스(배열 위치)**가 키다.
             *  - **update = 키 매칭 동기화(merge)**: {@link updateOptions}에 배열을 주면 각 원소를 키로 기존
             *    항목과 매칭해, 매칭된 항목은 **지정한 속성만 갱신**(나머지 보존)한다. 동기화는 set 연산의
             *    **3축**({@link RCollectionUpdateMode})으로 조절한다:
             *      · `addMissing`(기본 true): 매칭 안 된 source 원소를 추가·또는 무시(update-only).
             *      · `removeMissing`(기본 false): source에 없는 기존 항목 삭제·또는 유지.
             *      · `reorder`(기본 false, key 모드): 최종 순서를 source 순서에 맞춤.
             *    기본은 **upsert**(수정+추가, 빠진 건 유지)다. 세 축을 모두 켜도 **목록 구성·순서만** source와
             *    같아질 뿐, 각 항목 내용은 여전히 부분 병합이다("full sync" 아님). 각 축은 source의 `updateMode`
             *    ({@link RCollectionUpdateMode.addMissing}/{@link RCollectionUpdateMode.removeMissing}/
             *    {@link RCollectionUpdateMode.reorder})로 호출마다 지정하거나, 정책 getter override로 기본값을 바꾼다.
             *    살아남는 항목은 항상 merge되어 지정 안 한 속성이 보존된다(base ROptionable의 merge를 배열로 확장).
             *  - **load = 전체 교체**: {@link loadOptions}에 배열을 주면 기존 항목을 모두 버리고 새로 만든다
             *    (항목을 새로 생성하므로 지정 안 한 속성은 default로 초기화된다).
             *  - **save = 배열 직렬화**: {@link saveOptions}는 각 항목을 직렬화한 **배열**을 반환한다(객체 아님).
             *  - **개별 항목 직접 수정**도 가능하다: `collection.itemAt(0)?.updateOptions({ color: 'red' })`.
             *    경로 API도 인덱스로 항목에 도달한다(ROptionable 규약 #4):
             *    `chart.updateAt('series.0.color', 'red')`, `chart.propAt('series.1.color')` 등.
             *
             * ## 사용
             * [중요] RCollection은 **반드시 부모의 `_doInit()` 안에서 `_addChild('name', new XxxCollection())`로 등록**해야 한다.
             *   RCollection은 특별한 클래스가 아니라 그냥 `ROptionable` 자식이다. `_addChild`로 등록되어 부모의
             *   `_children`에 들어가야만 부모의 load/save/update/경로 API가 다형성으로 이 컬렉션에 자동 위임된다
             *   (`parent.loadOptions({ name: [...] })`, `parent.saveOptions(undefined, true)`,
             *   `parent.updateAt('name.0.color', ...)` 등). 등록하지 않으면 부모는 이 컬렉션을 전혀 인지하지 못한다.
             *   그래서 base `ROptionable._doLoad`/`_doSave`에는 RCollection 전용 분기가 필요 없다(자식 처리로 흡수됨).
             * 구체 클래스는 {@link _createItem}으로 항목 인스턴스를 생성하는 팩토리를 구현한다.
             * [전제] 한 컬렉션의 **항목은 모두 동일 클래스**다(동질 컬렉션). 그래서 update로는 항목의 클래스를
             *   바꿀 수 없고(기존 항목에 부분 병합만 함), 타입 자체를 바꿀 일은 없다고 본다.
             * 키 매칭을 쓰려면 {@link keyProp}를 override한다(미지정이면 인덱스 키).
             * ROptionable의 규약대로 {@link _optionChanged}도 구현해야 한다.
             *
             * [AI Hint] 이 옵션 값은 보통 **JSON 배열**이며 각 원소가 항목 하나다. 부모 옵션 안에서는
             * `{ "<collectionKey>": [ { ...item0 }, { ...item1 }, ... ] }` 형태다. 동기화 방식을 바꿔야 할 때는
             * 배열 대신 `{ "items": [ ...항목 ], "updateMode": { ... } }` 객체로 줄 수 있다. 각 항목은
             * `<keyProp>` 속성 값으로 식별된다. 키 설정이 없으면(index 모드) **배열에서의 위치**로 식별하므로,
             * 이때는 원소를 반드시 **기존 항목과 같은 순서로(같은 위치에 같은 항목이 오도록)** 나열해야 한다.
             *  - 적용 방식: 각 원소는 같은 키의 기존 항목과 매칭되어 **거기 적은 속성만** 덮어쓰고, 적지 않은
             *    속성은 그대로 유지된다. 키가 없던 원소는 새 항목으로 추가된다.
             *  - 따라서 한 항목의 일부 속성만 바꾸려면 그 항목의 **키 + 바꿀 속성만** 담으면 된다.
             *      · 기존: `[ { "id":1, "value":"a", "text":"A" }, { "id":2, "value":"b", "text":"B" } ]`
             *      · 입력: `[ { "id":1, "value":"x" } ]`
             *      · 결과: `[ { "id":1, "value":"x", "text":"A" }, { "id":2, "value":"b", "text":"B" } ]`
             *  - 항목 구성을 바꾸려면(추가·삭제·순서) 원하는 **최종 목록 전체**를 나열하고
             *    `{ "items": [...], "updateMode": { "removeMissing": true, "reorder": true } }`처럼 정책을 함께 준다.
             *    그러면 목록에 없는 기존 항목은 제거되고 나열한 순서가 최종 순서가 된다.
             *  - **특정 항목만 삭제**하려면 전체 목록을 나열할 필요 없이 키만 지정한다:
             *    `{ "updateMode": { "remove": [2, 5] } }` → 키 2, 5인 항목만 삭제(index 모드면 그 위치). `items`와
             *    함께 주면 동기화(upsert) 후 이 키들이 삭제된다.
             *  - **비우고 다시 채우기(교체)**는 `{ "items": [...], "updateMode": { "remove": "*" } }` — '*'가 동기화 전에
             *    기존 항목을 모두 비운 뒤 items로 채운다. 부모 update 한 번에서 이 컬렉션만 load처럼 교체할 때 유용하다.
             *
             * @example
             *   class RowCollection extends RCollection<Row> {
             *       protected get keyProp() { return 'id'; }            // 'id'로 항목 매칭(미지정 시 인덱스)
             *       protected _createItem(source: any): Row { return new Row(); }
             *       _optionChanged(): void { ...재렌더... }
             *   }
             *   // [필수] 부모의 _doInit()에서 _addChild로 등록해야 부모 옵션 트리에 편입된다.
             *   //   class Grid extends ROptionable<GridOptions> {
             *   //       rows!: RowCollection;
             *   //       protected override _doInit(op) { this.rows = this._addChild('rows', new RowCollection()); }
             *   //   }
             *   // grid.loadOptions({ rows: [{id:1, value:'a', text:'A'}, {id:2, value:'b', text:'B'}] }); // 전체 설정
             *   // grid.rows.updateOptions([{id:1, value:'x'}]);   // upsert: id=1의 value만 변경(text 유지), id=2 그대로
             *   // grid.rows.updateOptions({ items:[{id:2},{id:1}], updateMode:{ removeMissing:true, reorder:true } }); // 구성·순서 동기화(내용은 부분 병합)
             *   // grid.rows.itemAt(0)?.updateOptions({ text:'Z' }); // 개별 항목 직접 수정
             */
            declare abstract class RCollection<T extends ROptionable = ROptionable, OP extends RCollectionOptions = RCollectionOptions> extends ROptionable<OP> {
                static readonly UPDATE_MODE: RCollectionUpdateMode;
                private _items;
                private _map;
                constructor(mapped?: boolean);
                /**
                 * 항목 인스턴스를 생성하는 팩토리. 아직 `_init`되지 않은 새 인스턴스를 반환해야 한다.
                 * 잘못된 source를 받으면 `undefined`를 반환해 항목을 만들지 않을 수 있다. (항목 생성 실패는 `_optionChanged`를 호출하지 않는다.)
                 * (RCollection이 생성 후 `initAndLoad(source)`로 초기화/로드한다.)
                 * [전제] 항목은 모두 **동일 클래스**이므로 보통 `source`를 보지 않고 `return new Xxx()`만 하면 된다.
                 * (`source`는 항목 옵션 객체로 참고용으로만 전달된다.)
                 */
                protected abstract _createItem(source?: any): T | undefined;
                /**
                 * 항목 식별 키로 쓸 속성명. 미지정(`undefined`)이면 **인덱스(배열 위치)**를 키로 쓴다.
                 * {@link updateOptions}(키 매칭 merge)에서 각 원소를 기존 항목과 매칭하는 기준이다.
                 * 키가 같은 항목이 여럿이면 첫 번째가 매칭된다(키는 유일해야 한다).     *
                 * [주의] 미지정(index 모드)이면 매칭이 **위치 기반**이므로, source `items`의 i번째
                 * 원소가 그대로 i번째 기존 항목에 병합된다. 따라서 **호출하는 쪽이 source 원소를
                 * 기존 항목 순서에 맞춰(같은 위치에 같은 항목이 오도록) 전달할 책임**이 있다. 특정
                 * 항목 하나만 부분 수정하려고 그 항목 하나만 담아 보내면 의도와 다른 앞 항목이 바뀜에
                 * 주의한다(그런 부분 수정은 {@link keyProp}를 지정하거나 경로 API로 한다).     */
                protected get keyProp(): string | undefined;
                /**
                 * {@link updateOptions} 호출에서 `addMissing`을 생략했을 때 쓰는 **지속 기본 정책**.
                 * (호출 시 source의 `updateMode.addMissing`을 주면 그 호출에 한해 이 값을 덮어쓴다 — transient.)
                 *  - `true`(기본): source에 있고 매칭 안 된 원소를 새 항목으로 **추가**(upsert).
                 *  - `false`: 추가하지 않음 — 기존 항목만 수정하고 모르는 키는 무시(update-only).
                 * 외부 입력을 부분 신뢰만 하는 컬렉션이면 `false`로 override한다.
                 */
                protected get addMissingOnUpdate(): boolean;
                /**
                 * {@link updateOptions} 호출에서 `removeMissing`을 생략했을 때 쓰는 **지속 기본 정책**.
                 * (호출 시 source의 `updateMode.removeMissing`을 주면 그 호출에 한해 이 값을 덮어쓴다 — transient.)
                 *  - `false`(기본): source에 없는 기존 항목을 유지(부분 패치에 안전).
                 *  - `true`: source에 없는 기존 항목을 삭제 → 목록 구성이 source와 일치.
                 * [주의] 이건 목록 "구성"만 맞추며 항목 내용은 여전히 부분 병합이다(full sync 아님). 항목 내용까지
                 * 통째 교체하려면 {@link loadOptions}(전체 교체)를 쓴다. 목록이 항상 "전체 목록"을 의미하는
                 * 컬렉션이면 `true`로 override한다(주로 {@link keyProp}가 있는 경우).
                 */
                protected get removeMissingOnUpdate(): boolean;
                /**
                 * {@link updateOptions} 호출에서 `reorder`를 생략했을 때 쓰는 **지속 기본 정책**.
                 * (호출 시 source의 `updateMode.reorder`을 주면 그 호출에 한해 이 값을 덮어쓴다 — transient.)
                 *  - `false`(기본): 매칭된 항목의 기존 위치를 유지하고 새 항목은 끝에 추가.
                 *  - `true`: 동기화 후 최종 순서를 **source 순서**에 맞춤(key 모드에서만 의미, index 모드는 무시).
                 * `removeMissing:true`와 함께 쓰면 목록의 구성과 순서가 source와 같아진다(단, 항목 내용은 여전히 부분 병합).
                 */
                protected get reorderOnUpdate(): boolean;
                /** 항목 개수. */
                get count(): number;
                get isEmpty(): boolean;
                get isSingle(): boolean;
                /** 항목 배열(읽기 전용 복사본). 변경은 add/insert/removeItemAt/clear 또는 update/load로 한다. */
                get items(): T[];
                get first(): T | undefined;
                get last(): T | undefined;
                /**
                 * 항목 배열을 직접 반환한다.<br/>
                 * 읽기/내부 전용, 직접 변형 금지.
                 */
                _internalItems(): readonly T[];
                /** 인덱스로 항목을 반환한다. 범위를 벗어나면 `undefined`. */
                get(index: number): T | undefined;
                getOf(key: any): T | undefined;
                /**
                 * @deprecated use {@link get} instead.
                 * 인덱스로 항목을 반환한다. 범위를 벗어나면 `undefined`.
                 */
                itemAt(index: number): T | undefined;
                /** 항목의 인덱스를 반환한다. 없으면 -1. */
                indexOf(item: T): number;
                indexOfProp(prop: string, value: any): number;
                findIndex(callback: (item: T, index: number, collection: this) => boolean): number;
                contains(item: T): boolean;
                forEach(callback: (item: T, index: number, collection: this) => void): void;
                some(callback: (item: T, index: number, collection: this) => boolean): boolean;
                someProp(prop: string, value: any): boolean;
                find(callback: (item: T, index: number, collection: this) => boolean): T | undefined;
                findProp(prop: string, value: any): T | undefined;
                filter(callback: (item: T, index: number, collection: this) => boolean): T[];
                filterProp(prop: string, value: any): T[];
                map(callback: (item: T, index: number, collection: this) => any): any[];
                /** 끝에 새 항목을 추가하고 반환한다. */
                addSource(source?: any, render?: boolean): T;
                /** `index` 위치에 새 항목을 삽입하고 반환한다. */
                insertSource(source: any, index: number, render?: boolean): T;
                add(item: T, render?: boolean): boolean;
                insert(item: T, index: number, render?: boolean): boolean;
                addAll(items: T[], render?: boolean): number;
                insertAll(items: T[], index: number, render?: boolean): number;
                remove(item: T | string, render?: boolean): T | undefined;
                removeAll(items: (T | string)[], render?: boolean): number;
                /**
                 * `index` 위치의 항목을 제거하고 반환한다(범위 밖이면 `undefined`).
                 * 제거된 항목은 dispose하지 않는다. 소유권이 호출자에게 넘어가므로 필요시 직접 dispose한다.
                 */
                removeAt(index: number, render?: boolean): T | undefined;
                /** 모든 항목을 제거한다. 제거되는 항목들은 dispose된다. */
                clear(render?: boolean): boolean;
                moveTo(item: T, newIndex: number, render?: boolean): boolean;
                replace(oldItem: T, newItem: T, append?: boolean, render?: boolean): boolean;
                protected _doItemInserted(item: T, index: number): void;
                protected _doItemRemoved(item: T, index: number): void;
                protected _doCleared(): void;
                protected _doItemMoved(item: T, oldIndex: number, newIndex: number): void;
                protected _doItemsChanged(items: T[]): void;
                private $_insertItem;
                /**
                 * 각 항목을 직렬화한 **배열**을 반환한다(항상 배열, 객체 아님). `updateMode`는 호출마다 주는
                 * transient 파라미터이므로 인스턴스에 저장되지 않고 직렬화에도 포함되지 않는다.
                 *
                 * 대칭(round-trip): **per-item 필터 없이** 저장한 전체 배열은 {@link loadOptions}에 그대로
                 * 넣으면 원래 상태로 복원된다(`coll.loadOptions(coll.saveOptions())`는 항등). command stack의
                 * undo/redo도 이 성질을 쓴다: `before = parent.saveOptions(delta, true, true, true)`로 변경 전
                 * 스냅샷을 잡는다. `delta`가 컬렉션 키의 **배열**이면 각 원소가 per-item 필터가 되어, 그 항목에서
                 * 지정한 속성만(force면 없는 속성도 `undefined`로) 스냅샷된다. key 모드면 원소를 `keyProp` 값으로
                 * 항목과 매칭해 매칭된 항목만(필터에 든 것만) 스냅샷하고, index 모드면 같은 위치 항목을 스냅샷한다.
                 * undo에서 이 배열을 {@link updateOptions}로 되먹이면 인덱스/키로 매칭되어 변경된 속성이 원복된다. 항목 추가/삭제처럼
                 * 개수가 바뀌는 변경의 undo는 `{ items, updateMode: { removeMissing: true } }`처럼 **그 호출에
                 * removeMissing을 실어** 보내거나 {@link loadOptions}(전체 교체)로 처리한다(updateMode는 transient라
                 * 호출 페이로드에 명시해야 한다).
                 *
                 * `props` 처리:
                 *  - **컬렉션 값-형태**(`{ items:[...], updateMode:{...} }`): `items` 배열을 아래 **배열** 필터로 언랩해
                 *    처리하고 `updateMode`는 무시한다(save에는 동기화 정책이 무의미). `updateOptions`에 준 페이로드를
                 *    그대로 save 필터로 재사용하는 경우(예: undo 스냅샷)를 위해 두 API가 같은 값 문법을 받도록 한 대칭 장치다.
                 *  - **객체**(`{ color:1, ... }`): 모든 항목에 동일하게 적용되는 per-item projection 필터로 전달된다.
                 *  - **배열**(`[ {color:1}, ... ]`): per-item 필터. {@link keyProp}가 있으면(key 모드) 각 필터 원소를
                 *    `keyProp` 값으로 항목과 매칭해 **매칭된 항목만** 그 필터로 저장한다(필터에 없는 항목은 저장 안 됨,
                 *    결과는 필터 순서). 예: 항목 `[{name:'a'},{name:'b'}]`에 `[{name:'b'}]`를 주면 `[{name:'b'}]`만
                 *    저장된다(`updateOptions`의 키 매칭과 대칭). keyProp가 없으면(index 모드) **위치별** 필터로,
                 *    원소 `props[i]`가 항목 `i`의 필터가 되며 배열 길이를 넘는 항목은 필터 없이 전체 저장된다.
                 *    부분 배열은 조회/표시·스냅샷용이다. update/load는 항목을 통째로 교체하므로 부분 배열을 되먹이면
                 *    나머지 속성이 사라진다(부분 수정은 개별 항목을 root로 하는 경로/도구로 한다).
                 *  `recursive`/`includeDefs`/`force`는 각 항목 저장에 그대로 전달된다.
                 *
                 * [키 보장] {@link keyProp}가 있으면 저장 결과 각 항목에 **키 속성값을 항상 포함**한다(필터로
                 * 빠지거나 default와 같아 생략될 값이어도 강제로 채운다). 저장본을 키로 다시 매칭({@link updateOptions})
                 * 할 수 있어야 하기 때문이다.
                 */
                saveOptions(props?: any, recursive?: boolean, includeDefs?: boolean, force?: boolean): any;
                /**
                 * 항목 하나를 저장한다. {@link keyProp}가 있으면 저장 결과에 키 값이 없을 때(필터/ default로 빠진 경우)
                 * 키 값을 강제로 채워 저장본이 항상 키로 매칭 가능하도록 한다.
                 */
                private $_saveItem;
                /**
                 * 컬렉션은 **배열**로 직렬화되므로 base의 `saveTo`처럼
                 * 임의의 객체 `target`에 속성으로 병합하는 의미가 성립하지 않는다. 따라서 `target`을 무시하고
                 * {@link saveOptions}와 **동일한 결과**를 반환한다(두 공개 save 진입점을 일관되게 유지).
                 *
                 * [주의] base의 `saveTo`는 내부적으로 `_doSave`를 호출하는데, RCollection은 save를
                 * `_doSave`(target에 쓰는 hook)가 아니라 `saveOptions`(배열을 반환)에서 처리한다.
                 * (배열은 객체 target에 담을 수 없으므로 _doSave hook으로는 표현 불가.) 이 override가 없으면
                 * `collection.saveTo(t)`가 base `_doSave`로 떨어져 빈 `{}`를 반환하는 비대칭이 생긴다.
                 * 부모가 자식 컬렉션을 저장할 때는 부모의 `_doSave`가 `child.saveOptions(...)`를 호출하므로
                 * 이 경로와 무관하게 정상 동작한다.
                 */
                saveTo(_target: any, props?: any, recursive?: boolean, includeDefs?: boolean, force?: boolean): any;
                /**
                 * source를 **키 매칭 동기화(merge)**로 적용한다(base ROptionable의 부분 merge를 배열로 확장).
                 * source는 배열 `[ ...item ]`이거나 객체 `{ items?: [...], updateMode?: {...} }`다. 그 외면 무시한다.
                 * `updateMode`는 **이 호출에만 적용**되는 transient 정책이고(저장 안 됨), `items`가 있으면 동기화한다.
                 *
                 * 각 원소를 키로 기존 항목과 매칭한다. 키는 {@link keyProp}이며, 미지정이면 **인덱스**다.
                 * (index 모드에선 매칭이 위치 기반이므로 **호출하는 쪽이 source 원소를 기존 항목 순서에 맞춰 전달해야** 한다.)
                 *  - 매칭됨: 그 항목에 `item.updateOptions(원소)`로 병합 → **지정한 속성만 갱신, 나머지 보존**.
                 *  - 매칭 안 됨(새 키/범위 밖 인덱스): `addMissing`이면 새 항목으로 **추가**, 아니면 무시.
                 *  - source에 없는 기존 항목: `removeMissing`이면 **삭제**, 아니면 그대로 둔다.
                 *  - `reorder`이면 동기화 후 최종 순서를 source 순서에 맞춘다(key 모드 한정).
                 *  - `updateMode.remove`로 준 키들은 위 동기화가 끝난 **뒤** 추가로 삭제된다(특정 항목 직접 삭제).
                 *
                 * 동기화 축은 source의 `updateMode`로 주고, 생략한 축은 정책 getter
                 * ({@link addMissingOnUpdate}/{@link removeMissingOnUpdate}/{@link reorderOnUpdate})를 따른다.
                 * 주요 조합은 {@link RCollectionUpdateMode} 참조. 기본은 **upsert**(수정+추가, 빠진 건 유지)로
                 * 현재 항목을 안전하게 보존한다.
                 *
                 * 어느 모드든 살아남는 항목은 merge하므로 지정 안 한 속성은 보존된다(항목을 새로 만드는
                 * {@link loadOptions}(전체 교체, 속성 초기화)와 다른 점이다).
                 */
                updateOptions(source?: any, render?: boolean): this;
                /**
                 * `source`({@link updateOptions}에 줄 값)의 적용을 되돌리는 **역 update 페이로드**를 현재 상태 기준으로
                 * 만든다(ROptionable.invertOptions의 컬렉션 override). redo 적용 **전에** 호출해야 한다.
                 *
                 * key 모드이고 변경이 **내용/추가만**이면 최소 역델타를 만든다:
                 *  - 매칭되는(내용 변경될) 항목 → source가 바꿀 속성만 **현재 값**으로 복원(default였던 것도 force 포함).
                 *  - source에만 있어 **추가될** 항목 → undo시 `updateMode.remove`로 삭제.
                 *
                 * 반면 **삭제/재정렬/`remove:'*'`** 가 개입하거나 **index 모드**면 위치 복원이 최소 델타로는 취약하므로,
                 * 현재 **전체 목록**을 통째로 되돌리는 안전한 역델타(`{ items: 현재전체, updateMode:{ remove:'*', addMissing/removeMissing/reorder } }`)를 만든다.
                 */
                invertOptions(source?: any): RCollectionOptions;
                /**
                 * 항목들을 생성하기 전에 source를 정규화한다.
                 * 기본은 그대로 반환. override로 항목 생성 전 source를 변형할 수 있다.
                 */
                protected _normalizeOptions(items: any): any[];
                protected _doLoad(_op: OP, source: any): void;
                clearOptions(recursive?: boolean, render?: boolean): this;
                /**
                 * 경로 API(`propAt`/`updateAt`/`removeAt`/`getOptionAt`)가 인덱스(`'0'`, `'1'`...)로
                 * 항목에 도달하도록 경로 해석 전용 hook `_resolveChild`만 override한다.
                 * 예: `chart.updateAt('series.0.color', 'red')` → 컬렉션이 `'0.color'`를 받아
                 * head `'0'`을 항목으로 풀고 나머지 `'color'`를 항목에 위임한다.
                 *
                 * [주의] `_findChild`(명명 자식 registry)는 건드리지 않는다. 항목은 등록된 명명 자식이
                 * 아니므로, `getOption`/`removeOption` 등 registry 기반 API의 의미를 오염시키지 않기 위해
                 * 경로 해석 경로(`_resolveChild`)에만 인덱스를 노출한다. 숫자 외엔 super에 위임한다.
                 */
                protected _resolveChild(head: string): ROptionable | undefined;
                protected _doDispose(): void;
                private $_newItem;
                private $_inserted;
                private $_removed;
                /**
                 * source를 `{ items, updateMode }`로 정규화한다. 컬렉션 값은 두 형태를 허용한다:
                 *  - 배열 `[ ...item ]`: items만(가장 흔한 형태, updateMode는 현재 정책 유지).
                 *  - 객체 `{ items?: [...], updateMode?: {...} }`: items와 동기화 정책을 함께.
                 * 그 외 값이면 둘 다 `undefined`.
                 */
                private $_split;
                private $_replaceItems;
                /**
                 * 키 매칭 동기화: 각 source 원소를 키(keyProp 또는 인덱스)로 기존 항목과 매칭한다.
                 *  - 매칭됨 → 그 항목에 merge(지정 속성만 갱신, 나머지 보존).
                 *  - 매칭 안 됨 → `addMissing`이면 새 항목으로 추가, 아니면 무시.
                 *  - source에 없는 기존 항목 → `removeMissing`이면 삭제(목록 구성 동기화), 아니면 유지.
                 *  - `reorder`이면(key 모드) 마지막에 최종 순서를 source 순서에 맞춘다.
                 */
                private $_reconcile;
                /**
                 * key 모드 재정렬: 최종 항목 순서를 source 순서에 맞춘다. source에 대응하는 항목을
                 * source 순서대로 앞에 배치하고, source에 없던 항목(removeMissing=false로 살아남은 것)은
                 * 기존 상대 순서를 유지한 채 뒤에 붙인다.
                 */
                private $_reorderByKey;
                private $_findByKey;
                /**
                 * 지정한 키들에 해당하는 항목을 삭제한다(updateMode.remove 처리).
                 *  - key 모드(keyProp 있음): keyProp 값이 keys에 포함된 항목을 모두 제거.
                 *  - index 모드(keyProp 없음): keys를 배열 위치로 보고 유효한 위치만 제거.
                 * 매칭 안 되는 키는 무시한다.
                 */
                private $_removeKeys;
                private $_clearItems;
            }

            /**
             * 컬렉션 옵션의 객체 형태. 컬렉션 값은 배열 `[ ...item ]`(축약형)이거나 이 객체 형태일 수 있다.
             */
            declare interface RCollectionOptions<T extends ROptions = ROptions> extends ROptions {
                readonly keyProp?: string;
                /** 항목 배열. */
                items?: Partial<T>[];
                /** 이 update 호출에만 적용되는 동기화 정책(transient). 저장/직렬화되지 않으며, 생략한 축은 정책 getter 기본값을 따른다. load 시에는 무시된다. */
                updateMode?: RCollectionUpdateMode;
            }

            /**
             * {@link RCollection}의 키 매칭 동기화(merge) 동작을 조절하는 정책 플래그 집합. set 동기화의 **3축**이다.
             * 컬렉션 값의 객체 형태 `{ items, updateMode }`에 실어 **{@link RCollection.updateOptions} 호출 시점에만**
             * 전달한다(함수 매개변수처럼 **그 호출에만 적용되고 저장/직렬화되지 않는다 — transient**). 지속적인 기본
             * 정책은 정책 getter({@link RCollection.addMissingOnUpdate}/{@link RCollection.removeMissingOnUpdate}/
             * {@link RCollection.reorderOnUpdate}) override로 정한다. 호출에서 생략한 축은 이 getter 기본값(기본 upsert)을
             * 따른다. (load=전체 교체에는 updateMode가 의미 없어 무시된다.)
             *
             * `addMissing` × `removeMissing` 조합 의미:
             *  | addMissing | removeMissing | 의미 |
             *  | --- | --- | --- |
             *  | `true`  | `false` | **upsert**(기본): 수정 + 추가, source에 없는 항목은 유지 |
             *  | `false` | `false` | **update-only**: 기존 항목만 수정, 모르는 키는 무시, 빠진 건 유지 |
             *  | `true`  | `true`  | **구성 동기화**: 추가/삭제로 목록 구성을 source와 일치(항목 내용은 여전히 부분 병합) |
             *  | `false` | `true`  | **intersection prune**: 교집합만 남김(드묾) |
             *
             * [주의] 세 축은 모두 목록의 **구성(추가/삭제)과 순서**만 조절한다. update는 항상 항목을 **부분 병합**하므로,
             * `addMissing`·`removeMissing`이 모두 true여도 각 항목 내용은 지정한 속성만 갱신된다("full sync"가 아니다).
             * 항목 내용까지 source대로 통째 교체(미지정 속성 default 초기화)하려면 {@link RCollection.loadOptions}를 쓴다.
             */
            declare interface RCollectionUpdateMode {
                /** source에 있고 매칭 안 된 원소를 새 항목으로 **추가**할지. 기본 `true`. */
                addMissing?: boolean;
                /** source에 없는 기존 항목을 **삭제**할지. 기본 `false`. `true`면 목록 구성이 source와 일치(단, 항목 내용은 여전히 부분 병합). */
                removeMissing?: boolean;
                /** 동기화 후 최종 순서를 source 순서에 맞춰 **재정렬**할지. 기본 `false`. key 모드에서만 의미(index 모드는 무시). */
                reorder?: boolean;
                /**
                 * **특정 항목만 삭제**할 키 목록(key 모드면 {@link RCollection.keyProp} 값, index 모드면 위치 번호).
                 * `items` 없이 단독으로 줘도 되고(전체 목록 재나열 불필요), `items`와 함께 주면 동기화(upsert) **후** 적용된다.
                 * 매칭 안 되는 키는 무시된다.
                 *
                 * `'*'`는 키 삭제가 아니라 **동기화 전에 현재 항목을 모두 비우는 reset** 플래그다(배열 remove와 적용 시점이 반대).
                 * 단독으로 주면 전체 비우기, `items`와 함께 주면 **비우고 다시 채우기**(이 컬렉션만 load처럼 통째 교체)가 된다.
                 * 부모 update 한 번에서 다른 키는 update로 처리하고 이 컬렉션 키만 load처럼 교체하고 싶을 때 쓴다.
                 * (컬렉션을 직접 전체 교체할 때는 {@link RCollection.loadOptions}도 가능.)
                 */
                remove?: any[] | '*';
            }

            /**
             * Control base class.<br/>
             * Provides basic functionality for rendering and event handling.
             */
            declare abstract class RControl<TEvents extends IControlEvents = IControlEvents> extends REventAware<TEvents> {
                private _container;
                protected _dom: HTMLDivElement;
                protected _windowResizeHandler: (ev: Event) => void;
                private _domResizeHandler;
                private _inited;
                private _dirty;
                private _requestTimer;
                private _defaultTool;
                private _tool;
                private _activeTool;
                private _resizeObserver;
                loaded: boolean;
                private _saveDisplay;
                private _wSave;
                private _hSave;
                private _resizeTimer;
                private _resizeDelay;
                private _wScrollBar;
                private _hScrollBar;
                _scrolling: boolean;
                constructor(doc: Document, container: string | HTMLDivElement, className: string);
                protected _doDispose(): void;
                get isInited(): boolean;
                get doc(): Document;
                get win(): Window | undefined;
                get dom(): HTMLElement;
                get width(): number;
                set width(value: number);
                get height(): number;
                set height(value: number);
                get visible(): boolean;
                set visible(value: boolean);
                get activeTool(): IControlTool;
                set activeTool(value: IControlTool);
                focus(): this;
                hideTooltip(): void;
                invalidate(force?: boolean): void;
                refresh(): void;
                getBound(): Rectangle;
                pointerToPoint(event: PointerEvent): IPoint;
                getHtml(): string;
                containes(element: Node): boolean;
                setCursor(cursor?: string): void;
                controlToLocal(dom: HTMLElement, x: number, y: number): IPoint;
                localToControl(dom: HTMLElement, x: number, y: number): IPoint;
                getScrollBarSize(): {
                    width: number;
                    height: number;
                };
                setCssData(data: string, value: any): void;
                protected _initControl(doc: Document, container: string | HTMLDivElement, className: string): HTMLDivElement;
                protected abstract _createDefaultTool(): IControlTool;
                protected _needScrollBar(): boolean;
                protected _domResized(ev: Event): void;
                private $_addListener;
                protected _registerEventHandlers(dom: HTMLDivElement): void;
                protected _unregisterEventHandlers(dom: HTMLDivElement): void;
                private $_requestRender;
                protected abstract _render(): void;
                private $_isVisible;
                private $_render;
                protected _doLoaded(): void;
                protected _doRendered(): void;
                private $_measureScrollBarSize;
                protected _doClick(event: PointerEvent): void;
                protected _doDblClick(event: PointerEvent): void;
                protected _doTouchStart(event: TouchEvent): void;
                protected _doTouchMove(event: TouchEvent): boolean;
                protected _doTouchEnd(event: TouchEvent): void;
                protected _doPointerDown(event: PointerEvent): boolean;
                protected _doPointerMove(event: PointerEvent): void;
                protected _doPointerUp(event: PointerEvent): void;
                protected _doPointerOver(event: PointerEvent): void;
                protected _doPointerCancel(event: PointerEvent): void;
                protected _doPointerEnter(event: PointerEvent): void;
                protected _doPointerLeave(event: PointerEvent): void;
                protected _doKeyDown(event: KeyboardEvent): void;
                protected _doKeyUp(event: KeyboardEvent): void;
                protected _doKeyPress(event: KeyboardEvent): void;
                protected _doWheel(event: WheelEvent): void;
                protected _doContextMenu(event: MouseEvent): void;
                private $_isFocusableTarget;
                private _clickHandler;
                private _dblClickHandler;
                private _touchStartHandler;
                private _touchMoveHandler;
                private _touchEndHandler;
                private _pointerDownHandler;
                private _pointerMoveHandler;
                private _pointerUpHandler;
                private _pointerOverHandler;
                private _pointerCancelHandler;
                private _pointerEnterHandler;
                private _pointerLeaveHandler;
                private _keyDownHandler;
                private _keyUpHandler;
                private _keyPressHandler;
                private _wheelHandler;
                private _contextMenuHandler;
            }

            /**
             * 모든 도구에 공통으로 추가되는 예약 파라미터(reason)의 정의.<br/>
             * 내부 스키마 변환과 외부 agent용 도구 export가 동일한 정의를 공유하도록 여기 둔다.
             */
            export declare const REASON_PARAMETER: AICommandParameter;

            declare class Rectangle {
                x: number;
                y: number;
                width: number;
                height: number;
                static readonly Empty: Rectangle;
                static Temp: Rectangle;
                static create(x: any, y?: number, width?: number, height?: number): Rectangle;
                constructor(x?: number, y?: number, width?: number, height?: number);
                /** left */
                get left(): number;
                set left(value: number);
                /** right */
                get right(): number;
                set right(value: number);
                /** top */
                get top(): number;
                set top(value: number);
                /** bottom */
                get bottom(): number;
                set bottom(value: number);
                /** isEmpty */
                get isEmpty(): boolean;
                get isValid(): boolean;
                clone(): Rectangle;
                getInner(): Rectangle;
                equals(r: Rectangle): boolean;
                leftBy(delta: number): Rectangle;
                rightBy(delta: number): Rectangle;
                topBy(delta: number): Rectangle;
                bottomBy(delta: number): Rectangle;
                shrink(dx: number, dy: number): Rectangle;
                expand(dx: number, dy: number): Rectangle;
                contains(x: number, y: number): boolean;
                setEmpty(): Rectangle;
                move(x?: number, y?: number): Rectangle;
                set(x: number, y: number, width: number, height: number): Rectangle;
                setWidth(value: number): Rectangle;
                copy(r: Rectangle): Rectangle;
                copyHorz(r: Rectangle): Rectangle;
                copyVert(r: Rectangle): Rectangle;
                inflate(left?: number, top?: number, right?: number, bottom?: number): Rectangle;
                offset(dx: number, dy: number): Rectangle;
                round(): Rectangle;
                union(r: Rectangle): Rectangle;
                normalize(): Rectangle;
            }

            /**
             * Fact row로부터 특정 Dimension alias까지 도달하기 위한 chain의 한 단계.<br/>
             * snowflake 모델에서 다단계 link를 따라가는 경로를 표현한다.<br/>
             */
            declare type ResolutionStep = {
                /** 이 단계의 dimension alias */
                alias: string;
                /** FK 값을 읽어올 소스 테이블 (이전 단계 dim 또는 fact) */
                sourceTable: DataFrame;
                /** sourceTable에서 FK 컬럼의 인덱스 */
                fkColIndex: number;
                /** 이 alias의 PK(=value) → rowIndex 맵 */
                pkIndex: Map<any, number>;
                /** 이 단계의 dimension 테이블 (다음 단계의 sourceTable이 되거나 최종 값 추출 대상) */
                targetTable: DataFrame;
            };

            /**
             * 셀에 적용될 highlight 스타일 번들. style 한번, className 하나로 평면화.
             */
            declare interface ResolvedHighlight extends PivotCellStyle {
                className?: string;
            }

            /**
             * 셀 렌더링에 사용되는 아이콘 정보.
             */
            declare interface ResolvedIcon {
                /** 아이콘 이름 (등록된 이름). */
                name: string;
                /** 아이콘 색상. 지정 안하면 셀의 텍스트 색상을 따른다 (colorable일 때만 의미). */
                color: string;
                /** 아이콘 배치. */
                placement: IconPlacement;
                /** 아이콘 크기(px). 0이면 기본값(CSS) 적용. */
                size: number;
                /** 아이콘과 텍스트 사이 간격(px). 0이면 간격 없음. iconOnly 또는 start/end 배치에서는 무시된다. */
                gap: number;
                /** true면 값 텍스트를 숨기고 아이콘만 표시. */
                hideText: boolean;
            }

            /**
             * 셀에 적용할 heatmap/dataBar 시각적 overlay 결과.
             * - `cellBg`: 셀 dom 배경 (heatmap).
             * - `spanBg`: (deprecated) 사용 안 함. 호환을 위해 인터페이스만 유지. 항상 빈 문자열.
             * - `bar`: dataBar 막대. border 유무와 무관하게 별도 div로 렌더링.
             * - `hideText`: dataBar `barOnly` / icon `iconOnly` 옵션으로 값 텍스트 숨김 여부.
             * - `icon`: 아이콘 overlay 결과. 없으면 null.
             */
            declare interface ResolvedOverlay {
                cellBg: string;
                spanBg: string;
                bar: {
                    leftPct: number;
                    widthPct: number;
                    heightPct: number;
                    background: string;
                    border: string;
                } | null;
                hideText: boolean;
                icon: ResolvedIcon | null;
            }

            /**
             * 함수의 첫 번째 파라미터를 제외한 나머지 파라미터들의 타입.<br/>
             */
            declare type RestParameters<T> = T extends (first: any, ...rest: infer R) => any ? R : never;

            declare type RestParameters_2<T> = T extends (first: any, ...rest: infer R) => any ? R : never;

            /**
             * 멀티캐스팅 이벤트 디스패처 객체.<br/>
             * 여러 리스너를 등록하고 이벤트 발생 시 모든 리스너의 해당 메서드를 호출한다.
             *
             * @template TListener 리스너 인터페이스 타입. 각 이벤트에 해당하는 선택적 메서드를 정의한다.
             *
             * @example
             * ```js
             * // TypeScript에서 리스너 인터페이스 정의
             * interface MyListener {
             *     onDataChanged?(source: MyClass, data: any): void;
             *     onError?(source: MyClass, error: Error): void;
             * }
             *
             * class MyClass extends REventAware<MyListener> {
             *     doSomething() {
             *         this._fireEvent('onDataChanged', someData);
             *     }
             * }
             * ```
             */
            declare abstract class REventAware<TListener = any> extends RObject {
                private _listeners;
                private _eventLock;
                private _internalListener;
                private _eventHandlers;
                constructor();
                /**
                 * 등록된 리스너 개수를 반환한다.<br/>
                 *
                 * @returns 리스너 개수
                 */
                get listenerCount(): number;
                /**
                 * 이벤트 리스너를 추가한다.<br/>
                 *
                 * @param listener 이벤트 리스너
                 */
                addListener(listener: TListener): void;
                /**
                 * 이벤트 리스너를 제거한다.<br/>
                 *
                 * @param listener 이벤트 리스너
                 * @returns 제거 성공 여부
                 */
                removeListener(listener: TListener): boolean;
                /**
                 * 모든 이벤트 리스너를 제거한다.<br/>
                 */
                clearListeners(): void;
                /**
                 * 특정 이벤트에 핸들러를 등록한다.<br/>
                 * addEventListener()보다 간편한 방식으로 개별 이벤트 핸들러를 등록할 수 있다.
                 *
                 * @param eventName 이벤트 이름
                 * @param handler 이벤트 핸들러 함수
                 *
                 * @example
                 * ```js
                 * table.on('onRowUpdated', (sender, row, oldValues) => {
                 *     console.log('Row updated:', row);
                 * });
                 * ```
                 */
                on<K extends keyof TListener>(eventName: K, handler: TListener[K]): void;
                /**
                 * 특정 이벤트에서 핸들러를 제거한다.<br/>
                 *
                 * @param eventName 이벤트 이름
                 * @param handler 제거할 이벤트 핸들러 함수
                 * @returns 제거 성공 여부
                 *
                 * @example
                 * ```js
                 * const handler = (sender, row) => console.log(row);
                 * table.on('onRowUpdated', handler);
                 * table.off('onRowUpdated', handler);
                 * ```
                 */
                off<K extends keyof TListener>(eventName: K, handler: TListener[K]): boolean;
                /**
                 * 이벤트 발생을 일시적으로 중단한다.<br/>
                 * beginUpdate()와 endUpdate()는 중첩 호출을 지원한다.
                 * endUpdate() 호출 횟수가 beginUpdate() 호출 횟수와 같아지면 이벤트 발생이 재개된다.
                 *
                 * **중요**: 예외 발생 시에도 endUpdate()가 반드시 호출되도록 try-finally 패턴을 사용해야 한다.
                 *
                 * @example
                 * ```js
                 * table.beginUpdate();
                 * try {
                 *     table.setValue(0, 0, 'value1');
                 *     table.setValue(0, 1, 'value2');
                 *     table.updateRow(1, ['a', 'b', 'c']);
                 *     // ... 여러 작업들
                 * } finally {
                 *     table.endUpdate();
                 * }
                 * ```
                 */
                beginUpdate(): void;
                /**
                 * 이벤트 발생을 재개한다.<br/>
                 * beginUpdate() 호출 횟수만큼 endUpdate()를 호출해야 이벤트 발생이 재개된다.
                 *
                 * **중요**: try-finally 블록의 finally에서 호출하여 예외 발생 시에도 실행되도록 해야 한다.
                 */
                endUpdate(): void;
                /**
                 * 현재 이벤트 발생이 중단된 상태인지 확인한다.<br/>
                 *
                 * @returns 이벤트 발생이 중단된 상태이면 true, 그렇지 않으면 false
                 */
                isUpdating(): boolean;
                /**
                 * 이벤트 락 카운터를 강제로 0으로 리셋한다.<br/>
                 *
                 * **경고**: 이 메서드는 예외 처리 누락 등으로 인해 이벤트 락이 영구적으로 걸린 경우에만 사용해야 한다.
                 * 정상적인 흐름에서는 beginUpdate()/endUpdate()를 올바르게 사용해야 한다.
                 *
                 * @example
                 * ```js
                 * // 디버깅이나 에러 복구 시
                 * if (table.isUpdating()) {
                 *     console.warn('Event lock is stuck, resetting...');
                 *     table.resetUpdate();
                 * }
                 * ```
                 */
                resetUpdate(): void;
                private $_createInternalListener;
                /**
                 * 등록된 리스너들의 특정 이벤트 메서드를 호출한다.<br/>
                 * 리스너가 해당 메서드를 구현하지 않은 경우 무시된다.
                 * beginUpdate() 호출 후에는 이벤트가 발생하지 않는다.
                 *
                 * @param eventName 호출할 이벤트 메서드 이름
                 * @param args 이벤트 메서드에 전달할 인자들 (첫 번째 파라미터 this는 자동으로 추가됨)
                 */
                protected _fireEvent<K extends keyof TListener>(eventName: K, ...args: RestParameters<TListener[K]>): void;
                /**
                 * 등록된 리스너들의 특정 확인 이벤트 메서드를 호출한다.<br/>
                 * 리스너 중 하나라도 명시적 false를 반환하면 즉시 중단하고 false를 반환한다.
                 * 모든 리스너가 true를 반환하거나 구현하지 않은 경우 true를 반환한다.
                 * beginUpdate() 호출 후에도 확인 이벤트는 발생한다.
                 *
                 * @param eventName 호출할 이벤트 메서드 이름
                 * @param args 이벤트 메서드에 전달할 인자들 (첫 번째 파라미터 this는 자동으로 추가됨)
                 * @returns 모든 리스너가 승인(true 또는 undefined)하면 true, 하나라도 거부(false)하면 false
                 */
                protected _fireConfirmEvent<K extends keyof TListener>(eventName: K, ...args: RestParameters<TListener[K]>): boolean;
                /**
                 * 등록된 리스너들의 비동기 이벤트 메서드를 호출한다.<br/>
                 * 모든 핸들러를 병렬로 실행하고 모두 완료될 때까지 대기한다.
                 * beginUpdate() 호출 후에는 이벤트가 발생하지 않는다.
                 *
                 * @param eventName 호출할 이벤트 메서드 이름
                 * @param args 이벤트 메서드에 전달할 인자들 (첫 번째 파라미터 this는 자동으로 추가됨)
                 * @returns 모든 핸들러가 완료되면 resolve되는 Promise
                 */
                protected _fireEventAsync<K extends keyof TListener>(eventName: K, ...args: RestParameters<TListener[K]>): Promise<void>;
                /**
                 * 등록된 리스너들의 비동기 확인 이벤트 메서드를 호출한다.<br/>
                 * 모든 핸들러를 순차적으로 실행하며, 하나라도 false를 반환하면 즉시 중단한다.
                 * beginUpdate() 호출 후에도 확인 이벤트는 발생한다.
                 *
                 * @param eventName 호출할 이벤트 메서드 이름
                 * @param args 이벤트 메서드에 전달할 인자들 (첫 번째 파라미터 this는 자동으로 추가됨)
                 * @returns 모든 리스너가 승인하면 true, 하나라도 거부하면 false
                 */
                protected _fireConfirmEventAsync<K extends keyof TListener>(eventName: K, ...args: RestParameters<TListener[K]>): Promise<boolean>;
            }

            /**
             * 기본 오류 처리를 제공하는 베이스 객체.<br/>
             */
            declare class RObject {
                private _hash;
                private _disposed;
                private _disposing;
                /**
                 * 객체를 해제하고 null을 반환한다.<br/>
                 * 사용 예: `this._obj = this._obj.dispose();`
                 *
                 * @returns null
                 */
                dispose(): null;
                protected _doDispose(): void;
                get hash(): number;
                get shash(): string;
                get disposing(): boolean;
                get orphaned(): boolean;
                protected _throwError(message: string): never;
            }

            declare class RootElement extends UIElement {
                private _container;
                constructor(doc: Document, container: UIControl);
                get container(): UIControl;
            }

            /**
             * ROptionable은 모델 설정(options)을 관리하는 객체의 기본 클래스이다.<br/>
             *
             * ## 왜 필요한가
             * 차트/디자이너/리포트 같은 도구는 수많은 모델 객체가 각자 수십~수백 개의 설정 값을 가진다.
             * 단순히 인스턴스 필드/생성자 인자로 관리하면 다음과 같은 문제가 반복된다.
             *  - 객체마다 모든 기본값이 메모리에 복사되어 낭비됨.
             *  - 직렬화 시 "사용자가 명시적으로 지정한 값"과 "기본값"을 구분할 수 없어 출력이 비대해지고
             *    버전 호환성(기본값 변경 시 기존 저장본의 의미 보존)이 깨짐.
             *  - 옵션 변경 → 재계산/재렌더 알림 → 자식 모델로 위임 → 경로 기반 접근(`axis.x.color`)
             *    같은 공통 패턴을 매 클래스가 따로 구현해 일관성이 없어짐.
             *
             *
             * ROptionable은 이 패턴들을 한곳에 모아 표준화한다.
             *
             * ## 핵심 규약
             * 1. **기본값은 클래스에 정적으로**, 인스턴스에는 변경분(delta)만 보관한다.
             *    `_op`에는 명시적으로 설정된 값들만 own property로 존재한다.
             *    옵션 값을 읽을 때는 `_op` 직접 접근 대신 {@link prop} / {@link props} / {@link num}을 사용한다.
             *    [주의] 클래스 기본값은 정적으로 정의되면 실행 시간에 변경해서는 안 된다(SSOT).
             * 2. **직렬화는 minimal delta**. 명시적으로 설정된 값들 중 기본값과 다른 값들만 저장된다.
             *    `includeDefs`/`props` 필터로 정책을 조절할 수 있다.
             * 3. **자식 모델은 `_addChild`로 등록**한다. 자식의 옵션은 자식 인스턴스가 직접 보유하며
             *    부모의 `_op`에는 마운팅되지 않는다(`_children`이 부모/자식 관계의 유일한 권위 source).
             *    직렬화/로드 시점에만 트리 형태로 합성/분해된다.
             *    동적 컴렉션 자식(예: chart의 `series[]`)은 {@link RCollection}으로 구현한다.
             * 4. **경로 기반 접근**: `propAt('axis.x.color')`, `updateAt('series.0.color', 'red')` 등
             *    dot path API가 자식/컬렉션을 자동으로 따라간다(`_resolvePath`).
             * 5. **변경 알림 hook**: 모든 mutator는 `_doApply(op)` → `_optionChanged(tag)` 순서로 통지한다.
             *    파생 클래스가 캐시 갱신/재렌더를 일관되게 트리거할 수 있다.
             * 6. **field와의 분리**: 빈번히 사용되거나 파생 계산이 필요한 값은 field로 캐시할 수 있다.
             *    이 경우 옵션 변경 시점(`_doApply()`)에 field를 갱신한다.
             * [주의] _doLoadProp/_doSaveProp/_doUpdateProp hook은 언제나 3쌍이 같이 구현되어야 한다. 하나만 구현하면 직렬화/로드/업데이트 중 일부가 누락된다.
             가능하면 이 함수들이 필요없도록 설계하는 것이 좋다. (즉, 외부 상태를 직접 관리하지 않고, 단순히 `_op`에 기록되도록 설계.)
             * [주의] external은 "옵션 모델 바깥에 사는 값"을 위한 escape hatch이다.
             *   - 적합한 경우: 단일 level의 배열/blob, 또는 다른 서브시스템이 소유하는 비-ROptionable 값(옵션은 직렬화 뷰일 뿐).
             *     이런 단일 level external은 배열/값 전체를 단위로 save/load/update 한다(부분 병합 없음).
             *   - 계층(중첩 객체) 구조는 external 대신 ROptionable 자식으로 구현해 `_children`에 포함시키는 것이 정석이다.
             *     자식으로 만들면 부분 병합(`{ fields: { rows: [] } }`만 주면 `cols`는 유지), 경로 접근, minimal-delta 직렬화,
             *     변경 알림이 모두 자동 처리된다. external로 계층을 다루면 이 병합 로직을 `_doUpdateProp`에서 직접 구현해야 한다.
             *
             * ## 얻는 것
             *  - 메모리: 인스턴스당 "변경된 값"만 보관 → 대량 모델에서 절약 큼.
             *  - 직렬화: 사용자 의도(=delta)만 출력 → 파일 크기/diff 가독성/기본값 변경 안전성 향상.
             *  - 일관성: update / toggle / remove / load / save / 경로 접근 / 변경 알림이 통일된 방식으로 동작.
             *  - 확장성: 자식/컴렉션/커스텀 직렬화는 hook(`_doInit`/`_doLoad`/`_doSave` 등) override 또는 {@link RCollection} 상속으로 처리.
             *  - **선언적 모델 구축**: 코드 API 호출 대신 단일 JSON(options 트리)으로 모델 전체를 구축할 수 있다.
             *    `loadOptions(json)` 한 번이면 자식/컬렉션까지 재귀적으로 복원된다. 이로 인해
             *      - 저장/공유/템플릿화가 단순해지고,
             *      - LLM/AI 도구가 schema(=`OP` 타입과 `defaults`)만 보고 모델을 생성/수정할 수 있다(메서드 시퀀스 추론 불필요).
             *      - 외부 도구(에디터, 자동화 스크립트, 마이그레이션 툴)가 동일한 데이터 표현을 공유한다.
             */
            declare abstract class ROptionable<OP extends ROptions = ROptions> extends RObject {
                /**
                 * 각 클래스별 기본 설정 값들.
                 * 하위 클래스에서 재정의한다.
                 * 객체 인스턴스의 `_op`에는 명시적으로 설정된 값들만 들어가므로,
                 * 효과 값(effective value)을 읽을 때는 항상 이 기본값을 fallback으로 사용해야 한다.(single-source-of-truth)
                 * @example
                 *    const value = op.prop ?? 10;                          // [X] 매직 넘버 금지
                 *    const value = op.prop ?? MyClass.defaults.prop;       // [△] 가능하지만
                 *    const value = this.prop('prop');                      // [O] 권장
                 */
                protected static readonly defaults: ROptions;
                private static readonly EMPTY_MAP;
                protected _op: OP;
                /**
                 * preset(그룹/공유 기본값) 소스의 명시값 delta(`preset._op`)에 대한 라이브 참조.
                 * 설정되면 효과 값 조회 시 클래스 `defaults`보다 먼저 상속된다(`_op` → `_preset` → `defaults`).
                 * {@link preset}으로 설정한다.
                 */
                protected _preset: OP;
                private _children;
                private _externals;
                private _init;
                protected _doInit(op: OP): void;
                /**
                 * 이 인스턴스의 preset(그룹/공유 기본값)을 설정한다.<br/>
                 * preset이 설정되면 {@link prop}/{@link num}/{@link bool}/{@link props} 등 효과 값 조회 시
                 * 이 인스턴스에 명시되지 않은 옵션을 클래스 `defaults`보다 먼저 preset에서 가져온다
                 * (해석 순서: `_op` → preset → `defaults`).<br/>
                 *
                 * preset은 **동일 클래스**의 인스턴스를 전제한다(따라서 `defaults`가 동일하므로 preset의
                 * 명시값 delta만 참조해도 충분하다). 내부적으로 `preset._op`(명시값 delta)를 **라이브로**
                 * 참조하므로 원본 preset의 이후 변경이 전파된다. 직렬화(`saveOptions`)의 minimal-delta 기준은
                 * 여전히 클래스 `defaults`이며 preset은 읽기 전용 오버레이로만 작용한다.
                 *
                 * @param preset 이 인스턴스가 기본값으로 상속할 동일 클래스 옵션 모델
                 * @param recursive true이면 자식 모델까지 재귀적으로 preset을 설정한다. 기본값 true
                 */
                preset(preset: ROptionable<OP>, recursive?: boolean): this;
                protected _doDispose(): void;
                /**
                 * 옵션의 효과 값(effective value)을 반환한다.<br/>
                 * 해석 순서는 `명시값(_op)` → `preset` → 클래스 `defaults`이다. 이 인스턴스에 명시적으로 설정된
                 * 값이 있으면 그 값을, 없고 {@link preset}이 설정돼 있으면 preset의 명시값을, 그것도 없으면
                 * 클래스 `defaults`의 기본값을 반환한다.<br/>
                 * 옵션 값을 읽을 때는 `options.prop` 직접 접근 대신 이 메서드를 사용한다.
                 *
                 * @param prop 설정 항목 이름
                 */
                prop<K extends keyof OP>(prop: K): OP[K];
                /**
                 * 문자열 타입의 옵션 값에 특화된 `prop()` 메서드. `prop()`과 달리 문자열로 변환해서 반환한다.<br/>
                 * 해석 순서는 `prop()`과 동일하다(`명시값(_op)` → `preset` → 클래스 `defaults`).<br/>
                 * 어디에서도 값을 얻지 못하면 `String(undefined)` 즉 `"undefined"` 문자열이 반환되며,
                 * 값이 `null`이면 `"null"`이 된다. 미설정 시 기본값이 필요하면 {@link strDef}를 사용한다.
                 *
                 * @param prop 설정 항목 이름
                 * @returns 문자열로 변환한 옵션 값
                 */
                str<K extends keyof OP>(prop: K): string;
                /**
                 * 숫자 타입의 옵션 값에 특화된 `prop()` 메서드. `prop()`과 달리 숫자로 변환해서 반환한다.<br/>
                 * 해석 순서는 `prop()`과 동일하다(`명시값(_op)` → `preset` → 클래스 `defaults`).
                 *
                 * @param prop 설정 항목 이름
                 * @returns 숫자 타입의 옵션 값. 어디에서도 숫자를 얻지 못하면 `NaN`.
                 */
                num<K extends keyof OP>(prop: K): number;
                /**
                 * boolean 타입의 옵션 값에 특화된 `prop()` 메서드. `prop()`과 달리 boolean으로 변환해서 반환한다.<br/>
                 * 해석 순서는 `prop()`과 동일하다(`명시값(_op)` → `preset` → 클래스 `defaults`).
                 *
                 * @param prop 설정 항목 이름
                 * @returns boolean 타입의 옵션 값.
                 */
                bool<K extends keyof OP>(prop: K): boolean;
                /**
                 * 점(dot) 표기법으로 경로를 지정해서 옵션의 효과 값(effective value)을 반환한다.<br/>
                 *
                 * @param path 경로 문자열
                 * @returns 경로에 해당하는 옵션 값 또는 `undefined`
                 */
                propAt(path: string): any;
                /**
                 * 점(dot) 표기법으로 경로를 지정해서 문자열 타입의 옵션 값을 반환한다.<br/>
                 * 해석은 {@link str}과 동일하며, 경로가 유효하지 않으면 `undefined`를 반환한다.
                 *
                 * @param path 경로 문자열
                 * @returns 경로에 해당하는 문자열 옵션 값 또는 `undefined`
                 */
                strAt(path: string): string;
                /**
                 * 점(dot) 표기법으로 경로를 지정해서 숫자 타입의 옵션 값을 반환한다.<br/>
                 *
                 * @param path 경로 문자열
                 * @returns 경로에 해당하는 숫자 타입의 옵션 값 또는 `NaN`
                 */
                numAt(path: string): number;
                /**
                 * 점(dot) 표기법으로 경로를 지정해서 boolean 타입의 옵션 값을 반환한다.<br/>
                 *
                 * @param path 경로 문자열
                 * @returns 경로에 해당하는 boolean 타입의 옵션 값 또는 `false`
                 */
                boolAt(path: string): boolean;
                /**
                 * 지정한 옵션들의 효과 값(effective value)을 묶어서 반환한다.<br/>
                 * 여러 옵션을 destructuring으로 한꺼번에 읽을 때 사용한다.
                 * 각 항목의 해석 순서는 `prop()`과 동일하다(`명시값(_op)` → `preset` → 클래스 `defaults`).
                 *
                 * @example
                 *   const { color, radius } = this.props('color', 'radius');
                 *
                 * @param props 설정 항목 이름들
                 */
                props<K extends keyof OP>(...props: K[]): Pick<OP, K>;
                /**
                 * 옵션 값이 특정 값과 일치하는지 여부를 반환한다.<br/>
                 *
                 * @param prop 설정 항목 이름
                 * @param value 비교할 값
                 * @returns 일치 여부
                 */
                propIs(prop: keyof OP, value: any): boolean;
                /**
                 * 옵션 값이 특정 값과 일치하지 않는지 여부를 반환한다.<br/>
                 *
                 * @param prop 설정 항목 이름
                 * @param value 비교할 값
                 * @returns 불일치 여부
                 */
                propIsNot(prop: keyof OP, value: any): boolean;
                /**
                 * 특정 부모에 마운팅되지 않은 독립된 옵션 객체를 초기화한다.
                 */
                init(): this;
                /**
                 * 특정 부모에 마운팅되지 않은 독립된 옵션 객체를 초기화하고, source 객체로부터 옵션 값을 읽어서 설정한다.<br/>
                 */
                initAndLoad(source: any): this;
                private $_load;
                /**
                 * 옵션 값을 읽는다.<br/>
                 * `prop()`과 달리 효과 값이 아닌 명시적으로 설정된 값만 읽는다. 설정되지 않은 옵션은 `undefined`를 반환한다.
                 *
                 * @param option 설정 항목 이름
                 * @returns 명시적으로 설정된 값 또는 `undefined`
                 */
                getOption(option: string): any;
                /**
                 * 점(dot) 표기법으로 경로를 지정해서 옵션 값을 읽는다.<br/>
                 *
                 * @param path 경로 문자열
                 * @returns 경로에 해당하는 옵션 값 또는 `undefined`
                 */
                getOptionAt(path: string): any;
                /**
                 * source 객체로부터 모델 설정 값을 읽어서 적용한다.<br/>
                 *
                 * [정책] load는 source에 명시된 값을 "사용자 의도"로 그대로 보존한다. 즉 source의 값이
                 * 현재 `defaults`와 같더라도 `_op`에 그대로 기록된다. 이는 단순한 성능 최적화가 아니라
                 * 의미상 의도된 동작이다:
                 *  - `defaults`는 라이브러리 버전업 시 변경될 수 있다.
                 *  - load 시점에 "defaults와 같다"는 이유로 키를 버리면, 이후 `defaults`가 바뀌었을 때
                 *    저장본이 표현하던 값이 조용히 달라진다.
                 *  - 그대로 보존하면 사용자가 명시적으로 지정한 값이 항상 우선한다.
                 *
                 * 직렬화(`saveOptions`)는 어차피 `defaults`와 같은 값을 필터링하므로, 외부에 저장되는
                 * 결과의 크기와 내용에는 영향이 없다. 추가 비용은 `_op`에 약간의 메모리뿐이다.
                 * (메모리 정리나 `getOption()`의 "사용자 명시 여부" 의미가 필요한 특수 케이스에 한해서만
                 * `clean()`을 명시적으로 호출한다.)
                 *
                 * @param clear 기본 `true`. 적용 전에 기존 설정을 모두 비운다(재귀). 즉 source는 모델 전체를
                 *  표현하는 완전한 옵션 트리로 간주되어, source에 없는 기존 값은 사라진다(전체 교체).
                 *  `false`이면 **부분 reload**가 된다: 기존 설정을 비우지 않고 source에 **포함된 키만** load
                 *  의미로 다시 적용하고, 빠진 키는 그대로 보존한다. 특정 하위 트리만 통째로 갈아끼울 때 유용하다.
                 *
                 * [updateOptions와의 차이] `clear=false`도 "포함된 키만 적용"이지만 의미가 다르다.
                 *  - `updateOptions`: 값이 현재 effective 값과 같으면 건너뛰고, 객체 값은 **부분 병합**한다.
                 *  - `loadOptions(source, false)`: 포함된 키는 **load 의미**로 적용한다. 즉 defaults와 같아도
                 *    `_op`에 그대로 기록하고, 객체/자식 값은 부분 병합이 아니라 **통째 교체**한다.
                 */
                loadOptions(source: any, clear?: boolean): this;
                /**
                 * 옵션 값을 읽는다.<br/>
                 * `prop()`과 달리 효과 값이 아닌 명시적으로 설정된 값만 읽는다. 설정되지 않은 옵션은 `undefined`를 반환한다.
                 *
                 * @param prop 설정 항목 이름
                 * @returns 명시적으로 설정된 값 또는 `undefined`
                 */
                saveOption<K extends keyof OP>(prop: K): OP[K] | {
                    [K in keyof OP]?: any;
                } | undefined;
                /**
                 * 모델의 설정 값을 json 객체로 직렬화한다.<br/>
                 *
                 * @param props 저장할 속성 필터.
                 *  - `(keyof OP)[]` 배열: 해당 키들만 저장.
                 *  - 객체 (`{ [K in keyof OP]?: any }`): 객체에 정의된 키들만 저장. 자식 모델 키의 값으로 객체를 지정하면
                 *    해당 자식의 `saveOptions(childFilter, true, includeDefs)` 호출 시 필터로 전달된다.
                 *  - 생략 또는 빈 배열: 모든 속성 저장.
                 * @param recursive 자식 모델까지 재귀 저장 여부.
                 * @param includeDefs 기본값과 동일한 값도 저장 여부.
                 */
                /**
                 * 모델의 설정 값을 json 객체로 직렬화한다.<br/>
                 *
                 * @param props 저장할 속성 필터.
                 *  - `(keyof OP)[]` 배열: 해당 키들만 저장.
                 *  - 객체 (`{ [K in keyof OP]?: any }`): 객체에 정의된 키들만 저장. 자식 모델 키의 값으로 객체를 지정하면
                 *    해당 자식의 `saveOptions(childFilter, true, includeDefs, force)` 호출 시 필터로 전달된다.
                 *  - 생략 또는 빈 배열: 모든 속성 저장.
                 * @param recursive 자식 모델까지 재귀 저장 여부.
                 * @param includeDefs 기본값과 동일한 값도 저장 여부.
                 * @param force `true`이면 `props`로 명시된 속성은 `_op`나 `defaults`에 값이 없더라도
                 *  결과에 포함된다 (일반 옵션은 `undefined`, 명시된 자식은 빈 `{}`이라도 포함). `props`가
                 *  없을 때는 무시된다.
                 */
                saveOptions(props?: (keyof OP)[] | {
                    [K in keyof OP]?: any;
                }, recursive?: boolean, includeDefs?: boolean, force?: boolean): Partial<OP>;
                /**
                 * 모델의 설정 값을 target 객체에 복사해서 저장한다.<br/>
                 */
                saveTo(target: Partial<OP>, props?: (keyof OP)[] | {
                    [K in keyof OP]?: any;
                }, recursive?: boolean, includeDefs?: boolean, force?: boolean): Partial<OP>;
                /**
                 * 모델 설정 값들을 변경한다.<br/>
                 * `source`에 자식 모델 이름의 키가 포함되면 해당 값은 자식 모델의 {@link updateOptions}에 위임된다.
                 *
                 * @param source 설정 옵션들이 포함된 json 객체
                 * @param render true로 지정하면 옵션 변경 시 컨트롤을 다시 그린다. 기본값 true
                 * @returns 모델 객체 자신
                 */
                updateOptions(source?: Partial<OP>, render?: boolean): this;
                /**
                 * `source`를 {@link updateOptions}에 적용했을 때 그 변경을 되돌리는 **역(inverse) update 페이로드**를
                 * **현재 상태 기준으로** 계산해 반환한다. redo 적용 **전에** 호출해야 한다(현재 값이 곧 "before"다).
                 * command의 undo용 스냅샷을 최소 델타로 만들기 위한 것이다:
                 *
                 *   const inverse = model.invertOptions(options); // 적용 전에 캡처
                 *   model.updateOptions(options);                // redo
                 *   model.updateOptions(inverse);                // undo → before로 복원
                 *
                 * 키 종류별 처리(다형적으로 자식에 위임):
                 *  - **자식 모델**: `child.invertOptions(source[key])`로 위임한다. {@link RCollection}은 이를 override해
                 *    추가/삭제/재정렬까지 되돌리는 구조 역델타를 만든다.
                 *  - **스칼라/외부 키**: 해당 키의 **현재 값**을 force 스냅샷한다(default였던 값도 포함하므로 undo가
                 *    default로 되돌릴 수 있다). `source`의 값 자체는 키 선택자로만 쓰이고 무시된다.
                 *
                 * `source`가 일반 객체가 아니면(undefined/원시값/배열) base로선 되돌릴 키가 없으므로 **no-op 역(`{}`)**을
                 * 반환한다. 배열 source나 `_doSetSimple`로 상태를 통째 세팅하는 소스를 실제로 다루는 클래스는 이
                 * 메서드를 override한다({@link RCollection}이 그 예로, 배열/`{items,updateMode}` source의 구조 역델타를 만든다).
                 */
                invertOptions(source?: any): any;
                /**
                 * 하나의 속성 값을 설정한다.<br/>
                 * 여러 속성들을 한꺼번에 변경할 때는 {@page updateOptions}를 사용한다.
                 * 기본적으로 이전 값과 다른 경우에만 적용된다.
                 * 특히, 속성값이 객체인 경우 객체 속성만 바뀐 경우 적용되지 않는다.
                 * 바꾸고 싶다면 force 매개변수를 true로 지정해서 호출한다.<br/>
                 * 또, prop 매개변수가 하위 모델 이름인 경우 하위 모델의 {@page updateOptions}를 호출한 것과 동일하다.
                 *
                 * @param prop 설정 항목 이름
                 * @param value 설정 값
                 * @param render true로 지정하면 옵션 변경 시 컨트롤을 다시 그린다. 기본값: true
                 * @param force 지정한 값이 이전 값과 동일한 경우에도 적용한다. 기본값: false
                 * @returns 모델 객체 자신
                 */
                updateOption<K extends keyof OP>(prop: K, value: OP[K], render?: boolean, force?: boolean): this;
                updateOption(prop: string, value: any, render?: boolean, force?: boolean): this;
                /**
                 * boolean 타입의 모델 설정 값을 반대 값으로 변경한다.<br/>
                 * `prop`이 자식 모델 이름인 경우에는 아무것도 하지 않고 무시된다.
                 *
                 * @param prop 설정 항목 이름
                 * @param render true로 지정하면 옵션 변경 시 컨트롤을 다시 그린다. 기본값 true
                 * @returns 모델 객체 자신
                 */
                toggleOption(prop: keyof OP, render?: boolean): this;
                /**
                 * 명시적으로 설정된 모델 설정 값을 제거해서 모델의 기본 값이 적용되도록 한다.<br/>
                 * `prop`이 자식 모델 이름인 경우에는 해당 자식의 `clearOptions(true)`를 호출한다.
                 *
                 * @param prop 설정 항목 이름
                 * @param render true로 지정하면 옵션 변경 시 컨트롤을 다시 그린다. 기본값 true
                 * @returns 모델 객체 자신
                 */
                removeOption(prop: keyof OP, render?: boolean): this;
                /**
                 * 하위 모델의 설정 값을 변경한다.<br/>
                 * path 매개변수는 하위 모델의 속성 이름을 점(.)으로 구분해서 지정한다.
                 * 예를 들어, "axis.x"는 axis 모델의 x 속성을 의미한다.<br/>
                 * render와 force 매개변수는 {@page updateOption}과 동일하다.
                 */
                updateAt(path: string, value: any, render?: boolean, force?: boolean): any;
                /**
                 * boolean 타입의 모델 설정 값을 반대 값으로 변경한다.<br/>
                 * path 매개변수는 하위 모델의 속성 이름을 점(.)으로 구분해서 지정한다.
                 * 예를 들어, "axis.x"는 axis 모델의 x 속성을 의미한다.<br/>
                 * render와 force 매개변수는 {@page toggleOption}과 동일하다.
                 */
                toggleAt(path: string, render?: boolean): any;
                /**
                 * 명시적으로 설정된 하위 모델의 설정 값을 제거해서 모델의 기본 값이 적용되도록 한다.<br/>
                 * path 매개변수는 하위 모델의 속성 이름을 점(.)으로 구분해서 지정한다.
                 * 예를 들어, "axis.x"는 axis 모델의 x 속성을 의미한다.<br/>
                 * render와 force 매개변수는 {@page toggleOption}과 동일하다.
                 */
                deleteAt(path: string, render?: boolean): any;
                protected _clearExternalOptions(): void;
                /**
                 * 명시적으로 설정된 모든 모델 설정 값들을 제거한다.<br/>
                 *
                 * @param recursive true로 지정하면 모든 자식 모델에 대해서도 재귀적으로 제거한다. 기본값: false
                 * @param render true로 지정하면 옵션 변경 시 컨트롤을 다시 그린다. 기본값: true
                 * @returns 모델 객체 자신
                 */
                clearOptions(recursive?: boolean, render?: boolean): this;
                protected _cleanExternalOptions(): void;
                /**
                 * `_op`에 명시적으로 설정되어 있지만 값이 현재 `defaults`와 동일한 항목들을 제거해
                 * `_op`를 minimal delta 상태로 정규화한다.
                 *
                 * [주의] 대부분의 경우 호출할 필요가 없다.
                 *  - 효과 값(`prop`/`num`/`props`)은 영향 없음.
                 *  - 직렬화(`saveOptions`)도 어차피 defaults와 같은 값을 필터링하므로 결과가 동일하다.
                 *    즉 외부 저장 결과는 clean 전후가 같다.
                 *
                 * clean이 실제로 차이를 만드는 경우는 다음과 같다.
                 *  - `_op`의 메모리 사용을 줄이고 싶을 때(`loadOptions`로 큰 source를 읽어들인 직후 등).
                 *  - `getOption()`/`saveOption()`처럼 _op의 own value를 그대로 반환하는 API의 결과를
                 *    "사용자가 명시했는가"의 의미로 사용해야 할 때(예: 디자이너 UI의 "기본값 사용 중" 표시).
                 *    이 경우 clean 후에는 defaults와 같은 값들이 `undefined`로 보고된다.
                 *
                 * @param recursive true로 지정하면 모든 자식 모델에 대해서도 재귀적으로 수행한다. 기본값: true
                 * @returns 모델 객체 자신
                 */
                clean(recursive?: boolean): this;
                /**
                 * 자식 모델을 등록한다. `_doInit()` 안에서 호출한다.
                 * 첫 호출 시 `this._children` Map을 lazy하게 생성한다.
                 * 자식의 `_init()`을 자동 호출하며 자식의 `_op`는 부모의 `_op`에 마운팅하지 않는다.
                 * (부모/자식 관계는 `_children`이 유일한 권위 source이며 직렬화 시에만 트리 형태로 합성된다.)
                 * `_children` Map은 삽입 순서를 보존하며 base의 재귀 동작은 인스턴스 필드/getter에 의존하지 않는다.
                 * (인스턴스 필드 할당은 호출 측에서 직접 한다. 필요한 경우 getter로 노출.)
                 * `child`는 새로 생성된(아직 `_init`되지 않은) 인스턴스이거나 null이 될 수 있다. null이면 등록하지 않고 그냥 반환한다.
                 * null인 경우 나중에 _doRecreateChild에서 새로 생성해서 등록해야 한다. (즉, null은 "등록하지 않음" 의미.)
                 *
                 * `name`은 `OP`에 선언된 속성 중 값 타입이 객체(즉 `ROptions` 계승자)인 키만 허용된다.
                 * 또한 `child`의 옵션 타입은 `OP[name]`과 호환되어야 한다.
                 */
                protected _addChild<K extends RChildKey<OP>, T extends ROptionable<RChildOptions<OP[K]> & ROptions>>(name: K, child: T): T;
                /**
                 * 이미 초기화된 외부 인스턴스를 경로 참조 자식(Aggregation)으로 연결한다.
                 *
                 * `_addChild`는 소유(Composition) 자식 전용으로 `_init()`을 자동 호출하지만,
                 * 이 메서드는 이미 초기화된 인스턴스를 `_init()` 없이 경로 트리에만 연결한다.
                 * 연결 후 `propAt('name.xxx')`, `updateAt('name.xxx', val)` 이 자동 동작한다.
                 * 소유권이 없으므로 부모 dispose 시 ref를 dispose하지 않는다.
                 *
                 * @param name  경로 접두사 (`propAt('name.xxx')` 의 head segment)
                 * @param ref   이미 초기화된 외부 ROptionable 인스턴스
                 */
                protected _attachRef(name: string, ref: ROptionable): void;
                /**
                 * 등록된 자식 모델을 이름으로 찾아 반환한다. 등록되지 않았으면 `undefined`.
                 */
                protected _findChild(name: string): ROptionable | undefined;
                /**
                 * 경로 API(`propAt`/`updateAt`/`removeAt`/`getOptionAt`)가 head segment를 자식 ROptionable로
                 * 해석할 때 사용하는 hook. 기본은 등록된 명명 자식(`_findChild`)이다.
                 *
                 * [주의] `_findChild`는 경로 해석 외에도 getOption/saveOption/updateOption(s)/
                 * toggleOption/removeOption/_doLoad 등 "등록된 명명 자식 registry"로 광범위하게
                 * 사용된다. 인덱스로 항목을 노출하는 동적 컬렉션은 {@link RCollection}으로
                 * 구현하며, 그 클래스가 이 hook만 override해 `_findChild`(registry) 의미를
                 * 훼손하지 않고 경로 해석에만 항목을 노출한다.
                 */
                protected _resolveChild(head: string): ROptionable | undefined;
                /**
                 * dot path에서 가장 앞의 segment를 소비해 자식 ROptionable을 찾고 남은 path를 반환한다.
                 *  - 자식 해석은 `_resolveChild(head)`로 수행한다(기본: 명명 자식, RCollection: 인덱스 항목).
                 *
                 * 반환:
                 *  - `{ child, rest }`: 해결됨. `rest === ''`이면 path가 자식 자체를 가리킨다.
                 *  - `0`: 미해결 + path에 점 없음. 호출자가 path 자체를 local leaf 옵션 키로 쓰면 됨.
                 *  - `-1`: 미해결 + path에 점 있음. 해석 불가 경로 — 호출자는 아무것도 하지 않아야 함.
                 */
                private _resolvePath;
                /**
                 * 옵션 변경 후 호출되는 알림 hook. 하위 클래스에서 반드시 재구현해야 한다.
                 *
                 * @param tag 변경된 항목 식별자.
                 *  - `string`: 단일 속성이 변경됨 (`updateOption`, `toggleOption`, `removeOption`).
                 *  - `string[]`: 여러 속성이 변경됨 (`updateOptions`). 자식 모델 키는 포함되지 않는다.
                 *  - `undefined`: 전체 변경 또는 식별 불가 (`clearOptions`).
                 */
                _optionChanged(tag?: string | string[]): void;
                protected _includeTags<K extends keyof OP>(tag?: string | string[], ...props: K[]): boolean;
                /**
                 * load나 update 시점에 prop 이름으로 지정된 자식 모델을 재생성할 수 있는 기회를 제공한다.<br/>
                 * `op`는 해당 자식에 적용될 설정 값이며, 서브클래스는 이 값에 따라 다른 자식을 생성할 수 있다.
                 * 예) `op`가 `{ type: 'bar' }`이면 BarAxis, `{ type: 'line' }`이면 LineAxis를 생성하도록 구현할 수 있다.<br/>
                 */
                private $_recreateChild;
                /**
                 * `prop` 이름의 자식에 `op` 설정이 적용되기 직전에 호출된다.
                 * 설정 값에 따라 다른 자식 모델을 생성해서 반환하면 해당 자식으로 교체된다.
                 * `undefined`를 반환하면 기존 자식이 그대로 사용된다.
                 */
                protected _doRecreateChild(prop: string, child: ROptionable, op: any): ROptionable | undefined;
                protected _doLoad(options: OP, source: any): void;
                protected _doSetSimple(op: OP, src: any): boolean;
                /**
                 * 여기에서 필터된 속성들은 `_op`에 기록하지 않고 `_externals`에 보관된다.
                 * [주의] 반드시 _doUpdateProp, _doSaveProp와 쌍으로 구현되어야 한다.
                 *       가능하면 이 함수들이 필요없도록 설계하는 것이 좋다. (즉, 외부 상태를 직접 관리하지 않고, 단순히 `_op`에 기록되도록 설계.)
                 */
                protected _doLoadProp(prop: string, value: any): boolean;
                /**
                 * 단일 배열 항목을 관리하는 속성인 경우 단위 항목별로 유지하는 것이 아니라면 _doLoadProp과 대개 동일할 것이다.<br/>
                 */
                protected _doUpdateProp(prop: string, value: any): boolean;
                protected _doSaveProp(target: any, prop: string, value: any): boolean;
                protected _doApply(op: OP): void;
                /**
                 * 옵션 값 비교/직렬화 시 사용하는 "기준값(baseline)"을 반환한다. 기본은 클래스 정적 `defaults`의 값.
                 * {@link RModel}은 이를 override해 template 값을 기준으로 삼아 template 대비 최소 delta 직렬화/정규화를 구현한다.
                 */
                protected _propBaseline(prop: keyof OP, defs: OP): any;
                protected _doSave(target: any, props: string[], defs: OP, recursive: boolean, includeDefs: boolean, childFilters?: any, force?: boolean, externalFilters?: any): void;
                private $_validateOptions;
                /**
                 * `props` 객체 필터를 일반 옵션 키 목록과 자식 필터 맵으로 분리한다.
                 * - 자식 키(`_children`에 등록된 이름)는 `childFilters`에만 담아 자식의 `saveOptions` 필터로 전달.
                 * - 외부 키(`_externals`에 등록된 이름)는 `externalFilters`에만 담아 외부 옵션 저장 대상으로 사용.
                 * - 그 외 키는 `propList`에 담아 일반 옵션 저장 대상으로 사용.
                 */
                private $_splitProps;
                protected _doValidateOptions(prop: string, value: any): void;
            }

            /**
             * ROptions는 ROptionable의 옵션 객체 타입으로,
             * ROptionable을 상속하는 클래스에서 모델 설정을 관리하기 위해 구현해야 하는 인터페이스이다.<br/>
             */
            declare interface ROptions {
            }

            /**
             * 행별 열 그룹 소계.<br/>
             * 각 행에 대해 상위 열 차원값별로 합계를 제공한다.<br/>
             * 예: columnDimensions=['year','quarter']일 때, 각 행의 'year별' 소계.
             */
            declare interface RowByColumnGroupTotals {
                /** 열 차원명 (예: 'year') */
                columnDimension: string;
                /** 열 차원 인덱스 */
                columnDimensionIndex: number;
                /** 열 그룹별 고유값 목록 */
                columnGroupValues: any[];
                /** 행별 열그룹 소계 [행][열그룹][measure] (i64 measure 는 bigint) */
                totals: any[][][];
            }

            /**
             * 행 데이터.<br/>
             */
            declare type RowData = RowValues | RowObject;

            declare class RowFieldView extends PivotDimensionView {
                constructor(doc: Document);
            }

            declare class RowGrandCellView extends PivotHeaderGrandCelllView {
                model: PivotRowHeaderGrandCell;
                constructor(doc: Document);
                getTooltip(table: PivotTable): string;
                render(width: number, table: PivotTable, model: PivotRowHeaderGrandCell): void;
            }

            declare class RowHeaderCellView extends PivotHeaderCellView {
                model: PivotRowHeaderCell;
                constructor(doc: Document);
                getTooltip(table: PivotTable): string | undefined;
                render(width: number, table: PivotTable, model: PivotRowHeaderCell): void;
            }

            declare class RowHeaderGrandValueCellView extends PivotHeaderGrandValueCellView {
                constructor(doc: Document);
                getTooltip(table: PivotTable): string;
            }

            /**
             * 행 헤더의 series 셀 view. 임시로 series.label ?? series.name 만 표시한다.
             */
            declare class RowHeaderSeriesCellView extends HeaderCellView {
                model: PivotRowHeaderSeriesCell;
                constructor(doc: Document);
                getTooltip(_table: PivotTable): string | undefined;
                render(_width: number, _table: PivotTable, model: PivotRowHeaderSeriesCell): void;
            }

            declare class RowHeaderTotalCellView extends PivotHeaderTotalCellView {
                model: PivotRowHeaderTotalCell;
                constructor(doc: Document);
                render(width: number, table: PivotTable, model: PivotRowHeaderTotalCell): void;
            }

            declare class RowHeaderValueCellView extends PivotHeaderTotalCellView {
                model: PivotRowHeaderValueCell;
                constructor(doc: Document);
                render(width: number, table: PivotTable, model: PivotRowHeaderValueCell): void;
            }

            /**
             * 행 데이터 객체.<br/>
             */
            declare type RowObject = {
                [key: string]: any;
            };

            declare type RowState = typeof _RowState[keyof typeof _RowState];

            /**
             * 행의 상태
             */
            declare const _RowState: {
                /**
                 * 생성됨.<br/>
                 */
                readonly CREATED: "created";
                /**
                 * 변경됨.<br/>
                 */
                readonly UPDATED: "updated";
                /**
                 * 삭제됨.<br/>
                 */
                readonly DELETED: "deleted";
                /**
                 * 생성 후 삭제됨.<br/>
                 */
                readonly CREATE_AND_DELETED: "createAndDeleted";
            };

            /**
             * 행 데이터 값 배열.<br/>
             */
            declare type RowValues = any[];

            /**
             * `getStats()` 결과.
             */
            declare interface ScopedStats {
                /** 전체(`compareScope` 분리 없음) 통계. */
                all: GroupStats;
                /** 그룹 키 → 통계. `compareScope`이 `'all'`이면 비어있다. */
                groups: Map<string, GroupStats>;
                /** 적용된 비교 축 (`compareScope` 해석 결과). */
                compareAxes: CompareAxis[];
                /** 적용된 셀 레벨 (`cellScope` 해석 결과). */
                cellLevels: Set<ValueCellType>;
                /**
                 * 셀 컨텍스트로부터 그룹 키를 만든다.
                 * `compareAxes`가 비어있으면 빈 문자열 반환.
                 */
                groupKey(ctx: CellContext): string;
            }

            /**
             * Slicer 선택 모드.<br/>
             * - **'single'**: 단일 선택
             * - **'multiple'**: 다중 선택
             */
            declare type SelectionMode_2 = 'single' | 'multiple';

            export declare const setLicenseKey: typeof Globals.setLicenseKey;

            export declare const setLogging: typeof Globals.setLogging;

            /** Finding 심각도(내림차순: critical > warning > info > ok). */
            declare type Severity = 'critical' | 'warning' | 'info' | 'ok';

            declare type ShowAsAxis = 'row' | 'column';

            declare interface SiblingPositions { positions: Array<{ row: number; col: number }>; }

            /**
             * Slicer 클래스.<br/>
             *
             * Power BI, Excel의 Slicer와 유사한 필터링 컴포넌트를 제공한다.
             * 대시보드나 리포트에서 차원(dimension) 기반의 인터랙티브한 필터링을 위해 사용된다.<br/>
             *
             * ## 주요 기능
             * - **목록 필터**: 값 목록에서 단일/다중 선택
             * - **범위 필터**: 숫자나 날짜의 범위 지정
             * - **검색 필터**: 텍스트 검색으로 필터링
             * - **날짜 필터**: 상대적 날짜 (오늘, 지난 7일 등)
             * - **트리 필터**: parentDimension 계층 기반 트리 UI (Excel Tree Slicer와 유사)
             * - **카운트 표시**: 각 값별로 데이터 건수 표시
             * - **상태 관리**: 선택 상태 추적 및 복원
             *
             * ## 계층(Tree) 지원
             *
             * Slicer의 dimension에 `parentDimension` 체인이 존재하면, 자동으로 트리 계층을 인식한다.
             * 별도의 타입 지정 없이 `getHierarchyLevels()`로 계층 유무를 판단할 수 있다.<br/>
             *
             * **dateFields 분해 차원**은 별도의 parentDimension 지정 없이도 자동으로 계층이 구성된다.
             * `$_buildColumns()`에서 `order_date → order_date.year → order_date.month` 체인을 자동 생성하기 때문이다.<br/>
             *
             * **비-date 차원**은 스키마에서 `parentDimension`을 수동으로 지정해야 한다.<br/>
             *
             * ```typescript
             * // dateFields: 자동 계층 (parentDimension 지정 불필요)
             * { name: 'order_date', type: 'date', dateFields: ['year', 'month', 'day'] }
             * // → order_date → order_date.year → order_date.month → order_date.day
             *
             * // 비-date: 수동 계층 (parentDimension 명시)
             * { name: 'country', type: 'str' },
             * { name: 'city', type: 'str', parentDimension: 'country' },
             * { name: 'district', type: 'str', parentDimension: 'city' }
             * ```
             *
             * ## 사용 예시
             *
             * ### 1. 기본 목록 Slicer
             * ```typescript
             * // DataCube에 Slicer 등록
             * const regionSlicer = cube.addSlicer({
             *   name: 'region',
             *   dimension: 'region',
             *   type: 'list',
             *   selectionMode: 'multiple',
             *   showCounts: true
             * });
             *
             * // 값 선택 → DataCube에 자동 적용 (apply 기본값: true)
             * regionSlicer.select(['서울', '부산']);
             *
             * // 자동 적용 없이 상태만 변경
             * regionSlicer.select(['대구'], false);
             * cube.applySlicers();  // 수동 적용
             * ```
             *
             * ### 2. 날짜 범위 Slicer
             * ```typescript
             * const dateSlicer = cube.addSlicer({
             *   name: 'date',
             *   dimension: 'date',
             *   type: 'date'
             * });
             *
             * // 프리셋 사용
             * dateSlicer.setDatePreset('last30days');
             *
             * // 또는 직접 범위 지정
             * dateSlicer.setRange('2024-01-01', '2024-12-31');
             * ```
             *
             * ### 3. 검색 Slicer
             * ```typescript
             * const productSlicer = cube.addSlicer({
             *   name: 'product',
             *   dimension: 'product',
             *   type: 'search',
             *   maxItems: 1000
             * });
             *
             * // 검색
             * productSlicer.search('노트북');
             *
             * // 검색 결과에서 선택
             * productSlicer.select(productSlicer.getSearchResults());
             * ```
             *
             * ### 4. 다중 Slicer 조합
             * ```typescript
             * // 여러 Slicer를 한 번에 변경할 때는 apply=false로 배치 처리
             * cube.getSlicer('region')?.select(['서울'], false);
             * cube.getSlicer('date')?.setRange('2024-01-01', '2024-12-31', false);
             * cube.getSlicer('product')?.search('노트북', false);
             * cube.applySlicers();  // 한 번만 적용
             * ```
             *
             * ### 5. 트리 Slicer (Tree)
             * ```typescript
             * // 리프 차원을 지정하면 parentDimension 체인을 자동 추적
             * const slicer = cube.addSlicer({ name: 'loc', dimension: 'district' });
             *
             * // 계층 확인
             * slicer.getHierarchyLevels(); // ['country', 'city', 'district']
             *
             * // 트리 UI 데이터
             * slicer.getTreeValues();
             * // [{ dimension: 'country', value: 'Korea', count: 5, children: [...] }]
             *
             * // 트리 노드 선택 (중간 노드 → 하위 리프 전체 선택)
             * slicer.selectNode(['Korea', 'Seoul']);
             *
             * // 체크박스 상태 (✓, ▣, ☐)
             * slicer.getNodeState(['Korea']);        // 'some'
             * slicer.getNodeState(['Korea', 'Seoul']); // 'all'
             * ```
             *
             * @example
             * // Dashboard에서의 사용
             * cube.addSlicer({ name: 'region', dimension: 'region' });
             * cube.addSlicer({ name: 'date', dimension: 'date', type: 'date' });
             * cube.addSlicer({ name: 'product', dimension: 'product', type: 'search' });
             *
             * // 개별 선택 시 자동 적용 (UI 이벤트 핸들러에서)
             * cube.getSlicer('region')?.select(['서울', '부산']);
             *
             * // 여러 Slicer 일괄 변경 시 apply=false로 배치 처리
             * cube.getSlicer('region')?.select(['서울'], false);
             * cube.getSlicer('date')?.setDatePreset('last30days', false);
             * cube.applySlicers();
             */
            declare class Slicer {
                private cube;
                private options;
                private state;
                private sourceData;
                private _isDateDimension;
                /** 계층 레벨 배열: [루트, ..., 리프(=dimension)]. 계층 없으면 null */
                private _hierarchyLevels;
                /**
                 * Slicer 생성자.<br/>
                 *
                 * @param cube - DataCube 인스턴스
                 * @param options - Slicer 설정 옵션
                 */
                constructor(cube: DataCube, options: SlicerOptions);
                /**
                 * 이 Slicer가 연결된 DataCube 인스턴스.<br/>
                 */
                get dataCube(): DataCube;
                /**
                 * 연결된 dimension이 날짜(date) 타입인지 여부.<br/>
                 * Timeline 등 날짜 기반 UI가 적용 가능 여부를 판단할 때 사용한다.<br/>
                 */
                get isDateDimension(): boolean;
                /**
                 * 값 선택 모드('single' | 'multiple').<br/>
                 */
                get selectionMode(): SelectionMode_2;
                get label(): string;
                /**
                 * 값 선택.<br/>
                 *
                 * @param values - 선택할 값 또는 값 배열
                 * @param apply - true이면 DataCube에 즉시 반영 (기본값: true)
                 * @returns 선택 상태가 변경되었으면 true
                 */
                select(values: any | any[], apply?: boolean): boolean;
                clearAndSelect(values: any | any[], apply?: boolean): boolean;
                /**
                 * 값 선택 해제.<br/>
                 *
                 * @param values - 선택 해제할 값 또는 값 배열. 생략 시 전체 해제.
                 * @param apply - true이면 DataCube에 즉시 반영 (기본값: true)
                 * @returns 선택 상태가 변경되었으면 true
                 */
                deselect(values?: any | any[], apply?: boolean): boolean;
                /**
                 * 전체 선택.<br/>
                 *
                 * @param apply - true이면 DataCube에 즉시 반영 (기본값: true)
                 * @returns 선택 상태가 변경되었으면 true
                 */
                selectAll(apply?: boolean): boolean;
                /**
                 * 전체 선택 해제.<br/>
                 *
                 * @param apply - true이면 DataCube에 즉시 반영 (기본값: true)
                 * @returns 선택 상태가 변경되었으면 true
                 */
                deselectAll(apply?: boolean): boolean;
                /**
                 * 저장된 상태와 현재 상태가 다른지 확인한다.<br/>
                 *
                 * @param saved - save()로 저장한 상태
                 * @returns 변경되었으면 true
                 */
                isChanged(saved: SlicerState): boolean;
                /**
                 * 현재 상태를 저장한다.<br/>
                 * 반환된 객체는 isChanged(), restore()에서 사용한다.<br/>
                 *
                 * @returns 현재 상태의 복사본
                 */
                save(): SlicerState;
                /**
                 * 저장된 상태로 복원한다.<br/>
                 *
                 * @param saved - save()로 저장한 상태
                 * @param apply - true이면 DataCube에 즉시 반영 (기본값: true)
                 * @returns 상태가 변경되었으면 true
                 */
                restore(saved: SlicerState, apply?: boolean): void;
                /**
                 * 범위 설정 (range, date 타입).<br/>
                 *
                 * @param start - 시작 값
                 * @param end - 끝 값
                 * @param apply - true이면 DataCube에 즉시 반영 (기본값: true)
                 * @returns 범위가 변경되었으면 true
                 */
                setRange(start: any, end: any, apply?: boolean): boolean;
                /**
                 * 날짜 프리셋 설정.<br/>
                 *
                 * @param preset - 날짜 프리셋
                 * @param apply - true이면 DataCube에 즉시 반영 (기본값: true)
                 * @returns 범위가 변경되었으면 true
                 */
                setDatePreset(preset: DateRangePreset, apply?: boolean): boolean;
                /**
                 * 검색 텍스트 설정.<br/>
                 *
                 * @param text - 검색할 텍스트
                 * @param apply - true이면 DataCube에 즉시 반영 (기본값: true)
                 * @returns 검색 텍스트가 변경되었으면 true
                 */
                search(text: string, apply?: boolean): boolean;
                /**
                 * 검색 결과 가져오기.<br/>
                 */
                getSearchResults(): any[];
                /**
                 * 현재 필터 조건 가져오기.<br/>
                 *
                 * @returns CubeFilter 또는 null (필터가 활성화되지 않은 경우)
                 */
                getFilter(): CubeFilter | null;
                /**
                 * 현재 상태 가져오기.<br/>
                 */
                getState(): Readonly<SlicerState>;
                /**
                 * 사용 가능한 값 목록 가져오기.<br/>
                 * 각 항목은 `[value, count]` 튜플로, `value`는 차원의 고유값이고
                 * `count`는 해당 값의 데이터 건수이다.<br/>
                 *
                 * @param limit - 반환할 최대 항목 수. 생략 시 전체 반환.
                 * @returns [value, count] 형태의 배열
                 *
                 * @example
                 * ```typescript
                 * const slicer = cube.addSlicer({ name: 'region', dimension: 'region' });
                 * slicer.getAvailableValues();
                 * // [['Seoul', 3], ['Busan', 2], ['Daegu', 1]]
                 *
                 * slicer.getAvailableValues(2);
                 * // [['Seoul', 3], ['Busan', 2]]
                 * ```
                 */
                getAvailableValues(limit?: number): Array<[any, number]>;
                /**
                 * 값의 범위(최소/최대)를 가져오기.<br/>
                 * Date, Range 타입의 Slicer에서 슬라이더 UI의 범위 설정 등에 유용하다.<br/>
                 *
                 * ## getAvailableValues() vs getValueRange()
                 * - `getAvailableValues()`: 모든 고유값과 카운트를 반환. **List UI**에 적합.
                 * - `getValueRange()`: 최소/최대값만 반환. **Date/Range 슬라이더 UI**에 적합.
                 *
                 * Date나 숫자 범위 필터에서는 모든 고유값이 필요하지 않고 min/max만 필요한 경우가 많으므로,
                 * `getValueRange()`를 사용하는 것이 더 효율적이다.<br/>
                 *
                 * ## 지원 케이스
                 * - 숫자 차원의 최소/최대값 반환
                 * - 문자열 차원의 최소/최대값 반환 (알파벳 순)
                 * - 날짜 문자열 차원의 범위 반환
                 * - Date 객체 차원의 범위 반환
                 * - 빈 데이터셋에서 null 반환
                 * - null 값이 포함된 경우 null 제외
                 *
                 * @returns { min, max } 객체. 값이 없으면 null.
                     *
                     * @example
                     * ```typescript
                     * // Date 타입 Slicer - 날짜 범위 슬라이더 초기화
                     * const dateSlicer = cube.addSlicer({
                     *   name: 'date',
                     *   dimension: 'orderDate',
                     *   type: 'date'
                     * });
                     * const range = dateSlicer.getValueRange();
                     * // { min: Date('2024-01-01'), max: Date('2024-12-31') }
                     * // → DateRangePicker의 minDate, maxDate 설정에 사용
                     *
                     * // Range 타입 Slicer - 숫자 범위 슬라이더 초기화
                     * const ageSlicer = cube.addSlicer({
                     *   name: 'age',
                     *   dimension: 'age',
                     *   type: 'range'
                     * });
                     * const ageRange = ageSlicer.getValueRange();
                     * // { min: 18, max: 65 }
                     * // → RangeSlider의 min, max 설정에 사용
                     * ```
                     */
                 getValueRange(): {
                     min: any;
                     max: any;
                 } | null;
                 /**
                  * 현재 선택된 값 목록 가져오기.<br/>
                  * `select()`, `selectAll()` 등으로 선택된 값들을 배열로 반환한다.<br/>
                  *
                  * @returns 선택된 값 배열. 선택이 없으면 빈 배열.
                  *
                  * @example
                  * ```typescript
                  * const slicer = cube.addSlicer({ name: 'region', dimension: 'region' });
                  * slicer.select(['Seoul', 'Busan']);
                  * slicer.getSelectedValues();  // ['Seoul', 'Busan']
                  * ```
                  */
                 getSelectedValues(): any[];
                 /**
                  * 필터 활성화 여부.<br/>
                  */
                 isFiltered(): boolean;
                 /**
                  * 상태 초기화 (모든 선택 해제).<br/>
                  *
                  * @param apply - true이면 DataCube에 즉시 반영 (기본값: true)
                  * @returns 상태가 변경되었으면 true
                  */
                 reset(apply?: boolean): boolean;
                 /**
                  * 사용 가능한 값 새로고침 (DataCube 변경 시).<br/>
                  */
                 refresh(): this;
                 /**
                  * 계층 레벨 배열을 반환한다.<br/>
                  * 루트(최상위)부터 현재 dimension(리프)까지의 차원 이름 배열.
                  * 계층이 없으면(parentDimension 체인이 없으면) null을 반환한다.<br/>
                  *
                  * @returns 차원 이름 배열 또는 null
                  *
                  * @example
                  * ```typescript
                  * // dimension: 'district', parentDimension 체인: district → city → country
                  * slicer.getHierarchyLevels();
                  * // ['country', 'city', 'district']
                  * ```
                  */
                 getHierarchyLevels(): string[] | null;
                 /**
                  * 계층 구조의 트리 데이터를 반환한다.<br/>
                  * parentDimension 체인을 따라 루트→리프까지 트리를 구성한다.
                  * 각 노드는 해당 레벨의 값, 소속 차원, 하위 데이터 건수를 포함한다.<br/>
                  *
                  * 계층이 없으면(getHierarchyLevels()가 null이면) null을 반환한다.<br/>
                  *
                  * @returns 트리 노드 배열 또는 null
                  *
                  * @example
                  * ```typescript
                  * slicer.getTreeValues();
                  * // [
                  * //   { dimension: 'country', value: 'Korea', count: 5, children: [
                  * //     { dimension: 'city', value: 'Seoul', count: 3, children: [
                  * //       { dimension: 'district', value: 'Gangnam', count: 2 },
                  * //       { dimension: 'district', value: 'Jongno', count: 1 }
                  * //     ]},
                  * //     { dimension: 'city', value: 'Busan', count: 2, children: [...] }
                  * //   ]}
                  * // ]
                  * ```
                  */
                 getTreeValues(): SlicerTreeNode[] | null;
                 /**
                  * 트리 경로로 값을 선택한다.<br/>
                  * 경로가 중간 노드까지만 지정되면, 해당 노드 아래 모든 리프 값을 선택한다.
                  * 경로가 리프까지 지정되면, 해당 리프 값 하나를 선택한다.<br/>
                  *
                  * @param path - 루트에서 대상 노드까지의 값 배열 (예: ['Korea', 'Seoul'])
                  * @param apply - true이면 DataCube에 즉시 반영 (기본값: true)
                  * @returns 선택 상태가 변경되었으면 true
                  *
                  * @example
                  * ```typescript
                  * // 중간 노드 선택 → 하위 리프 전체 선택
                  * slicer.selectNode(['Korea', 'Seoul']);
                  * // → Gangnam, Jongno 등 Seoul 아래 모든 district 선택
                  *
                  * // 리프 직접 선택
                  * slicer.selectNode(['Korea', 'Seoul', 'Gangnam']);
                  * ```
                  */
                 selectNode(path: any[], apply?: boolean): boolean;
                 /**
                  * 트리 경로로 값을 선택 해제한다.<br/>
                  * 경로가 중간 노드까지만 지정되면, 해당 노드 아래 모든 리프 값을 해제한다.<br/>
                  *
                  * @param path - 루트에서 대상 노드까지의 값 배열
                  * @param apply - true이면 DataCube에 즉시 반영 (기본값: true)
                  * @returns 선택 상태가 변경되었으면 true
                  *
                  * @example
                  * ```typescript
                  * slicer.deselectNode(['Korea', 'Seoul']);
                  * // → Seoul 아래 모든 district 선택 해제
                  * ```
                  */
                 deselectNode(path: any[], apply?: boolean): boolean;
                 /**
                  * 트리 노드의 체크 상태를 반환한다.<br/>
                  * 해당 노드 아래의 리프 값들이 선택된 비율에 따라 상태를 결정한다.<br/>
                  *
                  * @param path - 루트에서 대상 노드까지의 값 배열
                  * @returns 'all' | 'some' | 'none'
                  *
                  * @example
                  * ```typescript
                  * slicer.selectNode(['Korea', 'Seoul']);
                  * slicer.getNodeState(['Korea']);        // 'some' (Seoul만 선택, Busan은 미선택)
                  * slicer.getNodeState(['Korea', 'Seoul']); // 'all'
                  * slicer.getNodeState(['Korea', 'Busan']); // 'none'
                  * ```
                  */
                 getNodeState(path: any[]): SlicerNodeState;
                 /**
                  * 옵션 정규화 (기본값 설정).<br/>
                  */
                 private $_normalizeOptions;
                 /**
                  * 상태 초기화.<br/>
                  */
                 private $_initializeState;
                 /**
                  * Date 또는 날짜 문자열을 epoch ms로 변환.<br/>
                  */
                 /**
                  * 모든 필터 조건을 종합하여 isActive를 갱신한다.<br/>
                  */
                 private $_updateIsActive;
                 private $_toEpochMs;
                 /**
                  * parentDimension 체인을 상향 추적하여 계층 레벨 배열을 구성.<br/>
                  * 결과는 [루트, ..., 리프(=dimension)] 순서.
                  * parentDimension이 없으면 null 반환.<br/>
                  */
                 private $_resolveHierarchy;
                 /**
                  * 트리 경로에 해당하는 리프 값들을 찾는다.<br/>
                  * path가 리프까지 도달하면 단일 값, 중간 노드이면 하위 리프 전체를 수집한다.<br/>
                  */
                 private $_resolveLeafValues;
                 /**
                  * 사용 가능한 값들을 DataCube에서 로드.<br/>
                  */
                 private $_loadAvailableValues;
                 /**
                  * 사용 가능한 값들을 정렬.<br/>
                  */
                 private $_sortAvailableValues;
                 /**
                  * 날짜 프리셋에 따른 범위 계산.<br/>
                  */
                 private calculateDateRange;
                }

                /**
                 * 트리 노드의 체크 상태.<br/>
                 * - **'all'**: 하위 항목 전체 선택 (✓)
                 * - **'some'**: 일부만 선택 (▣, indeterminate)
                 * - **'none'**: 미선택 (☐)
                 */
                declare type SlicerNodeState = 'all' | 'some' | 'none';

                /**
                 * Slicer 설정 옵션.<br/>
                 */
                declare interface SlicerOptions {
                    /**
                     * Slicer 이름.<br/>
                     * DataCube에 등록할 때 Slicer를 식별하는 키로 사용된다.<br/>
                     * addSlicer()로 등록할 때는 필수.<br/>
                     */
                    name?: string;
                    /**
                     * 대상 차원(dimension) 이름.<br/>
                     */
                    dimension: string;
                    /**
                     * Slicer 타입.<br/>
                     * @default 'list'
                     */
                    type?: SlicerType;
                    /**
                     * 선택 모드 (single/multiple).<br/>
                     * @default 'multiple'
                     */
                    selectionMode?: SelectionMode_2;
                    /**
                     * 표시할 레이블 필드.<br/>
                     * 지정하지 않으면 dimension 값 그대로 표시.<br/>
                     */
                    labelField?: string;
                    /**
                     * 정렬 방식.<br/>
                     * @default 'asc'
                     */
                    sortOrder?: 'asc' | 'desc' | 'count' | 'none';
                    /**
                     * 최대 표시 항목 수.<br/>
                     * 초과 시 검색 기능이 자동으로 활성화됨.<br/>
                     */
                    maxItems?: number;
                    /**
                     * 빈 값(null) 표시 여부.<br/>
                     * @default false
                     */
                    showEmpty?: boolean;
                    /**
                     * "전체 선택" 옵션 표시 여부.<br/>
                     * @default true
                     */
                    showSelectAll?: boolean;
                    /**
                     * 항목별 카운트 표시 여부.<br/>
                     * @default true
                     */
                    showCounts?: boolean;
                }

                /**
                 * Slicer 상태 정보.<br/>
                 */
                declare interface SlicerState {
                    /**
                     * 차원 이름.<br/>
                     */
                    dimension: string;
                    /**
                     * 현재 선택된 값들.<br/>
                     */
                    selectedValues: Set<any>;
                    /**
                     * 범위 필터 (range/date 타입).<br/>
                     */
                    range?: {
                        start: any;
                        end: any;
                    };
                    /**
                     * 검색 텍스트.<br/>
                     */
                    searchText?: string;
                    /**
                     * 사용 가능한 모든 값들과 카운트.<br/>
                     */
                    availableValues: Map<any, number>;
                    /**
                     * 필터 활성화 여부.<br/>
                     */
                    isActive: boolean;
                }

                /**
                 * Slicer 트리 노드.<br/>
                 * `getTreeValues()`가 반환하는 계층 구조의 노드.
                 * 리프 노드는 `children`이 없고, 중간/루트 노드는 해당 값의 하위 항목을 포함한다.<br/>
                 */
                declare type SlicerTreeNode = {
                    /** 차원 이름 (이 노드가 속한 레벨) */
                    dimension: string;
                    /** 노드 값 */
                    value: any;
                    /** 이 노드 하위의 데이터 건수 */
                    count: number;
                    /** 하위 노드 (리프이면 undefined) */
                    children?: SlicerTreeNode[];
                };

                /**
                 * Slicer UI 타입.<br/>
                 * - **'list'**: 목록 형태 (단일/다중 선택)
                 * - **'range'**: 범위 형태 (숫자, 날짜)
                 * - **'date'**: 날짜 전용 (캘린더, 상대적 날짜)
                 */
                declare type SlicerType = 'list' | 'range' | 'date';

                /**
                 * 슬라이더 레이블 위치.<br/>
                 */
                declare type SliderLabelPosition = 'bottom' | 'side' | 'auto';

                /**
                 * 슬라이더 selector 옵션.<br/>
                 * 연속 범위 슬라이더로, 날짜에 국한하지 않고 임의의 수치 범위를 지원한다.<br/>
                 */
                declare interface SliderSelectorOptions extends FilterSelectorOptions {
                    /** @dummy */
                    type?: typeof SliderSelectorType;
                    /**
                     * 슬라이더 최소값.<br/>
                     * 지정하지 않으면 데이터 범위에서 자동 산출한다.<br/>
                     */
                    min?: number | Date;
                    /**
                     * 슬라이더 최대값.<br/>
                     * 지정하지 않으면 데이터 범위에서 자동 산출한다.<br/>
                     */
                    max?: number | Date;
                    /**
                     * 슬라이더 이동 단위(step).<br/>
                     * 지정하지 않으면 연속(continuous) 이동한다.<br/>
                     */
                    step?: number;
                    /**
                     * range 레이블 위치.<br/>
                     * - 'bottom': 슬라이더 아래에 표시<br/>
                     * - 'side': 슬라이더 좌우에 표시<br/>
                     * - 'auto': simple 모드에서 label과 track을 충분히 구분할 수 있으면 'side', 그렇지 않으면 'bottom'으로 자동 결정<br/>
                     *
                     * @default 'auto'
                     */
                    labelPosition?: SliderLabelPosition;
                    /**
                     * 값을 레이블 텍스트로 변환하는 포매터 함수.<br/>
                     * 지정하지 않으면 기본 toString()을 사용한다.<br/>
                     */
                    labelFormatter?: (value: number) => string;
                    /**
                     * 슬라이더 바(track) 높이(px).<br/>
                     *
                     * @default undefined (브라우저 기본값 사용)
                     */
                    trackHeight?: number;
                    /**
                     * 핸들 반지름(px).<br/>
                     *
                     * @default undefined (브라우저 기본값 사용)
                     */
                    handleRadius?: number;
                    /**
                     * 헤더에 표시되는 simple 모드에서 셀렉터의 최대 너비(px).<br/>
                     * 숫자로 지정하면 px 단위로 해석한다.
                     * 문자열로 지정하면 '%' 등 CSS width 값으로 해석한다.<br/>
                     *
                     * @default 'auto'
                     */
                    simpleWidth?: number | string;
                    /**
                     * 헤더에 표시되는 simple 모드에서 트랙(슬라이더 바)의 최소 너비(px).<br/>
                     * 컨테이너가 좁아도 트랙이 이 값 아래로 줄어들지 않도록 하여 드래그 사용성을 보장한다.<br/>
                     * 컨테이너가 충분히 넓으면 트랙이 이미 이 값보다 커지므로 영향을 주지 않는다.<br/>
                     * {@page simpleMaxTrackWidth}보다 크게 지정하면 max 값으로 clamp된다.<br/>
                     *
                     * @default 100
                     */
                    simpleMinTrackWidth?: number;
                    /**
                     * 헤더에 표시되는 simple 모드에서 트랙 영역(레이블 + 트랙)의 최대 너비(px).<br/>
                     * 컨테이너가 넓을 때 트랙이 과도하게 늘어나는 것을 막는다.<br/>
                     * 레이블과 트랙 끝 정렬을 유지하기 위해 트랙이 아니라 레이블을 포함한 행 전체에 적용된다.<br/>
                     */
                    simpleMaxTrackWidth?: number;
                }

                declare const SliderSelectorType = "slider";

                /**
                 * 정렬 기준.<br/>
                 */
                declare interface SortCriteria {
                    /**
                     * 필드 인덱스 또는 이름.<br/>
                     */
                    field: string | number;
                    /**
                     * 정렬 방향.<br/>
                     */
                    order: SortOrder;
                }

                /**
                 * 정렬 함수.<br/>
                 * 두 행의 values 배열과 원본 테이블의 행 인덱스를 받아서 비교 결과를 반환한다.
                 * [주의] values 배열은 내부적으로 사용되므로 수정하거나 별도로 보관하지 말 것.<br/>
                 *
                 * @param valuesA 첫 번째 행의 값 배열
                 * @param rowA 첫 번째 행의 원본 테이블 인덱스
                 * @param valuesB 두 번째 행의 값 배열
                 * @param rowB 두 번째 행의 원본 테이블 인덱스
                 * @returns 비교 결과 (0: 같음, 음수: a < b, 양수: a > b)
                 */
                declare type SortFunction = (valuesA: any[], rowA: number, valuesB: any[], rowB: number) => number;

                /**
                 * 정렬 방향.<br/>
                 */
                declare type SortOrder = 'asc' | 'desc';

                declare interface SparkBarSeriesRendererOptions extends SparkChartSeriesRendererOptions {
                    /** @dummy */
                    type?: typeof SparkBarSeriesRendererType;
                    /**
                     * 막대 그래프의 최소값을 설정한다.<br/>
                     * 이 값이 설정되지 않으면, 각 시리즈의 데이터 범위에 따라 자동으로 결정된다.
                     * 모든 시리즈가 동일한 축 범위를 가지도록 하려면, 이 옵션을 사용하여 고정된 최소값을 지정할 수 있다.
                     * 이 값보다 작은 데이터 값은 모두 이 최소값에서 시작하는 막대로 표시된다.
                     *
                     * @default 0
                     */
                    minValue?: number;
                    /**
                     * 막대 그래프의 색상.<br/>
                     *
                     * @default '#28a745'
                     */
                    barColor?: string;
                }

                declare const SparkBarSeriesRendererType = "sparkbar";

                declare interface SparkChartSeriesRendererOptions extends PivotSeriesRendererOptions {
                }

                declare interface SparkLineSeriesRendererOptions extends SparkChartSeriesRendererOptions {
                    /** @dummy */
                    type?: typeof SparkLineSeriesRendererType;
                    minValue?: number;
                    maxValue?: number;
                    curved?: boolean;
                    lineColor?: string | string[];
                    areaColor?: string | string[];
                }

                declare const SparkLineSeriesRendererType = "sparkline";

                declare interface SparkWinlossSeriesRendererOptions extends SparkChartSeriesRendererOptions {
                    /** @dummy */
                    type?: typeof SparkWinlossSeriesRendererType;
                    /**
                     * 막대 그래프의 기준값을 설정한다.<br/>
                     *
                     * @defaul 0
                     */
                    baseValue?: number;
                    /**
                     * 막대 그래프의 색상.<br/>
                     *
                     * @default '#28a745'
                     */
                    barColor?: string;
                }

                declare const SparkWinlossSeriesRendererType = "sparkwinloss";

                /**
                 * 무한대로 회전하는 스피너 형태의 인디케이터 뷰. (로딩 중 표시 등)
                 */
                declare class SpinnerIndicatorView extends IndicatorView {
                    private _spinner;
                    private _label;
                    constructor(doc: Document);
                    /**
                     * 스피너와 함께 표시할 텍스트를 설정한다. 빈 문자열이면 텍스트는 숨긴다.<br/>
                     * UIElement.setText를 오버라이드하여 indicator dom 전체가 아니라 라벨에만 반영되도록 한다.<br/>
                     * 기본적으로 끝에 '...' 애니메이션이 붙는다. 끌고 싶으면 animated=false로 호출.
                     */
                    setText(text: string, animated?: boolean): this;
                    protected _doInit(doc: Document, initData: any): void;
                }

                /**
                 * 스타 스키마 데이터 소스.<br/>
                 * 중앙의 Fact 테이블과 주변의 Dimension 테이블들로 구성된다.<br/>
                 * 모든 테이블은 DataSet에 등록된 이름으로 참조한다.<br/>
                 *
                 * ## 스타 스키마 구조
                 * ```
                 *                    ┌──────────────┐
                 *                    │   Product    │
                 *                    │  (Dimension) │
                 *                    └──────┬───────┘
                 *                           │
                 *   ┌──────────────┐  ┌─────┴─────┐  ┌──────────────┐
                 *   │    Region    │──│   Sales   │──│     Date     │
                 *   │  (Dimension) │  │  (Fact)   │  │  (Dimension) │
                 *   └──────────────┘  └─────┬─────┘  └──────────────┘
                 *                           │
                 *                    ┌──────┴───────┐
                 *                    │   Customer   │
                 *                    │  (Dimension) │
                 *                    └──────────────┘
                 * ```
                 *
                 * ## 지원 스키마 패턴
                 * `DimensionLink.from` 을 통해 다음 패턴까지 모두 표현 가능하다.
                 *
                 * - **순수 Star**: `from` 생략, Fact ↔ Dim 1-hop
                 * - **Snowflake (다단계 정규화)**: `from`으로 부모 dim을 가리켜 Fact → Dim → SubDim → ... chain 구성 (depth 무제한, DAG)
                 * - **Role-playing Dimension**: 같은 테이블을 서로 다른 `alias`로 여러 번 등록 (예: `date`를 `order_date`/`ship_date`로)
                 * - **Conformed Dimension**: 여러 dim이 같은 sub-dim을 공유 (alias만 분리하면 됨, 예: `customer→region`, `store→region`)
                 * - **분기형/다이아몬드형 chain**: DAG이므로 한 dim에서 여러 자식 dim 분기 또는 두 경로가 같은 sub-dim에 도달 가능
                 * - **NULL FK / 매칭 실패**: 자동으로 `null` 반환 (fact row는 유지 = left outer 의미)
                 *
                 * ## 검증 규칙
                 * - 중복 alias 거부
                 * - 미정의 `from` alias 참조 거부
                 * - 자기참조(`from === self`) 거부
                 * - 순환 참조(DAG 위반) 거부 — `_detectCycles()`
                 * - `from` 생략 시 FK가 Fact에 없으면 에러, 단 다른 Dim에 있으면 "use 'from'" 힌트 제공
                 * - Dimension PK 중복 거부 (`buildIndexes()`)
                 *
                 * ## 미지원 / 한계 (실무 snowflake와 자주 결합되는 인접 기능)
                 * 다음 항목들은 본 클래스의 범위를 벗어나며 별도 기능이 필요하다.
                 *
                 * - **복합키(Composite FK/PK) 관계**: 현재 단일 컬럼 join만 지원. 회피책 — 결합 키 컬럼을 미리 만들어 단일 PK화.
                 * - **Unknown Member 라우팅**: FK 매칭 실패 시 항상 `null`. "Unknown" 행으로 라우팅하는 옵션 없음.
                 * - **타입 불일치 FK/PK**: `Map` strict equality 기반이므로 `"1"` vs `1`은 매칭 실패. 데이터 정규화로 회피.
                 * - **SCD Type 2 (이력 dimension)**: 시점 기반 join 미지원. 동일 자연키 + valid_from/valid_to 구간 처리는 별도 기능.
                 * - **Bridge / Many-to-Many**: 학생↔과목 같은 M:N 관계. snowflake 범위 밖이므로 별도 `BridgeLink` 필요.
                 * - **Parent-Child 자기참조 계층**: 조직도, BOM 등. 현재 self-from은 차단되며 별도 hierarchy 기능 필요.
                 * - **Multi-Fact (Galaxy/Constellation)**: StarSchema는 fact 1개. Sales + Inventory처럼 fact 여러 개가 공통 dim을 공유하며 drill-across 하려면 상위 `SchemaSet` 컨테이너 필요.
                 * - **Hierarchy 메타선언**: snowflake로 link는 되지만 "Department→Category→Product가 한 drill-down hierarchy"라는 선언적 정의가 없음. 현재는 DataCube 스키마 측에서 순서로 표현.
                 * - **PK index 공유 최적화**: 같은 `(table, primaryKey)`를 여러 alias가 쓰면 동일 Map이 alias 수만큼 중복 생성됨 (향후 최적화 여지).
                 * - **양방향 필터 / 자동 차원 평탄화**: 현재 Dim→Fact 단방향 lookup만. Bi-directional cross-filter 없음.
                 *
                 * @example
                 * ```typescript
                 * // DataSet에 테이블들 등록
                 * const ds = new DataSet();
                 * ds.add('sales', salesTable);
                 * ds.add('product', productTable);
                 * ds.add('region', regionTable);
                 *
                 * // StarSchema 생성
                 * const star = new StarSchema({
                 *     dataset: ds,
                 *     fact: 'sales',
                 *     dimensions: [
                 *         { table: 'product', foreignKey: 'product_id' },
                 *         { table: 'region',  foreignKey: 'region_id' },
                 *         { table: 'date',    foreignKey: 'date_id', primaryKey: 'id' }
                 *     ]
                 * });
                 *
                 * // DataCube에서 사용
                 * const cube = new DataCube({
                 *     source: star,
                 *     schema: { ... }
                 * });
                 * ```
                 */
                declare class StarSchema {
                    /**
                     * 컬럼 참조 문자열에서 테이블 별칭과 컬럼명을 분리한다.<br/>
                     *
                     * @param columnRef 컬럼 참조 (예: 'product.name' 또는 'amount')
                     * @returns { alias: string | null, column: string }
                         *
                         * @example
                         * ```typescript
                         * StarSchema.parseColumnRef('product.name')  // { alias: 'product', column: 'name' }
                         * StarSchema.parseColumnRef('amount')        // { alias: null, column: 'amount' }
                         * ```
                         */
                     static parseColumnRef(columnRef: string): {
                         alias: string | null;
                         column: string;
                     };
                     /**
                      * StarSchema 인스턴스인지 확인하는 타입 가드.<br/>
                      *
                      * @param source 데이터 소스
                      * @returns StarSchema 타입 여부
                      */
                     static isStarSchema(source: any): source is StarSchema;
                     private _name;
                     private _dataset;
                     private _factName;
                     private _dimensions;
                     /** alias → DimensionLink 빠른 조회용 맵 */
                     private _dimensionMap;
                     /** alias → (PK값 → Dimension row index) 인덱스 맵 */
                     private _pkIndexes;
                     /** alias → Fact 부터 해당 alias 까지의 resolution chain */
                     private _chains;
                     /**
                      * StarSchema를 생성한다.<br/>
                      *
                      * @param options 스타 스키마 옵션
                      * @throws {Error} Fact 또는 Dimension 테이블이 DataSet에 없을 때
                      */
                     constructor(options: StarSchemaOptions);
                     get name(): string;
                     set name(value: string);
                     /**
                      * DataSet을 반환한다.<br/>
                      */
                     get dataset(): DataSet;
                     /**
                      * Fact 테이블 이름을 반환한다.<br/>
                      */
                     get factName(): string;
                     /**
                      * Fact 테이블 DataFrame을 반환한다.<br/>
                      */
                     get fact(): DataFrame;
                     /**
                      * Dimension 연결 정의 배열을 반환한다.<br/>
                      */
                     get dimensions(): readonly DimensionLink[];
                     /**
                      * Dimension alias 목록을 반환한다.<br/>
                      */
                     get dimensionAliases(): string[];
                     /**
                      * 스타 스키마 유효성을 검증한다.<br/>
                      * DataSet에 필요한 테이블들이 모두 등록되어 있는지 확인한다.<br/>
                      *
                      * @throws {Error} Fact 또는 Dimension 테이블이 DataSet에 없을 때
                      * @throws {Error} FK 컬럼이 Fact 테이블에 없을 때
                      * @throws {Error} Dimension 간 link 시도 시 (FK가 다른 Dimension에 있을 때)
                      */
                     validate(): void;
                     /* Excluded from this release type: _detectCycles */
                     /**
                      * alias로 Dimension 연결 정의를 찾는다.<br/>
                      *
                      * @param alias 테이블 별칭 (또는 테이블 이름)
                      * @returns DimensionLink 또는 undefined
                      */
                     getDimension(alias: string): DimensionLink | undefined;
                     /**
                      * alias로 Dimension 테이블 DataFrame을 찾는다.<br/>
                      *
                      * @param alias 테이블 별칭 (또는 테이블 이름)
                      * @returns DataFrame 또는 undefined
                      */
                     getDimensionTable(alias: string): DataFrame | undefined;
                     /**
                      * 특정 alias가 존재하는지 확인한다.<br/>
                      *
                      * @param alias 테이블 별칭
                      * @returns 존재 여부
                      */
                     hasDimension(alias: string): boolean;
                     /**
                      * 컬럼 참조가 Fact 테이블인지 확인한다.<br/>
                      * alias가 없거나 Dimension에 없으면 Fact 테이블로 간주.<br/>
                      *
                      * @param columnRef 컬럼 참조 (예: 'product.name' 또는 'amount')
                      * @returns Fact 테이블 컬럼 여부
                      */
                     isFactColumn(columnRef: string): boolean;
                     /**
                      * 컬럼 참조에서 실제 테이블과 컬럼명을 해석한다.<br/>
                      *
                      * @param columnRef 컬럼 참조 (예: 'product.name' 또는 'amount')
                      * @returns { table: DataFrame, column: string, isFactTable: boolean }
                          * @throws {Error} 존재하지 않는 alias 참조 시
                          */
                      resolveColumn(columnRef: string): {
                          table: DataFrame;
                          column: string;
                          isFactTable: boolean;
                      };
                      /* Excluded from this release type: _getFieldIndex */
                      /* Excluded from this release type: _getFieldNames */
                      /**
                       * 모든 Dimension 테이블에 대한 PK 인덱스를 구축한다.<br/>
                       * FK → PK lookup 성능을 위해 Dimension PK 값 → row index 맵을 생성한다.<br/>
                       *
                       * @returns this (메서드 체이닝용)
                       * @throws {Error} PK 컬럼이 없거나 중복 PK 값이 있을 때
                       */
                      buildIndexes(): this;
                      /* Excluded from this release type: _computeChain */
                      /**
                       * Fact 부터 특정 dimension alias 까지 도달하는 resolution chain을 반환한다.<br/>
                       * buildIndexes() 호출 이후 사용 가능하다.<br/>
                       *
                       * @param alias dimension alias
                       * @returns chain step 배열 또는 undefined
                       */
                      getResolutionChain(alias: string): readonly ResolutionStep[] | undefined;
                      /**
                       * Fact row index 로부터 chain을 따라 특정 alias의 dim row index를 찾는다.<br/>
                       * snowflake 다단계 link를 자동으로 따라간다.<br/>
                       *
                       * @param alias dimension alias
                       * @param factRow fact row index
                       * @returns dim row index, 도달 실패 시 -1
                       */
                      lookupRowFromFact(alias: string, factRow: number): number;
                      /**
                       * Fact row index 로부터 chain을 따라 dimension의 특정 컬럼 값을 가져온다.<br/>
                       *
                       * @param alias dimension alias
                       * @param factRow fact row index
                       * @param column dimension 컬럼명
                       * @returns 컬럼 값, 실패 시 null
                       */
                      lookupValueFromFact(alias: string, factRow: number, column: string): any;
                      /**
                       * 특정 Dimension의 PK 인덱스를 반환한다.<br/>
                       *
                       * @param alias Dimension 별칭
                       * @returns PK값 → row index 맵, 없으면 undefined
                       */
                      getPkIndex(alias: string): Map<any, number> | undefined;
                      /**
                       * FK 값으로 Dimension 테이블의 row를 찾는다.<br/>
                       *
                       * @param alias Dimension 별칭
                       * @param fkValue FK 값
                       * @returns Dimension row index, 없으면 -1
                       */
                      lookupDimensionRow(alias: string, fkValue: any): number;
                      /**
                       * FK 값으로 Dimension 테이블의 특정 컬럼 값을 조회한다.<br/>
                       *
                       * @param alias Dimension 별칭
                       * @param fkValue FK 값
                       * @param column Dimension 컬럼명
                       * @returns 컬럼 값, 없으면 null
                       */
                      lookupDimensionValue(alias: string, fkValue: any, column: string): any;
                      /**
                       * 인덱스가 구축되었는지 확인한다.<br/>
                       */
                      get hasIndexes(): boolean;
                     }

                     /**
                      * 스타 스키마 생성 옵션.<br/>
                      */
                     declare type StarSchemaOptions = {
                         name?: string;
                         /**
                          * 테이블들을 관리하는 DataSet.<br/>
                          */
                         dataset: DataSet;
                         /**
                          * Fact 테이블 이름 (DataSet에 등록된 이름).<br/>
                          */
                         fact: string;
                         /**
                          * Dimension 테이블 연결 정의 배열.<br/>
                          */
                         dimensions: DimensionLink[];
                     };

                     /**
                      * 소계 셀 위치 지정 타입.<br/>
                      * - leaf 행/열: 인덱스로 직접 지정
                      * - group 단일 값: {dimension, value}로 지정
                      *   - 상위 차원 value 지정 시: 해당 그룹의 합계 (단일 값)
                      *   - 하위 차원 value 지정 시: 상위 그룹별로 분리된 배열
                      * - group 전체: {dimension}만 지정 (value 생략 시 전체 반환)
                      */
                     declare type SubtotalPosition = number | {
                         dimension: string;
                         value: any;
                     } | {
                         dimension: string;
                     } | {
                         dimensionIndex: number;
                         valueIndex: number;
                     } | {
                         dimensionIndex: number;
                     };

                     declare class TableEventAware extends REventAware<IPivotTableEvents> {
                         table: PivotTable;
                         constructor(table: PivotTable);
                         fire<K extends keyof IPivotTableEvents>(eventName: K, ...args: RestParameters_2<IPivotTableEvents[K]>): void;
                     }

                     /**
                      * 값이 문자형일 때 텍스트 변경 형식.
                      * 세미콜론(;)으로 구분되는 형식. 두개의 문자열은 각각 String.prototype.replace의 매개변수가 된다.
                      * 예) 사업자번호: '(\\d{3})(\\d{2})(\\d{5});$1-$2-$3'
                      */
                     declare class TextFormatter {
                         private static readonly Formatters;
                         static getFormatter(format: string): TextFormatter;
                         private _format;
                         private _pattern;
                         private _replace;
                         constructor(format: string);
                         get format(): string;
                         toStr(text: string): string;
                         $_parse(fmt: string): void;
                     }

                     declare interface TextSeriesRendererOptions extends PivotSeriesRendererOptions {
                         /** @dummy */
                         type?: typeof TextSeriesRendererType;
                     }

                     declare const TextSeriesRendererType = "text";

                     /**
                      * 타임라인 selector 옵션.<br/>
                      * 이산 블록(discrete blocks) 방식으로 기간을 선택한다.<br/>
                      * header 영역에 배치할 수 없다.
                      */
                     declare interface TimelineSelectorOptions extends FilterSelectorOptions {
                         /** @dummy */
                         type?: typeof TimelineSelectorType;
                         min?: Date | number;
                         max?: Date | number;
                         /**
                          * 타임라인 시간 단위.<br/>
                          * {@page availableUnits}이 비어있지 않고 현재 단위가 포함되어 있지 않으면, availableUnits의 첫 번째 단위로 변경된다.<br/>
                          *
                          * @default 'months'
                          */
                         unit?: TimelineUnit;
                         /**
                          * 사용자가 전환 가능한 시간 단위 목록.<br/>
                          * 목록이 비어 있으면 {@page unit}으로 지정한 단위가 표시되고 사용된다.<br/>
                          *
                          * @default ['years', 'quarters', 'months', 'days']
                          */
                         availableUnits?: TimelineUnit[];
                         /**
                          * days 단위에서 블록 배치 방식.<br/>
                          * - 'list': 기본 순차 블록 나열<br/>
                          * - 'calendar': 요일 기준 7열 달력 배치 (주말 스타일 포함)<br/>
                          *
                          * @default 'list'
                          */
                         daysLayout?: 'list' | 'calendar';
                         /**
                          * 헤더에 표시되는 simple 모드에서 셀렉터의 최대 너비(px).<br/>
                          * 숫자로 지정하면 px 단위로 해석한다.
                          * 문자열로 지정하면 '%' 등 CSS width 값으로 해석한다.<br/>
                          *
                          * @default 'auto'
                          */
                         simpleWidth?: number | string;
                         /**
                          * 헤더에 표시되는 simple 모드에서 팝업 리스트의 최대 너비(px).<br/>
                          *
                          * @default 400
                          */
                         simpleListWidth?: number;
                         /**
                          * 헤더에 표시되는 simple 모드에서 팝업 리스트의 최대 높이(px).<br/>
                          *
                          * @default 300
                          */
                         simpleListHeight?: number;
                     }

                     declare const TimelineSelectorType = "timeline";

                     /**
                      * 타임라인 시간 단위.<br/>
                      */
                     declare type TimelineUnit = 'years' | 'quarters' | 'months' | 'days';

                     /**
                      * Top N 필터 모드.
                      * - **'count'**: 절대 개수 (기본값)
                      * - **'percent'**: 상위 N% (예: limit=10이면 상위 10%)
                      * - **'sum'**: 누적 합이 limit에 도달할 때까지
                      */
                     declare type TopNMode = 'count' | 'percent' | 'sum';

                     declare type TotalPosition = 'start' | 'end';

                     /**
                      * 트리 뷰에서 렌더링할 flat row 정보.
                      */
                     declare interface TreeRowInfo {
                         /** PivotRow */
                         prow: PivotRow;
                         /** visible row index */
                         vrow: number;
                         /** depth (indent level) */
                         depth: number;
                         /** 그룹(subtotal) 행인가 */
                         isGroup: boolean;
                         /** group일 때 collapsed 여부 */
                         collapsed: boolean;
                         /** 그룹 행일 때 원본 header cell (expand/collapse 등) */
                         headerCell?: PivotRowHeaderCell;
                         /** measure 이름 (valuesOnRows일 때) */
                         measureLabel?: string;
                         /** 표시 텍스트 */
                         label: string;
                     }

                     /**
                      * 트리 selector 옵션.<br/>
                      */
                     declare interface TreeSelectorOptions extends FilterSelectorOptions {
                         /** @dummy */
                         type?: typeof TreeSelectorType;
                         /**
                          * 항목별 카운트 표시 여부.<br/>
                          * @default true
                          */
                         showCounts?: boolean;
                         /**
                          * 초기 펼침 레벨.<br/>
                          * 0이면 모두 접힘, Infinity이면 모두 펼침.<br/>
                          * @default 1
                          */
                         expandLevel?: number;
                         /**
                          * 헤더에 표시되는 simple 모드에서 셀렉터의 최대 너비(px).<br/>
                          * 숫자로 지정하면 px 단위로 해석한다.
                          * 문자열로 지정하면 '%' 등 CSS width 값으로 해석한다.<br/>
                          *
                          * @default 'auto'
                          */
                         simpleWidth?: number | string;
                         /**
                          * 헤더에 표시되는 simple 모드에서 셀렉터의 최대 너비(px).<br/>
                          * 숫자로 지정하면 px 단위로 해석한다.
                          * 문자열로 지정하면 '%' 등 CSS width 값으로 해석한다.<br/>
                          *
                          * @default 300
                          */
                         simpleMaxWidth?: number | string;
                         /**
                          * 헤더에 표시되는 simple 모드에서 팝업 리스트의 최대 높이(px).<br/>
                          *
                          * @default 200
                          */
                         simpleListHeight?: number;
                     }

                     declare const TreeSelectorType = "tree";

                     declare type Typed = Int32Array | Uint32Array | Float64Array | Uint8Array;

                     declare abstract class UIControl<TEvents extends UIControlEvents = UIControlEvents> extends RControl<TEvents> {
                         private _root;
                         private _mediaQuery;
                         private _themeChangeHandler;
                         constructor(doc: Document, container: string | HTMLDivElement, className: string, rootClassName?: string);
                         protected _initRoot(doc: Document, root: UIElement): void;
                         protected _registerEventHandlers(dom: HTMLDivElement): void;
                         protected _unregisterEventHandlers(dom: HTMLDivElement): void;
                         setCssData(data: string, value: any): void;
                         protected _creatDefaultTool(): IControlTool;
                         protected _render(): void;
                         protected get root(): RootElement;
                         protected _addElement(element: UIElement): void;
                         protected _doRender(doc: Document, bounds: Rectangle): void;
                         protected _doAfterRender(doc: Document): void;
                     }

                     declare interface UIControlEvents extends IControlEvents {
                     }

                     declare class UIElement extends RObject {
                         private _inited;
                         private _visible;
                         private _x;
                         private _y;
                         private _width;
                         private _height;
                         private _parent;
                         private _dom;
                         private _styles;
                         userData: any;
                         initData: any;
                         constructor(doc: Document, className?: string, elementType?: string);
                         init(): this;
                         protected _doDispose(): void;
                         get doc(): Document;
                         get dom(): HTMLElement;
                         get parent(): UIElement;
                         get container(): UIControl;
                         /** visible */
                         get visible(): boolean;
                         setVisible(value: boolean): boolean;
                         /** x */
                         get x(): number;
                         set x(value: number);
                         /** y */
                         get y(): number;
                         set y(value: number);
                         /** width */
                         get width(): number;
                         set width(value: number);
                         /** height */
                         get height(): number;
                         set height(value: number);
                         get size(): ISize;
                         get offsetSize(): ISize;
                         isDom(dom: Element): boolean;
                         containsDom(dom: Element): boolean;
                         containsClass(className: string): boolean;
                         setClass(className: string): void;
                         addClass(className: string): this;
                         removeClass(className: string): this;
                         toggleClass(className: string, force?: boolean): this;
                         setHint(title: string): this;
                         setDisabled(disabled: boolean): this;
                         addListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
                         removeListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
                         setAttr(name: string, value: any): this;
                         setBoolAttr(name: string, value: boolean): this;
                         removeAttr(name: string): this;
                         setBoolData(name: string, value: boolean): this;
                         getBoolData(name: string): boolean;
                         protected _styleChanged(): void;
                         clearStyles(): this;
                         _internalSetStyle(style: string, value: string): void;
                         _internalSetStyles(styles: {
                             [key: string]: string;
                         }): void;
                         setStyle(style: string, value: string): this;
                         setStyles(styles: object, clear?: boolean): this;
                         updateStyles(styles: object): this;
                         setImportantStyle(style: string, value: any): void;
                         getBoundingRect(): DOMRect;
                         setBounds(x: number, y: number, width: number, height: number): this;
                         setRect(r: IRect): this;
                         resize(width: number, height: number): UIElement;
                         setWidth(width: number): UIElement;
                         setHeight(height: number): UIElement;
                         move(x: number, y: number): UIElement;
                         contains(dom: Element | UIElement): boolean;
                         appendDom<T extends Element>(dom: T): T;
                         insertDom<T extends Element>(dom: T, before: UIElement): T;
                         appendDiv(doc: Document, className?: string): HTMLDivElement;
                         insertDiv(doc: Document, before: Element, className?: string): HTMLDivElement;
                         appendSpan(doc: Document, className?: string, text?: string): HTMLSpanElement;
                         insertSpan(doc: Document, before: Element, className?: string, text?: string): HTMLSpanElement;
                         appendText(doc: Document, text: string): Text;
                         appendButton(doc: Document, className?: string, text?: string, hint?: string): HTMLButtonElement;
                         appendElement<K extends keyof HTMLElementTagNameMap>(doc: Document, tag: K, className?: string): HTMLElementTagNameMap[K];
                         insertElement<K extends keyof HTMLElementTagNameMap>(doc: Document, tag: K, before: Element, className?: string): HTMLElementTagNameMap[K];
                         clear(): void;
                         addChild(child: UIElement): boolean;
                         addAndInit(child: UIElement): boolean;
                         insertChild(child: UIElement, before: UIElement): boolean;
                         insertAndInit(child: UIElement, before: UIElement): boolean;
                         removeChild(child: UIElement): boolean;
                         remove(): this;
                         setText(text: string): this;
                         hide(): this;
                         show(style?: string): this;
                         setRotation(rotation: number): this;
                         invalidate(): this;
                         controlToLocal(x?: number, y?: number): {
                             x: number;
                             y: number;
                         };
                         localToControl(x?: number, y?: number): {
                             x: number;
                             y: number;
                         };
                         /**
                          * view의 dom을 초기화 한다.<br/>
                          * [주의] field로 보관되는 하위 view들은 override한 생성자에서 추가해야 한다.
                          */
                         protected _doInitDom(doc: Document, dom: HTMLElement): void;
                         protected _doInit(doc: Document, initData: any): void;
                         protected _registerEvents(): void;
                         protected _unregisterEvents(): void;
                         protected _attached(parent: UIElement): void;
                         protected _detached(): void;
                         protected _getCssDisplay(): string;
                         protected _visibleChanged(): void;
                         protected _addChild(child: UIElement): void;
                         protected _insertChild(child: UIElement, before: UIElement): void;
                         protected _removeChild(child: UIElement): boolean;
                     }

                     declare class UIFlexElement extends UIElement {
                         constructor(doc: Document, className: string, columnar?: boolean);
                         setColumnar(columnar: boolean): this;
                         protected _getCssDisplay(): string;
                     }

                     export declare const use: typeof Globals.use;

                     export declare const useAll: typeof Globals.useAll;

                     /**
                      * `minValue`/`maxValue`(+ heatmap `midValue`) 해석 방식. overlay 전체에 하나만 적용된다.
                      *
                      * - `'auto'`       : 경계값 옵션을 무시하고 데이터의 실제 min/max를 사용. (기본)
                      * - `'number'`     : 옵션값을 절대값으로 사용.
                      * - `'percent'`    : 옵션값(0~100)을 데이터 범위 내 백분율로 해석. 0 → min, 100 → max.
                      * - `'percentile'` : 옵션값(0~100)을 데이터 분포의 백분위수로 해석. (sorted 통계 필요)
                      *
                      * 앵커별로 서로 다른 모드를 섞고 싶을 때는 `formatter`/`styler`로 직접 처리한다.
                      */
                     declare type ValueBoundsMode = 'auto' | 'value' | 'percent' | 'percentile';

                     declare type ValueCellType = 'g' | 'd' | 'm' | 's';

                     /**
                      * 값 필드 섹션 Model.
                      */
                     declare class ValueFieldSection extends InspectorFieldSection<InspectorValueField> {
                         constructor(inspector: PivotFieldPanel);
                         protected _createField(model: PivotField): InspectorValueField;
                         needUnique(): boolean;
                         canDrop(data: IFieldDragData): boolean;
                         getMenu(): PopupMenu;
                         getFieldMenu(field: InspectorValueField): PopupMenu;
                         private _menu;
                         private _fieldMenu;
                     }

                     declare class ValueFieldStatsManager { [key: string]: any; }

                     declare type ValueFilterOp = keyof typeof ValueFilterOps;

                     /**
                      * 값 필터 연산자.
                      * Excel 피벗의 값 필터에 대응한다.
                      * 긴 형식(equals)과 간략 형식(=) 모두 지원한다.
                      */
                     declare type ValueFilterOperator = 'equals' | '=' | 'notEquals' | '!=' | '<>' | 'in' | 'notIn' | '!in' | 'greaterThan' | '>' | 'greaterThanOrEqual' | '>=' | 'lessThan' | '<' | 'lessThanOrEqual' | '<=' | 'between' | '><' | 'notBetween' | '!><';

                     declare const ValueFilterOps: {
                         "=": string;
                         "!=": string;
                         ">": string;
                         ">=": string;
                         "<": string;
                         "<=": string;
                         "><": string;
                         "!><": string;
                         in: string;
                         "!in": string;
                     };

                     /**
                      * 사용자가 `boundsBy`/`minValue`/`maxValue`/`logBase`로 정규화 범위를 조정할 수 있는 overlay.
                      *
                      * heatmap, dataBar 등 연속적인 시각 표현을 가진 overlay가 상속한다.
                      * 슬롯 컷 기반 overlay(icon)는 {@link NormalizedCellOverlay}를 직접 상속하여
                      * 이 옵션들을 노출하지 않는 게 자연스럽다.
                      */
                     declare abstract class ValueRangeOverlay<OP extends ValueRangeOverlayOptions = ValueRangeOverlayOptions> extends NormalizedCellOverlay<OP> {
                         static defaults: ValueRangeOverlayOptions;
                         /** 현재 prepare 시점의 boundsBy 모드 */
                         protected _boundsMode: ValueBoundsMode;
                         protected _beforeCollectStats(): void;
                         protected _logBase(): number;
                         protected _needsSortedStats(): boolean;
                         protected _outOfRangeMode(): 'clamp' | 'hide';
                         protected _resolveRange(gs: GroupStats): {
                             min: number;
                             max: number;
                         };
                         /**
                          * 단일 경계값(minValue/maxValue/midValue 등)을 현재 `boundsBy` 모드로 raw 데이터 값으로 해석한다.
                          */
                         protected _resolveBound(val: number | undefined, gs: GroupStats, fallback: number): number;
                     }

                     /**
                      * 정규화 범위(min/max)를 사용자가 명시 조정할 수 있는 overlay 옵션.
                      * `boundsBy`/`minValue`/`maxValue`/`logBase`가 추가된다.
                      */
                     declare interface ValueRangeOverlayOptions extends NormalizedCellOverlayOptions {
                         /**
                          * `minValue`/`maxValue`(+ heatmap `midValue`) 해석 방식.
                          * overlay의 모든 경계 옵션은 이 한 가지 방식으로 통일 해석된다.
                          *
                          * @default 'auto'
                          * @see {@link ValueBoundsMode}
                          */
                         boundsMode?: ValueBoundsMode;
                         /**
                          * 최대값. `boundsMode`에 따라 해석된다.
                          * `boundsMode: 'auto'`이거나 미지정이면 데이터의 실제 최대값이 사용된다.
                          */
                         maxValue?: number;
                         /**
                          * 최소값. `boundsMode`에 따라 해석된다.
                          * `boundsMode: 'auto'`이거나 미지정이면 데이터의 실제 최소값이 사용된다.
                          */
                         minValue?: number;
                         /**
                          * 사용자가 설정한 `minValue`/`maxValue` 범위를 벗어난 값의 처리 방식.
                          *
                          * - `'clamp'` (기본): 범위 경계값으로 클래핑해서 overlay를 계속 그린다 (heatmap: 끝색, dataBar: 0%/100%).
                          * - `'hide'`     : 범위 밖 셀은 overlay를 적용하지 않는다 (값 자체는 표시).
                          *
                          * `boundsMode: 'auto'`이거나 min/max를 지정하지 않으면 범위 밖 셀이 존재할 수 없으므로 이 옵션은 무의미하다.
                          *
                          * @default 'clamp'
                          */
                         outOfRange?: OutOfRangeMode;
                         /**
                          * 로그 스케일 밑(base).
                          *
                          * - `> 1` 이면 해당 밑의 로그 스케일로 정규화한다 (예: `2`, `Math.E`, `10`).
                          * - `<= 1` 이거나 미지정/비유한값이면 무시되어 선형 스케일로 처리된다.
                          *   (`base = 1`은 정의 불가, `0 < base < 1`은 정규화 방향이 뒤집혀 의미가 없다.)
                          *
                          * @default 10
                          */
                         logBase?: number;
                     }

                     /**
                      * 셀 값 표시 방식.
                      */
                     declare type ValueShowAs = typeof ValueShowAsTypes[keyof typeof ValueShowAsTypes];

                     /**
                      * 셀 값 표시 방식 정의.
                      *
                      * 각 항목별 함께 지정해야 하는 연관 속성:
                      * - `baseValue` / `basePercent` / `baseDiff` / `basePercentDiff`
                      *   → {@link PivotValueFieldOptions.baseField}(필수), {@link PivotValueFieldOptions.baseItem}(필수)
                      * - `diff` / `percentDiff` / `running` / `rank`
                      *   → {@link PivotValueFieldOptions.showAsAxis}(선택, 기본값 `'row'`)
                      * - 그 외(`normal`, `rowPercent`, `colPercent`, `totalPercent`, `parentRowPercent`, `parentColPercent`)
                      *   → 추가 속성 없음.
                      */
                     declare const ValueShowAsTypes: {
                         /**
                          * 집계 값을 그대로 표시한다.
                          */
                         readonly normal: "normal";
                         /**
                          * 행 합계 대비 백분율. 같은 행에서 각 열 값이 행 전체 합계의 몇 %인지 표시한다.
                          *
                          * @example
                          * { name: 'amount', showAs: 'rowPercent', numberFormat: '0.0%' }
                          */
                         readonly rowPercent: "rowPercent";
                         /**
                          * 열 합계 대비 백분율. 같은 열에서 각 행 값이 열 전체 합계의 몇 %인지 표시한다.
                          *
                          * @example
                          * { name: 'amount', showAs: 'colPercent', numberFormat: '0.0%' }
                          */
                         readonly colPercent: "colPercent";
                         /**
                          * 전체 합계(Grand Total) 대비 백분율.
                          */
                         readonly totalPercent: "totalPercent";
                         /**
                          * 상위 행 소계 대비 백분율. 부모 행 그룹의 소계를 기준으로 백분율을 계산한다.
                          * 행에 2개 이상의 dimension이 있어야 의미가 있음.
                          *
                          * @example
                          * // rows: ['region', 'city'] 일 때 city 값이 속한 region 소계 대비 비중
                          * { name: 'amount', showAs: 'parentRowPercent', numberFormat: '0.0%' }
                          */
                         readonly parentRowPercent: "parentRowPercent";
                         /**
                          * 상위 열 소계 대비 백분율. 부모 열 그룹의 소계를 기준으로 백분율을 계산한다.
                          * 열에 2개 이상의 dimension이 있어야 의미가 있음.
                          *
                          * @example
                          * // columns: ['year', 'quarter'] 일 때 quarter 값이 속한 year 소계 대비 비중
                          * { name: 'amount', showAs: 'parentColPercent', numberFormat: '0.0%' }
                          */
                         readonly parentColPercent: "parentColPercent";
                         /**
                          * 기준 항목의 값을 그대로 표시한다.
                          * {@link PivotValueFieldOptions.baseField}와 {@link PivotValueFieldOptions.baseItem}로
                          * 지정한 셀 값을 출력한다.
                          *
                          * 연관 속성:
                          * - {@link PivotValueFieldOptions.baseField} (필수): 기준 dimension 필드명.
                          * - {@link PivotValueFieldOptions.baseItem} (필수): 기준 필드 값 또는
                          *   `'@first' | '@last' | '@previous' | '@next'`.
                          *
                          * @example
                          * // year 축의 2024년도 값을 모든 셀에 동일하게 표시
                          * { name: 'amount', showAs: 'baseValue', baseField: 'year', baseItem: 2024 }
                          */
                         readonly baseValue: "baseValue";
                         /**
                          * 기준값 대비 백분율.
                          * {@link PivotValueFieldOptions.baseField}와 {@link PivotValueFieldOptions.baseItem}로
                          * 지정한 셀 값을 기준으로 계산한다. (현재값 / 기준값)
                          *
                          * 연관 속성:
                          * - {@link PivotValueFieldOptions.baseField} (필수)
                          * - {@link PivotValueFieldOptions.baseItem} (필수)
                          *
                          * @example
                          * // year 축의 첫 항목 대비 비율
                          * { name: 'amount', showAs: 'basePercent', baseField: 'year', baseItem: 'first', numberFormat: '0.0%' }
                          */
                         readonly basePercent: "basePercent";
                         /**
                          * 기준값과의 차이. (현재값 - 기준값)
                          *
                          * 연관 속성:
                          * - {@link PivotValueFieldOptions.baseField} (필수)
                          * - {@link PivotValueFieldOptions.baseItem} (필수)
                          *
                          * @example
                          * // 직전 year 항목과의 차이
                          * { name: 'amount', showAs: 'baseDiff', baseField: 'year', baseItem: 'previous' }
                          */
                         readonly baseDiff: "baseDiff";
                         /**
                          * 기준값 대비 변화율. (현재값 - 기준값) / 기준값.
                          *
                          * 연관 속성:
                          * - {@link PivotValueFieldOptions.baseField} (필수)
                          * - {@link PivotValueFieldOptions.baseItem} (필수)
                          *
                          * @example
                          * // 직전 year 대비 증감률
                          * { name: 'amount', showAs: 'basePercentDiff', baseField: 'year', baseItem: 'previous', numberFormat: '+0.0%;-0.0%' }
                          */
                         readonly basePercentDiff: "basePercentDiff";
                         /**
                          * 이전 값과의 차이.
                          * {@link PivotValueFieldOptions.showAsAxis} 방향의
                          * 직전 형제 셀 값과의 차이를 표시한다. (같은 부모 그룹 + 같은 measure 셀들만 형제로 간주)
                          *
                          * 연관 속성:
                          * - {@link PivotValueFieldOptions.showAsAxis} (선택, 기본값 `'row'`).
                          *
                          * @example
                          * // 행 방향(열을 따라) 직전 셀과의 차이
                          * { name: 'amount', showAs: 'diff', showAsAxis: 'row' }
                          */
                         readonly diff: "diff";
                         /**
                          * 이전 값 대비 변화율. (현재값 - 이전값) / 이전값.
                          *
                          * 연관 속성:
                          * - {@link PivotValueFieldOptions.showAsAxis} (선택, 기본값 `'row'`).
                          *
                          * @example
                          * // 열 방향(행을 따라) 직전 셀 대비 증감률
                          * { name: 'amount', showAs: 'percentDiff', showAsAxis: 'column', numberFormat: '+0.0%;-0.0%' }
                          */
                         readonly percentDiff: "percentDiff";
                         /**
                          * 누적 합계. {@link PivotValueFieldOptions.showAsAxis} 방향으로 값을 누적하여 표시한다.
                          *
                          * 연관 속성:
                          * - {@link PivotValueFieldOptions.showAsAxis} (선택, 기본값 `'row'`).
                          *
                          * @example
                          * // 열 방향(행을 따라) 누적합
                          * { name: 'amount', showAs: 'running', showAsAxis: 'column' }
                          */
                         readonly running: "running";
                         /**
                          * 레벨별 누적 합계.<br/>
                          * `running`과 비슷하지만 leaf 셀뿐 아니라 소계/총계 셀에 대해서도 같은 레벨의
                          * 형제 셀들끼리 {@link PivotValueFieldOptions.showAsAxis} 방향으로 누적하여 표시한다.
                          *
                          * 즉,
                          * - leaf 셀: 같은 부모 그룹 내 leaf끼리 누적 (`running`과 동일).
                          * - 소계 셀: 같은 부모 아래 동일 레벨의 소계 셀끼리 누적.
                          * - 총계 셀: 같은 레벨(보통 단일 셀)에서 누적.
                          *
                          * 연관 속성:
                          * - {@link PivotValueFieldOptions.showAsAxis} (선택, 기본값 `'row'`).
                          *
                          * @example
                          * { name: 'amount', showAs: 'runningLevel', showAsAxis: 'row' }
                          */
                         readonly runningLevel: "runningLevel";
                         /**
                          * 순위. {@link PivotValueFieldOptions.showAsAxis} 방향에서의 dense rank(내림차순)를 표시한다.
                          * 동일 값은 같은 순위로 매긴다.
                          *
                          * 연관 속성:
                          * - {@link PivotValueFieldOptions.showAsAxis} (선택, 기본값 `'row'`).
                          *
                          * @example
                          * // 같은 행에서 열 간 순위
                          * { name: 'amount', showAs: 'rank', showAsAxis: 'row' }
                          */
                         readonly rank: "rank";
                         /**
                          * 레벨별 순위.<br/>
                          * `rank`와 비슷하지만 leaf 셀뿐 아니라 소계/총계 셀에 대해서도 같은 레벨의
                          * 형제 셀들끼리 {@link PivotValueFieldOptions.showAsAxis} 방향에서
                          * dense rank(내림차순)를 매긴다. 동일 값은 같은 순위.
                          *
                          * 즉,
                          * - leaf 셀: 같은 부모 그룹 내 leaf끼리 순위 (`rank`와 동일).
                          * - 소계 셀: 같은 부모 아래 동일 레벨 소계 셀끼리 순위.
                          * - 총계 셀: 같은 레벨 셀끼리 순위.
                          *
                          * 연관 속성:
                          * - {@link PivotValueFieldOptions.showAsAxis} (선택, 기본값 `'row'`).
                          *
                          * @example
                          * { name: 'amount', showAs: 'rankLevel', showAsAxis: 'row' }
                          */
                         readonly rankLevel: "rankLevel";
                         /**
                          * 순위(오름차순). `rank`와 동일하지만 작은 값일수록 높은 순위.
                          * Excel의 "순위 - 오름차순" 표시 형식에 대응한다.
                          *
                          * 연관 속성:
                          * - {@link PivotValueFieldOptions.showAsAxis} (선택, 기본값 `'row'`).
                          */
                         readonly rankAsc: "rankAsc";
                         /**
                          * 레벨별 순위(오름차순). `rankLevel`과 동일하지만 작은 값일수록 높은 순위.
                          *
                          * 연관 속성:
                          * - {@link PivotValueFieldOptions.showAsAxis} (선택, 기본값 `'row'`).
                          */
                         readonly rankLevelAsc: "rankLevelAsc";
                         /**
                          * 누적 합계 비율. `running`과 동일한 누적값을 axis 방향 전체 합계로 나눈 백분율.
                          * Excel의 "누계 비율" 표시 형식에 대응한다.
                          *
                          * 연관 속성:
                          * - {@link PivotValueFieldOptions.showAsAxis} (선택, 기본값 `'row'`).
                          *
                          * @example
                          * { name: 'amount', showAs: 'percentRunning', showAsAxis: 'row', numberFormat: '0.0%' }
                          */
                         readonly percentRunning: "percentRunning";
                         /**
                          * 인덱스. Excel의 "인덱스" 표시 형식에 대응한다.<br/>
                          * `(cell × grandTotal) / (rowTotal × colTotal)`
                          *
                          * 셀의 상대적 중요도를 나타낸다. 1보다 크면 평균보다 큰 값, 작으면 작은 값.
                          *
                          * @example
                          * { name: 'amount', showAs: 'index' }
                          */
                         readonly index: "index";
                         /**
                          * 상위 합계 대비 백분율(특정 필드 기준). Excel의 "상위 합계 비율" 표시 형식에 대응한다.<br/>
                          * {@link PivotValueFieldOptions.baseField}로 지정한 dimension 레벨 그룹의 합계 대비 백분율.
                          *
                          * 연관 속성:
                          * - {@link PivotValueFieldOptions.baseField} (필수): 상위 그룹 기준 dimension 필드명.
                          *
                          * @example
                          * // rows: ['region', 'city'] 일 때 region 그룹 합계 대비 비율
                          * { name: 'amount', showAs: 'parentPercent', baseField: 'region', numberFormat: '0.0%' }
                          */
                         readonly parentPercent: "parentPercent";
                     };

                     declare type ValueType = typeof _ValueType[keyof typeof _ValueType];

                     /**
                      * 값 유형.<br/>
                      **/
                     declare const _ValueType: {
                         /**
                          * 텍스트
                          */
                         readonly TEXT: "text";
                         /**
                          * 숫자
                          */
                         readonly NUMBER: "number";
                         /**
                          * Boolean
                          */
                         readonly BOOLEAN: "boolean";
                         /**
                          * 오브젝트
                          */
                         readonly OBJECT: "object";
                         /**
                          * 날짜 & 시간
                          */
                         readonly DATETIME: "datetime";
                         /**
                          * 시간 부분이 제거된 날짜
                          */
                         readonly DATE: "date";
                     };

                     /**
                      * 휠 스크롤 시 스크롤 축 결정 방식.<br/>
                      * - `dominant`: 휠 이벤트의 deltaX와 deltaY 중 절대값이 큰 축을 스크롤 축으로 결정
                      * - 'both': deltaX, deltaY 모두 스크롤 축으로 결정하여 대각선 스크롤 허용
                      * - `horizontal`: 항상 수평 축을 스크롤 축으로 결정
                      * - `vertical`: 항상 수직 축을 스크롤 축으로 결정
                      */
                     declare type WheelAxisMode = 'both' | 'dominant' | 'horizontal' | 'vertical';

                     export { }
