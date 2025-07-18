import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ParejasComponent } from './parejas.component';

describe('ParejasComponent', () => {
    let component: ParejasComponent;
    let fixture: ComponentFixture<ParejasComponent>;
    let mockRouter: jasmine.SpyObj<Router>;

    beforeEach(async () => {
        const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        await TestBed.configureTestingModule({
            imports: [ParejasComponent],
            providers: [
                { provide: Router, useValue: routerSpy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ParejasComponent);
        component = fixture.componentInstance;
        mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize game on component init', () => {
        expect(component.cards.length).toBe(16); // 8 parejas = 16 cartas
        expect(component.moves).toBe(0);
        expect(component.pairsFound).toBe(0);
        expect(component.seconds).toBe(0);
    });

    it('should shuffle cards', () => {
        const initialOrder = [...component.cards];
        component.newGame();

        // Verificar que el orden cambió (muy probable con 16 cartas)
        const newOrder = [...component.cards];
        expect(initialOrder).not.toEqual(newOrder);
    });

    it('should flip card when clicked', () => {
        const card = component.cards[0];
        expect(card.flipped).toBe(false);

        component.flipCard(card);
        expect(card.flipped).toBe(true);
    });

    it('should navigate to home when goHome is called', () => {
        component.goHome();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
    });

    it('should reset game state when restartGame is called', () => {
        component.moves = 10;
        component.pairsFound = 3;
        component.seconds = 30;

        component.restartGame();

        expect(component.moves).toBe(0);
        expect(component.pairsFound).toBe(0);
        expect(component.seconds).toBe(0);
    });

    it('should format time correctly', () => {
        component.seconds = 45;
        expect(component.getFormattedTime()).toBe('45s');
    });

    it('should format pairs text correctly', () => {
        component.pairsFound = 3;
        expect(component.getPairsText()).toBe('3/8');
    });
});
