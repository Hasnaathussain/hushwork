import { StatusBar } from "expo-status-bar";
import * as SecureStore from "expo-secure-store";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

type ProductImage = { url: string; alt: string; role: string };
type Product = { id: string; slug: string; name: string; category: string; collection: string; description: string; priceCents: number; material: string; details: string; stock: number; featured: boolean; images: ProductImage[] };
type User = { id: string; name: string; email: string };
type Order = { id: string; status: string; totalCents: number; createdAt: string; itemCount: number };
type CartItem = Product & { quantity: number };
type Screen = "home" | "shop" | "cart" | "account" | "product";

const API_ROOT = process.env.EXPO_PUBLIC_API_URL ?? (Platform.OS === "android" ? "http://10.0.2.2:3000/api/v1" : "http://localhost:3000/api/v1");
const WEB_ROOT = API_ROOT.replace(/\/api\/v1$/, "");
const collections = ["all", "focus", "reset", "travel", "gifts", "refills"];
const colors = { cloud: "#F5F4EF", cloudDeep: "#E9E8E1", carbon: "#141515", muted: "#6D706C", slate: "#536A82", ember: "#C76645", moss: "#657462", white: "#FFFFFF" };

function price(cents: number) { return `$${(cents / 100).toFixed(2)}`; }
function imageUrl(url?: string) { return url?.startsWith("http") ? url : `${WEB_ROOT}${url ?? ""}`; }

async function api(path: string, options: RequestInit = {}, token?: string) {
  const response = await fetch(`${API_ROOT}${path}`, { ...options, headers: { ...(options.body ? { "Content-Type": "application/json" } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers ?? {}) } });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error ?? "Something went wrong.");
  return payload;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [products, setProducts] = useState<Product[]>([]);
  const [collection, setCollection] = useState("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [token, setToken] = useState<string | undefined>();
  const [user, setUser] = useState<User | undefined>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      api("/products"),
      SecureStore.getItemAsync("hushwork_mobile_token").catch(() => null),
      SecureStore.getItemAsync("hushwork_mobile_user").catch(() => null)
    ])
      .then(async ([catalog, savedToken, savedUser]) => {
        setProducts(catalog.products as Product[]);
        if (savedToken) {
          try {
            const result = await api("/orders", {}, savedToken);
            setToken(savedToken);
            if (savedUser) setUser(JSON.parse(savedUser) as User);
            setOrders(result.orders as Order[]);
          } catch {
            await SecureStore.deleteItemAsync("hushwork_mobile_token").catch(() => undefined);
            await SecureStore.deleteItemAsync("hushwork_mobile_user").catch(() => undefined);
          }
        }
      })
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Could not load the catalog."))
      .finally(() => setLoading(false));
  }, []);

  const visibleProducts = useMemo(() => products.filter((product) => (collection === "all" || product.collection === collection) && (!query.trim() || `${product.name} ${product.description} ${product.material}`.toLowerCase().includes(query.trim().toLowerCase()))), [products, collection, query]);
  const featured = products.filter((product) => product.featured).slice(0, 4);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);

  function addToCart(product: Product, quantity = 1) {
    setCart((current) => {
      const existing = current.find((item) => item.slug === product.slug);
      if (existing) return current.map((item) => item.slug === product.slug ? { ...item, quantity: Math.min(item.stock, item.quantity + quantity) } : item);
      return [...current, { ...product, quantity: Math.min(quantity, product.stock) }];
    });
    setScreen("cart");
  }

  function openProduct(product: Product) { setSelected(product); setScreen("product"); }

  async function signOut() {
    setToken(undefined);
    setUser(undefined);
    setOrders([]);
    await SecureStore.deleteItemAsync("hushwork_mobile_token").catch(() => undefined);
    await SecureStore.deleteItemAsync("hushwork_mobile_user").catch(() => undefined);
  }

  if (loading) return <SafeAreaView style={styles.loading}><StatusBar style="dark" /><View style={styles.loadingMark} /><Text style={styles.muted}>Loading HUSHWORK</Text></SafeAreaView>;

  return <SafeAreaView style={styles.safe}><StatusBar style="dark" /><View style={styles.app}><Header itemCount={itemCount} onHome={() => setScreen("home")} onCart={() => setScreen("cart")} /><ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>{error ? <View style={styles.error}><Text style={styles.errorText}>{error}</Text><Pressable onPress={() => setError("")}><Text style={styles.link}>Dismiss</Text></Pressable></View> : null}{screen === "home" && <Home products={featured} onShop={() => setScreen("shop")} onProduct={openProduct} />}{screen === "shop" && <Shop products={visibleProducts} collection={collection} setCollection={setCollection} query={query} setQuery={setQuery} onProduct={openProduct} />}{screen === "product" && selected && <ProductDetail product={selected} onBack={() => setScreen("shop")} onAdd={addToCart} />}{screen === "cart" && <Cart cart={cart} subtotal={subtotal} onBack={() => setScreen("shop")} onUpdate={(slug, quantity) => setCart((current) => current.map((item) => item.slug === slug ? { ...item, quantity } : item))} onRemove={(slug) => setCart((current) => current.filter((item) => item.slug !== slug))} token={token} user={user} />}{screen === "account" && <Account token={token} user={user} orders={orders} onSignedIn={async (nextToken, nextUser) => { setToken(nextToken); setUser(nextUser); await SecureStore.setItemAsync("hushwork_mobile_token", nextToken).catch(() => undefined); await SecureStore.setItemAsync("hushwork_mobile_user", JSON.stringify(nextUser)).catch(() => undefined); try { const result = await api("/orders", {}, nextToken); setOrders(result.orders as Order[]); } catch { setOrders([]); } }} onSignOut={signOut} />}</ScrollView><BottomNav screen={screen} itemCount={itemCount} onChange={setScreen} /></View></SafeAreaView>;
}

