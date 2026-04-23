import type { Product, CartItem, AppState } from './types';
import { getCurrentUser } from './auth';
import type { User } from './types';


class StateManager {
    private state: AppState;

    private listeners: (() => void)[] = [];

    constructor() {
        this.state = {
            products: [],
            cart: [],
            currentPage: 'home',
            isLoading: false,
            currentUser: getCurrentUser(),
            successMessage: null,

        };

        this.loadCartFromStorage();
    }


    getState(): AppState {
        return this.state;
    }

    setProducts(products: Product[]): void {
        this.state.products = products;
        this.notifyListeners();
    }

    addToCart(product: Product, selectedSize: number, selectedColor: string): void {
        const existingItem = this.state.cart.find(item =>
            item.product.id === product.id &&
            item.selectedSize === selectedSize &&
            item.selectedColor === selectedColor
        )

        if (existingItem) {
            existingItem.quantity += 1
        } else {
            const newItem: CartItem = {
                product,
                selectedSize,
                selectedColor,
                quantity: 1
            }
            this.state.cart.push(newItem)
        }

        this.saveCartToStorage()

        this.notifyListeners()

    }

    navigateTo(page: 'home' | 'product-detail' | 'cart' | 'login' | 'signup' | 'profile' | 'settings', productId?: number): void {
        this.state.currentPage = page;
        this.state.selectedProductId = productId;

        if (page === 'home') {
            window.location.hash = '#/';
        } else if (page === 'product-detail' && productId) {
            window.location.hash = `#/product/${productId}`;
        } else if (page === 'cart') {
            window.location.hash = '#/cart';
        } else if (page === 'login') {
            window.location.hash = '#/login';
        } else if (page === 'signup') {
            window.location.hash = '#/signup';
        } else if (page === 'profile') {
            window.location.hash = '#/profile';
        } else if (page === 'settings') {
            window.location.hash = '#/settings';
        }

        this.notifyListeners();
    }
    subscribe(listener: () => void): void {
        this.listeners.push(listener);
    }

    setLoading(isLoading: boolean): void {
        this.state.isLoading = isLoading
        this.notifyListeners()
    }

    removeFromCart(productId: number, selectedSize: number, selectedColor: string): void {
        const initialLength = this.state.cart.length

        this.state.cart = this.state.cart.filter(item =>
            !(
                item.product.id === productId &&
                item.selectedSize === selectedSize &&
                item.selectedColor === selectedColor
            )
        )

        if (this.state.cart.length === initialLength) {
            console.log("Item not found in cart")
        }

        this.saveCartToStorage()
        this.notifyListeners()
    }

    private notifyListeners(): void {
        this.listeners.forEach(listener => listener());
    }

    private saveCartToStorage(): void {
        const cartJson = JSON.stringify(this.state.cart)
        localStorage.setItem("cart", cartJson)
    }

    private loadCartFromStorage(): void {
        try {
            const storedCart = localStorage.getItem('cart')

            if (!storedCart) {
                this.state.cart = []
                return
            }

            const parsedCart = JSON.parse(storedCart)
            this.state.cart = parsedCart
        }
        catch (error) {
            console.log("Failed to load cart from storage: ", error)
            this.state.cart = []
        }
    }

    setCurrentUser(user: User | null): void {
        this.state.currentUser = user;
        this.notifyListeners();
    }

    getCurrentUser(): User | null {
        return this.state.currentUser;
    }

    clearCart(): void {
        this.state.cart = []; // Empty the internal state
        this.saveCartToStorage(); // Clear the localStorage
        this.notifyListeners(); // Update the UI (reset badge count)
    }

    setSuccessMessage(message: string): void {
        this.state.successMessage = message;
        this.notifyListeners();

        setTimeout(() => {
            this.state.successMessage = null;
            this.notifyListeners();
        }, 2000);
    }
}

export const stateManager = new StateManager();