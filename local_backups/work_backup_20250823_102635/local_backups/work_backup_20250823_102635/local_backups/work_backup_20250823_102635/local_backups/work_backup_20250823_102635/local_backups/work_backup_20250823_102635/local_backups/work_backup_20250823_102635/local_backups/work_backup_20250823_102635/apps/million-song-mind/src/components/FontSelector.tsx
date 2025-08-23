import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMusicalFont, MusicalFontName, fontSelector, debugFontStatus } from '@/utils/fontSelector';
import { Type, Settings, CheckCircle, XCircle } from 'lucide-react';

interface FontSelectorProps {
    className?: string;
    showPreview?: boolean;
}

export function FontSelector({ className = '', showPreview = true }: FontSelectorProps) {
    const { currentFont, setFont, allFonts, isFontLoaded } = useMusicalFont();
    const [fontLoadStatus, setFontLoadStatus] = React.useState<Record<string, boolean>>({});

    React.useEffect(() => {
        // Check font loading status for all fonts
        const checkFonts = async () => {
            const status: Record<string, boolean> = {};
            for (const font of allFonts) {
                status[font.name] = await isFontLoaded(font.name);
            }
            setFontLoadStatus(status);
        };

        checkFonts();
    }, [allFonts, isFontLoaded]);

    const handleFontChange = (value: string) => {
        setFont(value as MusicalFontName);
    };

    const handleDebugFonts = () => {
        debugFontStatus();
    };

    return (
        <Card className={`font-selector ${className}`}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Type className="h-4 w-4" />
                        <CardTitle className="text-sm font-semibold">Musical Font Selector</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                            Current: {currentFont.displayName}
                        </Badge>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleDebugFonts}
                            className="h-6 w-6 p-0"
                        >
                            <Settings className="h-3 w-3" />
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Font Selection Dropdown */}
                <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">
                        Choose Musical Font:
                    </label>
                    <Select value={currentFont.name} onValueChange={handleFontChange}>
                        <SelectTrigger className="text-sm">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {allFonts.map((font) => (
                                <SelectItem key={font.name} value={font.name} className="text-sm">
                                    <div className="flex items-center justify-between w-full">
                                        <span>{font.displayName}</span>
                                        {fontLoadStatus[font.name] !== undefined && (
                                            <span className="ml-2">
                                                {fontLoadStatus[font.name] ? (
                                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                                ) : (
                                                    <XCircle className="h-3 w-3 text-red-500" />
                                                )}
                                            </span>
                                        )}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Current Font Info */}
                <div className="p-3 bg-secondary/30 rounded-lg">
                    <div className="text-xs font-medium text-muted-foreground mb-1">
                        Font Description:
                    </div>
                    <p className="text-xs text-foreground">{currentFont.description}</p>
                    <div className="mt-2 text-xs text-muted-foreground">
                        Family: <code className="text-xs bg-muted px-1 py-0.5 rounded">{currentFont.family}</code>
                    </div>
                </div>

                {/* Font Preview */}
                {showPreview && (
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">
                            Preview:
                        </label>
                        <div
                            className="p-4 bg-background border rounded-lg text-center"
                            style={{
                                fontFamily: currentFont.family,
                                fontSize: '24px',
                                lineHeight: '1.2'
                            }}
                        >
                            <div className="space-y-2">
                                <div>I ii iii IV V vi vii°</div>
                                <div>123 456 789</div>
                                <div>♭♯°ø◦ⁱⁱⁱⁱᵛᵛᵛⁱ</div>
                            </div>
                        </div>

                        {/* Loading Status */}
                        <div className="flex items-center justify-center gap-2">
                            {fontLoadStatus[currentFont.name] !== undefined && (
                                <>
                                    {fontLoadStatus[currentFont.name] ? (
                                        <CheckCircle className="h-3 w-3 text-green-500" />
                                    ) : (
                                        <XCircle className="h-3 w-3 text-red-500" />
                                    )}
                                    <span className="text-xs text-muted-foreground">
                                        {fontLoadStatus[currentFont.name] ? 'Font Loaded' : 'Font Not Loaded'}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Quick Font Switch Buttons */}
                <div className="flex flex-wrap gap-1">
                    {allFonts.slice(0, 4).map((font) => (
                        <Button
                            key={font.name}
                            variant={currentFont.name === font.name ? "default" : "outline"}
                            size="sm"
                            onClick={() => setFont(font.name)}
                            className="text-xs h-7"
                        >
                            {font.displayName.split(' ')[0]}
                        </Button>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
