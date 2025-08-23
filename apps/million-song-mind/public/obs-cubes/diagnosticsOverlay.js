// Simple diagnostics overlay. Enabled when URL has ?debug=1.

export function isDebugOn() {
    try {
        const url = new URL(window.location.href);
        return url.searchParams.get('debug') === '1';
    } catch (_) { return false; }
}

export function setupDiagnostics(getInfo) {
    if (!isDebugOn()) return { update() { } };
    const box = document.createElement('div');
    box.style.position = 'fixed';
    box.style.top = '8px';
    box.style.right = '8px';
    box.style.zIndex = '9999';
    box.style.padding = '8px 10px';
    box.style.borderRadius = '6px';
    box.style.font = '12px/1.3 system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial';
    box.style.background = 'rgba(0,0,0,0.55)';
    box.style.color = '#e7e7e7';
    box.style.pointerEvents = 'none';
    document.body.appendChild(box);
    const update = () => {
        try {
            const info = getInfo ? getInfo() : {};
            box.textContent = `FPS ~ | Tweens: ${info.tweens ?? '-'} | Dragging: ${!!info.dragging} | Lineup: ${info.lineup ?? 0} | State: ${info.state ?? ''}`;
        } catch (_) { }
    };
    return { update };
}


