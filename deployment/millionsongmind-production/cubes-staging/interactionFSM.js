// Minimal finite-state interaction helper to standardize click vs drag decisions

export class InteractionFSM {
    constructor(opts = {}) {
        this.DRAG_START_PX = opts.DRAG_START_PX ?? 8;
        this.CLICK_MAX_PX = opts.CLICK_MAX_PX ?? 5;
        this.CLICK_MAX_MS = opts.CLICK_MAX_MS ?? 250;
        this.reset();
    }
    reset() {
        this.state = 'idle';
        this.downX = 0; this.downY = 0; this.downTime = 0;
    }
    onPointerDown(x, y, timeMs) {
        this.state = 'pressed';
        this.downX = x; this.downY = y; this.downTime = timeMs;
    }
    movementExceeded(x, y) {
        const dx = x - this.downX;
        const dy = y - this.downY;
        return Math.hypot(dx, dy) > this.DRAG_START_PX;
    }
    classifyRelease(x, y, timeMs) {
        const dx = x - this.downX;
        const dy = y - this.downY;
        const moved = Math.hypot(dx, dy);
        const elapsed = timeMs - this.downTime;
        const isClick = (moved <= this.CLICK_MAX_PX && elapsed <= this.CLICK_MAX_MS);
        this.reset();
        return { isClick, moved, elapsed };
    }
}


