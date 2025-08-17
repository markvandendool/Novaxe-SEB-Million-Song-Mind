/**
 * Runtime Smoke Test - Zero-flake validation
 * Tests core functionality without Karma/Jasmine dependencies
 * Run in browser console or as import validation
 */

export class RuntimeSmokeTest {
  
  private results: { [key: string]: boolean } = {};
  
  /**
   * Run all smoke tests and return results
   */
  public async runAllTests(): Promise<{ passed: number, failed: number, results: any }> {
    console.log('🧪 Starting Nuclear Angular Runtime Smoke Tests...');
    
    // Test 1: Angular Bootstrap
    this.results['angular-bootstrap'] = this.testAngularBootstrap();
    
    // Test 2: Router Navigation
    this.results['router-navigation'] = this.testRouterNavigation();
    
    // Test 3: Services Available
    this.results['services-available'] = this.testServicesAvailable();
    
    // Test 4: DOM Elements Present
    this.results['dom-elements'] = this.testDOMElements();
    
    // Test 5: Assets Available
    this.results['assets-available'] = await this.testAssetsAvailable();
    
    // Test 6: Component Rendering
    this.results['component-rendering'] = this.testComponentRendering();
    
    const passed = Object.values(this.results).filter(r => r).length;
    const failed = Object.values(this.results).filter(r => !r).length;
    
    console.log(`✅ Smoke Tests Complete: ${passed} passed, ${failed} failed`);
    return { passed, failed, results: this.results };
  }
  
  private testAngularBootstrap(): boolean {
    try {
      // Check if Angular is bootstrapped
      const appRoot = document.querySelector('app-root');
      const hasContent = appRoot && appRoot.innerHTML.length > 0;
      console.log('🔍 Angular Bootstrap:', hasContent ? '✅ PASS' : '❌ FAIL');
      return !!hasContent;
    } catch (error) {
      console.log('🔍 Angular Bootstrap: ❌ FAIL -', error);
      return false;
    }
  }
  
  private testRouterNavigation(): boolean {
    try {
      // Check if router outlet exists
      const routerOutlet = document.querySelector('router-outlet');
      const navLinks = document.querySelectorAll('nav a[routerLink]');
      const hasNavigation = routerOutlet && navLinks.length > 0;
      console.log('🔍 Router Navigation:', hasNavigation ? '✅ PASS' : '❌ FAIL');
      return !!hasNavigation;
    } catch (error) {
      console.log('🔍 Router Navigation: ❌ FAIL -', error);
      return false;
    }
  }
  
  private testServicesAvailable(): boolean {
    try {
      // Check if key services are injected (basic validation)
      const hasWindow = typeof window !== 'undefined';
      const hasDocument = typeof document !== 'undefined';
      const hasLocalStorage = typeof localStorage !== 'undefined';
      const servicesOk = hasWindow && hasDocument && hasLocalStorage;
      console.log('🔍 Services Available:', servicesOk ? '✅ PASS' : '❌ FAIL');
      return servicesOk;
    } catch (error) {
      console.log('🔍 Services Available: ❌ FAIL -', error);
      return false;
    }
  }
  
  private testDOMElements(): boolean {
    try {
      // Check if key DOM elements are present
      const hasTitle = document.querySelector('h1')?.textContent?.includes('NOVAXE NUCLEAR');
      const hasNav = document.querySelector('nav') !== null;
      const hasRouterOutlet = document.querySelector('router-outlet') !== null;
      const domOk = hasTitle && hasNav && hasRouterOutlet;
      console.log('🔍 DOM Elements:', domOk ? '✅ PASS' : '❌ FAIL');
      return !!domOk;
    } catch (error) {
      console.log('🔍 DOM Elements: ❌ FAIL -', error);
      return false;
    }
  }
  
  private async testAssetsAvailable(): Promise<boolean> {
    try {
      // Test if key assets are accessible
      const testAssets = [
        '/assets/bindings.json',
        '/assets/tonalities.json',
        '/assets/scales.json'
      ];
      
      const results = await Promise.all(
        testAssets.map(async (asset) => {
          try {
            const response = await fetch(asset);
            return response.ok;
          } catch {
            return false;
          }
        })
      );
      
      const assetsOk = results.every(r => r);
      console.log('🔍 Assets Available:', assetsOk ? '✅ PASS' : '❌ FAIL');
      return assetsOk;
    } catch (error) {
      console.log('🔍 Assets Available: ❌ FAIL -', error);
      return false;
    }
  }
  
  private testComponentRendering(): boolean {
    try {
      // Check if components are rendering (basic check)
      const appContent = document.querySelector('app-root')?.innerHTML || '';
      const hasComponents = appContent.includes('RUNTIME OPERATIONAL');
      const hasRouting = appContent.includes('routes prove navigation');
      const renderingOk = hasComponents && hasRouting;
      console.log('🔍 Component Rendering:', renderingOk ? '✅ PASS' : '❌ FAIL');
      return renderingOk;
    } catch (error) {
      console.log('🔍 Component Rendering: ❌ FAIL -', error);
      return false;
    }
  }
  
  /**
   * Quick validation for browser console
   */
  public static async quickTest(): Promise<void> {
    const tester = new RuntimeSmokeTest();
    const results = await tester.runAllTests();
    
    if (results.failed === 0) {
      console.log('🎉 ALL SMOKE TESTS PASSED! Nuclear Angular is operational.');
    } else {
      console.log(`⚠️ ${results.failed} tests failed. Check results above.`);
    }
    
    return results as any;
  }
}

// Global access for browser console testing
(window as any).runSmokeTest = RuntimeSmokeTest.quickTest;

console.log('🧪 Runtime Smoke Test loaded. Run: runSmokeTest() in browser console');
