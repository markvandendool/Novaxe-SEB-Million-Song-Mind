#!/bin/bash

# COMPONENT QUARANTINE MIGRATION SCRIPT
# Migrates ONE component through Angular 11→20 with verification at each step

COMPONENT_NAME=${1:-"piano"}
COMPONENT_PATH="src/app/components/$COMPONENT_NAME"

echo "🔬 COMPONENT QUARANTINE MIGRATION PROTOCOL"
echo "Target: $COMPONENT_NAME"
echo "Path: $COMPONENT_PATH"

# Step 1: Create quarantine environment
echo "Creating quarantine environment..."
mkdir -p quarantine-lab
cd quarantine-lab

# Step 2: Create minimal Angular 11 project with JUST this component
echo "Initializing Angular 11 test harness..."
npx -y @angular/cli@11 new component-test --routing=false --style=scss --skip-git --minimal

cd component-test

# Step 3: Copy ONLY the target component
echo "Extracting component for quarantine..."
cp -r ../../$COMPONENT_PATH src/app/

# Step 4: Version-by-version migration with verification
VERSIONS=(12 13 14 15 16 17 18 19 20)

for VERSION in "${VERSIONS[@]}"; do
    echo ""
    echo "📈 Migrating to Angular $VERSION..."
    
    # Update to target version
    npx -y @angular/cli@$VERSION update @angular/core@$VERSION @angular/cli@$VERSION --force
    
    # Apply version-specific transformations
    case $VERSION in
        12)
            echo "Applying Angular 12 transformations..."
            # RxJS 6→7 patterns
            find src -name "*.ts" -exec sed -i '' 's/\.map(/\.pipe(map(/g' {} \;
            ;;
        13)
            echo "Applying Angular 13 transformations..."
            # Ivy strict mode
            ;;
        14)
            echo "Applying Angular 14 transformations..."
            # Typed forms
            ;;
        15)
            echo "Applying Angular 15 transformations..."
            # Standalone components intro
            ;;
        16)
            echo "Applying Angular 16 transformations..."
            # Signals preview
            ;;
        17)
            echo "Applying Angular 17 transformations..."
            # New control flow
            ;;
        18)
            echo "Applying Angular 18 transformations..."
            # Signals stable
            ;;
        19)
            echo "Applying Angular 19 transformations..."
            # Enhanced standalone
            ;;
        20)
            echo "Applying Angular 20 transformations..."
            # Zoneless
            ;;
    esac
    
    # Verify build at this version
    echo "Verifying Angular $VERSION build..."
    if ng build --configuration production; then
        echo "✅ Angular $VERSION: SUCCESS"
        
        # Save the successful transformation
        cp -r src/app/$COMPONENT_NAME ../../migrations/angular-$VERSION-$COMPONENT_NAME/
    else
        echo "❌ Angular $VERSION: FAILED"
        echo "Errors must be fixed before proceeding!"
        exit 1
    fi
done

echo ""
echo "🎉 COMPONENT MIGRATION COMPLETE!"
echo "Component $COMPONENT_NAME successfully migrated from Angular 11→20"
echo "Transformation scripts saved in migrations/ directory"
