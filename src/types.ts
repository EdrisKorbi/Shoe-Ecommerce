
export interface Product {
    id: number
    name: string
    price: number
    image: string
    images?: string[]
    category: string
    rating: number
    stock: number
    reviews: number
    description: string
    sizes: number[]
    inStock: boolean
    colors: string[]

}

export interface CartItem {
    product: Product
    quantity: number
    selectedSize: number
    selectedColor: string
}

export interface AppState {
    products: Product[]

    cart: CartItem[]

    currentPage: 'home' | 'product-detail' | 'cart' | 'login' | 'signup' | 'profile' | 'settings'

    selectedProductId?: number

    isLoading: boolean

    currentUser: User | null;

    successMessage?: string | null;
}

export interface User {
    id: string;
    email: string;
    name: string;
    profilePicture?: string;
    createdAt: string;
}

export interface AuthState {
    isLoggedIn: boolean;
    currentUser: User | null;
}