function Header({ itemCount, onHome, onCart }: { itemCount: number; onHome: () => void; onCart: () => void }) {
  return <View style={styles.header}><Pressable onPress={onHome} style={styles.brand}><View style={styles.brandMark}><Text style={styles.brandMarkText}>H</Text></View><Text style={styles.brandText}>HUSHWORK</Text></Pressable><Pressable onPress={onCart} style={styles.bag}><Text style={styles.bagText}>BAG</Text><Text style={styles.bagCount}>{String(itemCount).padStart(2, "0")}</Text></Pressable></View>;
}

function Home({ products, onShop, onProduct }: { products: Product[]; onShop: () => void; onProduct: (product: Product) => void }) {
  const hero = products[0];
  return <View><View style={styles.heroCopy}><Text style={styles.kicker}>HUSHWORK / RESET SYSTEMS</Text><Text style={styles.heroTitle}>Better transitions<Text style={styles.serif}> between things.</Text></Text><Text style={styles.heroBody}>Useful objects for the move from work to rest, desk to dinner, inside to out.</Text><Pressable style={styles.darkButton} onPress={onShop}><Text style={styles.darkButtonText}>Shop the edit  →</Text></Pressable></View>{hero ? <Pressable onPress={() => onProduct(hero)} style={styles.heroImageWrap}><Image source={{ uri: imageUrl(hero.images[0]?.url) }} alt={hero.name} accessibilityLabel={hero.name} style={styles.heroImage} /><View style={styles.imageCaption}><Text style={styles.captionSmall}>01 / 08</Text><Text style={styles.captionTitle}>{hero.name.toUpperCase()}</Text><Text style={styles.captionSmall}>{hero.material}</Text></View></Pressable> : null}<View style={styles.ruleRow}><Text style={styles.ruleItem}>Small-batch goods</Text><Text style={styles.ruleItem}>Repairable materials</Text><Text style={styles.ruleItem}>30-day returns</Text></View><View style={styles.sectionHeader}><View><Text style={styles.kicker}>The current edit</Text><Text style={styles.sectionTitle}>Start with the pieces<Text style={styles.serif}> you’ll use.</Text></Text></View><Pressable onPress={onShop}><Text style={styles.link}>View all  →</Text></Pressable></View><View style={styles.mobileProductGrid}>{products.map((product) => <MobileProductCard key={product.id} product={product} onPress={() => onProduct(product)} />)}</View></View>;
}

