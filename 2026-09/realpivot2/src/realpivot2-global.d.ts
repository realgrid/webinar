import type * as RealPivot2 from '../lib/realpivot2.js'

declare global {
    interface Window {
        RealPivot2: typeof RealPivot2
    }
}

export {}
