import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { LogOut, Plus, ShoppingCart, Tag, Calculator, CheckCircle, XCircle, AlertCircle, LayoutDashboard, Ticket, Users, ArrowRight } from "lucide-react"
import logo from "@/assets/logo.png"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

const REASON_MAP = {
    COUPON_INACTIVE: "Coupon is inactive",
    DATE_INVALID: "Coupon is expired or not yet valid",
    USAGE_LIMIT_EXCEEDED: "Usage limit exceeded for this user",
    USER_TIER_NOT_ALLOWED: "User tier does not match",
    MIN_LIFETIME_SPEND_NOT_MET: "Lifetime spend is too low",
    MIN_ORDERS_NOT_MET: "Minimum orders not met",
    NOT_FIRST_ORDER: "Valid only for first order",
    COUNTRY_NOT_ALLOWED: "Country not allowed",
    MIN_CART_VALUE_NOT_MET: "Cart value is too low",
    CATEGORY_NOT_APPLICABLE: "No applicable items in cart",
    CATEGORY_EXCLUDED: "Cart contains excluded categories",
    MIN_ITEMS_NOT_MET: "Minimum items count not met",
    NO_DISCOUNT_APPLICABLE: "Discount calculation resulted in 0"
}

export default function Dashboard() {
    const navigate = useNavigate()
    const [user, setUser] = useState(null)
    const [activeTab, setActiveTab] = useState("coupons")
    const [coupons, setCoupons] = useState([])

    // Simulator State
    const [simUser, setSimUser] = useState({
        userId: "u1", userTier: "REGULAR", country: "IN", lifetimeSpend: 0, ordersPlaced: 0
    })
    const [cartItems, setCartItems] = useState([
        { productId: "p1", category: "electronics", unitPrice: 1000, quantity: 1 }
    ])
    const [bestCouponResult, setBestCouponResult] = useState(null)

    // Test Specific Coupon State
    const [selectedCouponCode, setSelectedCouponCode] = useState("")
    const [validationResult, setValidationResult] = useState(null)
    const [validationError, setValidationError] = useState("")

    useEffect(() => {
        const storedUser = localStorage.getItem("user")
        if (!storedUser) {
            navigate("/")
            return
        }
        setUser(JSON.parse(storedUser))
        fetchCoupons()
    }, [navigate])

    // Clear validation result when selection changes
    useEffect(() => {
        setValidationResult(null)
        setValidationError("")
    }, [selectedCouponCode, simUser, cartItems])

    const fetchCoupons = async () => {
        try {
            const res = await fetch("/api/coupons")
            const data = await res.json()
            setCoupons(data.coupons || [])
        } catch (err) {
            console.error("Failed to fetch coupons", err)
        }
    }

    const handleLogout = () => {
        localStorage.removeItem("user")
        navigate("/")
    }

    const runSimulation = async () => {
        try {
            const payload = {
                user: simUser,
                cart: { items: cartItems }
            }
            const res = await fetch("/api/coupons/best", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })
            const data = await res.json()
            setBestCouponResult(data)
        } catch (err) {
            console.error("Simulation failed", err)
        }
    }

    const validateSpecificCoupon = async () => {
        if (!selectedCouponCode) return

        try {
            setValidationResult(null)
            setValidationError("")

            const payload = {
                user: simUser,
                cart: { items: cartItems }
            }

            const res = await fetch(`/api/coupons/${selectedCouponCode}/validate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Validation failed")
            }

            setValidationResult(data)
        } catch (err) {
            setValidationError(err.message)
        }
    }

    const addCartItem = () => {
        setCartItems([...cartItems, { productId: `p${Date.now()}`, category: "general", unitPrice: 100, quantity: 1 }])
    }

    const updateCartItem = (index, field, value) => {
        const newItems = [...cartItems]
        newItems[index] = { ...newItems[index], [field]: value }
        setCartItems(newItems)
    }

    const removeCartItem = (index) => {
        setCartItems(cartItems.filter((_, i) => i !== index))
    }

    if (!user) return null

    if (!user) return null

    return (
        <div className="min-h-screen bg-background font-sans text-foreground">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 border-b bg-white/80 px-4 py-4 backdrop-blur-md sm:px-6 lg:px-8">
                <div className="mx-auto flex max-w-7xl items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src={logo} alt="CouponManager Logo" className="h-8 w-auto" />
                        <span className="text-xl font-bold tracking-tight">CouponManager</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="hidden text-sm font-medium text-muted-foreground sm:block">
                            {user.email}
                        </div>
                        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-foreground">
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </Button>
                    </div>
                </div>
            </nav>

            <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="mb-16 text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                        Manage your <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500">discounts</span>.
                    </h1>
                    <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                        Create, track, and simulate coupon logic with our powerful engine.
                    </p>

                    <div className="mt-8 flex justify-center gap-4">
                        <button
                            onClick={() => setActiveTab("coupons")}
                            className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${activeTab === "coupons"
                                ? "bg-black text-white shadow-lg"
                                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                                }`}
                        >
                            Active Coupons
                        </button>
                        <button
                            onClick={() => setActiveTab("simulator")}
                            className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${activeTab === "simulator"
                                ? "bg-black text-white shadow-lg"
                                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                                }`}
                        >
                            Simulator & Debug
                        </button>
                    </div>
                </div>

                {/* Content */}
                {activeTab === "coupons" ? (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="flex items-center justify-between border-b pb-4">
                            <h2 className="text-2xl font-bold tracking-tight">All Coupons</h2>
                            <Button onClick={() => navigate("/create-coupon")} className="rounded-full px-6">
                                <Plus className="mr-2 h-4 w-4" /> Create New
                            </Button>
                        </div>

                        {coupons.length === 0 ? (
                            <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed bg-secondary/30 text-center">
                                <div className="rounded-full bg-secondary p-4">
                                    <Tag className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <h3 className="mt-4 text-lg font-semibold">No coupons found</h3>
                                <p className="text-muted-foreground">Get started by creating your first coupon.</p>
                            </div>
                        ) : (
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {coupons.map((coupon) => (
                                    <Card key={coupon.code} className="group relative overflow-hidden border transition-all hover:shadow-xl hover:-translate-y-1">
                                        <CardHeader className="pb-2">
                                            <div className="flex items-center justify-between mb-2">
                                                <Badge variant="secondary" className="font-mono text-xs">
                                                    {coupon.code}
                                                </Badge>
                                                <span className={`h-2 w-2 rounded-full ${coupon.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                                            </div>
                                            <CardTitle className="text-3xl font-bold">
                                                {coupon.discountType === "FLAT" ? `₹${coupon.discountValue}` : `${coupon.discountValue}%`}
                                                <span className="text-sm font-medium text-muted-foreground ml-1">OFF</span>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground mb-4">{coupon.description}</p>
                                            <div className="space-y-1 text-xs text-muted-foreground">
                                                <div className="flex justify-between">
                                                    <span>Valid Until</span>
                                                    <span className="font-medium text-foreground">{new Date(coupon.endDate).toLocaleDateString()}</span>
                                                </div>
                                                {coupon.usageLimitPerUser && (
                                                    <div className="flex justify-between">
                                                        <span>Limit</span>
                                                        <span className="font-medium text-foreground">{coupon.usageLimitPerUser} per user</span>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="grid gap-12 lg:grid-cols-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        {/* Simulation Inputs */}
                        <div className="space-y-8 lg:col-span-7">
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                        <ShoppingCart className="h-4 w-4" />
                                    </div>
                                    <h3 className="text-lg font-semibold">Cart Configuration</h3>
                                </div>

                                <div className="space-y-4">
                                    {cartItems.map((item, idx) => (
                                        <div key={idx} className="flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-sm sm:flex-row sm:items-end">
                                            <div className="grid flex-1 gap-4 sm:grid-cols-2">
                                                <div className="space-y-1.5">
                                                    <Label className="text-xs text-muted-foreground">Category</Label>
                                                    <Input
                                                        value={item.category}
                                                        onChange={(e) => updateCartItem(idx, "category", e.target.value)}
                                                        className="h-9"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-xs text-muted-foreground">Price (₹)</Label>
                                                    <Input
                                                        type="number"
                                                        value={item.unitPrice}
                                                        onChange={(e) => updateCartItem(idx, "unitPrice", Number(e.target.value))}
                                                        className="h-9"
                                                    />
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="icon" onClick={() => removeCartItem(idx)} className="h-9 w-9 text-muted-foreground hover:text-destructive">
                                                <LogOut className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button variant="outline" size="sm" onClick={addCartItem} className="w-full border-dashed">
                                        <Plus className="mr-2 h-4 w-4" /> Add Item
                                    </Button>
                                </div>
                            </div>

                            <div className="h-px bg-border"></div>

                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                                        <Users className="h-4 w-4" />
                                    </div>
                                    <h3 className="text-lg font-semibold">User Context</h3>
                                </div>

                                <div className="grid gap-6 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>User Tier</Label>
                                        <select
                                            className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                            value={simUser.userTier}
                                            onChange={(e) => setSimUser({ ...simUser, userTier: e.target.value })}
                                        >
                                            <option value="REGULAR">Regular</option>
                                            <option value="GOLD">Gold Member</option>
                                            <option value="NEW">New User</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Lifetime Spend (₹)</Label>
                                        <Input
                                            type="number"
                                            value={simUser.lifetimeSpend}
                                            onChange={(e) => setSimUser({ ...simUser, lifetimeSpend: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4 pt-4">
                                    <Button className="w-full rounded-full" size="lg" onClick={runSimulation}>
                                        Find Best Coupon
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>

                                    <div className="relative flex w-full items-center py-2">
                                        <div className="flex-grow border-t"></div>
                                        <span className="mx-4 flex-shrink-0 text-xs font-semibold text-muted-foreground uppercase tracking-wider">OR</span>
                                        <div className="flex-grow border-t"></div>
                                    </div>

                                    <div className="flex w-full gap-3">
                                        <select
                                            className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                            value={selectedCouponCode}
                                            onChange={(e) => setSelectedCouponCode(e.target.value)}
                                        >
                                            <option value="">Select a coupon to test...</option>
                                            {coupons.map(c => (
                                                <option key={c.code} value={c.code}>{c.code} - {c.description}</option>
                                            ))}
                                        </select>
                                        <Button
                                            variant="secondary"
                                            onClick={validateSpecificCoupon}
                                            disabled={!selectedCouponCode}
                                            className="min-w-[100px]"
                                        >
                                            Validate
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Results */}
                        <div className="lg:col-span-5">
                            <div className="sticky top-24 space-y-6">
                                {/* Best Coupon Result */}
                                {bestCouponResult && !validationResult && !validationError && (
                                    <Card className="overflow-hidden border-2 border-green-100 shadow-xl">
                                        <div className="bg-green-50 p-6 text-center">
                                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                                                <CheckCircle className="h-6 w-6" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-green-900">Best Match Found</h3>

                                            {bestCouponResult.coupon ? (
                                                <div className="mt-6">
                                                    <div className="text-4xl font-black tracking-tight text-green-600 mb-2">
                                                        {bestCouponResult.coupon.code}
                                                    </div>
                                                    <Badge className="bg-green-600 hover:bg-green-700">
                                                        Save ₹{bestCouponResult.discount}
                                                    </Badge>
                                                    <p className="mt-4 text-sm text-green-800">{bestCouponResult.coupon.description}</p>
                                                </div>
                                            ) : (
                                                <p className="mt-4 text-muted-foreground">No eligible coupons found.</p>
                                            )}
                                        </div>
                                    </Card>
                                )}

                                {/* Specific Validation Result */}
                                {(validationResult || validationError) && (
                                    <Card className="overflow-hidden shadow-xl">
                                        <CardHeader className="bg-secondary/50 pb-4">
                                            <CardTitle className="text-lg">Validation Analysis</CardTitle>
                                            <CardDescription>
                                                Checking rules for <span className="font-bold text-foreground">{selectedCouponCode}</span>
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="pt-6">
                                            {validationError ? (
                                                <div className="flex items-center gap-3 rounded-lg bg-red-50 p-4 text-red-600">
                                                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                                    <p className="text-sm font-medium">{validationError}</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-6">
                                                    <div className={`flex flex-col items-center justify-center gap-2 rounded-xl p-6 text-center border-2 ${validationResult.isEligible
                                                        ? "border-green-100 bg-green-50 text-green-700"
                                                        : "border-red-100 bg-red-50 text-red-700"
                                                        }`}>
                                                        {validationResult.isEligible ? (
                                                            <>
                                                                <CheckCircle className="h-8 w-8 mb-2" />
                                                                <h4 className="text-xl font-bold">Eligible!</h4>
                                                                <p className="text-sm font-medium">Discount Applied: ₹{validationResult.discount}</p>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <XCircle className="h-8 w-8 mb-2" />
                                                                <h4 className="text-xl font-bold">Not Eligible</h4>
                                                                <p className="text-sm font-medium">See breakdown below</p>
                                                            </>
                                                        )}
                                                    </div>

                                                    {/* Breakdown */}
                                                    {validationResult.breakdown && (
                                                        <div className="space-y-3">
                                                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Rule Breakdown</h4>
                                                            <div className="grid gap-2">
                                                                {Object.entries(validationResult.breakdown).map(([key, passed]) => (
                                                                    <div key={key} className="flex items-center justify-between rounded-lg border p-2.5 text-sm">
                                                                        <span className="font-medium capitalize text-muted-foreground">
                                                                            {key.replace(/([A-Z])/g, ' $1').trim()}
                                                                        </span>
                                                                        {passed ? (
                                                                            <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">Passed</Badge>
                                                                        ) : (
                                                                            <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-200 border-0">Failed</Badge>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Reasons */}
                                                    {!validationResult.isEligible && validationResult.reasons?.length > 0 && (
                                                        <div className="rounded-lg bg-red-50 p-4">
                                                            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-red-700">Specific Issues</h4>
                                                            <ul className="space-y-1.5">
                                                                {validationResult.reasons.map((reason, i) => (
                                                                    <li key={i} className="flex items-start gap-2 text-sm text-red-600">
                                                                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-red-500 flex-shrink-0" />
                                                                        {REASON_MAP[reason] || reason}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}

                                {!bestCouponResult && !validationResult && !validationError && (
                                    <div className="flex h-64 flex-col items-center justify-center rounded-2xl border bg-secondary/20 p-8 text-center text-muted-foreground">
                                        <div className="mb-4 rounded-full bg-white p-4 shadow-sm">
                                            <Calculator className="h-6 w-6" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-foreground">Ready to Simulate</h3>
                                        <p className="mt-1 max-w-xs text-sm">Configure your cart and user details, then run the simulation to see results.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
