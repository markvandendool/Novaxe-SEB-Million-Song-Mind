// Console error debugging script
console.log('🔧 DEBUG: Console error debugging script loaded');

window.addEventListener('error', (e) => {
    console.error('🚨 JavaScript Error:', e.error);
    console.error('🚨 Error Message:', e.message);
    console.error('🚨 Error Source:', e.filename, 'Line:', e.lineno);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('🚨 Unhandled Promise Rejection:', e.reason);
});

// Check if chord cubes are actually loading
setTimeout(() => {
    console.log('🔧 DEBUG: Checking shelfCubes after 3 seconds...');
    try {
        console.log('🔧 shelfCubes length:', window.shelfCubes ? window.shelfCubes.length : 'shelfCubes not found');
        console.log('🔧 lineup length:', window.lineup ? window.lineup.length : 'lineup not found');
        console.log('🔧 scene children count:', window.scene ? window.scene.children.length : 'scene not found');
    } catch (err) {
        console.error('🚨 Error checking cubes:', err);
    }
}, 3000);

console.log('🔧 DEBUG: Console debugging setup complete');