function Shop({ products, collection, setCollection, query, setQuery, onProduct }: { products: Product[]; collection: string; setCollection: (value: string) => void; query: string; setQuery: (value: string) => void; onProduct: (product: Product) => void }) {
  return <View><View style={styles.pageIntro}><Text style={styles.kicker}>THE CATALOG</Text><Text style={styles.pageTitle}>Find the thing<Text style={styles.serif}> that helps.</Text></Text><Text style={styles.muted}>Objects for focus, reset, travel, and useful gifts.</Text></View><TextInput value={query} onChangeText={setQuery} placeholder="Search objects" placeholderTextColor={colors.muted} style={styles.searchInput} /><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>{collections.map((item) => <Pressable key={item} onPress={() => setCollection(item)} style={[styles.chip, collection === item && styles.chipActive]}><Text style={[styles.chipText, collection === item && styles.chipTextActive]}>{item === "all" ? "All" : item[0].toUpperCase() + item.slice(1)}</Text></Pressable>)}</ScrollView><Text style={styles.resultCount}>{products.length} {products.length === 1 ? "object" : "objects"}</Text><View style={styles.mobileProductGrid}>{products.map((product) => <MobileProductCard key={product.id} product={product} onPress={() => onProduct(product)} />)}</View></View>;
}

function MobileProductCard({ product, onPress }: { product: Product; onPress: () => void }) {
  return <Pressable style={styles.productCard} onPress={onPress}><Image source={{ uri: imageUrl(product.images[0]?.url) }} alt={product.name} accessibilityLabel={product.name} style={styles.productImage} /><View style={styles.productMeta}><Text style={styles.kicker}>{product.collection}</Text><Text style={styles.stock}>{product.stock > 0 ? "In stock" : "Sold out"}</Text></View><Text style={styles.productName}>{product.name}</Text><Text numberOfLines={2} style={styles.productDescription}>{product.description}</Text><Text style={styles.productPrice}>{price(product.priceCents)}</Text></Pressable>;
}

function ProductDetail({ product, onBack, onAdd }: { product: Product; onBack: () => void; onAdd: (product: Product, quantity?: number) => void }) {
  const [quantity, setQuantity] = useState(1);
  const [imageIndex, setImageIndex] = useState(0);
  return <View><Pressable onPress={onBack}><Text style={styles.back}>←  Back to shop</Text></Pressable><Image source={{ uri: imageUrl(product.images[imageIndex]?.url) }} alt={product.name} accessibilityLabel={product.name} style={styles.detailImage} /><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbRow}>{product.images.map((image, index) => <Pressable key={image.url} onPress={() => setImageIndex(index)} style={[styles.thumb, index === imageIndex && styles.thumbActive]}><Image source={{ uri: imageUrl(image.url) }} alt={`${product.name} ${image.role}`} accessibilityLabel={`${product.name} ${image.role}`} style={styles.thumbImage} /></Pressable>)}</ScrollView><Text style={styles.kicker}>{product.collection} / {product.category}</Text><Text style={styles.detailTitle}>{product.name}</Text><Text style={styles.detailDescription}>{product.description}</Text><View style={styles.priceRow}><Text style={styles.detailPrice}>{price(product.priceCents)}</Text><Text style={styles.stock}>{product.stock > 0 ? "In stock" : "Sold out"}</Text></View><View style={styles.buyRow}><View style={styles.quantity}><Pressable onPress={() => setQuantity(Math.max(1, quantity - 1))}><Text style={styles.quantityButton}>−</Text></Pressable><Text>{quantity}</Text><Pressable onPress={() => setQuantity(Math.min(product.stock, quantity + 1))}><Text style={styles.quantityButton}>＋</Text></Pressable></View><Pressable style={styles.darkButtonFlex} onPress={() => onAdd(product, quantity)} disabled={!product.stock}><Text style={styles.darkButtonText}>Add to bag  →</Text></Pressable></View><View style={styles.detailNotes}><Text style={styles.kicker}>ABOUT THE OBJECT</Text><Text style={styles.detailDescription}>{product.details}</Text><Text style={styles.smallNote}>{product.material}</Text></View></View>;
}

