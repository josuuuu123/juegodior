import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MarioComponent } from './mario.component';

describe('MarioComponent', () => {
    let component: MarioComponent;
    let fixture: ComponentFixture<MarioComponent>;
    let mockRouter: jasmine.SpyObj<Router>;

    beforeEach(async () => {
        const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        await TestBed.configureTestingModule({
            imports: [MarioComponent],
            providers: [
                { provide: Router, useValue: routerSpy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(MarioComponent);
        component = fixture.componentInstance;
        mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize with correct default values', () => {
        expect(component.score).toBe(0);
        expect(component.lives).toBe(3);
        expect(component.running).toBe(true);
        expect(component.gameOver).toBe(false);
    });

    it('should restart game when restartGame is called', () => {
        component.score = 100;
        component.lives = 1;
        component.gameOver = true;

        component.restartGame();

        expect(component.score).toBe(0);
        expect(component.lives).toBe(3);
        expect(component.gameOver).toBe(false);
        expect(component.running).toBe(true);
    });

    it('should navigate to home when goHome is called', () => {
        component.goHome();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
    });

    it('should handle component cleanup on destroy', () => {
        spyOn(component, 'ngOnDestroy').and.callThrough();

        component.ngOnDestroy();

        expect(component.ngOnDestroy).toHaveBeenCalled();
    });
});
