import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Component } from '@angular/core';

// Import services for testing
import { BindingsService } from '../services/bindings/bindings.service';
import { GuitarService } from '../services/guitar/guitar.service';
import { TransportService } from '../services/transport/transport.service';

// Import components for testing
import { AppComponent } from '../app.component';
import { TestpageComponent } from '../components/testpage/testpage.component';
import { PageAlbumComponent } from '../pages/page-album/page-album.component';
import { PageAuthorComponent } from '../pages/page-author/page-author.component';

// Mock route components for testing
@Component({ template: '' })
class MockComponent { }

describe('Nuclear Angular - Smoke Tests', () => {

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [
                AppComponent,
                TestpageComponent,
                PageAlbumComponent,
                PageAuthorComponent,
                MockComponent
            ],
            imports: [
                RouterTestingModule.withRoutes([
                    { path: '', component: MockComponent },
                    { path: 'album/:album', component: PageAlbumComponent },
                    { path: 'author/:author', component: PageAuthorComponent },
                    { path: 'test', component: TestpageComponent }
                ])
            ],
            providers: [
                BindingsService,
                GuitarService,
                TransportService
            ]
        }).compileComponents();
    });

    describe('🧪 Core Services Smoke Test', () => {

        it('should create BindingsService without errors', () => {
            const service = TestBed.inject(BindingsService);
            expect(service).toBeTruthy();
            expect(service.getKeyCode).toBeDefined();
            expect(service.bindKey).toBeDefined();
        });

        it('should create GuitarService without errors', () => {
            const service = TestBed.inject(GuitarService);
            expect(service).toBeTruthy();
            expect(service.audioContext).toBeDefined();
        });

        it('should create TransportService without errors', () => {
            const service = TestBed.inject(TransportService);
            expect(service).toBeTruthy();
        });

    });

    describe('🏠 Page Components Smoke Test', () => {

        it('should create PageAlbumComponent', () => {
            const fixture = TestBed.createComponent(PageAlbumComponent);
            const component = fixture.componentInstance;
            expect(component).toBeTruthy();
            expect(component.album).toBeDefined();
        });

        it('should create PageAuthorComponent', () => {
            const fixture = TestBed.createComponent(PageAuthorComponent);
            const component = fixture.componentInstance;
            expect(component).toBeTruthy();
            expect(component.author).toBeDefined();
        });

    });

    describe('🧪 Test Components Smoke Test', () => {

        it('should create TestpageComponent', () => {
            const fixture = TestBed.createComponent(TestpageComponent);
            const component = fixture.componentInstance;
            expect(component).toBeTruthy();
            expect(component.abcChordString).toBeDefined();
            expect(component.lastKeyPressed).toBeDefined();
        });

        it('should initialize TestpageComponent with default values', () => {
            const fixture = TestBed.createComponent(TestpageComponent);
            const component = fixture.componentInstance;
            fixture.detectChanges();

            expect(component.abcChordString).toBe('ceg');
            expect(component.chordString).toBe('c,e,g');
            expect(component.lastKeyPressed).toBe('');
        });

    });

    describe('🎯 App Component Smoke Test', () => {

        it('should create the app', () => {
            const fixture = TestBed.createComponent(AppComponent);
            const app = fixture.componentInstance;
            expect(app).toBeTruthy();
        });

        it('should render navigation links', () => {
            const fixture = TestBed.createComponent(AppComponent);
            fixture.detectChanges();
            const compiled = fixture.nativeElement as HTMLElement;

            expect(compiled.querySelector('nav')).toBeTruthy();
            expect(compiled.querySelector('router-outlet')).toBeTruthy();
            expect(compiled.textContent).toContain('NOVAXE NUCLEAR');
        });

    });

    describe('🔑 BindingsService Integration Smoke Test', () => {

        it('should handle key binding creation without errors', () => {
            const service = TestBed.inject(BindingsService);

            expect(() => {
                const binding = service.bindKey('T');
                expect(binding).toBeTruthy();
            }).not.toThrow();
        });

        it('should return correct key codes', () => {
            const service = TestBed.inject(BindingsService);

            expect(service.getKeyCode('T')).toBe(84);
            expect(service.getKeyCode('A')).toBe(65);
            expect(service.getKeyCode('ENTER')).toBe(13);
        });

    });

    describe('📊 Build Integrity Smoke Test', () => {

        it('should have all required imports available', () => {
            expect(TestBed).toBeDefined();
            expect(RouterTestingModule).toBeDefined();
            expect(BindingsService).toBeDefined();
            expect(GuitarService).toBeDefined();
            expect(TransportService).toBeDefined();
        });

        it('should compile all components without throwing', () => {
            expect(() => {
                TestBed.createComponent(AppComponent);
                TestBed.createComponent(TestpageComponent);
                TestBed.createComponent(PageAlbumComponent);
                TestBed.createComponent(PageAuthorComponent);
            }).not.toThrow();
        });

    });

});
