
declare module 'abcjs' {
    namespace abcjs {
        interface AbcVisualParams  {
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
