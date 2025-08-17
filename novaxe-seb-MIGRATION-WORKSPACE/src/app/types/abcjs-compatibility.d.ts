// TypeScript union type compatibility fix for Angular 11 + abcjs
// Fixes TS1337: An index signature parameter type cannot be a union type
// Date: August 16, 2025
// Context: Historical Angular 11→20 migration pattern from ZITA Recovery docs

declare module 'abcjs' {
    namespace abcjs {
        // Override the problematic AbcVisualParams interface to use mapped object type instead of index signature with union type
        interface AbcVisualParams {
            add_classes?: boolean;
            afterParsing?: any; // AfterParsing type
            ariaLabel?: string;
            clickListener?: any; // ClickListener type
            dragColor?: string;
            dragging?: boolean;
            foregroundColor?: string;
            format?: { [K in FormatAttributes]?: any }; // FIXED: mapped type instead of union type index signature
            header_only?: boolean;
            initialClef?: boolean;
            jazzchords?: boolean;
            lineBreaks?: Array<number>;
            minPadding?: number;
            oneSvgPerLine?: boolean;
            paddingbottom?: number;
            paddingleft?: number;
            paddingright?: number;
            paddingtop?: number;
            print?: boolean;
            responsive?: any; // Responsive type
            scale?: number;
            scrollHorizontal?: boolean;
            selectionColor?: string;
            selectTypes?: boolean | Array<any>; // DragTypes array
            showDebug?: Array<"grid" | "box">;
            staffwidth?: number;
            startingTune?: number;
            stop_on_warning?: boolean;
            textboxpadding?: number;
            viewportHorizontal?: boolean;
            viewportVertical?: boolean;
            visualTranspose?: number;
            wrap?: any; // Wrap type
        }
    }
}

// This preserves the original FormatAttributes union type while making it compatible with TypeScript 3.9.5
// by using a mapped type instead of an index signature with union type parameter
