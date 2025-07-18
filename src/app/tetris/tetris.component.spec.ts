import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { TetrisComponent } from './tetris.component';

describe('TetrisComponent', () => {
    let component: TetrisComponent;
    let fixture: ComponentFixture<TetrisComponent>;
    let mockRouter: jasmine.SpyObj<Router>;

    beforeEach(async () => {
        const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        await TestBed.configureTestingModule({
            imports: [TetrisComponent],
            providers: [
                { provide: Router, useValue: routerSpy }
            ]
        })
            .compileComponents();

        fixture = TestBed.createComponent(TetrisComponent);
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
