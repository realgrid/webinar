// 2026-10-27 · index.html의 <script>로 로드한 RealPivot2 전역 객체입니다.
// 타입은 public/realpivot2/realpivot2.min.js와 같은 버전의 types/realpivot2.d.ts를 따릅니다.
declare const RealPivot2: typeof import('../types/realpivot2');
declare namespace RealPivot2 {
    export type PivotBookConfiguration = import('../types/realpivot2').PivotBookConfiguration;
    export type PivotBookPageOptions = import('../types/realpivot2').PivotBookPageOptions;
    export type PivotControl = import('../types/realpivot2').PivotControl;
    export type PivotCubeManager = import('../types/realpivot2').PivotCubeManager;
    export type PivotDataSet = import('../types/realpivot2').PivotDataSet;
}
