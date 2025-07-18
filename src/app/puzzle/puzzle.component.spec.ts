import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { PuzzleComponent } from './puzzle.component';

describe('PuzzleComponent', () => {
    let component: PuzzleComponent;
    let fixture: ComponentFixture<PuzzleComponent>;
    let mockRouter: jasmine.SpyObj<Router>;

    beforeEach(async () => {
        const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        await TestBed.configureTestingModule({
            imports: [PuzzleComponent],
            providers: [
                { provide: Router, useValue: routerSpy }
            ]
        })
            .compileComponents();

        fixture = TestBed.createComponent(PuzzleComponent);
        component = fixture.componentInstance;
        mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should navigate to home when goHome is called', () => {
        component.goHome();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
    });
});
