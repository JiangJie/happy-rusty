/**
 * Async Option example: Remote data fetching with caching
 *
 * Demonstrates using async Option methods for handling
 * asynchronous operations that may or may not return values.
 */
import { None, type Option, Some } from '../src/mod.ts';

// Simulated cache and remote data
interface Product {
    id: number;
    name: string;
    price: number;
    inStock: boolean;
}

const cache = new Map<number, Product>();
const remoteProducts: Product[] = [
    { id: 1, name: 'Laptop', price: 999, inStock: true },
    { id: 2, name: 'Phone', price: 699, inStock: false },
    { id: 3, name: 'Tablet', price: 499, inStock: true },
];

/**
 * Check local cache for product
 */
function getFromCache(id: number): Option<Product> {
    const product = cache.get(id);
    return product ? Some(product) : None;
}

/**
 * Simulate fetching from remote API
 */
async function fetchFromRemote(id: number): Promise<Option<Product>> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));

    const product = remoteProducts.find(p => p.id === id);
    if (product) {
        // Update cache
        cache.set(id, product);
        return Some(product);
    }
    return None;
}

/**
 * Check if product is available (async stock check)
 */
async function checkAvailability(product: Product): Promise<boolean> {
    // Simulate async inventory check
    await new Promise(resolve => setTimeout(resolve, 50));
    return product.inStock;
}

// Example 1: Cache-first with async fallback
console.log('=== Example 1: Cache-first product lookup ===');

async function getProduct(id: number): Promise<Option<Product>> {
    return await getFromCache(id)
        .inspect(p => console.log(`Cache hit: ${p.name}`))
        .orElseAsync(async () => {
            console.log(`Cache miss, fetching from remote...`);
            return await fetchFromRemote(id);
        });
}

// First call - cache miss
let product = await getProduct(1);
console.log(`Product: ${product.map(p => p.name).unwrapOr('Not found')}`);

// Second call - cache hit
product = await getProduct(1);
console.log(`Product: ${product.map(p => p.name).unwrapOr('Not found')}\n`);

// Example 2: Async validation chain
console.log('=== Example 2: Check product availability ===');

const availableProduct = await getFromCache(1)
    .orElseAsync(() => fetchFromRemote(1))
    .then(opt => opt.andThenAsync(async p => {
        const available = await checkAvailability(p);
        return available ? Some(p) : None;
    }));

console.log(
    availableProduct
        .map(p => `${p.name} is available at $${p.price}`)
        .unwrapOr('Product not available'),
);

// Example 3: Async predicate check
console.log('\n=== Example 3: Async stock validation ===');

for (const id of [1, 2, 3]) {
    const result = await fetchFromRemote(id);
    const inStock = await result.isSomeAndAsync(async p => {
        return await checkAvailability(p);
    });

    const name = result.map(p => p.name).unwrapOr('Unknown');
    console.log(`${name}: ${inStock ? 'In Stock' : 'Out of Stock'}`);
}
