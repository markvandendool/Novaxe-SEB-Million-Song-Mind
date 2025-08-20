# 🚨 ANGULAR QUICK ERROR REFERENCE
**Last Updated:** August 20, 2025

---

## 🔥 **MOST COMMON ANGULAR ERRORS**

### **1. Dependency Injection Errors**
```
ERROR: No provider for [ServiceName]
SOLUTION: Add service to providers array in module or use @Injectable({providedIn: 'root'})

ERROR: Can't resolve all parameters for [ComponentName]
SOLUTION: Check constructor parameter types and imports
```

### **2. Module Import Errors** 
```
ERROR: '[ComponentName]' is not a known element
SOLUTION: Add component to declarations array in module

ERROR: Can't bind to '[property]' since it isn't a known property
SOLUTION: Import required module (FormsModule, ReactiveFormsModule, etc.)
```

### **3. Template Syntax Errors**
```
ERROR: Parser Error: Unexpected token
SOLUTION: Check template syntax - missing quotes, brackets, or parentheses

ERROR: Cannot read property of undefined
SOLUTION: Use safe navigation operator (?.) or *ngIf
```

### **4. Routing Errors**
```
ERROR: Cannot match any routes
SOLUTION: Check route path configuration and router-outlet placement

ERROR: Cannot navigate to route
SOLUTION: Verify route exists and component is properly declared
```

### **5. Lifecycle Hook Errors**
```
ERROR: ExpressionChangedAfterItHasBeenCheckedError
SOLUTION: Move logic to appropriate lifecycle hook or use setTimeout

ERROR: Cannot read property of undefined in ngOnInit
SOLUTION: Check property initialization and async data loading
```

---

## 🎯 **ANGULAR-SPECIFIC PATTERNS FOR OUR PROJECT**

### **Braid Component Integration:**
```typescript
// DIAMOND Pattern - Service Injection
constructor(
  private sel: SelectionModel,
  private zone: NgZone,
  public cm: ConfigModel,
  private curTonality: CurTonalityModel,
  private sm: Songmodel
) {}

// Common Error: Missing service providers
// Solution: Add to app.module.ts providers array
```

### **RxJS Observable Patterns:**
```typescript
// DIAMOND Pattern - Subscription Management
this.curTonality$ = this.curTonality.current_tonality$.subscribe((data) => {
  this.rotate_arrays_for_tona(data.tonality);
});

// Common Error: Memory leaks from unsubscribed observables
// Solution: Implement ngOnDestroy and unsubscribe
```

### **Angular Material Integration:**
```typescript
// Import required modules in app.module.ts
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

// Common Error: Material component not recognized
// Solution: Add module to imports array
```

---

## 📚 **QUICK REFERENCE COMMANDS**

### **Angular CLI Commands:**
```bash
ng generate component component-name
ng generate service service-name
ng build --prod
ng serve --open
ng test
ng lint
```

### **Debug Commands:**
```bash
# Check Angular version
ng version

# Build with source maps
ng build --source-map

# Serve with specific port
ng serve --port 4200
```

---

**FILE STATUS:** Ready for instant error lookup  
**CROSS-REFERENCE:** Links to main Angular documentation folder  
**SEARCH COMMAND:** `grep -r "error_text" /OFFICIAL_DOCUMENTS/Angular/`
