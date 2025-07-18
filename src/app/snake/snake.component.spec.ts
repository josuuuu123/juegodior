import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { SnakeComponent } from './snake.component';

describe('SnakeComponent', () => {
    let component: SnakeComponent;
    let fixture: ComponentFixture<SnakeComponent>;
    let mockRouter: jasmine.SpyObj<Router>;

    beforeEach(async () => {
        const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        await TestBed.configureTestingModule({
            imports: [SnakeComponent],
            providers: [
                { provide: Router, useValue: routerSpy }
            ]
        })
            .compileComponents();

        fixture = TestBed.createComponent(SnakeComponent);
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