function Cart({ cart, subtotal, onBack, onUpdate, onRemove, token, user }: { cart: CartItem[]; subtotal: number; onBack: () => void; onUpdate: (slug: string, quantity: number) => void; onRemove: (slug: string) => void; token?: string; user?: User }) {
  const [fields, setFields] = useState({ email: user?.email ?? "", shippingName: user?.name ?? "", shippingAddress: "", city: "", postalCode: "", country: "United States" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function checkout() {
    setBusy(true); setError("");
    try {
      const result = await fetch(`${WEB_ROOT}/api/checkout/session`, { method: "POST", headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ ...fields, idempotencyKey: `mobile-${Date.now()}-${Math.random().toString(36).slice(2)}`, items: cart.map((item) => ({ slug: item.slug, quantity: item.quantity })) }) });
      const payload = await result.json();
      if (!result.ok || !payload.url) throw new Error(payload.error ?? "Secure checkout is unavailable.");
      await Linking.openURL(payload.url);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Secure checkout is unavailable."); }
    finally { setBusy(false); }
  }
  if (!cart.length) return <View style={styles.empty}><Text style={styles.sectionTitle}>Your bag is quiet.</Text><Text style={styles.muted}>Add something useful for the in-between hours.</Text><Pressable style={styles.darkButton} onPress={onBack}><Text style={styles.darkButtonText}>Browse the catalog  →</Text></Pressable></View>;
  return <View><Pressable onPress={onBack}><Text style={styles.back}>←  Keep shopping</Text></Pressable><Text style={styles.pageTitle}>Your bag<Text style={styles.serif}>.</Text></Text>{cart.map((item) => <View style={styles.cartItem} key={item.slug}><Image source={{ uri: imageUrl(item.images[0]?.url) }} alt={item.name} accessibilityLabel={item.name} style={styles.cartImage} /><View style={styles.cartCopy}><Text style={styles.productName}>{item.name}</Text><Text style={styles.muted}>{price(item.priceCents)}</Text><View style={styles.cartControls}><Pressable onPress={() => item.quantity > 1 ? onUpdate(item.slug, item.quantity - 1) : onRemove(item.slug)}><Text>−</Text></Pressable><Text>{item.quantity}</Text><Pressable onPress={() => onUpdate(item.slug, Math.min(item.stock, item.quantity + 1))}><Text>＋</Text></Pressable></View></View><Pressable onPress={() => onRemove(item.slug)}><Text style={styles.remove}>Remove</Text></Pressable></View>)}<View style={styles.summary}><View style={styles.summaryRow}><Text style={styles.muted}>Subtotal</Text><Text style={styles.productPrice}>{price(subtotal)}</Text></View><View style={styles.summaryRow}><Text style={styles.muted}>Delivery</Text><Text style={styles.productPrice}>{subtotal >= 7500 ? "Free" : "$8.50"}</Text></View><View style={styles.summaryTotal}><Text>Total</Text><Text style={styles.productPrice}>{price(subtotal + (subtotal >= 7500 ? 0 : 850))}</Text></View></View><Text style={styles.kicker}>DELIVERY DETAILS</Text>{Object.entries(fields).map(([key, value]) => <TextInput key={key} value={value} onChangeText={(next) => setFields((current) => ({ ...current, [key]: next }))} placeholder={key === "shippingName" ? "Name" : key === "shippingAddress" ? "Address" : key === "postalCode" ? "Postal code" : key[0].toUpperCase() + key.slice(1)} autoCapitalize={key === "email" ? "none" : "sentences"} keyboardType={key === "email" ? "email-address" : "default"} style={styles.input} />)}{error ? <Text style={styles.errorText}>{error}</Text> : null}<Pressable style={styles.darkButtonWide} onPress={checkout} disabled={busy}>{busy ? <ActivityIndicator color={colors.cloud} /> : <Text style={styles.darkButtonText}>Continue to secure payment  →</Text>}</Pressable></View>;
}

function Account({ token, user, orders, onSignedIn, onSignOut }: { token?: string; user?: User; orders: Order[]; onSignedIn: (token: string, user: User) => void; onSignOut: () => void }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [fields, setFields] = useState({ name: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit() {
    setBusy(true); setError("");
    try { const result = await api(`/auth/${mode}`, { method: "POST", body: JSON.stringify(mode === "signup" ? fields : { email: fields.email, password: fields.password }) }); onSignedIn(result.token, result.user); } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not sign in."); } finally { setBusy(false); }
  }
  if (token && user) return <View><Text style={styles.kicker}>YOUR ACCOUNT</Text><Text style={styles.pageTitle}>Hello, <Text style={styles.serif}>{user.name.split(" ")[0]}.</Text></Text><Text style={styles.muted}>{user.email}</Text><View style={styles.accountSection}><Text style={styles.kicker}>ORDER HISTORY</Text>{orders.length ? orders.map((order) => <View style={styles.order} key={order.id}><View><Text style={styles.productName}>{order.id}</Text><Text style={styles.muted}>{new Date(order.createdAt).toLocaleDateString()} · {order.itemCount} items</Text></View><Text style={styles.productPrice}>{price(order.totalCents)}</Text></View>) : <Text style={styles.muted}>No orders yet.</Text>}</View><Pressable style={styles.outlineButton} onPress={onSignOut}><Text style={styles.outlineButtonText}>Sign out</Text></Pressable></View>;
  return <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}><View><Text style={styles.kicker}>YOUR HUSHWORK ACCOUNT</Text><Text style={styles.pageTitle}>{mode === "login" ? "Welcome back" : "Make room"}<Text style={styles.serif}>.</Text></Text>{mode === "signup" && <TextInput value={fields.name} onChangeText={(name) => setFields({ ...fields, name })} placeholder="Name" style={styles.input} /> }<TextInput value={fields.email} onChangeText={(email) => setFields({ ...fields, email })} placeholder="Email" keyboardType="email-address" autoCapitalize="none" style={styles.input} /><TextInput value={fields.password} onChangeText={(password) => setFields({ ...fields, password })} placeholder="Password" secureTextEntry style={styles.input} />{error ? <Text style={styles.errorText}>{error}</Text> : null}<Pressable style={styles.darkButtonWide} onPress={submit} disabled={busy}>{busy ? <ActivityIndicator color={colors.cloud} /> : <Text style={styles.darkButtonText}>{mode === "login" ? "Sign in" : "Create account"}  →</Text>}</Pressable><Pressable onPress={() => setMode(mode === "login" ? "signup" : "login")}><Text style={styles.link}>{mode === "login" ? "New here? Make an account" : "Already have an account? Sign in"}</Text></Pressable></View></KeyboardAvoidingView>;
}

function BottomNav({ screen, itemCount, onChange }: { screen: Screen; itemCount: number; onChange: (screen: Screen) => void }) {
  return <View style={styles.bottomNav}>{(["home", "shop", "cart", "account"] as const).map((item) => <Pressable key={item} onPress={() => onChange(item)} style={styles.navItem}><Text style={[styles.navText, screen === item && styles.navTextActive]}>{item === "cart" ? `Bag ${itemCount ? `(${itemCount})` : ""}` : item[0].toUpperCase() + item.slice(1)}</Text></Pressable>)}</View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cloud },
  app: { flex: 1, backgroundColor: colors.cloud },
  scroll: { paddingHorizontal: 20, paddingBottom: 100 },
  loading: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14, backgroundColor: colors.cloud },
  loadingMark: { width: 48, height: 48, borderRadius: 24, borderWidth: 1, borderColor: colors.slate },
  header: { minHeight: 66, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: "rgba(20,21,21,.15)", flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  brand: { flexDirection: "row", alignItems: "center", gap: 9 },
  brandMark: { width: 25, height: 25, backgroundColor: colors.carbon, alignItems: "center", justifyContent: "center" },
  brandMarkText: { color: colors.cloud, fontSize: 13, fontWeight: "800" },
  brandText: { color: colors.carbon, fontSize: 11, fontWeight: "800", letterSpacing: 2 },
  bag: { flexDirection: "row", alignItems: "center", gap: 8 },
  bagText: { color: colors.muted, fontSize: 10, fontWeight: "700", letterSpacing: 1 },
  bagCount: { color: colors.ember, fontSize: 11, fontWeight: "800" },
  kicker: { color: colors.muted, fontSize: 10, fontWeight: "800", letterSpacing: 1.5, marginBottom: 9 },
  heroCopy: { paddingTop: 42, paddingBottom: 30 },
  heroTitle: { color: colors.carbon, fontSize: 47, fontWeight: "500", lineHeight: 47, letterSpacing: -2.4 },
  serif: { fontFamily: Platform.select({ ios: "Georgia", android: "serif", default: "serif" }), fontWeight: "400" },
  heroBody: { maxWidth: 320, color: colors.muted, fontSize: 15, lineHeight: 23, marginTop: 20, marginBottom: 22 },
  darkButton: { alignSelf: "flex-start", minHeight: 46, paddingHorizontal: 16, alignItems: "center", justifyContent: "center", backgroundColor: colors.carbon },
  darkButtonFlex: { flex: 1, minHeight: 46, alignItems: "center", justifyContent: "center", backgroundColor: colors.carbon },
  darkButtonWide: { minHeight: 48, alignItems: "center", justifyContent: "center", backgroundColor: colors.carbon, marginTop: 12 },
  darkButtonText: { color: colors.cloud, fontSize: 12, fontWeight: "800" },
  heroImageWrap: { position: "relative", backgroundColor: colors.cloudDeep },
  heroImage: { width: "100%", height: 330 },
  imageCaption: { position: "absolute", right: 0, bottom: 0, width: 150, padding: 11, gap: 4, backgroundColor: colors.carbon },
  captionSmall: { color: "rgba(245,244,239,.65)", fontSize: 9 },
  captionTitle: { color: colors.cloud, fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  ruleRow: { flexDirection: "row", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: "rgba(20,21,21,.15)", paddingVertical: 15 },
  ruleItem: { color: colors.muted, fontSize: 9 },
  sectionHeader: { paddingTop: 58, paddingBottom: 24, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: 10 },
  sectionTitle: { color: colors.carbon, fontSize: 31, lineHeight: 32, letterSpacing: -1.5, maxWidth: 300 },
  link: { color: colors.carbon, fontSize: 11, fontWeight: "800", textDecorationLine: "underline" },
  muted: { color: colors.muted, fontSize: 13, lineHeight: 20 },
  mobileProductGrid: { gap: 28 },
  productCard: { width: "100%" },
  productImage: { width: "100%", height: 290, backgroundColor: colors.cloudDeep },
  productMeta: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10 },
  stock: { color: colors.moss, fontSize: 10, fontWeight: "800" },
  productName: { color: colors.carbon, fontSize: 15, fontWeight: "800", marginTop: 3 },
  productDescription: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 4 },
  productPrice: { color: colors.carbon, fontSize: 12, fontWeight: "800", marginTop: 8 },
  pageIntro: { paddingTop: 38, paddingBottom: 26 },
  pageTitle: { color: colors.carbon, fontSize: 43, lineHeight: 43, letterSpacing: -2, marginBottom: 16 },
  chips: { gap: 8, paddingBottom: 18 },
  chip: { borderWidth: 1, borderColor: "rgba(20,21,21,.2)", paddingHorizontal: 13, paddingVertical: 9 },
  chipActive: { borderColor: colors.carbon, backgroundColor: colors.carbon },
  chipText: { color: colors.carbon, fontSize: 11, fontWeight: "700" },
  chipTextActive: { color: colors.cloud },
  resultCount: { color: colors.muted, fontSize: 11, marginBottom: 20 },
  back: { color: colors.muted, fontSize: 12, fontWeight: "700", paddingVertical: 18 },
  detailImage: { width: "100%", height: 360, backgroundColor: colors.cloudDeep },
  thumbRow: { gap: 7, paddingVertical: 9 },
  thumb: { width: 67, height: 67, borderWidth: 1, borderColor: "transparent" },
  thumbActive: { borderColor: colors.carbon },
  thumbImage: { width: "100%", height: "100%" },
  detailTitle: { color: colors.carbon, fontSize: 39, lineHeight: 40, letterSpacing: -1.7, marginTop: 8 },
  detailDescription: { color: colors.muted, fontSize: 14, lineHeight: 22, marginTop: 13 },
  priceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: "rgba(20,21,21,.15)", marginTop: 24, paddingTop: 13 },
  detailPrice: { color: colors.carbon, fontSize: 15, fontWeight: "800" },
  buyRow: { flexDirection: "row", gap: 8, marginTop: 11 },
  quantity: { minHeight: 46, borderWidth: 1, borderColor: "rgba(20,21,21,.18)", paddingHorizontal: 7, flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: 112 },
  quantityButton: { color: colors.carbon, fontSize: 20, paddingHorizontal: 8 },
  detailNotes: { borderTopWidth: 1, borderTopColor: "rgba(20,21,21,.15)", marginTop: 28, paddingTop: 20 },
  smallNote: { color: colors.slate, fontSize: 12, fontWeight: "700", marginTop: 18 },
  empty: { minHeight: 500, justifyContent: "center", alignItems: "flex-start", gap: 12 },
  cartItem: { flexDirection: "row", gap: 11, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: "rgba(20,21,21,.15)" },
  cartImage: { width: 67, height: 67, backgroundColor: colors.cloudDeep },
  cartCopy: { flex: 1 },
  cartControls: { width: 87, marginTop: 8, flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderWidth: 1, borderColor: "rgba(20,21,21,.16)", paddingHorizontal: 7, paddingVertical: 4 },
  remove: { color: colors.muted, fontSize: 10, textDecorationLine: "underline", marginTop: 3 },
  summary: { paddingVertical: 17, borderBottomWidth: 1, borderBottomColor: colors.carbon, marginBottom: 22 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 7 },
  summaryTotal: { flexDirection: "row", justifyContent: "space-between", paddingTop: 12, borderTopWidth: 1, borderTopColor: "rgba(20,21,21,.16)" },
  input: { minHeight: 46, borderBottomWidth: 1, borderBottomColor: colors.carbon, color: colors.carbon, fontSize: 14, marginTop: 10 },
  searchInput: { minHeight: 46, borderWidth: 1, borderColor: "rgba(20,21,21,.18)", color: colors.carbon, fontSize: 14, paddingHorizontal: 12, marginBottom: 14 },
  error: { padding: 12, backgroundColor: "rgba(199,102,69,.1)", marginTop: 14, flexDirection: "row", justifyContent: "space-between" },
  errorText: { color: "#8F422A", fontSize: 12, lineHeight: 18, marginTop: 9 },
  accountSection: { marginTop: 35, borderTopWidth: 1, borderTopColor: "rgba(20,21,21,.15)", paddingTop: 18 },
  order: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: "rgba(20,21,21,.15)" },
  outlineButton: { marginTop: 28, borderWidth: 1, borderColor: colors.carbon, minHeight: 45, alignItems: "center", justifyContent: "center" },
  outlineButtonText: { color: colors.carbon, fontSize: 12, fontWeight: "800" },
  bottomNav: { position: "absolute", right: 0, bottom: 0, left: 0, minHeight: 68, paddingHorizontal: 12, paddingBottom: Platform.OS === "ios" ? 12 : 5, borderTopWidth: 1, borderTopColor: "rgba(20,21,21,.15)", backgroundColor: colors.cloud, flexDirection: "row", justifyContent: "space-around", alignItems: "center" },
  navItem: { padding: 10 },
  navText: { color: colors.muted, fontSize: 11, fontWeight: "700" },
  navTextActive: { color: colors.carbon, textDecorationLine: "underline", textDecorationColor: colors.ember }
});
